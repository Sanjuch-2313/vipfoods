import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus, FiArrowRight, FiAward, FiTruck } from "react-icons/fi";
import { getCategories } from "../services/categoryService";
import { getProducts } from "../services/productService";
import { useCart } from "../context/CartContext";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <text x='50%' y='50%' font-family='sans-serif' font-size='22' fill='#9ca3af' text-anchor='middle' dominant-baseline='middle'>VIP Foods</text>
    </svg>`
  );

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const [catData, prodData] = await Promise.all([
          getCategories().catch(() => []),
          getProducts().catch(() => []),
        ]);

        if (!isMounted) return;

        const catList = Array.isArray(catData) ? catData : [];
        setCategories(
          catList
            .filter((c) => c.active !== false)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        );

        const prodList = Array.isArray(prodData) ? prodData : [];
        setProducts(
          prodList.filter((p) => p.active !== false && p.published !== false)
        );
      } catch (err) {
        console.error("Home data error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Up to 20 products purely fetched from backend (added from admin)
  const displayedDeals = products.slice(0, 20);

  const handleQuickAdd = (e, deal) => {
    e.stopPropagation();
    const price =
      deal.variants?.[0]?.sellingPrice ||
      deal.variants?.[0]?.price ||
      deal.offerPrice ||
      deal.price ||
      0;
    const weight =
      deal.variants?.[0]?.weight ||
      deal.variants?.[0]?.unit ||
      deal.weight ||
      "1 kg";

    addToCart({
      id: deal._id || deal.id,
      name: deal.name,
      image: deal.images?.[0] || deal.image || PLACEHOLDER_IMAGE,
      price: Number(price),
      offerPrice: Number(price),
      weight,
      tag: deal.category?.name || "Deals",
    });

    setToastMsg(`Added ${deal.name} to cart!`);
    setTimeout(() => setToastMsg(""), 2000);
  };

  return (
    <main className="bg-gray-50 min-h-screen pb-28 font-sans w-full overflow-x-hidden">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg">
          {toastMsg}
        </div>
      )}

      <div className="max-w-5xl xl:max-w-6xl mx-auto">
        {/* ============================================================ */}
        {/* 1. SHOP BY CATEGORY (Circular Avatars Horizontal Scroll) */}
        {/* ============================================================ */}
        <section className="px-4 pt-4 sm:pt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
              Shop by Category
            </h3>
            <Link
              to="/products"
              className="text-pink-500 text-xs sm:text-sm font-bold hover:underline"
            >
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
              categories.map((cat) => (
                <Link
                  key={cat._id || cat.slug}
                  to={`/products?category=${cat.slug || cat.name}`}
                  className="flex flex-col items-center min-w-[76px] sm:min-w-[88px] snap-start group"
                >
                  <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full bg-white overflow-hidden shadow-xs mb-2 border-2 border-white group-hover:border-pink-200 transition-colors">
                    <img
                      src={cat.image || PLACEHOLDER_IMAGE}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 text-center truncate max-w-[88px]">
                    {cat.name}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. BEST DEALS TODAY (Fetched directly from backend/admin) */}
        {/* ============================================================ */}
        <section className="px-4 mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
              Best Deals Today
            </h3>
            <Link
              to="/products?deals=true"
              className="text-pink-500 text-xs sm:text-sm font-bold hover:underline"
            >
              See all
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-40 sm:w-48 shrink-0 bg-white rounded-[22px] p-3 shadow-xs animate-pulse space-y-3"
                >
                  <div className="w-full aspect-square bg-gray-200 rounded-2xl"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : displayedDeals.length === 0 ? (
            <div className="bg-white rounded-[22px] p-6 text-center border border-gray-100">
              <p className="text-sm text-gray-500">No deal products added yet.</p>
            </div>
          ) : (
            <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 scrollbar-hide snap-x">
              {displayedDeals.map((deal, idx) => {
                const thumbnail = deal.images?.[0] || deal.image || PLACEHOLDER_IMAGE;
                const price =
                  deal.variants?.[0]?.sellingPrice ||
                  deal.variants?.[0]?.price ||
                  deal.offerPrice ||
                  deal.price ||
                  0;
                const weight =
                  deal.variants?.[0]?.weight
                    ? `${deal.variants[0].weight}g`
                    : deal.variants?.[0]?.unit || deal.weight || "1 unit";
                const badge =
                  deal.badges?.[0] ||
                  (idx % 2 === 0 ? "15% OFF" : idx % 3 === 0 ? "50% OFF" : "SALE");

                return (
                  <div
                    key={deal._id || deal.id || idx}
                    className="w-40 sm:w-48 md:w-52 shrink-0 snap-start bg-white rounded-[22px] border border-gray-100 p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    {/* Image Box with Discount Badge */}
                    <div className="relative w-full aspect-square rounded-2xl bg-gray-50 overflow-hidden mb-2">
                      <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                        {badge}
                      </span>
                      <img
                        src={thumbnail}
                        alt={deal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-gray-900 truncate">
                        {deal.name}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
                        {weight}
                      </p>
                    </div>

                    {/* Price & Add Button */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-50">
                      <span className="font-extrabold text-sm sm:text-base text-gray-900">
                        ₹{price}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, deal)}
                        className="w-8 h-8 rounded-full bg-[#f43f5e] hover:bg-[#e11d48] text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform"
                        title="Add to cart"
                      >
                        <FiPlus size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* "View More" Slide-End Card */}
              <Link
                to="/products?deals=true"
                className="w-36 sm:w-44 shrink-0 snap-start bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-[22px] p-4 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center mb-2 shadow group-hover:scale-110 transition-transform">
                  <FiArrowRight size={20} />
                </div>
                <span className="font-extrabold text-sm sm:text-base text-purple-900">
                  View More
                </span>
                <span className="text-[11px] text-purple-600 font-semibold mt-0.5">
                  All Deals
                </span>
              </Link>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 3. FRESH CATEGORIES TILES */}
        {/* ============================================================ */}
        <section className="px-4 mt-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                Fresh Farm Collections
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
                Naturally harvested, delivered fresh daily
              </p>
            </div>
            <Link
              to="/products"
              className="text-pink-500 text-xs sm:text-sm font-bold hover:underline"
            >
              View all
            </Link>
          </div>

          {/* Row 1: 2 Large Hero Tiles (Fresh Fruits & Fresh Vegetables) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* Fresh Fruits */}
            <Link
              to="/products?category=fruits"
              className="relative rounded-[24px] bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-100/90 border border-emerald-200/70 overflow-hidden p-3.5 sm:p-5 flex flex-col justify-between h-36 sm:h-44 md:h-48 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              {/* Right-side food image with smooth blend mask */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-5/12 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-emerald-50/20 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80"
                  alt="Fresh Fruits"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </div>

              {/* Left Content */}
              <div className="relative z-20 max-w-[58%] sm:max-w-[60%] flex flex-col justify-between h-full">
                <div>
                  <span className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full mb-1 sm:mb-1.5 shadow-2xs">
                    Farm Fresh
                  </span>
                  <h4 className="font-black text-gray-900 text-sm sm:text-xl md:text-2xl leading-tight">
                    Fresh<br />Fruits
                  </h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-1 hidden xs:block sm:block line-clamp-1">
                    Sweet, juicy & handpicked daily
                  </p>
                </div>

                <div className="mt-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-900 group-hover:bg-[#f43f5e] text-white flex items-center justify-center shadow-xs group-hover:shadow-md transition-all duration-300">
                    <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Fresh Vegetables */}
            <Link
              to="/products?category=vegetables"
              className="relative rounded-[24px] bg-gradient-to-br from-green-50 via-emerald-50/70 to-green-100/90 border border-green-200/70 overflow-hidden p-3.5 sm:p-5 flex flex-col justify-between h-36 sm:h-44 md:h-48 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              {/* Right-side food image with smooth blend mask */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-5/12 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 via-green-50/20 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
                  alt="Fresh Vegetables"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </div>

              {/* Left Content */}
              <div className="relative z-20 max-w-[58%] sm:max-w-[60%] flex flex-col justify-between h-full">
                <div>
                  <span className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-green-800 bg-green-100/90 px-2 py-0.5 rounded-full mb-1 sm:mb-1.5 shadow-2xs">
                    Daily Harvest
                  </span>
                  <h4 className="font-black text-gray-900 text-sm sm:text-xl md:text-2xl leading-tight">
                    Fresh<br />Vegetables
                  </h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-1 hidden xs:block sm:block line-clamp-1">
                    Crisp, fresh & nutrient packed
                  </p>
                </div>

                <div className="mt-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-900 group-hover:bg-[#f43f5e] text-white flex items-center justify-center shadow-xs group-hover:shadow-md transition-all duration-300">
                    <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Row 2: 3 Smaller Tiles */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
            {/* Leafy & Herbs */}
            <Link
              to="/products?category=leafy-herbs"
              className="relative rounded-[22px] bg-gradient-to-br from-teal-50 via-emerald-50/60 to-teal-100/80 border border-teal-200/70 overflow-hidden p-2.5 sm:p-4 flex flex-col justify-between h-32 sm:h-38 md:h-44 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-50 via-teal-50/20 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80"
                  alt="Leafy & Herbs"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </div>

              <div className="relative z-20 max-w-[62%] sm:max-w-[65%] flex flex-col justify-between h-full">
                <div>
                  <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider text-teal-800 bg-teal-100/90 px-1.5 py-0.5 rounded-full mb-1">
                    Organic
                  </span>
                  <h5 className="font-black text-gray-900 text-[11px] sm:text-base md:text-lg leading-tight">
                    Leafy<br />& Herbs
                  </h5>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5 hidden md:block line-clamp-1">
                    Aromatic & fresh
                  </p>
                </div>

                <div className="mt-1 sm:mt-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 group-hover:bg-[#f43f5e] text-white flex items-center justify-center shadow-xs group-hover:shadow transition-colors">
                    <FiArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Organic & Residue Free */}
            <Link
              to="/products?category=organic"
              className="relative rounded-[22px] bg-gradient-to-br from-lime-50 via-emerald-50/60 to-lime-100/80 border border-lime-200/70 overflow-hidden p-2.5 sm:p-4 flex flex-col justify-between h-32 sm:h-38 md:h-44 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-lime-50 via-lime-50/20 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1550989460-0adc9554f529?auto=format&fit=crop&w=400&q=80"
                  alt="Organic & Residue Free"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </div>

              <div className="relative z-20 max-w-[62%] sm:max-w-[65%] flex flex-col justify-between h-full">
                <div>
                  <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider text-lime-800 bg-lime-100/90 px-1.5 py-0.5 rounded-full mb-1">
                    Pure
                  </span>
                  <h5 className="font-black text-gray-900 text-[11px] sm:text-base md:text-lg leading-tight">
                    Organic &<br />Residue Free
                  </h5>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5 hidden md:block line-clamp-1">
                    Zero chemical sprays
                  </p>
                </div>

                <div className="mt-1 sm:mt-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 group-hover:bg-[#f43f5e] text-white flex items-center justify-center shadow-xs group-hover:shadow transition-colors">
                    <FiArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Cut & Sprouts */}
            <Link
              to="/products?category=sprouts"
              className="relative rounded-[22px] bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-100/80 border border-emerald-200/70 overflow-hidden p-2.5 sm:p-4 flex flex-col justify-between h-32 sm:h-38 md:h-44 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-emerald-50/20 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80"
                  alt="Cut & Sprouts"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </div>

              <div className="relative z-20 max-w-[62%] sm:max-w-[65%] flex flex-col justify-between h-full">
                <div>
                  <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-full mb-1">
                    Ready
                  </span>
                  <h5 className="font-black text-gray-900 text-[11px] sm:text-base md:text-lg leading-tight">
                    Cut &<br />Sprouts
                  </h5>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5 hidden md:block line-clamp-1">
                    Washed & chopped
                  </p>
                </div>

                <div className="mt-1 sm:mt-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 group-hover:bg-[#f43f5e] text-white flex items-center justify-center shadow-xs group-hover:shadow transition-colors">
                    <FiArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. HOME PAGE BOTTOM (100% Freshness, Fast Delivery, Organic Favorites) */}
        {/* ============================================================ */}
        <section className="px-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: 100% Freshness */}
            <div className="bg-[#059669] text-white rounded-[24px] p-4 sm:p-5 flex items-center gap-3.5 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <FiAward size={26} className="text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                  100% Freshness
                </h4>
                <p className="text-[11px] sm:text-xs text-emerald-100 opacity-90 mt-0.5">
                  We guarantee the quality of all our products.
                </p>
              </div>
            </div>

            {/* Card 2: Fast Delivery */}
            <div className="bg-[#f59e0b] text-white rounded-[24px] p-4 sm:p-5 flex items-center gap-3.5 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <FiTruck size={26} className="text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                  Fast Delivery
                </h4>
                <p className="text-[11px] sm:text-xs text-amber-100 opacity-90 mt-0.5">
                  Get your groceries delivered in as little as 1 hour.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Organic Favorites Banner */}
        <section className="px-4 mt-4">
          <div className="relative rounded-[28px] overflow-hidden shadow-sm h-64 sm:h-72">
            <img
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80"
              alt="Organic Vegetables"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"></div>

            <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center z-10">
              <h2 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
                Organic Favorites
              </h2>
              <p className="text-gray-100 text-xs sm:text-sm font-medium max-w-sm sm:max-w-md mx-auto mt-2 mb-5 leading-relaxed drop-shadow">
                Pure, healthy, and full of flavor. Explore our best organic products.
              </p>
              <Link
                to="/products"
                className="bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-sm px-8 py-3 rounded-2xl shadow-md active:scale-95 transition-transform"
              >
                Shop Organic
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
