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
  const [selectedWeight] = useState(getDefaultWeight(product));
  const [quantity, setQuantity] = useState(initialQuantity || 0);

  useEffect(() => {
    setQuantity(initialQuantity || 0);
  }, [initialQuantity]);

  const selectedPrice = getProductPrice(product, selectedWeight);
  const mrp = product.price;
  const hasDiscount = mrp && selectedPrice && selectedPrice < mrp;

  const handleAdd = () => {
    const nextQuantity = quantity + 1;
    setQuantity(nextQuantity);
    onAddToCart && onAddToCart(product);
    onQuantityChange && onQuantityChange(product.id, product.weight || "default", nextQuantity);
  };

  const handleRemove = () => {
    setQuantity((current) => {
      const nextQuantity = Math.max(0, current - 1);
      onQuantityChange && onQuantityChange(product.id, product.weight || "default", nextQuantity);
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

        {weightOptions.length > 0 && (
          <p className="vip-weight">
            {String(weightOptions[0]?.label || selectedWeight || "1 Litre")}
          </p>
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