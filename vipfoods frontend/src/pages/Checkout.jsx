import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./home.css";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  return (
    <main className="section-wrap product-page">
      <button type="button" className="page-back" onClick={() => navigate(-1)}>
        Back
      </button>
      <section className="section-heading">
        <p>Checkout</p>
        <h2>Review and confirm your order</h2>
      </section>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add some items before checking out.</p>
        </div>
      ) : (
        <section className="checkout-details glass-card">
          <div className="checkout-summary">
            <h3>Order summary</h3>
            <p>Total items: {cartItems.length}</p>
            <p>Total amount: ₹{total}</p>
          </div>
          <div className="checkout-actions">
            <button type="button" className="cta-btn full" onClick={() => navigate("/")}>
              Continue to Payment (placeholder)
            </button>
            <p className="checkout-note">
              Payment integration comes later. For now, this button is a placeholder so you can wire Razorpay next.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
