import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import Order from '../models/Order.js';
import { buildBill } from '../utils/orderBill.js';

export async function getBill(req, res) {
  try {
    const reference = req.params.reference;
    const query = mongoose.isValidObjectId(reference) ? { _id: reference } : { orderNumber: reference };
    if (!req.admin) query.customer = req.user._id;
    const order = await Order.findOne(query).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const bill = buildBill(order);
    res.setHeader('Cache-Control', 'private, no-store');
    if (req.query.format !== 'pdf') return res.json({ bill });
    const doc = new PDFDocument({ size: 'A4', margin: 45 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="VIP-Foods-${String(bill.number).replace(/[^a-zA-Z0-9-]/g, '')}.pdf"`);
    doc.pipe(res);
    const amount = value => `INR ${Number(value || 0).toFixed(2)}`;
    const line = (text, size = 11) => { doc.fontSize(size).text(String(text)); doc.moveDown(0.4); };
    line('VIP FOODS', 24); line('ORDER BILL / PAYMENT RECEIPT', 14);
    line(`Bill: ${bill.number}`); line(`Date: ${new Date(bill.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
    line(`Order status: ${bill.orderStatus}`);
    const c = bill.customer || {};
    line(`Customer: ${c.fullName || ''} | ${c.phone || ''}`);
    line([c.addressLine1, c.addressLine2, c.city, c.state, c.postalCode].filter(Boolean).join(', '));
    doc.moveDown();
    for (const item of bill.items) {
      line(`${item.name} ${item.size ? `(${item.size})` : ''}`, 12);
      line(`Qty: ${item.quantity} | Unit: ${amount(item.unitPrice ?? item.total / item.quantity)} | Amount: ${amount(item.total)}`);
      for (const selection of item.selections) line(selection, 10);
    }
    doc.moveDown();
    line(`Subtotal: ${amount(bill.subtotal)}`); line(`Discount: -${amount(bill.discount)}`);
    if (bill.codCharge) line(`COD charge: ${amount(bill.codCharge)}`);
    line(`TOTAL: ${amount(bill.payment.total)}`, 16);
    line(`Payment method: ${bill.payment.method}`); line(`Payment status: ${bill.payment.status.replaceAll('_', ' ')}`);
    line(`Paid through wallet: ${amount(bill.payment.wallet)}`); line(`Paid online / COD advance: ${amount(bill.payment.online)}`);
    line(`Total paid: ${amount(bill.payment.paid)}`); line(`Balance due${order.paymentMethod === 'COD' ? ' on delivery' : ''}: ${amount(bill.payment.due)}`, 14);
    if (bill.payment.status === 'REFUNDED') line('Payment is marked refunded. Paid amounts above show the original payment.');
    if (bill.orderStatus === 'Cancelled') line('Order cancelled. Refund processing, if applicable, is separate.');
    doc.moveDown(); line('Thank you for shopping with VIP Foods.');
    doc.end();
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Unable to generate bill' });
    else res.end();
  }
}
