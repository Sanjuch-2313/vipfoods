import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentSummary, buildBill, dashboardAnalytics } from '../utils/orderBill.js';
const order = { grandTotal: 500, paymentMethod: 'ONLINE', paymentStatus: 'PAID', orderStatus: 'Pending', createdAt: '2026-09-29T10:00:00Z' };
test('wallet-only receipt does not count payment twice', () => {
  const p = paymentSummary({ ...order, walletAmountUsed: 500, onlinePaidAmount: 0 });
  assert.equal(p.paid, 500); assert.equal(p.online, 0); assert.equal(p.due, 0); assert.equal(p.method, 'Wallet');
});
test('mixed wallet and gateway payment', () => {
  const p = paymentSummary({ ...order, walletAmountUsed: 150, onlinePaidAmount: 350 });
  assert.equal(p.paid, 500); assert.equal(p.method, 'Wallet + online');
});
test('COD advance leaves remaining balance due', () => {
  const p = paymentSummary({ ...order, paymentMethod: 'COD', paymentStatus: 'PARTIALLY_PAID', codChargePaid: true, codCharge: 50, onlinePaidAmount: 50 });
  assert.equal(p.paid, 50); assert.equal(p.due, 450);
});
test('unpaid and legacy paid records', () => {
  assert.equal(paymentSummary({ ...order, paymentStatus: 'PENDING' }).due, 500);
  assert.equal(paymentSummary(order).paid, 500);
});
test('cancelled and refunded orders excluded from collected totals', () => {
  const analytics = dashboardAnalytics([order, { ...order, orderStatus: 'Cancelled' }, { ...order, paymentStatus: 'REFUNDED' }], new Date('2026-09-30'));
  assert.equal(analytics.collected, 500); assert.equal(analytics.orderValue, 500); assert.equal(analytics.months[5].orders, 3);
});
test('bill preserves item and combo details without exposing payment credentials', () => {
  const bill = buildBill({ ...order, razorpaySignature: 'private', items: [{ productName: 'Combo', quantity: 1, total: 500, comboSelections: [{ quantity: 2, productName: 'Mango', size: '250 g' }] }] });
  assert.equal(bill.items[0].selections[0], '2 x Mango (250 g)'); assert.equal(bill.razorpaySignature, undefined);
});
test('month boundaries use India time', () => {
  const a = dashboardAnalytics([{ ...order, createdAt: '2026-08-31T20:00:00Z' }], new Date('2026-09-30'));
  assert.equal(a.months[5].orders, 1);
});

test('bill endpoint enforces customer ownership and produces a PDF for admin', async () => {
  const { getBill } = await import('../controllers/billController.js');
  const { default: Order } = await import('../models/Order.js');
  const { Writable } = await import('node:stream');
  const original = Order.findOne;
  let query;
  const saved = { ...order, orderNumber: 'VIP-TEST', subtotal: 500, items: [{ productName: 'Pickle', quantity: 1, total: 500, variant: { price: 500, weight: '250 g' } }] };
  Order.findOne = q => { query = q; return { lean: async () => q.customer === 'other' ? null : saved }; };
  try {
    const response = () => ({ status(code) { this.code = code; return this; }, json(body) { this.body = body; }, setHeader() {} });
    const customer = response();
    await getBill({ params: { reference: 'VIP-TEST' }, query: {}, user: { _id: 'owner' } }, customer);
    assert.equal(query.customer, 'owner'); assert.equal(customer.body.bill.number, 'VIP-TEST');
    const other = response();
    await getBill({ params: { reference: 'VIP-TEST' }, query: {}, user: { _id: 'other' } }, other);
    assert.equal(other.code, 404);
    const chunks = [];
    const pdf = new Writable({ write(chunk, enc, next) { chunks.push(chunk); next(); } });
    const headers = {}; pdf.setHeader = (key, value) => { headers[key] = value; };
    const finished = new Promise((resolve, reject) => { pdf.on('finish', resolve); pdf.on('error', reject); });
    await getBill({ params: { reference: 'VIP-TEST' }, query: { format: 'pdf' }, admin: { role: 'admin' } }, pdf);
    await finished;
    assert.equal(query.customer, undefined);
    assert.equal(headers['Content-Type'], 'application/pdf');
    assert.ok(Buffer.concat(chunks).toString('ascii').startsWith('%PDF-'));
  } finally { Order.findOne = original; }
});
