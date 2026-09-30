import { Link } from "react-router-dom";

export default function WalletPaymentDetails({ order }) {
  const walletPaid = Number(order?.walletAmountUsed || 0);
  if (walletPaid <= 0 || order?.paymentStatus !== "PAID") return null;
  const gatewayPaid = Number(order.onlinePaidAmount || 0);

  return (
    <div className="mt-3 rounded-xl bg-green-50 p-3 text-xs text-green-800">
      <p className="font-bold">
        {gatewayPaid > 0 ? "Paid through wallet + Razorpay" : "Paid through wallet"}
      </p>
      <p className="mt-1">Wallet payment: ₹{walletPaid.toFixed(2)}</p>
      {gatewayPaid > 0 && <p>Razorpay payment: ₹{gatewayPaid.toFixed(2)}</p>}
      <Link to="/wallet" className="mt-2 inline-block font-semibold underline">
        View wallet balance and transactions
      </Link>
    </div>
  );
}
