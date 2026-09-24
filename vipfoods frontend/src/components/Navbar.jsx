import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiShoppingCart,
  FiBell,
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiFileText,
  FiCheckCircle,
  FiTag,
  FiPercent,
  FiCreditCard,
  FiUser,
  FiEdit2,
  FiMapPin,
  FiPlus,
  FiSettings,
  FiHelpCircle,
  FiSliders,
  FiLogOut,
  FiLogIn,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "./LocationPicker";
import api from "../services/api";

// Custom Storefront Icon matching bottom bar
function StorefrontIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 7l1-4h18l1 4c0 1.66-1.34 3-3 3s-3-1.34-3-3l-1-4-1 4c0 1.66-1.34 3-3 3s-3-1.34-3-3l-1-4-1 4c0 1.66-1.34 3-3 3S2 8.66 2 7z" />
      <path d="M4 10v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V10" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

// Custom 3D Isometric Box Icon matching bottom bar
function BoxIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

// Sort Icon matching Store page
function SortIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4" />
    </svg>
  );
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const { cartItems } = useCart();
  const { user, isLoggedIn, logout } = useAuth();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check unread notifications count
  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }
    const checkUnread = async () => {
      try {
        const { data } = await api.get("/notifications/user/unread");
        if (data.success && Array.isArray(data.notifications)) {
          setUnreadCount(data.notifications.length);
        }
      } catch (err) {
        // silent fail
      }
    };
    checkUnread();
  }, [isLoggedIn, location.pathname]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [drawerOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/products");
    }
  };

  const userName = isLoggedIn && user?.name
    ? user.name
    : user?.email
    ? user.email.split("@")[0]
    : "John Doe";

  const userEmail = isLoggedIn && user?.email
    ? user.email
    : "john.doe@example.com";

  const isHome = location.pathname === "/";
  const isProducts = location.pathname === "/products";
  const isShop = location.pathname === "/shop";
  const isCart = location.pathname === "/cart";
  const isOrders = location.pathname === "/my-orders";
  const isProfile = location.pathname === "/profile";
  const isCheckout = location.pathname === "/checkout";

  return (
    <>
      {/* ============================================================ */}
      {/* 1. TOP HEADER - Dynamic based on page */}
      {/* ============================================================ */}
      {isHome ? (
        /* HOME PAGE HEADER: Purple to Blue Gradient */
        <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white rounded-b-[28px] shadow-md px-4 pt-4 pb-5 transition-all">
          <div className="max-w-6xl mx-auto">
            {/* Top Bar: Hamburger, Location, Cart, Bell */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center shadow hover:bg-gray-100 active:scale-95 transition-all focus:outline-none"
                  aria-label="Open Navigation Menu"
                >
                  <FiMenu size={20} />
                </button>

                <LocationPicker
                  customTrigger={({ onClick, location: userLocation }) => (
                    <button
                      type="button"
                      onClick={onClick}
                      className="text-left group flex flex-col justify-center focus:outline-none"
                    >
                      <span className="font-bold text-xs sm:text-sm tracking-wide text-white leading-tight">
                        Delivery in 8 minutes
                      </span>
                      <span className="text-[11px] sm:text-xs text-purple-100 flex items-center gap-1 mt-0.5 opacity-90 max-w-[150px] sm:max-w-[240px] truncate">
                        <FiMapPin className="text-red-400 shrink-0" size={12} />
                        <span className="truncate">{userLocation || "123 Main St, New York"}</span>
                        <FiChevronDown className="ml-0.5 shrink-0 opacity-80" size={13} />
                      </span>
                    </button>
                  )}
                />
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  to="/cart"
                  className="w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center shadow hover:bg-gray-100 relative transition-transform active:scale-95 focus:outline-none"
                  aria-label="Shopping Cart"
                >
                  <FiShoppingCart size={19} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={() => navigate("/notifications")}
                  className="w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center shadow hover:bg-gray-100 relative transition-transform active:scale-95 focus:outline-none"
                  aria-label="Notifications"
                >
                  <FiBell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <FiSearch
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={19}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for vegetables, fruits..."
                className="w-full bg-white text-gray-800 rounded-full py-3 pl-11 pr-4 shadow-sm outline-none text-sm font-medium placeholder-gray-400 focus:ring-2 focus:ring-purple-300 transition-all"
              />
            </form>
          </div>
        </header>
      ) : isProducts ? (
        /* /products renders its own specific header with back arrow & search filter matching Image 1 */
        null
      ) : (
        /* OTHER PAGES HEADER: Clean White Bar */
        <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-xs transition-all">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left: Hamburger Button & Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all focus:outline-none"
                aria-label="Open Navigation Menu"
              >
                <FiMenu size={19} />
              </button>

              <div>
                <h1 className="font-extrabold text-base sm:text-lg text-gray-900 leading-tight">
                  {isCheckout && "Review Your Order"}
                  {isShop && "Fresh Vegetables & Fruits"}
                  {isCart && "My Cart"}
                  {isOrders && "My Orders"}
                  {isProfile && "VIP Foods"}
                  {!isCheckout && !isShop && !isCart && !isOrders && !isProfile && "VIP Foods"}
                </h1>
                {isShop && (
                  <p className="text-[11px] text-gray-500 font-medium">
                    Showing all products
                  </p>
                )}
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              {isShop ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/products?sort=price-asc")}
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-all focus:outline-none"
                    title="Sort Products"
                  >
                    <SortIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/products")}
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-all focus:outline-none"
                    title="Filter Products"
                  >
                    <FiSliders size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/products")}
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-all focus:outline-none"
                    title="Search"
                  >
                    <FiSearch size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/notifications")}
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 relative transition-all focus:outline-none"
                    title="Notifications"
                  >
                    <FiBell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ============================================================ */}
      {/* 2. SIDE DRAWER MENU (Extended Matching Image 3 Screenshot) */}
      {/* ============================================================ */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          <aside className="relative z-50 w-[84%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col overflow-y-auto transform transition-transform duration-300 ease-out">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full border-2 border-white/80 object-cover shadow-sm shrink-0"
                />
                <div className="truncate">
                  <h3 className="font-bold text-base leading-tight text-white truncate">
                    {userName}
                  </h3>
                  <p className="text-xs text-purple-100 opacity-90 truncate mt-0.5">
                    {userEmail}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors ml-2 shrink-0 focus:outline-none"
                aria-label="Close menu"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 py-3 text-gray-700 font-medium text-sm">
              {/* SECTION: SHOP */}
              <div className="px-5 pt-3 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Shop
              </div>

              <NavLink
                to="/"
                end
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2.5 transition-colors ${
                    isActive
                      ? "bg-purple-50 text-purple-700 font-bold border-l-4 border-purple-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <FiHome size={18} className="shrink-0 text-purple-600" />
                <span>Homepage</span>
              </NavLink>

              <NavLink
                to="/shop"
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2.5 transition-colors ${
                    isActive
                      ? "bg-purple-50 text-purple-700 font-bold border-l-4 border-purple-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <StorefrontIcon className="w-[18px] h-[18px] shrink-0 text-gray-600" />
                <span>Browse Stores</span>
              </NavLink>

              <NavLink
                to="/products"
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2.5 transition-colors ${
                    isActive
                      ? "bg-purple-50 text-purple-700 font-bold border-l-4 border-purple-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <FiSearch size={18} className="shrink-0 text-purple-600" />
                <span>Search Products</span>
              </NavLink>

              {/* SECTION: MY ORDERS & CART */}
              <div className="px-5 pt-4 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                My Orders & Cart
              </div>

              <NavLink
                to="/cart"
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-5 py-2.5 transition-colors ${
                    isActive
                      ? "bg-purple-50 text-purple-700 font-bold border-l-4 border-purple-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <FiShoppingCart size={18} className="shrink-0 text-gray-600" />
                  <span>My Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/checkout"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiShoppingBag size={18} className="shrink-0 text-gray-600" />
                <span>Checkout</span>
              </NavLink>

              <NavLink
                to="/my-orders"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BoxIcon className="w-[18px] h-[18px] shrink-0 text-gray-600" />
                <span>My Orders</span>
              </NavLink>

              <NavLink
                to="/my-orders"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiFileText size={18} className="shrink-0 text-gray-600" />
                <span>Order Details</span>
              </NavLink>

              <NavLink
                to="/my-orders"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiCheckCircle size={18} className="shrink-0 text-gray-600" />
                <span>Order Confirmation</span>
              </NavLink>

              {/* SECTION: SAVINGS */}
              <div className="px-5 pt-4 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Savings
              </div>

              <NavLink
                to="/coupons"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiPercent size={18} className="shrink-0 text-purple-600" />
                <span>Coupons</span>
              </NavLink>

              <NavLink
                to="/wallet"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiCreditCard size={18} className="shrink-0 text-gray-600" />
                <span>Wallet</span>
              </NavLink>

              {/* SECTION: MY ACCOUNT */}
              <div className="px-5 pt-4 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                My Account
              </div>

              <NavLink
                to="/profile"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FiUser size={18} className="shrink-0 text-gray-600" />
                  <span>My Profile</span>
                </div>
              </NavLink>

              <NavLink
                to="/profile"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FiEdit2 size={18} className="shrink-0 text-gray-600" />
                  <span>Edit Profile</span>
                </div>
              </NavLink>

              <NavLink
                to="/addresses"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FiMapPin size={18} className="shrink-0 text-gray-600" />
                  <span>My Addresses</span>
                </div>
                <FiChevronRight size={16} className="text-gray-400" />
              </NavLink>

              <NavLink
                to="/addresses"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FiPlus size={18} className="shrink-0 text-gray-600" />
                  <span>Add New Address</span>
                </div>
                <FiChevronRight size={16} className="text-gray-400" />
              </NavLink>

              <NavLink
                to="/payment-methods"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FiCreditCard size={18} className="shrink-0 text-gray-600" />
                  <span>Payment Methods</span>
                </div>
                <FiChevronRight size={16} className="text-gray-400" />
              </NavLink>

              <NavLink
                to="/payment-methods"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FiCreditCard size={18} className="shrink-0 text-gray-600" />
                  <span>Add New Card</span>
                </div>
                <FiChevronRight size={16} className="text-gray-400" />
              </NavLink>

              {/* SECTION: HELP & SETTINGS */}
              <div className="px-5 pt-4 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Help & Settings
              </div>

              <NavLink
                to="/settings"
                onClick={() => setDrawerOpen(false)}
                className="w-full flex items-center justify-between px-5 py-2.5 text-purple-700 font-bold bg-purple-50/60 transition-colors text-left border-l-4 border-purple-600"
              >
                <div className="flex items-center gap-3">
                  <FiSettings size={18} className="shrink-0 text-purple-600" />
                  <span>Settings</span>
                </div>
                <FiChevronRight size={16} className="text-purple-400" />
              </NavLink>

              <NavLink
                to="/notifications"
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-5 py-2.5 transition-colors text-left ${
                    isActive
                      ? "text-purple-600 bg-purple-50 font-bold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <FiBell size={18} className="shrink-0 text-gray-600" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <FiChevronRight size={16} className="text-gray-400" />
              </NavLink>

              <NavLink
                to="/settings?tab=notifications"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <FiSliders size={18} className="shrink-0 text-gray-600" />
                  <span>Notification Settings</span>
                </div>
                <FiChevronRight size={16} className="text-gray-400" />
              </NavLink>

              <NavLink
                to="/support"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <FiHelpCircle size={18} className="shrink-0 text-gray-600" />
                  <span>Support</span>
                </div>
                <FiChevronRight size={16} className="text-gray-400" />
              </NavLink>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      () => alert("Location permission enabled successfully!"),
                      () => alert("Location access was denied in browser.")
                    );
                  } else {
                    alert("Location not supported on this device.");
                  }
                }}
                className="w-full flex items-center justify-between px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <FiMapPin size={18} className="shrink-0 text-gray-600" />
                  <span>Enable Location</span>
                </div>
                <FiChevronRight size={16} className="text-gray-400" />
              </button>

              {/* Bottom Logout / Login */}
              <div className="pt-3 pb-2 border-t border-gray-100 mt-2">
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setDrawerOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50 font-bold transition-colors text-left"
                  >
                    <FiLogOut size={18} className="shrink-0 text-red-600" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-purple-700 hover:bg-purple-50 font-bold transition-colors"
                  >
                    <FiLogIn size={18} className="shrink-0" />
                    <span>Login / Register</span>
                  </NavLink>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. BOTTOM NAVIGATION BAR (Mobile edge-to-edge, Tablet/Laptop floating pill) */}
      {/* ============================================================ */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 py-2 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex justify-around items-center md:max-w-md md:left-1/2 md:-translate-x-1/2 md:bottom-4 md:rounded-full md:border md:shadow-2xl">
        {/* Tab 1: Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-colors min-w-[54px] py-1 ${
              isActive ? "text-purple-600 font-bold" : "text-gray-500 hover:text-gray-800"
            }`
          }
        >
          <FiHome size={22} className="mb-0.5" />
          <span className="text-[11px] tracking-tight">Home</span>
        </NavLink>

        {/* Tab 2: Store */}
        <NavLink
          to="/shop"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-colors min-w-[54px] py-1 ${
              isActive ? "text-purple-600 font-bold" : "text-gray-500 hover:text-gray-800"
            }`
          }
        >
          <StorefrontIcon className="w-[22px] h-[22px] mb-0.5" />
          <span className="text-[11px] tracking-tight">Store</span>
        </NavLink>

        {/* Tab 3: Cart */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-colors min-w-[54px] py-1 relative ${
              isActive ? "text-purple-600 font-bold" : "text-gray-500 hover:text-gray-800"
            }`
          }
        >
          <div className="relative">
            <FiShoppingCart size={22} className="mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Cart</span>
        </NavLink>

        {/* Tab 4: Orders */}
        <NavLink
          to="/my-orders"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-colors min-w-[54px] py-1 ${
              isActive ? "text-purple-600 font-bold" : "text-gray-500 hover:text-gray-800"
            }`
          }
        >
          <BoxIcon className="w-[22px] h-[22px] mb-0.5" />
          <span className="text-[11px] tracking-tight">Orders</span>
        </NavLink>

        {/* Tab 5: Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-colors min-w-[54px] py-1 ${
              isActive ? "text-purple-600 font-bold" : "text-gray-500 hover:text-gray-800"
            }`
          }
        >
          <FiUser size={22} className="mb-0.5" />
          <span className="text-[11px] tracking-tight">Profile</span>
        </NavLink>
      </nav>
    </>
  );
}