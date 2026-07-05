import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMinus,
  FiPlus,
  FiHeart,
  FiTruck,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";
import { getDefaultWeight, getProductPrice, getWeightOptions } from "../services/productService";
import "./ProductCard.css";

export default function ProductCard({
  product,
  onAddToCart,
  wishlisted,
  onToggleWishlist,
}) {
  const cardRef = useRef(null);
  const weightOptions = getWeightOptions(product);
  const [selectedWeight, setSelectedWeight] = useState(getDefaultWeight(product));

  const { cartItems, addToCart, updateCartQuantity } = useCart();
  const cartItem = cartItems.find((item) => item.id === product.id && item.weight === selectedWeight);
  const quantity = cartItem ? cartItem.quantity : 0;
  const selectedPrice = getProductPrice(product, selectedWeight);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * -8;
    const rotateY = ((x - rect.width / 2) / rect.width) * 8;

    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-10px)
      scale(1.02)
    `;
  };

  const handleMouseLeave = () => {
    cardRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div
      ref={cardRef}
      className={`product-card product-${product.category}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Wishlist */}
      <button
        className={`wishlist-icon ${wishlisted ? "wishlisted" : ""}`}
        onClick={() => onToggleWishlist && onToggleWishlist(product)}
      >
        <FiHeart />
      </button>

      {/* Badge */}
      <span className="product-badge">BEST SELLER</span>

      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
      </Link>

      {/* Content */}
      <div className="product-info">
        <div className="product-card-meta">
          <span className={`product-pill ${product.veg ? "veg" : "non-veg"}`}>
            {product.veg ? "Veg" : "Non-Veg"}
          </span>
          {product.trending && <span className="product-pill trending">Trending</span>}
        </div>

        <Link to={`/products/${product.id}`} className="product-title-link">
          <h4>{product.name}</h4>
        </Link>

        {/* Rating */}
        <div className="product-rating">{renderStars(product.rating || 0)}</div>

        <div className="product-details-line">
          <span className="product-tag">{product.tag}</span>
          <span className="product-delivery">
            <FiTruck /> Free Delivery
          </span>
        </div>

        <p className="product-price">₹{selectedPrice ?? product.price ?? 0}</p>

        {/* Weight Selector */}
        {weightOptions.length > 0 && (
          <label className="weight-label">
            Weight:
            <select
              value={selectedWeight}
              onChange={(e) => setSelectedWeight(e.target.value)}
            >
              {weightOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {quantity > 0 ? (
          <div className="quantity-inline">
            <button onClick={() => updateCartQuantity(product.id, selectedWeight, quantity - 1)}>
              <FiMinus />
            </button>
            <span>{quantity}</span>
            <button onClick={() => updateCartQuantity(product.id, selectedWeight, quantity + 1)}>
              <FiPlus />
            </button>
          </div>
        ) : (
          <button
            className="cta-btn full"
            onClick={() =>
              onAddToCart ? onAddToCart({ ...product, weight: selectedWeight }) : addToCart({ ...product, weight: selectedWeight })
            }
          >
            🛒 Add To Cart
          </button>
        )}
      </div>
    </div>
  );
}
