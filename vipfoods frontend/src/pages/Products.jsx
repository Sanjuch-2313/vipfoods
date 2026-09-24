import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiX, FiSliders, FiMinus, FiPlus } from "react-icons/fi";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { useCart } from "../context/CartContext";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <text x='50%' y='50%' font-family='sans-serif' font-size='22' fill='#9ca3af' text-anchor='middle' dominant-baseline='middle'>VIP Foods</text>
    </svg>`
  );

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateCartQuantity, removeFromCart } = useCart();

  const category = searchParams.get("category") || "all";
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "";
  const isDeals = searchParams.get("deals") === "true";

  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // ---------- LOAD CATEGORIES ----------
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  // ---------- LOAD + FILTER PRODUCTS ----------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const raw = await getProducts();
        let products = Array.isArray(raw) ? raw : [];

        // Category filter
        if (category !== "all") {
          products = products.filter(
            (p) => p.category?.slug === category || p.category?.name?.toLowerCase() === category.toLowerCase()
          );
        }

        // Search filter
        if (search) {
          products = products.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Sort
        if (sortBy === "price-asc") {
          products = [...products].sort(
            (a, b) =>
              (a.variants?.[0]?.sellingPrice || a.price || 0) -
              (b.variants?.[0]?.sellingPrice || b.price || 0)
          );
        } else if (sortBy === "price-desc") {
          products = [...products].sort(
            (a, b) =>
              (b.variants?.[0]?.sellingPrice || b.price || 0) -
              (a.variants?.[0]?.sellingPrice || a.price || 0)
          );
        }

        const formatted = products.map((p) => {
          const firstVariant = p.variants?.[0];
          const price = firstVariant?.sellingPrice || firstVariant?.price || p.offerPrice || p.price || 4.99;
          const mrp = firstVariant?.mrp || p.price || (price * 1.2).toFixed(2);
          const weight = firstVariant?.weight ? `${firstVariant.weight}g` : firstVariant?.unit || p.weight || "1 kg";

          return {
            id: p._id || p.id,
            name: p.name,
            image: p.images?.[0] || p.image || PLACEHOLDER_IMG,
            tag: p.category?.name || "Groceries",
            price: Number(price),
            mrp: Number(mrp),
            weight,
          };
        });

        setFilteredProducts(formatted);
      } catch (err) {
        console.error("Products fetch error:", err);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, search, sortBy, isDeals]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set("search", searchInput.trim());
    } else {
      next.delete("search");
    }
    setSearchParams(next);
  };

  const clearSearch = () => {
    setSearchInput("");
    const next = new URLSearchParams(searchParams);
    next.delete("search");
    setSearchParams(next);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      offerPrice: product.price,
      weight: product.weight,
      tag: product.tag,
    });
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find((c) => c.id === productId);
    return item ? item.quantity : 0;
  };

  const selectedCategory = categories.find((c) => c.slug === category);
  const displayLabel = search
    ? `"${search}"`
    : isDeals
    ? "Best Deals Today"
    : selectedCategory?.name || (category !== "all" ? category : "All Products");

  return (
    <div className="bg-gray-50 min-h-screen pb-24 font-sans">
      {/* ============================================================ */}
      {/* 1. TOP HEADER (Back button + Search Pill + Filter Icon - Image 1) */}
      {/* ============================================================ */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center gap-2.5">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all shrink-0 focus:outline-none"
            aria-label="Go Back"
          >
            <FiArrowLeft size={20} />
          </button>

          {/* Search Pill Input with Clear ✕ */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center justify-between"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent text-sm font-semibold text-gray-900 outline-none w-full placeholder-gray-400"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-700 ml-2 focus:outline-none"
              >
                <FiX size={18} />
              </button>
            )}
          </form>

          {/* Filter Sliders Icon Button */}
          <button
            type="button"
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 focus:outline-none ${
              filterOpen ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            aria-label="Filter"
          >
            <FiSliders size={18} />
          </button>
        </div>

        {/* Filter Popup / Drawer */}
        {filterOpen && (
          <div className="max-w-4xl mx-auto mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2 animate-fade-in">
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("category");
                setSearchParams(next);
                setFilterOpen(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                category === "all" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c._id || c.slug}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set("category", c.slug);
                  setSearchParams(next);
                  setFilterOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  category === c.slug ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. RESULTS SUBTITLE: Showing X results for "..." */}
      {/* ============================================================ */}
      <div className="max-w-4xl mx-auto px-4 pt-3.5 pb-2">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Showing <span className="font-extrabold text-gray-900">{filteredProducts.length} results</span> for{" "}
          <span className="font-bold text-gray-900">{displayLabel}</span>
        </p>
      </div>

      {/* ============================================================ */}
      {/* 3. 2-COLUMN PRODUCT GRID (Matching Image 1 Screenshot) */}
      {/* ============================================================ */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-2">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-[24px] p-3 shadow-xs animate-pulse space-y-3">
                <div className="w-full aspect-square bg-gray-200 rounded-2xl"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-9 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[24px] p-10 text-center border border-gray-100 shadow-xs mt-4">
            <h4 className="font-extrabold text-gray-900 text-base mb-1">No products found</h4>
            <p className="text-gray-500 text-xs mb-4">Try clearing filters or search query.</p>
            <button
              onClick={clearSearch}
              className="bg-purple-600 text-white px-5 py-2 rounded-full text-xs font-bold"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const qty = getCartQuantity(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-[24px] border border-gray-100 p-3 sm:p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square rounded-2xl bg-gray-50 overflow-hidden mb-2.5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PLACEHOLDER_IMG;
                      }}
                    />
                  </div>

                  {/* Price, Name, Unit (Matching Image 1 hierarchy) */}
                  <div>
                    <span className="font-extrabold text-base sm:text-lg text-gray-900 block leading-tight">
                      ₹{product.price}
                    </span>
                    <h3 className="font-extrabold text-sm text-gray-900 truncate mt-1">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium mb-3">
                      {product.weight}
                    </p>
                  </div>

                  {/* Full-width Pink Button or Stepper (Matching Image 1) */}
                  <div onClick={(e) => e.stopPropagation()}>
                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm text-center shadow-xs active:scale-[0.98] transition-transform focus:outline-none"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      /* Quantity Stepper with Pink Buttons (Matching Image 1) */
                      <div className="flex items-center justify-between gap-2 bg-gray-50 border border-pink-100 rounded-2xl p-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (qty === 1) {
                              removeFromCart(product.id, product.weight);
                            } else {
                              updateCartQuantity(product.id, product.weight, qty - 1);
                            }
                          }}
                          className="w-9 h-9 rounded-xl bg-[#f43f5e] hover:bg-[#e11d48] text-white flex items-center justify-center font-extrabold active:scale-90 transition-transform shadow-xs"
                        >
                          <FiMinus size={15} strokeWidth={2.5} />
                        </button>

                        <span className="font-extrabold text-sm text-gray-900 text-center flex-1">
                          {qty}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(product.id, product.weight, qty + 1)
                          }
                          className="w-9 h-9 rounded-xl bg-[#f43f5e] hover:bg-[#e11d48] text-white flex items-center justify-center font-extrabold active:scale-90 transition-transform shadow-xs"
                        >
                          <FiPlus size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}