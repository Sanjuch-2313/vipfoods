import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHeart,
} from "react-icons/fi";

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
  const [selectedWeight] = useState(getDefaultWeight(product));

  const selectedPrice = getProductPrice(product, selectedWeight);
  const mrp = product.price;
  const hasDiscount = mrp && selectedPrice && selectedPrice < mrp;

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

  return (
  <div className="vip-card">

    <button
      className={`vip-wishlist ${wishlisted ? "active" : ""}`}
      onClick={() => onToggleWishlist && onToggleWishlist(product)}
    >
      <FiHeart />
    </button>

    <Link
      to={`/products/${product.id}`}
      className="vip-image-box"
    >
      <img
        src={product.image}
        alt={product.name}
        className="vip-image"
      />

      <div className="vip-offer">
        BEST SELLER
      </div>
    </Link>

    <div className="vip-info">

      <Link
        to={`/products/${product.id}`}
        className="vip-title-link"
      >
        <h3 className="vip-title">
          {product.name}
        </h3>
      </Link>

      <div className="vip-rating-row">

        <span className="vip-rating">
            ⭐ {product.rating || 4.5}
        </span>

        <span className="vip-dot">•</span>

        <span className="vip-delivery">
            Free Delivery
        </span>

      </div>

      <p className="vip-category">
        {product.tag}
      </p>

      <div className="vip-price-row">
        <span className="vip-price">
          ₹{selectedPrice ?? product.price}
        </span>

        {hasDiscount && (
          <span className="vip-mrp">₹{mrp}</span>
        )}
      </div>

      {weightOptions.length > 0 && (
        <div className="vip-weight-pills">
          {weightOptions.map((option) => (
            <span
              key={option.label}
              className={`vip-weight-pill ${
                option.label === selectedWeight ? "active" : ""
              }`}
            >
              {option.label}
            </span>
          ))}
        </div>
      )}

    </div>

  </div>
);
}