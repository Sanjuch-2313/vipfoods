import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiHeart, FiPlus, FiMinus } from "react-icons/fi";
import { getCategories } from "../services/categoryService";
import { getShopProducts } from "../services/productService";
import { useCart } from "../context/CartContext";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <text x='50%' y='50%' font-family='sans-serif' font-size='22' fill='#9ca3af' text-anchor='middle' dominant-baseline='middle'>VIP Foods</text>
    </svg>`
  );

const PAGE_SIZE = 8;

import { filterAndSortProducts } from "../utils/shopFilters";

/* ── Per-card component – manages its own selected variant ── */
function ShopProductCard({ product, isWishlisted, onToggleWishlist, onToast }) {
  const { addToCart, cartItems, updateCartQuantity } = useCart();

  // Build a clean variants list from whatever the backend sends
  const variants = (product.variants || []).map((v) => ({
    label: v.weight || v.unit || "1 kg",
    price: v.sellingPrice || v.price || 0,
    mrp: v.mrp || 0,
  }));

  const [selectedIdx, setSelectedIdx] = useState(0);

  // Fallback when product has no variants array
  const selectedVariant = variants[selectedIdx] || {
    label: product.weight || "1 kg",
    price: product.offerPrice || product.price || 0,
    mrp: product.price || 0,
  };

  const thumbnail = product.images?.[0] || product.image || PLACEHOLDER_IMG;

  // Find quantity already in cart for this specific variant
  const cartItem = cartItems.find(
    (item) =>
      (item.id === (product._id || product.id)) &&
      item.weight === selectedVariant.label
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  const mrp = Number(selectedVariant.mrp);
  const price = Number(selectedVariant.price);
  const hasDiscount = Number.isFinite(mrp) && Number.isFinite(price) && mrp > 0 && price >= 0 && price < mrp;
  const badge = hasDiscount
    ? { text: `${Math.round(((mrp - price) / mrp) * 100)}% OFF`, bg: "bg-red-500 text-white" }
    : null;

  const wish = isWishlisted(product._id || product.id);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart({
      id: product._id || product.id,
      name: product.name,
      image: thumbnail,
      price: Number(selectedVariant.price),
      offerPrice: Number(selectedVariant.price),
      weight: selectedVariant.label,
      tag: product.category?.name || "Groceries",
    });
    onToast(`Added ${product.name} (${selectedVariant.label}) to cart!`);
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    updateCartQuantity(product._id || product.id, selectedVariant.label, quantity + 1);
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    updateCartQuantity(product._id || product.id, selectedVariant.label, quantity - 1);
  };

  return (
    <div className="bg-white rounded-[22px] border border-gray-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        {badge && (
          <span
            className={`absolute top-2.5 left-2.5 z-10 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-tight ${badge.bg}`}
          >
            {badge.text}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs text-gray-400 hover:text-red-500 hover:bg-white active:scale-90 transition-all focus:outline-none"
          aria-label="Wishlist"
        >
          <FiHeart
            className={wish ? "text-red-500 fill-red-500" : "text-gray-500"}
            size={16}
          />
        </button>

        <img
          src={thumbnail}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMG;
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-extrabold text-sm text-gray-900 truncate leading-snug">
            {product.name}
          </h3>

          {/* Sliding variant weight chips */}
          {variants.length > 0 ? (
            <div
              className="flex gap-1.5 mt-1.5 overflow-x-auto pb-0.5"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            >
              {variants.map((v, i) => (
                <button
                  key={`${v.label}-${i}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIdx(i);
                  }}
                  className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all whitespace-nowrap ${
                    selectedIdx === i
                      ? "bg-rose-50 border-rose-400 text-rose-600"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              {selectedVariant.label}
            </p>
          )}
        </div>

        {/* Price + Add/Qty row */}
        <div className="flex items-center justify-between mt-3 pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-sm sm:text-base text-gray-900">
              ₹{selectedVariant.price}
            </span>
            {Number(selectedVariant.mrp) > Number(selectedVariant.price) && (
              <span className="text-[11px] text-gray-400 line-through">
                ₹{selectedVariant.mrp}
              </span>
            )}
          </div>

          {quantity > 0 ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDecrease}
                className="w-7 h-7 rounded-full bg-[#f43f5e] text-white flex items-center justify-center active:scale-90 transition-transform focus:outline-none"
              >
                <FiMinus size={13} strokeWidth={3} />
              </button>
              <span className="text-sm font-bold text-gray-900 min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                className="w-7 h-7 rounded-full bg-[#f43f5e] text-white flex items-center justify-center active:scale-90 transition-transform focus:outline-none"
              >
                <FiPlus size={13} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="w-8 h-8 rounded-full bg-[#f43f5e] hover:bg-[#e11d48] text-white flex items-center justify-center shadow-sm active:scale-90 transition-transform focus:outline-none"
              title="Add to cart"
            >
              <FiPlus size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Shop page ── */
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlistItems, toggleWishlist } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const selectedCategory = searchParams.get("category") || "all";
  const selectedSubcategory = searchParams.get("subcategory") || "";
  const sort = searchParams.get("sort") || "default";
  const panel = searchParams.get("panel");
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  const updateParams = (changes) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      for (const [key, value] of Object.entries(changes)) {
        if (!value || value === "all" || value === "default") next.delete(key);
        else next.set(key, value);
      }
      return next;
    }, { replace: true });
  };
  const setSelectedCategory = (category) => updateParams({ category, subcategory: "" });
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let isMounted = true;

    const fetchShopProducts = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const [categoryData, productData] = await Promise.all([
          getCategories(),
          getShopProducts(),
        ]);

        if (!isMounted) return;

        const catList = Array.isArray(categoryData) ? categoryData : [];
        setCategories(
          catList
            .filter((c) => c.active !== false)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        );

        const list = Array.isArray(productData) ? productData : [];
        setProducts(list.filter((p) => p.active !== false && p.published !== false));
      } catch (err) {
        console.error("Failed to load shop data:", err);
        if (isMounted) setLoadError("Could not load store products and filters. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchShopProducts();

    return () => {
      isMounted = false;
    };
  }, [reload]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [selectedCategory, selectedSubcategory, sort]);

  const isWishlisted = (productId) =>
    wishlistItems.some((item) => item.id === productId || item._id === productId);

  const handleToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2000);
  };

  const category = categories.find((item) => (item.slug || item.name) === selectedCategory);
  const subcategories = (category?.subCategories || []).filter((item) => item.active !== false);
  const subcategory = subcategories.find((item) => (item.slug || item.name) === selectedSubcategory);
  const filteredProducts = filterAndSortProducts(products, category, subcategory, sort);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="bg-gray-50 min-h-screen pb-24 font-sans">
      {toastMsg && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg animate-bounce">
          {toastMsg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
        {panel === "sort" && (
          <section aria-label="Sort products" className="mb-4 rounded-2xl bg-white border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="shop-sort" className="font-bold">Sort products</label>
              <button type="button" onClick={() => updateParams({ panel: "" })} className="text-sm font-bold text-green-700">Done</button>
            </div>
            <select id="shop-sort" value={sort} onChange={(event) => updateParams({ sort: event.target.value })} className="w-full rounded-xl border border-gray-200 p-3 text-sm">
              <option value="default">Recommended</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
              <option value="newest">Newest first</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </section>
        )}
        {panel === "filters" && (
          <section aria-label="Filter products" className="mb-4 rounded-2xl bg-white border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Filter products</h3>
              <button type="button" onClick={() => updateParams({ panel: "" })} className="text-sm font-bold text-green-700">Done</button>
            </div>
            <label htmlFor="shop-category" className="block text-sm font-semibold">Category</label>
            <select id="shop-category" value={selectedCategory} disabled={loading} onChange={(event) => setSelectedCategory(event.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-sm">
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item._id || item.slug} value={item.slug || item.name}>{item.name}</option>)}
            </select>
            <label htmlFor="shop-subcategory" className="block text-sm font-semibold">Subcategory</label>
            <select id="shop-subcategory" value={selectedSubcategory} disabled={loading || !subcategories.length} onChange={(event) => updateParams({ subcategory: event.target.value })} className="w-full rounded-xl border border-gray-200 p-3 text-sm disabled:bg-gray-50">
              <option value="">{!category ? "Choose a category first" : "All subcategories"}</option>
              {subcategories.map((item) => <option key={item.slug || item.name} value={item.slug || item.name}>{item.name}</option>)}
            </select>
            <button type="button" onClick={() => setSelectedCategory("all")} className="text-sm font-bold text-green-700">Clear filters</button>
          </section>
        )}
        {loadError && <div role="alert" className="mb-4 text-sm text-red-600">{loadError} <button type="button" onClick={() => setReload((value) => value + 1)} className="font-bold underline">Retry</button></div>}
        <section className="pt-2 pb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">Shop by Category</h3>
            <Link to="/products" className="text-pink-500 text-xs sm:text-sm font-bold hover:underline">
              See all
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {loading ? (
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center min-w-[76px] animate-pulse">
                    <div className="w-[72px] h-[72px] rounded-full bg-gray-200 mb-2"></div>
                    <div className="w-12 h-3 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">No categories found</p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`flex flex-col items-center min-w-[76px] sm:min-w-[88px] snap-start group ${
                    selectedCategory === "all"
                      ? "opacity-100"
                      : "opacity-80"
                  }`}
                >
                  <div className={`w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full bg-white overflow-hidden shadow-xs mb-2 border-2 transition-colors ${selectedCategory === "all" ? "border-pink-200" : "border-white"}`}>
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-green-50 text-lg font-black text-gray-800">
                      All
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 text-center truncate max-w-[88px]">
                    All
                  </span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat._id || cat.slug}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug || cat.name)}
                    className={`flex flex-col items-center min-w-[76px] sm:min-w-[88px] snap-start group ${
                      selectedCategory === (cat.slug || cat.name)
                        ? "opacity-100"
                        : "opacity-80"
                    }`}
                  >
                    <div className={`w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full bg-white overflow-hidden shadow-xs mb-2 border-2 transition-colors ${selectedCategory === (cat.slug || cat.name) ? "border-pink-200" : "border-white"}`}>
                      <img
                        src={cat.image || PLACEHOLDER_IMG}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER_IMG;
                        }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-gray-800 text-center truncate max-w-[88px]">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[24px] p-3 shadow-xs animate-pulse flex flex-col justify-between h-64"
              >
                <div className="bg-gray-200 h-36 rounded-2xl w-full mb-3"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2 mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="bg-gray-200 h-5 rounded w-1/3"></div>
                  <div className="bg-gray-200 h-8 w-8 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <h3 className="font-bold text-gray-800 text-lg mb-1">No products available</h3>
            <p className="text-gray-500 text-sm mb-4">Check back soon for fresh arrivals!</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setVisibleCount(PAGE_SIZE);
              }}
              className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow hover:bg-green-700 transition-colors"
            >
              Show All
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 font-medium mb-3 px-0.5">
              Showing 1–{visibleProducts.length} of {filteredProducts.length} results
              {subcategory && ` · ${subcategory.name}`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {visibleProducts.map((product) => (
                <ShopProductCard
                  key={product._id || product.id}
                  product={product}
                  isWishlisted={isWishlisted}
                  onToggleWishlist={toggleWishlist}
                  onToast={handleToast}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-6 mb-2">
                <button
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="bg-[#f43f5e] hover:bg-[#e11d48] active:scale-95 text-white font-bold px-8 py-3 rounded-full shadow-md transition-all text-sm tracking-wide"
                >
                  Load More Products
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
