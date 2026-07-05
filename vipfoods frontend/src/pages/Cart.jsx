import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import "./home.css";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateCartQuantity, removeFromCart } = useCart();

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  return (
    <main className="section-wrap product-page">
      <button type="button" className="page-back" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>
      <section className="section-heading">
        <p>Your Cart</p>
        <h2>Review items before checkout</h2>
      </section>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add a product from the store to continue.</p>
        </div>
      ) : (
        <section className="cart-list">
          {cartItems.map((item) => (
            <article key={`${item.id}-${item.weight}`} className="glass-card cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>{item.tag}</p>
                {item.weight && <p className="cart-item-weight"><strong>Weight:</strong> {item.weight}</p>}
                <p>₹{item.price}</p>
                <div className="cart-item-controls">
                  <label>
                    Qty
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateCartQuantity(item.id, item.weight, Number(e.target.value))}
                    />
                  </label>
                  <button type="button" className="secondary-btn" onClick={() => removeFromCart(item.id, item.weight)}>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}

          <div className="cart-summary glass-card">
            <h3>Order summary</h3>
            <p>Total: ₹{total}</p>
            <button type="button" className="cta-btn full" onClick={() => navigate("/checkout") }>
              Proceed to Checkout
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
