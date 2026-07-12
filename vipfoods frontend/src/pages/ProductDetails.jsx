import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiMinus, FiPlus, FiShoppingCart, FiZap } from "react-icons/fi";
import {
  getProductById,
  getDefaultWeight,
  getProductPrice,
  getWeightOptions,
} from "../services/productService";
import { useCart } from "../context/CartContext";
import "./productDetails.css";

export default function ProductDetails() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { cartItems, addToCart, updateCartQuantity, wishlistItems, toggleWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const p = await getProductById(productId);

        const formatted = {
          id: p._id,
          name: p.name,
          image: p.images?.[0] || "",
          images: p.images || [],
          tag: p.category?.name || "",
          category: p.category?.name || "",
          description: p.description,
          price: p.variants?.[0]?.mrp || 0,
          offerPrice: p.variants?.[0]?.sellingPrice || 0,
          rating: p.averageRating || 4.5,
          veg: true,
          weights: Object.fromEntries(
            (p.variants || []).map((v) => [String(v.weight), v.sellingPrice])
          ),
          contents: p.ingredients,
          storage: p.storageInstructions,
        };

        setProduct(formatted);
        setSelectedWeight(getDefaultWeight(formatted));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const weightOptions = getWeightOptions(product);

  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-details-loading">
          <div className="loading-spinner" />
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-details-page">
        <div className="product-details-empty">
          <h2>Product not found</h2>
          <button type="button" className="cta-btn" onClick={() => navigate("/products")}>
            Browse Products
          </button>
        </div>
      </main>
    );
  }

  const cartItem = cartItems.find(
    (item) => item.id === product.id && item.weight === selectedWeight
  );
  const quantity = cartItem ? cartItem.quantity : 0;
  const wishlisted = wishlistItems.some((item) => item.id === product.id);
  const selectedPrice = getProductPrice(product, selectedWeight);
  const offerPrice = product.offerPrice || selectedPrice || product.price;
  const savings = product.offerPrice
    ? (selectedPrice ?? product.price ?? 0) - product.offerPrice
    : 0;
  const discountPercent =
    savings > 0 && product.price
      ? Math.round((savings / product.price) * 100)
      : 0;

  const handleAddToCart = () => {
    addToCart({ ...product, weight: selectedWeight });
  };

  const handleBuyNow = () => {
    if (!cartItem) {
      addToCart({ ...product, weight: selectedWeight });
    }
    navigate("/checkout");
  };

  return (
    <main className="product-details-page">
      <div className="product-details-inner">
        <button type="button" className="page-back" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="product-detail-grid">
          {/* IMAGE */}
          <div className="product-detail-image-wrap">
            <img src={product.image} alt={product.name} />
            {discountPercent > 0 && (
              <span className="product-discount-badge">{discountPercent}% OFF</span>
            )}
          </div>

          {/* INFO */}
          <div className="product-detail-info">
          

            <p className="product-detail-tag">{product.tag}</p>
            <h1 className="product-detail-title">{product.name}</h1>

            <p className="product-detail-description">
              {product.description ||
                "A premium handmade product crafted from tried-and-tested recipes for a fresh, flavorful experience."}
            </p>

            {weightOptions.length > 0 && (
              <div className="weight-selector">
                <span className="weight-selector-label">Select Weight</span>
                <div className="weight-options">
                  {weightOptions.map((option) => (
                    <button
                      type="button"
                      key={option.label}
                      className={`weight-chip ${
                        selectedWeight === option.label ? "active" : ""
                      }`}
                      onClick={() => setSelectedWeight(option.label)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-detail-pricing">
              <span className="detail-price">₹{offerPrice}</span>
              {product.offerPrice && product.price > offerPrice && (
                <span className="detail-old-price">₹{product.price}</span>
              )}
              {savings > 0 && (
                <span className="detail-savings">You save ₹{savings}</span>
              )}
            </div>

            <div className="detail-actions">
              {quantity > 0 ? (
                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() =>
                      updateCartQuantity(product.id, selectedWeight, quantity - 1)
                    }
                    aria-label="Decrease quantity"
                  >
                    <FiMinus />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateCartQuantity(product.id, selectedWeight, quantity + 1)
                    }
                    aria-label="Increase quantity"
                  >
                    <FiPlus />
                  </button>
                </div>
              ) : (
                <button type="button" className="add-to-cart-btn" onClick={handleAddToCart}>
                  <FiShoppingCart /> Add to Cart
                </button>
              )}

              <button type="button" className="buy-now-btn" onClick={handleBuyNow}>
                <FiZap /> Buy Now
              </button>

              <button
                type="button"
                className={`wishlist-btn ${wishlisted ? "wishlisted" : ""}`}
                onClick={() => toggleWishlist(product)}
                aria-label="Toggle wishlist"
              >
                <FiHeart />
              </button>
            </div>

            <div className="product-detail-meta">
              <div>
                <span>Category</span>
                <strong>{product.category || "—"}</strong>
              </div>
              <div>
                <span>Offer</span>
                <strong>{product.offerPrice ? "Available" : "Standard price"}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* EXTRA DETAILS */}
        <div className="product-extra-card">
          <h3>About this Product</h3>
          <div className="product-extra-grid">
            <div>
              <span>Contents</span>
              <p>{product.contents || "Made with natural ingredients and spices."}</p>
            </div>
            <div>
              <span>Uses</span>
              <p>{product.uses || "Perfect for daily meals, snacks, or festive occasions."}</p>
            </div>
            <div>
              <span>Storage</span>
              <p>{product.storage || "Store in a cool, dry place away from sunlight."}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}