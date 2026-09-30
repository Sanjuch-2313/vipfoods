const money = (value) => Math.round(Math.max(0, Number(value) || 0) * 100) / 100;
export function paymentSummary(order) {
  const total = money(order.grandTotal);
  const status = String(order.paymentStatus || 'PENDING').toUpperCase();
  const wallet = money(order.walletAmountUsed);
  const recordedOnline = money(order.onlinePaidAmount);
  // Older paid orders predate the payment breakdown fields.
  const online = recordedOnline || (status === 'PAID' ? money(total - wallet) : order.codChargePaid ? money(order.codCharge) : 0);
  const paid = money(wallet + online);
  const closed = status === 'REFUNDED' || order.orderStatus === 'Cancelled';
  return { total, wallet, online, paid, due: closed ? 0 : money(total - paid), status,
    method: order.paymentMethod === 'COD' ? 'Cash on delivery (COD)' : wallet > 0 ? (online > 0 ? 'Wallet + online' : 'Wallet') : 'Online',
    collected: closed ? 0 : paid };
}
export function buildBill(order) {
  const payment = paymentSummary(order);
  return { number: order.orderNumber, date: order.createdAt, orderStatus: order.orderStatus,
    customer: order.shippingAddress, items: (order.items || []).map(i => ({ name: i.productName, size: i.variant?.weight,
      quantity: i.quantity, unitPrice: i.variant?.price, total: i.total,
      selections: (i.comboSelections || []).map(s => `${s.quantity} x ${s.productName} (${s.size})`) })),
    subtotal: money(order.subtotal), discount: money(order.discount), codCharge: money(order.codCharge), payment };
}
export function dashboardAnalytics(orders, now = new Date()) {
  const monthKey = date => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit' }).format(new Date(date));
  const indiaNow = new Date(now.getTime() + 330 * 60000);
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(Date.UTC(indiaNow.getUTCFullYear(), indiaNow.getUTCMonth() - 5 + i, 1));
    return { key: monthKey(date), label: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit', timeZone: 'UTC' }), revenue: 0, orderValue: 0, orders: 0 };
  });
  const statuses = {};
  let collected = 0, outstanding = 0, orderValue = 0;
  for (const order of orders) {
    statuses[order.orderStatus] = (statuses[order.orderStatus] || 0) + 1;
    const p = paymentSummary(order);
    const active = order.orderStatus !== 'Cancelled' && p.status !== 'REFUNDED';
    collected += p.collected;
    if (active) { outstanding += p.due; orderValue += p.total; }
    const month = months.find(m => m.key === monthKey(order.createdAt));
    if (month) { month.orders++; month.revenue += p.collected; if (active) month.orderValue += p.total; }
  }
  return { months: months.map(m => ({ ...m, revenue: money(m.revenue), orderValue: money(m.orderValue) })), statuses,
    collected: money(collected), outstanding: money(outstanding), orderValue: money(orderValue) };
}
