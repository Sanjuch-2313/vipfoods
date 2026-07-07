import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { getProducts } from "../services/productService";
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

  // ✅ Changed from useMemo to useEffect + state
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const raw = await getProducts({
          category: category !== "all" ? category : "",
        });

        const formatted = raw.map((p) => ({
          id: p._id,
          name: p.name,
          image: p.images?.[0] || "",
          tag: p.category?.name || "",
          category: p.category?.slug || "",
          rating: p.averageRating || 4.5,

          price: p.variants?.[0]?.mrp || 0,
          offerPrice: p.variants?.[0]?.sellingPrice || 0,

          weights: Object.fromEntries(
            (p.variants || []).map((v) => [`${v.weight}g`, v.sellingPrice])
          ),
        }));

        setFilteredProducts(formatted);
      } catch (err) {
        console.error(err);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

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
        <h2>
          {trending
            ? "Trending VIP Products"
            : category === "all"
            ? "All VIP Foods"
            : category.charAt(0).toUpperCase() + category.slice(1)}
        </h2>
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
        {loading && (
          <div className="empty-state">
            <h3>Loading Products...</h3>
          </div>
        )}

        {!loading && filteredProducts.length === 0 ? (
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
