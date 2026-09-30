import { useEffect, useState } from "react";
import api from "../services/api";
import "./OrderBill.css";
const money = value => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });
export default function OrderBill({ reference, animated = false }) {
  const [bill, setBill] = useState(null);
  const [open, setOpen] = useState(animated);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const endpoint = `/orders/admin/${encodeURIComponent(reference || "")}/bill`;
  useEffect(() => {
    if (!open || !reference) return;
    let active = true;
    setBill(null); setError("");
    api.get(endpoint).then(({ data }) => { if (active) setBill(data.bill); })
      .catch(() => { if (active) setError("Unable to load bill. Please try again."); });
    return () => { active = false; };
  }, [open, reference, endpoint]);
  async function download() {
    setDownloading(true); setError("");
    try {
      const { data } = await api.get(`${endpoint}?format=pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const a = document.createElement("a"); a.href = url; a.download = `VIP-Foods-${bill?.number || reference}.pdf`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch { setError("Unable to download bill. Please try again."); }
    finally { setDownloading(false); }
  }
  if (!reference) return null;
  return <section className="vip-bill" onClick={e => e.stopPropagation()}>
    <div className="vip-bill-actions">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Hide bill" : "View bill"}</button>
      <button type="button" onClick={download} disabled={downloading}>{downloading ? "Downloading…" : "Download bill (PDF)"}</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {open && <div className={animated ? "vip-pos" : ""}>
      {animated && <div className="vip-pos-machine" aria-hidden="true"><span>VIP FOODS</span><i /></div>}
      <div className="vip-receipt-window">
        {!bill && !error && <p role="status">Preparing your bill…</p>}
        {bill && <article className={`vip-receipt ${animated ? "vip-receipt-print" : ""}`}>
          <h3>VIP FOODS</h3><p className="vip-bill-center">Order bill / Payment receipt</p>
          <p><strong>#{bill.number}</strong><br />{new Date(bill.date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
          <p>{bill.customer?.fullName} · {bill.customer?.phone}<br />{[bill.customer?.addressLine1, bill.customer?.addressLine2, bill.customer?.city, bill.customer?.state, bill.customer?.postalCode].filter(Boolean).join(", ")}</p>
          <p>Order: {bill.orderStatus}<br />Payment: <strong>{bill.payment.status.replaceAll("_", " ")}</strong><br />{bill.payment.method}</p>
          <div className="vip-bill-items">{bill.items.map((item, index) => <div key={index}>
            <div className="vip-bill-row"><strong>{item.name}</strong><span>{money(item.total)}</span></div>
            <small>{item.size} · {item.quantity} × {money(item.unitPrice ?? item.total / item.quantity)}</small>
            {item.selections.map((s, i) => <p key={i}>{s}</p>)}
          </div>)}</div>
          {[['Subtotal', bill.subtotal], ['Discount', -bill.discount], ...(bill.codCharge ? [['COD charge', bill.codCharge]] : []), ['Total', bill.payment.total], ['Paid through wallet', bill.payment.wallet], ['Paid online / COD advance', bill.payment.online], ['Total paid', bill.payment.paid], ['Balance due' + (bill.payment.method.includes('COD') ? ' on delivery' : ''), bill.payment.due]].map(([label, amount]) => <div className="vip-bill-row" key={label}><span>{label}</span><strong>{money(amount)}</strong></div>)}
          {bill.payment.status === "REFUNDED" && <p>Payment marked refunded. Paid amounts show the original payment.</p>}
          {bill.orderStatus === "Cancelled" && <p>Order cancelled. Any applicable refund is processed separately.</p>}
          <p className="vip-bill-center">Thank you for shopping with us!</p>
        </article>}
      </div>
    </div>}
  </section>;
}
