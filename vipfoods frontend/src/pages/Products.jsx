import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import "./Products.css";

const sortOptions = [
  { value: "", label: "Sort by" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlistItems, addToCart, toggleWishlist } = useCart();
  const navigate = useNavigate();

  const category = searchParams.get("category") || "all";
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "";
  const trending = searchParams.get("trending") === "true";

  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------- LOAD CATEGORIES (for tabs + dynamic filters) ----------
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  const selectedCategory = categories.find((c) => c.slug === category);

  // ---------- LOAD + FILTER PRODUCTS ----------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const raw = await getProducts();
        let products = raw;

        // Category filter
        if (category !== "all") {
          products = products.filter((p) => p.category?.slug === category);
        }

        // Search filter
        if (search) {
          products = products.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Dynamic filters (foodType, snackType, freshType, spiceType, etc.)
        // Reads directly from URL params, matching product fields by same key
        const reservedParams = ["category", "search", "sort", "trending"];
        for (const [key, value] of searchParams.entries()) {
          if (!value || reservedParams.includes(key)) continue;
          products = products.filter((p) => p[key] === value);
        }

        // Sort
        if (sortBy === "price-asc") {
          products = [...products].sort(
            (a, b) =>
              (a.variants?.[0]?.sellingPrice || 0) -
              (b.variants?.[0]?.sellingPrice || 0)
          );
        }

        if (sortBy === "price-desc") {
          products = [...products].sort(
            (a, b) =>
              (b.variants?.[0]?.sellingPrice || 0) -
              (a.variants?.[0]?.sellingPrice || 0)
          );
        }

        const formatted = products.map((p) => ({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search, sortBy, searchParams.toString()]);

  const handleChange = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleCategoryChange = (slug) => {
    // switching category clears any previous category-specific filter params
    const next = new URLSearchParams();
    if (slug !== "all") next.set("category", slug);
    if (search) next.set("search", search);
    if (sortBy) next.set("sort", sortBy);
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
            : selectedCategory?.name || category}
        </h2>
      </section>

      <section className="products-toolbar">
        <div className="category-tabs">
          <button
            type="button"
            className={category === "all" ? "tab-pill active" : "tab-pill"}
            onClick={() => handleCategoryChange("all")}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              className={category === cat.slug ? "tab-pill active" : "tab-pill"}
              onClick={() => handleCategoryChange(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="filters-row compact">
          {selectedCategory?.filters?.map((filter) => {
            const selectedValue = searchParams.get(filter.param) || "";

            return (
              <div className="chip-group" key={filter.param}>
                <button
                  type="button"
                  className={selectedValue === "" ? "chip active" : "chip"}
                  onClick={() => handleChange(filter.param, "")}
                >
                  All
                </button>

                {filter.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      selectedValue === option.value ? "chip active" : "chip"
                    }
                    onClick={() => handleChange(filter.param, option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            );
          })}

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