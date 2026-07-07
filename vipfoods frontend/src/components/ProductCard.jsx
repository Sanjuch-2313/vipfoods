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

      <div className="vip-bottom">

        <div>

          <div className="vip-price">
            ₹{selectedPrice ?? product.price}
          </div>

          {weightOptions.length > 0 && (
            <select
              className="vip-weight"
              value={selectedWeight}
              onChange={(e)=>setSelectedWeight(e.target.value)}
            >
              {weightOptions.map(option=>(
                <option
                  key={option.label}
                  value={option.label}
                >
                  {option.label}
                </option>
              ))}
            </select>
          )}

        </div>

        {quantity>0 ? (

          <div className="vip-qty">

            <button
             onClick={()=>updateCartQuantity(product.id,selectedWeight,quantity-1)}
            >
              <FiMinus/>
            </button>

            <span>{quantity}</span>

            <button
            onClick={()=>updateCartQuantity(product.id,selectedWeight,quantity+1)}
            >
              <FiPlus/>
            </button>

          </div>

        ):(

          <button
            className="vip-add-btn"
            onClick={()=>
              onAddToCart
                ? onAddToCart({...product,weight:selectedWeight})
                : addToCart({...product,weight:selectedWeight})
            }
          >
            ADD
          </button>

        )}

      </div>

    </div>

  </div>
);
}
