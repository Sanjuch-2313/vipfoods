import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import "./home.css";

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlistItems, toggleWishlist, addToCart } = useCart();

  const total = useMemo(
  () =>
    wishlistItems.reduce(
      (sum, item) => sum + (item.offerPrice || item.price || 0),
      0
    ),
  [wishlistItems]
);

  return (
    <main className="section-wrap product-page">
      <button type="button" className="page-back" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>
      <section className="section-heading">
        <p>Wishlist</p>
        <h2>Saved products you want to buy later</h2>
      </section>

      {wishlistItems.length === 0 ? (
        <div className="empty-state">
          <h3>Your wishlist is empty</h3>
          <p>Tap the wishlist button on any product to save it here.</p>
        </div>
      ) : (
        <section className="cart-list">
          {wishlistItems.map((item) => (
            <article key={item.id} className="glass-card cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>{item.tag}</p>
                <p>₹{item.offerPrice || item.price}</p>
                <div className="cart-item-controls">
                  <button type="button" className="cta-btn small" onClick={() => addToCart(item)}>
                    Add to Cart
                  </button>
                  <button type="button" className="secondary-btn" onClick={() => toggleWishlist(item)}>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}

          <div className="cart-summary glass-card">
            <h3>Wishlist total</h3>
            <p>Potential spend: ₹{total}</p>
          </div>
        </section>
      )}
    </main>
  );
}
