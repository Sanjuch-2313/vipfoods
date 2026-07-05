import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { getProducts, getCategoryLabel } from "../services/productService";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import "./home.css";

const sortOptions = [
  { value: "", label: "Sort by" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlistItems, addToCart, toggleWishlist } = useCart();

  const category = searchParams.get("category") || "all";
  const search = searchParams.get("search") || "";
  const vegFilter = searchParams.get("veg") || "all";
  const sortBy = searchParams.get("sort") || "";
  const trending = searchParams.get("trending") === "true";

  const navigate = useNavigate();

  const filteredProducts = useMemo(
    () => getProducts({ category, search, vegFilter, sortBy, trending }),
    [category, search, vegFilter, sortBy, trending],
  );

  const handleChange = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  return (
    <main className="section-wrap product-page">
      <button type="button" className="page-back" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>
      <section className="section-heading">
        <p>Products</p>
        <h2>{trending ? "Trending VIP Products" : getCategoryLabel(category)}</h2>
      </section>

      <section className="products-toolbar">
        <div className="category-tabs">
          {[
            { value: "all", label: "All" },
            { value: "pickles", label: "Pickles" },
            { value: "snacks", label: "Snacks" },
            { value: "fresh", label: "Fresh" },
            { value: "spices", label: "Spices" },
            { value: "dairy", label: "Dairy" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={category === option.value ? "tab-pill active" : "tab-pill"}
              onClick={() => handleChange("category", option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="filters-row compact">
          {/* Conditional filters based on category */}
          {category === "pickles" && (
            <div className="chip-group">
              {[
                { value: "all", label: "All" },
                { value: "veg", label: "Veg" },
                { value: "non-veg", label: "Non-Veg" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={vegFilter === option.value ? "chip active" : "chip"}
                  onClick={() => handleChange("veg", option.value === "all" ? "" : option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {category === "snacks" && (
            <div className="chip-group">
              {[
                { value: "all", label: "All" },
                { value: "sweet", label: "Sweet" },
                { value: "hot", label: "Hot" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={vegFilter === option.value ? "chip active" : "chip"}
                  onClick={() => handleChange("veg", option.value === "all" ? "" : option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {category === "fresh" && (
            <div className="chip-group">
              {[
                { value: "all", label: "All" },
                { value: "vegetables", label: "Vegetables" },
                { value: "fruits", label: "Fruits" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={vegFilter === option.value ? "chip active" : "chip"}
                  onClick={() => handleChange("veg", option.value === "all" ? "" : option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {category === "spices" && (
            <div className="chip-group">
              {[
                { value: "all", label: "All" },
                { value: "grinded", label: "Grinded" },
                { value: "normal", label: "Normal" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={vegFilter === option.value ? "chip active" : "chip"}
                  onClick={() => handleChange("veg", option.value === "all" ? "" : option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <label className="sort-label">
            Sort
            <select value={sortBy} onChange={(e) => handleChange("sort", e.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="product-grid">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try a different category, search term, or filter.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              wishlisted={wishlistItems.some((item) => item.id === product.id)}
            />
          ))
        )}
      </section>
    </main>
  );
}
