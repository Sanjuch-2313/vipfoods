import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import crypto from 'node:crypto';

// Run real controller code with isolated database and gateway substitutes.
async function load(relativePath, dependencies) {
  const code = await fs.readFile(new URL(relativePath, import.meta.url), 'utf8');
  const context = vm.createContext({ console, process, Buffer, Date });
  const module = new vm.SourceTextModule(code, { context });
  await module.link(async (name) => {
    const exports = dependencies[name];
    assert.ok(exports, `Missing test dependency: ${name}`);
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
    }, { context });
  });
  await module.evaluate();
  return module.namespace;
}
const paymentError = message => Object.assign(new Error(message), { statusCode: 400 });
const toPaise = value => Math.round(Number(value) * 100);
function response() {
  return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}

async function orderFixture({ balance = 100, insertFails = false } = {}) {
  const state = { balance, orders: [], debits: [], verifications: [] };
  const Order = {
    findOne(query) {
      const found = state.orders.find(order => order.paymentReference === query.paymentReference);
      const promise = Promise.resolve(found);
      promise.session = () => promise;
      return promise;
    },
    async create([data]) {
      if (insertFails) throw new Error('Order insert failed');
      state.orders.push(data);
      return [data];
    },
  };
  const User = {
    async findOneAndUpdate(query, update) {
      if (state.balance < query.walletBalance.$gte) return null;
      state.balance += update.$inc.walletBalance;
      state.debits.push(update.$push.walletTransactions);
      return { walletBalance: state.balance };
    },
  };
  const mongoose = { connection: { async transaction(callback) {
    const snapshot = structuredClone(state);
    try { await callback({}); } catch (error) { Object.assign(state, snapshot); throw error; }
  } } };
  const controller = await load('../controllers/orderController.js', {
    '../models/User.js': { default: User },
    '../models/Order.js': { default: Order },
    '../models/Coupon.js': { default: {} },
    '../models/Notification.js': { default: {} },
    '../utils/priceOnlineOrder.js': { priceOnlineOrder: async () => ({ subtotal: 100, discount: 0, items: [{ total: 100 }] }) },
    '../utils/razorpayPayment.js': { toPaise, paymentError, verifyRazorpayPayment: async (...args) => { state.verifications.push(args); } },
    mongoose: { default: mongoose }, uuid: { v4: () => crypto.randomUUID() },
  });
  const body = { paymentMethod: 'ONLINE', walletAmountUsed: 100, grandTotal: 0, checkoutPaymentId: 'attempt-1' };
  async function place(overrides = {}) {
    const res = response();
    await controller.createOrder({ user: { _id: 'user-1' }, body: { ...body, ...overrides } }, res);
    return res;
  }
  return { state, place };
}

test('full wallet payment creates a paid ONLINE order and retries do not debit again', async () => {
  const { state, place } = await orderFixture();
  const res = await place();
  assert.equal(res.code, 201);
  assert.equal(res.body.order.paymentMethod, 'ONLINE');
  assert.equal(res.body.order.paymentStatus, 'PAID');
  assert.equal(res.body.order.grandTotal, 100);
  assert.equal(res.body.order.onlinePaidAmount, 0);
  assert.equal(res.body.order.walletAmountUsed, 100);
  assert.equal(state.balance, 0);
  assert.equal(state.debits[0].amount, 100);
  assert.equal(state.debits[0].type, 'debit');
  assert.match(state.debits[0].description, /Paid through wallet/);
  assert.ok(state.debits[0].description.includes(res.body.order.orderNumber));
  await place();
  assert.equal(state.orders.length, 1);
  assert.equal(state.debits.length, 1);
});

test('partial wallet payment verifies only the uncovered amount', async () => {
  const { state, place } = await orderFixture();
  const result = await place({ walletAmountUsed: 50, grandTotal: 50, razorpayOrderId: 'order-1', razorpayPaymentId: 'pay-1' });
  assert.equal(result.code, 201);
  assert.equal(state.verifications[0][3], 5000);
  assert.equal(state.balance, 50);
  assert.equal(result.body.order.grandTotal, 100);
  assert.equal(result.body.order.onlinePaidAmount, 50);
});

test('insufficient funds, COD wallet use and altered totals cannot place paid orders', async () => {
  const { state, place } = await orderFixture({ balance: 20 });
  for (const body of [{}, { paymentMethod: 'COD' }, { grandTotal: 1 }]) {
    assert.equal((await place(body)).code, 400);
  }
  assert.equal(state.balance, 20);
  assert.equal(state.orders.length, 0);
});

test('failed order insert rolls back wallet balance and history', async () => {
  const { state, place } = await orderFixture({ insertFails: true });
  assert.equal((await place()).code, 500);
  assert.equal(state.balance, 100);
  assert.equal(state.debits.length, 0);
});

test('top-up credits the verified gateway amount once, ignoring client amount', async () => {
  let balance = 0;
  const references = new Set();
  const controller = await load('../controllers/authController.js', {
    bcryptjs: { default: {} }, jsonwebtoken: { default: {} }, crypto: { default: crypto },
    '../utils/razorpayPayment.js': {
      getRazorpay: () => ({}), toPaise,
      verifyRazorpayPayment: async () => ({ amount: 5000, order_id: 'order-topup' }),
    },
    '../models/User.js': { default: {
      async findOneAndUpdate(query, update) {
        const reference = query['walletTransactions.paymentReference'].$ne;
        if (references.has(reference)) return null;
        references.add(reference);
        balance += update.$inc.walletBalance;
        return { walletBalance: balance };
      },
      async findById() { return { walletBalance: balance }; },
    } },
  });
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = response();
    await controller.verifyWalletPayment({ user: { _id: 'user-1' }, body: { amount: 99999 } }, res);
    assert.equal(res.body.success, true);
    assert.equal(res.body.walletBalance, 50);
  }
  assert.equal(balance, 50);
});

test('gateway verification checks signature, owner, purpose, amount, capture and refunds', async () => {
  process.env.RAZORPAY_KEY_ID = 'test-key';
  process.env.RAZORPAY_KEY_SECRET = 'test-secret';
  const order = { notes: { userId: 'user-1', purpose: 'wallet_topup' }, currency: 'INR', amount: 5000 };
  const payment = { order_id: 'order-1', currency: 'INR', amount: 5000, status: 'authorized', amount_refunded: 0 };
  let captures = 0;
  class Gateway {
    orders = { fetch: async () => order };
    payments = {
      fetch: async () => payment,
      capture: async () => { captures++; payment.status = 'captured'; return payment; },
    };
  }
  const util = await load('../utils/razorpayPayment.js', { razorpay: { default: Gateway }, crypto: { default: crypto } });
  const details = { razorpay_order_id: 'order-1', razorpay_payment_id: 'pay-1', razorpay_signature: crypto.createHmac('sha256', 'test-secret').update('order-1|pay-1').digest('hex') };
  await util.verifyRazorpayPayment(details, 'user-1', 'wallet_topup', 5000);
  assert.equal(captures, 1);
  await assert.rejects(util.verifyRazorpayPayment({ ...details, razorpay_signature: '0'.repeat(64) }, 'user-1', 'wallet_topup'));
  await assert.rejects(util.verifyRazorpayPayment(details, 'other-user', 'wallet_topup'));
  await assert.rejects(util.verifyRazorpayPayment(details, 'user-1', 'checkout'));
  await assert.rejects(util.verifyRazorpayPayment(details, 'user-1', 'wallet_topup', 6000));
  payment.amount_refunded = 1;
  await assert.rejects(util.verifyRazorpayPayment(details, 'user-1', 'wallet_topup'));
  for (const invalid of [NaN, Infinity, -1, 'bad']) assert.throws(() => util.toPaise(invalid));
});

test('checkout totals use catalog prices and validate coupon eligibility', async () => {
  const coupon = { discount: 10, expiry: new Date('2099-01-01'), minOrder: 0, usageLimit: 10, usedCount: 0, categoryScope: 'all' };
  const pricing = await load('../utils/priceOnlineOrder.js', {
    '../models/Product.js': { default: { find: async () => [{ _id: 'product-1', variants: [{ sku: 'SKU-1', weight: '500g', sellingPrice: 100 }] }] } },
    '../models/Coupon.js': { default: { findById: async () => coupon } },
    './razorpayPayment.js': { paymentError, toPaise },
    './comboSizes.js': { normalizeComboSize: value => String(value).replace(/\s/g, '') },
    './priceComboItem.js': { priceComboItem: async () => { throw new Error('Unexpected combo'); } },
  });
  const items = [{ product: 'product-1', variant: { weight: '500g', price: 1 }, quantity: 2, total: 2 }];
  const result = await pricing.priceOnlineOrder(items, 'coupon-1');
  assert.equal(result.subtotal, 200);
  assert.equal(result.discount, 20);
  assert.equal(result.items[0].total, 200);
  await assert.rejects(pricing.priceOnlineOrder([{ ...items[0], quantity: -1 }]));
  coupon.usedCount = 10;
  await assert.rejects(pricing.priceOnlineOrder(items, 'coupon-1'));
});

test('payment preparation refuses stale wallet balances or totals before opening Razorpay', async () => {
  let created = 0;
  const controller = await load('../controllers/paymentController.js', {
    '../models/User.js': { default: { findById: async () => ({ walletBalance: 50 }) } },
    '../utils/priceOnlineOrder.js': { priceOnlineOrder: async () => ({ subtotal: 100, discount: 0 }) },
    '../utils/razorpayPayment.js': {
      paymentError, toPaise, verifyRazorpayPayment: async () => {},
      getRazorpay: () => ({ orders: { create: async data => { created++; return data; } } }),
    },
  });
  async function prepare(amount, walletAmountUsed) {
    const res = response();
    await controller.createOrder({ user: { _id: 'user-1' }, body: { amount, checkout: { paymentMethod: 'ONLINE', walletAmountUsed } } }, res);
    return res;
  }
  assert.equal((await prepare(40, 60)).code, 400);
  assert.equal((await prepare(1, 50)).code, 400);
  const result = await prepare(50, 50);
  assert.equal(result.code, 200);
  assert.equal(result.body.order.amount, 5000);
  assert.equal(result.body.order.notes.userId, 'user-1');
  assert.equal(created, 1);
});

test('combo sizes accept equivalent units without adding duplicate g labels', async () => {
  const { normalizeComboSize } = await import('../utils/comboSizes.js');
  assert.equal(normalizeComboSize('250 g'), normalizeComboSize('250'));
  assert.equal(normalizeComboSize('1 kg'), normalizeComboSize('1000g'));
  assert.equal(normalizeComboSize('1 L'), normalizeComboSize('1000 ml'));
  assert.notEqual(normalizeComboSize('250 ml'), normalizeComboSize('250g'));
});

test('custom combo validates size, exact item count, availability and server price', async () => {
  const { normalizeComboSize } = await import('../utils/comboSizes.js');
  const offer = { _id: 'combo-1', name: 'Choose any two', price: 399, size: '250 g', itemCount: 2, active: true };
  const products = [
    { _id: 'p1', name: 'Mango Pickle', variants: [{ _id: 'v1', weight: '250g', inStock: true }] },
    { _id: 'p2', name: 'Lime Pickle', variants: [{ _id: 'v2', weight: '250', inStock: true }] },
  ];
  const { priceComboItem } = await load('../utils/priceComboItem.js', {
    '../models/ComboOffer.js': { default: { findById: async () => offer } },
    '../models/Product.js': { default: { find: async () => products } },
    './comboSizes.js': { normalizeComboSize },
    './razorpayPayment.js': { paymentError, toPaise },
  });
  const item = { comboOffer: 'combo-1', quantity: 2, total: 1, variant: { price: 1 }, comboSelections: [
    { product: 'p1', variantId: 'v1', quantity: 1 }, { product: 'p2', variantId: 'v2', quantity: 1 },
  ] };
  const priced = await priceComboItem(item);
  assert.equal(priced.total, 798);
  assert.equal(priced.variant.price, 399);
  assert.equal(priced.productName, offer.name);
  assert.equal(priced.comboSelections[0].productName, 'Mango Pickle');
  await assert.rejects(priceComboItem({ ...item, comboSelections: item.comboSelections.slice(0, 1) }));
  await assert.rejects(priceComboItem({ ...item, comboSelections: [item.comboSelections[0], item.comboSelections[0]] }));
  await assert.rejects(priceComboItem({ ...item, quantity: -1 }));
  products[0].variants[0].weight = '500 ml';
  await assert.rejects(priceComboItem(item));
  products[0].variants[0].weight = '250g';
  products[0].variants[0].inStock = false;
  await assert.rejects(priceComboItem(item));
  offer.active = false;
  await assert.rejects(priceComboItem(item));
});

test('combo selections persist in the order schema without a fake product ID', async () => {
  const { default: Order } = await import('../models/Order.js');
  const order = new Order({
    orderNumber: 'TEST-COMBO', customer: '507f1f77bcf86cd799439011', paymentMethod: 'ONLINE', subtotal: 399, grandTotal: 399,
    items: [{ comboOffer: '507f1f77bcf86cd799439012', productName: 'Combo', quantity: 1, total: 399,
      comboSelections: [{ product: '507f1f77bcf86cd799439013', variantId: '507f1f77bcf86cd799439014', productName: 'Mango', size: '250 g', quantity: 2 }] }],
  });
  await order.validate();
  assert.equal(order.items[0].comboSelections[0].productName, 'Mango');
  assert.equal(order.items[0].product, undefined);
});


test('online-only payment verifies the full amount without touching wallet', async () => {
  const { state, place } = await orderFixture();
  const body = { walletAmountUsed: 0, grandTotal: 100, razorpayOrderId: 'online-order', razorpayPaymentId: 'online-payment' };
  const result = await place(body);
  assert.equal(result.code, 201);
  assert.equal(result.body.order.paymentStatus, 'PAID');
  assert.equal(result.body.order.walletAmountUsed, 0);
  assert.equal(result.body.order.onlinePaidAmount, 100);
  assert.equal(state.verifications[0][3], 10000);
  assert.equal(state.balance, 100);
  assert.equal(state.debits.length, 0);
  await place(body);
  assert.equal(state.orders.length, 1);
});

test('combined payment retry preserves one debit and correct remaining wallet balance', async () => {
  const { state, place } = await orderFixture({ balance: 75 });
  const body = { walletAmountUsed: 60, grandTotal: 40, razorpayOrderId: 'mixed-order', razorpayPaymentId: 'mixed-payment' };
  const result = await place(body);
  assert.equal(result.code, 201);
  assert.equal(result.body.order.paymentStatus, 'PAID');
  assert.equal(result.body.order.walletAmountUsed, 60);
  assert.equal(result.body.order.onlinePaidAmount, 40);
  assert.equal(result.body.order.remainingAmount, 0);
  await place(body);
  assert.equal(state.balance, 15);
  assert.equal(state.debits.length, 1);
  assert.equal(state.orders.length, 1);
});
