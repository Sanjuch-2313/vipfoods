import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiMinus, FiPlus } from "react-icons/fi";
import {
  getProductById,
  getDefaultWeight,
  getProductPrice,
  getWeightOptions,
} from "../services/productService";
import { useCart } from "../context/CartContext";
import "./home.css";

export default function ProductDetails() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { cartItems, addToCart, updateCartQuantity, wishlistItems, toggleWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const p = await getProductById(productId);

        const formatted = {
          id: p._id,
          name: p.name,
          image: p.images?.[0] || "",
          tag: p.category?.name || "",
          category: p.category?.name || "",
          description: p.description,
          price: p.variants?.[0]?.mrp || 0,
          offerPrice: p.variants?.[0]?.sellingPrice || 0,
          rating: p.averageRating || 4.5,
          veg: true, // adjust if backend provides veg/non-veg flag
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
      }
    };

    fetchProduct();
  }, [productId]);

  const weightOptions = getWeightOptions(product);

  // ✅ Loading state
  if (!product) {
    return (
      <main className="section-wrap product-page">
        <section className="empty-state">
          <h2>Loading product...</h2>
        </section>
      </main>
    );
  }

  const cartItem = cartItems.find((item) => item.id === product.id && item.weight === selectedWeight);
  const quantity = cartItem ? cartItem.quantity : 0;
  const wishlisted = wishlistItems.some((item) => item.id === product.id);
  const selectedPrice = getProductPrice(product, selectedWeight);
  const offerPrice = product.offerPrice || selectedPrice || product.price;
  const savings = product.offerPrice ? (selectedPrice ?? product.price ?? 0) - product.offerPrice : 0;

  return (
    <main className="section-wrap product-page product-detail-page">
      <button type="button" className="page-back" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      <section className="section-heading">
        <p>Product Details</p>
        <h2>{product.name}</h2>
      </section>

      <div className="product-detail-grid">
        <div className="product-detail-image-wrap">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-detail-info glass-card">
          <span className={`product-diet ${product.veg ? "veg" : "non-veg"}`}>
            {product.veg ? "Veg" : "Non-Veg"}
          </span>
          <p className="product-detail-tag">{product.tag}</p>
          <p className="product-detail-description">
            {product.description ||
              "A premium handmade product crafted from tried-and-tested recipes for a fresh, flavorful experience."}
          </p>

          {/* Weight Selector */}
          {weightOptions.length > 0 && (
            <label className="weight-label">
              Select Weight:
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

          <div className="product-detail-pricing">
            <div>
              <span className="detail-price">₹{offerPrice}</span>
              {product.offerPrice && <span className="detail-old-price">₹{product.price}</span>}
            </div>
            {savings > 0 && <span className="detail-savings">You save ₹{savings}</span>}
          </div>

          <div className="detail-actions">
            {quantity > 0 ? (
              <div className="quantity-controls">
                <button type="button" onClick={() => updateCartQuantity(product.id, selectedWeight, quantity - 1)}>
                  <FiMinus />
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => updateCartQuantity(product.id, selectedWeight, quantity + 1)}>
                  <FiPlus />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="cta-btn full"
                onClick={() => addToCart({ ...product, weight: selectedWeight })}
              >
                Add to Cart
              </button>
            )}

            <button
              type="button"
              className={`wishlist-btn ${wishlisted ? "wishlisted" : ""}`}
              onClick={() => toggleWishlist(product)}
            >
              <FiHeart /> {wishlisted ? "Wishlisted" : "Add to Wishlist"}
            </button>
          </div>

          <div className="product-detail-meta">
            <p>
              <strong>Category:</strong> {product.category}
            </p>
            <p>
              <strong>Offer:</strong> {product.offerPrice ? "Available" : "Standard price"}
            </p>
          </div>
        </div>
      </div>

      {/* Extra Details Card */}
      <div className="glass-card product-extra-card">
        <h3>About this Product</h3>
        <p><strong>Contents:</strong> {product.contents || "Made with natural ingredients and spices."}</p>
        <p><strong>Uses:</strong> {product.uses || "Perfect for daily meals, snacks, or festive occasions."}</p>
        <p><strong>Storage:</strong> {product.storage || "Store in a cool, dry place away from sunlight."}</p>
      </div>
    </main>
  );
}
