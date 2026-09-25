import { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";

import { getDefaultWeight, getProductPrice, getWeightOptions } from "../services/productService";
import "./ProductCard.css";

export default function ProductCard({
  product,
  onAddToCart,
  onQuantityChange,
  initialQuantity = 0,
  wishlisted,
  onToggleWishlist,
}) {
  const weightOptions = getWeightOptions(product);
  const [selectedWeight, setSelectedWeight] = useState(getDefaultWeight(product));
  const [quantity, setQuantity] = useState(initialQuantity || 0);

  useEffect(() => {
    setQuantity(initialQuantity || 0);
  }, [initialQuantity]);

  // Re-sync default weight if product changes
  useEffect(() => {
    setSelectedWeight(getDefaultWeight(product));
  }, [product]);

  const selectedPrice = getProductPrice(product, selectedWeight);
  const mrp = product.price;
  const hasDiscount = mrp && selectedPrice && selectedPrice < mrp;

  const handleAdd = () => {
    const nextQuantity = quantity + 1;
    setQuantity(nextQuantity);
    // Pass weight + correct price so cart always gets the right variant
    onAddToCart && onAddToCart({
      ...product,
      weight: selectedWeight,
      price: selectedPrice ?? product.price,
      offerPrice: selectedPrice ?? product.price,
    });
    onQuantityChange && onQuantityChange(product.id, selectedWeight, nextQuantity);
  };

  const handleRemove = () => {
    setQuantity((current) => {
      const nextQuantity = Math.max(0, current - 1);
      onQuantityChange && onQuantityChange(product.id, selectedWeight, nextQuantity);
      return nextQuantity;
    });
  };

  return (
    <article className="vip-card">
      <button
        type="button"
        className={`vip-wishlist ${wishlisted ? "active" : ""}`}
        onClick={() => onToggleWishlist && onToggleWishlist(product)}
      >
        <FiHeart />
      </button>

      <div className="vip-image-box">
        <img src={product.image} alt={product.name} className="vip-image" />
      </div>

      <div className="vip-info">
        <div className="vip-price-row">
          <span className="vip-price">₹{selectedPrice ?? product.price}</span>
          {hasDiscount && <span className="vip-mrp">₹{mrp}</span>}
        </div>

        <h3 className="vip-title">{product.name}</h3>

        {/* Sliding variant weight chips */}
        {weightOptions.length > 0 && (
          <div className="vip-variant-scroll">
            {weightOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                className={`vip-variant-chip ${selectedWeight === option.label ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWeight(option.label);
                  // Reset qty when switching variant
                  setQuantity(0);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {quantity > 0 ? (
          <div className="vip-cart-quantity" aria-label="Cart quantity selector">
            <button type="button" aria-label="Decrease quantity" onClick={handleRemove}>-</button>
            <span>{quantity}</span>
            <button type="button" aria-label="Increase quantity" onClick={handleAdd}>+</button>
          </div>
        ) : (
          <button type="button" className="vip-cart-btn" onClick={handleAdd}>
            Add to Cart
          </button>
        )}
      </div>
    </article>
  );
}