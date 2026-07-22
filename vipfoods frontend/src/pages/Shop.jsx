import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../services/categoryService";
import { getProducts } from "../services/productService";
import "./Shop.css";

const PREVIEW_LIMIT = 4;

function getProductCategoryId(product) {
  return typeof product.category === "object" && product.category !== null
    ? product.category._id
    : product.category;
}

function getLowestPrice(variants) {
  if (!variants?.length) return null;
  const prices = variants
    .map((v) => Number(v.sellingPrice))
    .filter((n) => !Number.isNaN(n));
  return prices.length ? Math.min(...prices) : null;
}

function getTotalStock(variants) {
  if (!variants?.length) return 0;
  return variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
}

function CategorySkeleton() {
  return (
    <div className="category-section category-section--skeleton">
      <div className="category-section__header">
        <div className="category-section__identity">
          <div className="skeleton skeleton--circle" />
          <div className="category-section__identity-text">
            <div className="skeleton skeleton--line skeleton--line-lg" />
            <div className="skeleton skeleton--line skeleton--line-sm" />
          </div>
        </div>
        <div className="skeleton skeleton--pill" />
      </div>

      <div className="category-section__divider" />

      <div className="product-grid">
        {Array.from({ length: PREVIEW_LIMIT }).map((_, index) => (
          <div className="product-card product-card--skeleton" key={index}>
            <div className="skeleton skeleton--image" />
            <div className="product-card__body">
              <div className="skeleton skeleton--line skeleton--line-md" />
              <div className="skeleton skeleton--line skeleton--line-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, onOpen }) {
  const lowestPrice = getLowestPrice(product.variants);
  const totalStock = getTotalStock(product.variants);
  const thumbnail = product.images?.[0];

  return (
    <button type="button" className="product-card" onClick={() => onOpen(product)}>
      <div className="product-card__image-wrap">
        {thumbnail ? (
          <img src={thumbnail} alt={product.name} className="product-card__image" />
        ) : (
          <div className="product-card__image product-card__image--empty" />
        )}
      </div>

      <div className="product-card__body">
        <h4 className="product-card__name">{product.name}</h4>

        <div className="product-card__meta-row">
          {lowestPrice !== null && (
            <p className="product-card__price">From ₹{lowestPrice}</p>
          )}
          <span className={`stock-badge ${totalStock > 0 ? "stock-badge--in" : "stock-badge--out"}`}>
            {totalStock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>
    </button>
  );
}

function EmptyShopState({ onBackHome }) {
  return (
    <div className="shop-empty-state">
      <svg
        className="shop-empty-state__illustration"
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <ellipse cx="100" cy="140" rx="70" ry="10" fill="var(--shop-surface-muted)" />
        <rect x="45" y="55" width="110" height="75" rx="14" fill="var(--shop-surface)" stroke="var(--shop-border)" strokeWidth="2" />
        <path d="M45 80 H155" stroke="var(--shop-border)" strokeWidth="2" />
        <circle cx="75" cy="67" r="4" fill="var(--shop-accent)" />
        <circle cx="90" cy="67" r="4" fill="var(--shop-border)" />
        <rect x="65" y="95" width="70" height="10" rx="5" fill="var(--shop-surface-muted)" />
        <rect x="75" y="112" width="50" height="8" rx="4" fill="var(--shop-surface-muted)" />
        <path d="M100 30 L108 48 L128 50 L113 62 L117 82 L100 71 L83 82 L87 62 L72 50 L92 48 Z" fill="var(--shop-accent-soft)" />
      </svg>

      <h3>No products yet</h3>
      <p>We're still stocking the shelves. Check back soon, or head back home for now.</p>
      <button type="button" className="shop-btn shop-btn--primary" onClick={onBackHome}>
        Back to Home
      </button>
    </div>
  );
}

export default function Shop() {
  const navigate = useNavigate();

  const [categorizedSections, setCategorizedSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadShop = async () => {
      try {
        const [categories, products] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);

        if (!isMounted) return;

        // Only active/published products should ever reach the storefront —
        // filtered here defensively in case getProducts() doesn't already
        // scope to active items.
        const activeProducts = products.filter(
          (product) => product.active !== false && product.published !== false
        );

        // Group products under their category, purely from live data —
        // nothing hardcoded. A category with zero matching products is
        // dropped entirely per spec.
        const sections = categories
          .map((category) => {
            const categoryProducts = activeProducts.filter(
              (product) => getProductCategoryId(product) === category._id
            );

            return {
              ...category,
              products: categoryProducts,
            };
          })
          .filter((category) => category.products.length > 0);

        setCategorizedSections(sections);
      } catch (err) {
        console.error("Failed to load shop data:", err);
        if (isMounted) {
          setLoadError("Unable to load the shop right now. Please try again shortly.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadShop();

    return () => {
      isMounted = false;
    };
  }, []);

  const openProduct = (product) => {
    navigate(`/products/${product._id}`);
  };

  return (
    <div className="shop-page">
      {/* ---------- HERO ---------- */}
      <section className="shop-hero">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <button type="button" onClick={() => navigate("/")}>
            Home
          </button>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Shop</span>
        </nav>

        {!loading && categorizedSections.length > 0 && (
          <span className="shop-hero__badge">
            {categorizedSections.length}{" "}
            {categorizedSections.length === 1 ? "Category" : "Categories"}
          </span>
        )}

        <h1 className="shop-hero__title">Everything We Make</h1>
        <p className="shop-hero__subtitle">
          Authentic homemade products prepared with traditional recipes.
        </p>
      </section>

      {/* ---------- BODY ---------- */}
      <div className="shop-body">
        {loading ? (
          <>
            <CategorySkeleton />
            <CategorySkeleton />
          </>
        ) : loadError ? (
          <div className="shop-empty-state">
            <h3>Something went wrong</h3>
            <p>{loadError}</p>
          </div>
        ) : categorizedSections.length === 0 ? (
          <EmptyShopState onBackHome={() => navigate("/")} />
        ) : (
          categorizedSections.map((category) => {
            const previewProducts = category.products.slice(0, PREVIEW_LIMIT);
            const hasMore = category.products.length > PREVIEW_LIMIT;

            return (
              <section className="category-section" key={category._id}>
                <div className="category-section__header">
                  <div className="category-section__identity">
                    <div className="category-section__icon">
                      <img
                        src={category.image}
                        alt={category.name}
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                      />
                    </div>

                    <div className="category-section__identity-text">
                      <h2>{category.name}</h2>
                      <p className="category-section__count">
                        {category.products.length}{" "}
                        {category.products.length === 1 ? "product" : "products"}
                      </p>
                    </div>
                  </div>

                  {hasMore && (
                    <button
                      type="button"
                      className="shop-btn shop-btn--ghost"
                      onClick={() => navigate(`/shop/${category.slug}`)}
                    >
                      View All
                      <span aria-hidden="true">→</span>
                    </button>
                  )}
                </div>

                <div className="category-section__divider" />

                <div className="product-grid">
                  {previewProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onOpen={openProduct}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* ---------- FOOTER CTA ---------- */}
      <section className="shop-cta">
        <h2>Can't find what you're looking for?</h2>
        <p>Chat with us directly and we'll help you find the right product.</p>
        <a
          className="shop-btn shop-btn--whatsapp"
          href="https://wa.me/910000000000"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chat on WhatsApp
        </a>
      </section>
    </div>
  );
}