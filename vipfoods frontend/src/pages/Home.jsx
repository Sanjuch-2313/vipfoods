import vipLogoImage from "../assets/viplogo.jpg";
import vipFreshImage from "../assets/vipfresh.jpg";
import vipDairyImage from "../assets/vipdairy.jpg";
import vipSnacksImage from "../assets/vipsnacks.jpg";
import vipPicklesImage from "../assets/vippickles.jpg";
import vipSpicesImage from "../assets/vipspices.jpg";
import vipOrganicsImage from "../assets/viporganics.jpg";
import { imageDelivery } from "../utils/imageDelivery";
import FirstVisitTour from "../components/FirstVisitTour";
import "../components/FirstVisitTour.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiPlus, FiArrowRight, FiAward, FiTruck, FiMinus } from "react-icons/fi";
import { getCategories } from "../services/categoryService";
import { getShopProducts } from "../services/productService";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay } from "swiper/modules";


import "swiper/css";
import "./HomeBanner.css";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <text x='50%' y='50%' font-family='sans-serif' font-size='22' fill='#9ca3af' text-anchor='middle' dominant-baseline='middle'>VIP Foods</text>
    </svg>`
  );

const defaultHeroSlides = [
  { id: "logo-banner", title: "VIP Foods", image: vipLogoImage },
  { id: "fresh-banner", title: "VIP Fresh", image: vipFreshImage },
  { id: "dairy-banner", title: "VIP Dairy", image: vipDairyImage },
  { id: "snacks-banner", title: "VIP Snacks", image: vipSnacksImage },
  { id: "pickles-banner", title: "VIP Pickles", image: vipPicklesImage },
  { id: "spices-banner", title: "VIP Spices", image: vipSpicesImage },
  { id: "organics-banner", title: "VIP Organics", image: vipOrganicsImage },
];

/* ── Per-deal card with variant state ── */
function DealCard({ deal, onToast }) {
  const { addToCart, cartItems, updateCartQuantity, wishlistItems, toggleWishlist } = useCart();

  const normalizeWeightLabel = (value, fallback = "1 kg") => {
    if (value === null || value === undefined || value === "") return fallback;

    const text = String(value).trim();
    if (!text) return fallback;

    return /^\d+(?:\.\d+)?$/.test(text) ? `${text} g` : text;
  };

  const variants = (deal.variants || []).map((v) => ({
    label: normalizeWeightLabel(v.weight, v.unit || "1 kg"),
    price: Number(v.sellingPrice ?? v.price ?? 0),
    mrp: Number(v.mrp || 0),
  }));

  const [selectedIdx, setSelectedIdx] = useState(0);

  const selected = variants[selectedIdx] || {
    label: normalizeWeightLabel(deal.weight, deal.unit || "1 unit"),
    price: Number(deal.offerPrice || deal.price || 0),
    mrp: Number(deal.price || 0),
  };

  const id = deal._id || deal.id;
  const thumbnail = deal.images?.[0] || deal.image || PLACEHOLDER_IMAGE;
  const hasDiscount = selected.mrp > selected.price;
  const badge = hasDiscount ? `${Math.round((selected.mrp - selected.price) / selected.mrp * 100)}% OFF` : "Best Deal";
  const wishlisted = wishlistItems.some((item) => (item._id || item.id) === id);

  const cartItem = cartItems.find((c) => c.id === id && c.weight === selected.label);
  const qty = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart({
      id,
      name: deal.name,
      image: thumbnail,
      price: selected.price,
      offerPrice: selected.price,
      weight: selected.label,
      tag: deal.category?.name || "Deals",
    });
    onToast(`Added ${deal.name} (${selected.label}) to cart!`);
  };

  const handleIncrease = (e) => { e.stopPropagation(); updateCartQuantity(id, selected.label, qty + 1); };
  const handleDecrease = (e) => { e.stopPropagation(); updateCartQuantity(id, selected.label, Math.max(0, qty - 1)); };

  return (
    <div className="w-40 sm:w-48 md:w-52 shrink-0 snap-start bg-white rounded-[22px] border border-gray-100 p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Image */}
      <div className="relative w-full aspect-square rounded-2xl bg-gray-50 overflow-hidden mb-2">
        <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
          {badge}
        </span>
        <button
          type="button"
          onClick={() => toggleWishlist(deal)}
          aria-label={wishlisted ? `Remove ${deal.name} from wishlist` : `Add ${deal.name} to wishlist`}
          aria-pressed={wishlisted}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-rose-500 shadow-sm"
        >
          <FiHeart size={17} fill={wishlisted ? "currentColor" : "none"} />
        </button>
        <img
          src={imageDelivery(thumbnail)}
          alt={deal.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy" decoding="async"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMAGE; }}
        />
      </div>

      {/* Name */}
      <div>
        <h4 className="font-extrabold text-sm sm:text-base text-gray-900 truncate">{deal.name}</h4>

        {/* Sliding variant chips */}
        {variants.length > 0 ? (
          <div
            className="flex gap-1.5 mt-1 overflow-x-auto pb-0.5"
            style={{ scrollbarWidth: "none" }}
          >
            {variants.map((v, i) => (
              <button
                key={`${v.label}-${i}`}
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedIdx(i); }}
                className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedIdx === i
                    ? "bg-rose-50 border-rose-400 text-rose-600"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[11px] sm:text-xs text-gray-400 font-medium">{selected.label}</p>
        )}
      </div>

      {/* Price + Add/Stepper */}
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-50">
        <div>
          <span className="font-extrabold text-sm sm:text-base text-gray-900">₹{selected.price}</span>
          {hasDiscount && <del className="block text-xs text-gray-400">₹{selected.mrp}</del>}
        </div>

        {qty > 0 ? (
          <div className="flex items-center gap-1">
            <button
              type="button" onClick={handleDecrease}
              className="w-7 h-7 rounded-full bg-[#f43f5e] text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <FiMinus size={12} strokeWidth={3} />
            </button>
            <span className="text-sm font-bold text-gray-900 min-w-[18px] text-center">{qty}</span>
            <button
              type="button" onClick={handleIncrease}
              className="w-7 h-7 rounded-full bg-[#f43f5e] text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <FiPlus size={12} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className="w-8 h-8 rounded-full bg-[#f43f5e] hover:bg-[#e11d48] text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform"
            title="Add to cart"
          >
            <FiPlus size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const heroSlides = defaultHeroSlides;
  const [promoItems, setPromoItems] = useState([
    "Free Delivery on orders above ₹499",
    "Fresh farm picks every day",
    "VIP offers updated weekly",
    "Extra savings on organic essentials",
  ]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    // Categories should not wait for every page of the product catalog.
    getCategories().then((data) => {
      if (!isMounted) return;
      setCategories((Array.isArray(data) ? data : [])
        .filter((category) => category.active !== false)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    }).catch(() => {}).finally(() => { if (isMounted) setCategoriesLoading(false); });

    getShopProducts().then((data) => {
      if (!isMounted) return;
      setProducts((Array.isArray(data) ? data : [])
        .filter((product) => product.active !== false && product.published !== false));
    }).catch(() => {}).finally(() => { if (isMounted) setLoading(false); });

    const fetchCoupons = async () => {
      try {
        const { data } = await api.get("/coupons");
        const fetchedCoupons = Array.isArray(data?.coupons) ? data.coupons : [];

        if (!fetchedCoupons.length) return;

        const couponOffers = fetchedCoupons.slice(0, 5).map((coupon) => {
          const discount = coupon.discount || coupon.discountValue || 0;
          return `${coupon.code || "VIP OFFER"} • ${discount}% OFF`;
        });

        setPromoItems((prev) => [
          "Free Delivery on orders above ₹499",
          ...couponOffers,
          "Fresh farm picks every day",
          ...prev.filter((item) => !couponOffers.includes(item) && item !== "Free Delivery on orders above ₹499"),
        ]);
      } catch (err) {
        console.error("Coupon ticker fetch failed:", err);
      }
    };

    fetchCoupons();
    return () => { isMounted = false; };
  }, []);

  const freshCategory = categories.find((item) => /^(vip[ -]?)?fresh$/i.test(item.slug || item.name));
  const freshLink = (kind) => {
    const sub = freshCategory?.subCategories?.find((item) => item.active !== false &&
      new RegExp(kind, "i").test(`${item.name} ${item.slug}`));
    return `/products?${new URLSearchParams({ category: freshCategory?.slug || "vip-fresh", subcategory: sub?.name || kind })}`;
  };

  const displayedDeals = products.filter((product) => product.bestDeal === true).slice(0, 20);



  const handleToast = (msg) => {
    setToastMsg(msg);
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

      <div className="max-w-7xl mx-auto">
        <section className="px-1 sm:px-2 pt-4 sm:pt-5" aria-label="VIP Foods featured banners">
          <Swiper
            modules={[A11y, Autoplay]}
            slidesPerView={1}
            initialSlide={0}
            speed={650}
            loop
            autoplay={window.matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { delay: 3000, disableOnInteraction: false }}
            className="home-banner-carousel overflow-hidden rounded-[32px] sm:rounded-[42px] shadow-lg shadow-black/10 bg-[#021b2f]"
          >
            {heroSlides.map((slide, index) => (
              <SwiperSlide key={slide.id}>
                <div className="home-banner-frame relative h-[200px] sm:h-[260px] md:h-[300px] lg:h-[340px] bg-[#021b2f]">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    width={1600}
                    height={449}
                    className="pointer-events-none block h-full w-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                </div>
              </SwiperSlide>
            ))}
            <p slot="container-end" className="home-banner-note">
              <span className="home-banner-note-text"><strong>Note:</strong> VIP Fresh & Dairy &amp; products available for Guntur &amp; Vijayawada only.</span>
            </p>
          </Swiper>
        </section>

        <section className="px-1 sm:px-2 pt-3 sm:pt-4">
          <div className="overflow-hidden rounded-full border border-sky-400/30 bg-[#021b2f] shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <div className="ticker-track flex items-center whitespace-nowrap py-2.5 sm:py-3 text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.12em] text-sky-100 uppercase">
              {[...promoItems, ...promoItems].map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-center shrink-0 px-3 sm:px-4">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.9)] mr-3" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <style>{`
          @keyframes homeCategoryZoom {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.12); }
          }

          .home-category-image {
            animation: homeCategoryZoom 3s ease-in-out infinite;
          }

          @keyframes homeCategoryGlow {
            0%, 100% { box-shadow: 0 0 6px rgba(22, 163, 74, 0.3), 0 0 12px rgba(34, 197, 94, 0.18); }
            50% { box-shadow: 0 0 10px rgba(22, 163, 74, 0.55), 0 0 20px rgba(34, 197, 94, 0.35); }
          }

          .home-category-glow {
            border-color: #86efac;
            box-shadow: 0 0 10px rgba(22, 163, 74, 0.35);
            animation: homeCategoryGlow 3s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .home-category-image, .home-category-glow { animation: none; }
          }

          @keyframes scrollTicker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          .ticker-track {
            width: max-content;
            animation: scrollTicker 24s linear infinite;
          }
        `}</style>

        {/* ============================================================ */}
        {/* 1. SHOP BY CATEGORY (Circular Avatars Horizontal Scroll) */}
        {/* ============================================================ */}
        <FirstVisitTour />
        <section data-tour="categories" className="px-4 pt-4 sm:pt-6">
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

          <div className="flex gap-4 overflow-x-auto px-3 py-3 -mx-3 scrollbar-hide">
            {categoriesLoading ? (
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
                  className="flex shrink-0 flex-col items-center w-[76px] sm:w-[88px] group"
                >
                  <div className="home-category-glow w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full bg-white overflow-hidden mb-2 border-2 group-hover:border-green-500 transition-colors">
                    <img
                      src={imageDelivery(cat.image, 180) || PLACEHOLDER_IMAGE}
                      alt={cat.name}
                      className="home-category-image w-full h-full object-cover"
                      loading="lazy" decoding="async"
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
        <section data-tour="deals" className="px-4 mt-6">
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
              {displayedDeals.map((deal, idx) => (
                <DealCard
                  key={deal._id || deal.id || idx}
                  deal={deal}
                  idx={idx}
                  onToast={handleToast}
                />
              ))}



              {/* "View More" Slide-End Card */}
              <Link
                to="/products?deals=true"
                className="w-36 sm:w-44 shrink-0 snap-start bg-green-50 hover:bg-green-100 border border-green-100 rounded-[22px] p-4 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mb-2 shadow group-hover:scale-110 transition-transform">
                  <FiArrowRight size={20} />
                </div>
                <span className="font-extrabold text-sm sm:text-base text-green-900">
                  View More
                </span>
                <span className="text-[11px] text-green-600 font-semibold mt-0.5">
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
              to={freshLink("fruits")}
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
              to={freshLink("vegetables")}
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

            {/* VIP Combo Packs */}
            <Link
              to="/combo-packs"
              data-tour="combos"
              className="vip-combo-highlight relative rounded-[22px] bg-gradient-to-br from-lime-50 via-emerald-50/60 to-lime-100/80 border border-lime-200/70 overflow-hidden p-2.5 sm:p-4 flex flex-col justify-between h-32 sm:h-38 md:h-44 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-lime-50 via-lime-50/20 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1550989460-0adc9554f529?auto=format&fit=crop&w=400&q=80"
                  alt="VIP Combo Packs"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </div>

              <div className="relative z-20 max-w-[62%] sm:max-w-[65%] flex flex-col justify-between h-full">
                <div>
                  <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider text-lime-800 bg-lime-100/90 px-1.5 py-0.5 rounded-full mb-1">
                    Your choice
                  </span>
                  <h5 className="font-black text-gray-900 text-[11px] sm:text-base md:text-lg leading-tight">
                    VIP Combo<br />Packs
                  </h5>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5 hidden md:block line-clamp-1">
                    Build your own combo
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
              loading="lazy" decoding="async"
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
