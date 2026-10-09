import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FiArrowLeft, FiHeart, FiMinus, FiPlus,
  FiShoppingCart, FiZap, FiTruck, FiClock,
  FiPackage, FiStar, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { getProductById } from "../services/productService";
import { useCart } from "../context/CartContext";
import SubcategoryBadge, { getSubcategoryColor } from "../components/SubcategoryBadge";
import { imageDelivery } from "../utils/imageDelivery";
import "./productDetails.css";

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <text x='50%' y='50%' font-family='sans-serif' font-size='22' fill='#9ca3af' text-anchor='middle' dominant-baseline='middle'>VIP Foods</text>
    </svg>`
  );

export default function ProductDetails() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { cartItems, addToCart, updateCartQuantity, wishlistItems, toggleWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [raw, setRaw] = useState(null); // keep original API response
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("description"); // description | nutrition | details

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const p = await getProductById(productId);
        setRaw(p);

        // Build variants from backend
        const variants = (p.variants || []).map((v) => ({
          id: v._id,
          label: v.weight ? (/^\d+$/.test(String(v.weight).trim()) ? `${v.weight} g` : String(v.weight)) : (v.unit || "1 unit"),
          price: Number(v.sellingPrice ?? v.price ?? 0),
          mrp: Number(v.mrp ?? 0),
          stock: v.stock ?? 0,
          inStock: v.inStock !== false,
          sku: v.sku || "",
        }));

        setProduct({
          id: p._id,
          name: p.name,
          shortDescription: p.shortDescription || "",
          description: p.description || "",
          images: p.images?.length ? p.images : [PLACEHOLDER],
          category: p.category?.name || "",
          categorySlug: p.category?.slug || "",
          subCategory: p.subCategory || "",
          brand: p.brand || "VIP Foods",
          manufacturer: p.manufacturer || "VIP Foods",
          countryOfOrigin: p.countryOfOrigin || "India",
          ingredients: p.ingredients || "",
          shelfLife: p.shelfLife || "",
          storageInstructions: p.storageInstructions || "",
          nutrition: p.nutrition || null,
          badges: p.badges || [],
          averageRating: p.averageRating || 0,
          reviewCount: p.reviewCount || 0,
          freeDelivery: p.freeDelivery || false,
          deliveryCharge: p.deliveryCharge || 0,
          estimatedDelivery: p.estimatedDelivery || "2-4 Days",
          variants,
        });
        setSelectedVariantIdx(0);
        setSelectedImageIdx(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <main className="pd-page">
        <div className="pd-loading">
          <div className="pd-spinner" />
          <p>Loading product…</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pd-page">
        <div className="pd-not-found">
          <h2>Product not found</h2>
          <button type="button" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </main>
    );
  }

  const variant = product.variants[selectedVariantIdx] || {
    label: "1 unit", price: 0, mrp: 0, stock: 0, inStock: true,
  };

  const hasDiscount = variant.mrp > 0 && variant.price < variant.mrp;
  const discountPct = hasDiscount ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100) : 0;
  const savings = hasDiscount ? variant.mrp - variant.price : 0;

  const cartKey = `${product.id}_${variant.label}`;
  const cartItem = cartItems.find((c) => c.id === product.id && c.weight === variant.label);
  const qty = cartItem?.quantity || 0;
  const wishlisted = wishlistItems.some((w) => (w._id || w.id) === product.id);

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      image: product.images[0],
      price: variant.price,
      offerPrice: variant.price,
      weight: variant.label,
      tag: product.category,
    });
  };

  const handleBuyNow = () => {
    if (!cartItem) handleAdd();
    navigate("/checkout");
  };

  const accentColor = getSubcategoryColor(raw);

  const images = product.images.length ? product.images : [PLACEHOLDER];

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(product.averageRating));

  return (
    <main className="pd-page" style={{ "--pd-accent": accentColor, "--pd-accent-soft": accentColor + "12" }}>
      <div className="pd-inner">
        {/* ── Back button ── */}
        <button type="button" className="pd-back" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} /> Back
        </button>

        {/* ── Breadcrumb ── */}
        <nav className="pd-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/shop?category=${product.categorySlug}`}>{product.category}</Link>
              <span>/</span>
            </>
          )}
          <span className="pd-breadcrumb-current">{product.name}</span>
        </nav>

        {/* ── Main grid ── */}
        <div className="pd-grid">
          {/* LEFT: Images */}
          <div className="pd-images">
            {/* Main image */}
            <div className="pd-main-image-wrap">
              {discountPct > 0 && (
                <span className="pd-discount-badge">{discountPct}% OFF</span>
              )}
              <button
                type="button"
                className={`pd-wishlist-btn ${wishlisted ? "wishlisted" : ""}`}
                onClick={() => toggleWishlist({ id: product.id, ...product })}
                aria-label="Toggle wishlist"
              >
                <FiHeart size={20} fill={wishlisted ? "currentColor" : "none"} />
              </button>
              <img
                src={imageDelivery(images[selectedImageIdx])}
                alt={product.name}
                className="pd-main-image"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER; }}
              />
              {/* Prev/Next arrows for multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    className="pd-img-nav pd-img-prev"
                    onClick={() => setSelectedImageIdx((i) => (i - 1 + images.length) % images.length)}
                    aria-label="Previous image"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button
                    className="pd-img-nav pd-img-next"
                    onClick={() => setSelectedImageIdx((i) => (i + 1) % images.length)}
                    aria-label="Next image"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="pd-thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`pd-thumb ${selectedImageIdx === i ? "active" : ""}`}
                    onClick={() => setSelectedImageIdx(i)}
                  >
                    <img
                      src={imageDelivery(img)}
                      alt={`${product.name} ${i + 1}`}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info */}
          <div className="pd-info">
            {/* SubcategoryBadge */}
            {raw && <SubcategoryBadge product={raw} className="pd-subcat-badge" />}

            {/* Badges */}
            {product.badges.length > 0 && (
              <div className="pd-badges">
                {product.badges.map((b, i) => (
                  <span key={i} className="pd-badge">{b}</span>
                ))}
              </div>
            )}

            {/* Category */}
            {product.category && (
              <p className="pd-category">{product.category}</p>
            )}

            {/* Name */}
            <h1 className="pd-title">{product.name}</h1>

            {/* Short description */}
            {product.shortDescription && (
              <p className="pd-short-desc">{product.shortDescription}</p>
            )}

            {/* Rating */}
            {product.averageRating > 0 && (
              <div className="pd-rating">
                <div className="pd-stars">
                  {stars.map((filled, i) => (
                    <FiStar key={i} size={14} fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" />
                  ))}
                </div>
                <span className="pd-rating-count">
                  {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Pricing */}
            <div className="pd-pricing">
              <span className="pd-price">₹{variant.price}</span>
              {hasDiscount && <span className="pd-mrp">₹{variant.mrp}</span>}
              {savings > 0 && <span className="pd-savings">You save ₹{savings}</span>}
            </div>
            <p className="pd-tax-note">Inclusive of all taxes</p>

            {/* Variant selector */}
            {product.variants.length > 0 && (
              <div className="pd-variants">
                <p className="pd-variants-label">Select Weight / Pack</p>
                <div className="pd-variant-chips">
                  {product.variants.map((v, i) => (
                    <button
                      key={v.id || i}
                      type="button"
                      className={`pd-variant-chip ${selectedVariantIdx === i ? "active" : ""}`}
                      onClick={() => setSelectedVariantIdx(i)}
                    >
                      <span className="pd-chip-label">{v.label}</span>
                      <span className="pd-chip-price">₹{v.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <p className={`pd-stock ${variant.inStock ? "in-stock" : "out-of-stock"}`}>
              {variant.inStock ? "✓ In Stock" : "✗ Out of Stock"}
            </p>

            {/* Action buttons */}
            <div className="pd-actions">
              {qty > 0 ? (
                <div className="pd-qty-control">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(product.id, variant.label, qty - 1)}
                    aria-label="Decrease"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(product.id, variant.label, qty + 1)}
                    aria-label="Increase"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="pd-add-btn"
                  onClick={handleAdd}
                  disabled={!variant.inStock}
                >
                  <FiShoppingCart size={18} /> Add to Cart
                </button>
              )}
              <button
                type="button"
                className="pd-buy-btn"
                onClick={handleBuyNow}
                disabled={!variant.inStock}
              >
                <FiZap size={18} /> Buy Now
              </button>
            </div>

            {/* Delivery info */}
            <div className="pd-delivery-info">
              <div className="pd-delivery-row">
                <FiTruck size={16} />
                <span>
                  {product.freeDelivery
                    ? "Free Delivery"
                    : `Delivery charge: ₹${product.deliveryCharge}`}
                </span>
              </div>
              <div className="pd-delivery-row">
                <FiClock size={16} />
                <span>Estimated delivery: {product.estimatedDelivery}</span>
              </div>
            </div>

            {/* Meta info strip */}
            <div className="pd-meta-strip">
              {product.brand && (
                <div className="pd-meta-item">
                  <span>Brand</span>
                  <strong>{product.brand}</strong>
                </div>
              )}
              {product.manufacturer && (
                <div className="pd-meta-item">
                  <span>Manufacturer</span>
                  <strong>{product.manufacturer}</strong>
                </div>
              )}
              {product.countryOfOrigin && (
                <div className="pd-meta-item">
                  <span>Country of Origin</span>
                  <strong>{product.countryOfOrigin}</strong>
                </div>
              )}
              {product.shelfLife && (
                <div className="pd-meta-item">
                  <span>Shelf Life</span>
                  <strong>{product.shelfLife}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs: Description / Nutrition / More Details ── */}
        <div className="pd-tabs-section">
          <div className="pd-tabs">
            {["description", "nutrition", "details"].map((t) => (
              <button
                key={t}
                type="button"
                className={`pd-tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "description" ? "Description" : t === "nutrition" ? "Nutrition" : "More Details"}
              </button>
            ))}
          </div>

          <div className="pd-tab-content">
            {tab === "description" && (
              <div>
                {product.description ? (
                  <p className="pd-desc-text">{product.description}</p>
                ) : (
                  <p className="pd-desc-text pd-empty">No description available.</p>
                )}
                {product.ingredients && (
                  <div className="pd-detail-block">
                    <h4>Ingredients</h4>
                    <p>{product.ingredients}</p>
                  </div>
                )}
                {product.storageInstructions && (
                  <div className="pd-detail-block">
                    <h4>Storage Instructions</h4>
                    <p>{product.storageInstructions}</p>
                  </div>
                )}
              </div>
            )}

            {tab === "nutrition" && (
              <div>
                {product.nutrition && Object.values(product.nutrition).some(Boolean) ? (
                  <table className="pd-nutrition-table">
                    <thead>
                      <tr>
                        <th>Nutrient</th>
                        <th>Per {product.nutrition.servingSize || "100g"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Calories", product.nutrition.calories],
                        ["Protein", product.nutrition.protein],
                        ["Carbohydrates", product.nutrition.carbohydrates],
                        ["Fat", product.nutrition.fat],
                        ["Fiber", product.nutrition.fiber],
                        ["Sugar", product.nutrition.sugar],
                        ["Sodium", product.nutrition.sodium],
                      ]
                        .filter(([, v]) => v)
                        .map(([label, value]) => (
                          <tr key={label}>
                            <td>{label}</td>
                            <td>{value}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="pd-empty">Nutrition information not available.</p>
                )}
              </div>
            )}

            {tab === "details" && (
              <div className="pd-details-grid">
                {product.brand && (
                  <div className="pd-detail-row"><span>Brand</span><strong>{product.brand}</strong></div>
                )}
                {product.manufacturer && (
                  <div className="pd-detail-row"><span>Manufacturer</span><strong>{product.manufacturer}</strong></div>
                )}
                {product.countryOfOrigin && (
                  <div className="pd-detail-row"><span>Country of Origin</span><strong>{product.countryOfOrigin}</strong></div>
                )}
                {product.shelfLife && (
                  <div className="pd-detail-row"><span>Shelf Life</span><strong>{product.shelfLife}</strong></div>
                )}
                {product.category && (
                  <div className="pd-detail-row"><span>Category</span><strong>{product.category}</strong></div>
                )}
                {product.subCategory && (
                  <div className="pd-detail-row"><span>Sub Category</span><strong>{product.subCategory}</strong></div>
                )}
                {product.variants.map((v, i) => (
                  <div key={i} className="pd-detail-row">
                    <span>Variant {i + 1}</span>
                    <strong>{v.label} — ₹{v.price}{v.sku ? ` (SKU: ${v.sku})` : ""}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}