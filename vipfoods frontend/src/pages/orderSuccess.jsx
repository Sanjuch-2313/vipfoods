import { useParams, Link } from "react-router-dom";
import "./orderSuccess.css";

export default function OrderSuccess() {
  const { orderNumber } = useParams();

  return (
    <main className="section-wrap order-success-page">
      <div className="glass-card success-card">
        <h2>🎉 Order Received!</h2>
        <p>Your order number is:</p>
        <h3>{orderNumber}</h3>
        <p>We’ll notify you when it’s packed and shipped.</p>
        <Link to="/" className="cta-btn full">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
