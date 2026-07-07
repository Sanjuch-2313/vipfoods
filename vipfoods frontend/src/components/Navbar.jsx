import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import {
  FiChevronDown,
  FiHeart,
  FiShoppingCart,
  FiTrendingUp,
  FiUser,
  FiLogOut,
  FiClock,
  FiSettings,
  FiBookmark,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getProducts } from "../services/productService";

import SearchBar from "./SearchBar";
import LocationPicker from "./LocationPicker";

import logo from "../assets/logo.png";

import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ✅ new state for trending count
  const [trendingCount, setTrendingCount] = useState(0);

  const { cartItems, wishlistItems } = useCart();
  const { user, isLoggedIn, logout } = useAuth();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  /*
  ============================================
  NAVBAR SCROLL BEHAVIOUR
  ============================================
  */
  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);

      if (currentY < 80) {
        setHidden(false);
      } else if (currentY > lastY) {
        setHidden(true);
        setMenuOpen(false);
        setDropdownOpen(false);
      } else {
        setHidden(false);
      }

      lastY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /*
  ============================================
  CLOSE MOBILE MENU
  ============================================
  */
  const closeMenu = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  /*
  ============================================
  LOGOUT
  ============================================
  */
  const handleLogout = () => {
    logout();
    closeMenu();
  };

  /*
  ============================================
  LOAD TRENDING COUNT FROM BACKEND
  ============================================
  */
  useEffect(() => {
    const loadTrendingProducts = async () => {
      try {
        const products = await getProducts();
        const count = products.filter((product) => product.featured === true).length;
        setTrendingCount(count);
      } catch (err) {
        console.error(err);
        setTrendingCount(0);
      }
    };

    loadTrendingProducts();
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""} ${hidden ? "navbar-hidden" : ""}`}>
      <div className="navbar-inner">
        {/* LOGO */}
        <div className="navbar-logo-section">
          <Link to="/" className="navbar-logo" onClick={closeMenu} title="VIP Foods Home">
            <img id="navbar-brand-logo" src={logo} alt="VIP Foods Logo" />
          </Link>
          <div className="navbar-logo-text">
            <span>VIP Foods</span>
          </div>
        </div>

        {/* LOCATION PICKER */}
        <div className="navbar-location-wrapper">
          <LocationPicker
            onLocationChange={(address, coords) => {
              console.log("Selected delivery location:", address, coords);
            }}
          />
        </div>

        {/* NAVIGATION LINKS */}
        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={closeMenu} title="Home">Home</NavLink>
          <NavLink to="/products" onClick={closeMenu} title="Products">Products</NavLink>

          {/* Categories dropdown */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => { if (window.innerWidth > 768) setDropdownOpen(true); }}
            onMouseLeave={() => { if (window.innerWidth > 768) setDropdownOpen(false); }}
          >
            <button
              type="button"
              className="nav-dropdown-trigger"
              title="Browse Categories"
              onClick={() => setDropdownOpen((current) => !current)}
            >
              <span>Categories</span>
              <FiChevronDown className={dropdownOpen ? "category-chevron open" : "category-chevron"} />
            </button>

            <div className={`nav-dropdown-menu ${dropdownOpen ? "open" : ""}`}>
              <Link to="/products?category=pickles" onClick={closeMenu} title="VIP Pickles">VIP Pickles</Link>
              <Link to="/products?category=snacks" onClick={closeMenu} title="Home Snacks">Home Snacks</Link>
              <Link to="/products?category=fresh" onClick={closeMenu} title="VIP Fresh">VIP Fresh</Link>
              <Link to="/products?category=spices" onClick={closeMenu} title="VIP Spices">VIP Spices</Link>
            </div>
          </div>

          {/* Mobile menu extra items */}
          <div className="mobile-menu-extra">
            <Link to="/products?trending=true" onClick={closeMenu} aria-label="Trending Products" title="Trending Products">
              <FiTrendingUp />
              <span>Trending Products</span>
              {trendingCount > 0 && <span className="mobile-menu-count">{trendingCount}</span>}
            </Link>

            <Link to="/wishlist" onClick={closeMenu} aria-label="Wishlist" title="Wishlist">
              <FiHeart />
              <span>Wishlist</span>
              {wishlistCount > 0 && <span className="mobile-menu-count">{wishlistCount}</span>}
            </Link>

            {isLoggedIn && (
              <Link to="/order-history" onClick={closeMenu} aria-label="Order History" title="Order History">
                <FiClock />
                <span>Order History</span>
              </Link>
            )}

            {!isLoggedIn && (
              <Link to="/login" className="mobile-login-button" onClick={closeMenu} aria-label="Login" title="Login">
                <FiUser />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* SEARCH */}
        <SearchBar />

        {/* ACTION ICONS */}
        <div className="navbar-actions">
          {/* Trending */}
          <Link to="/products?trending=true" className="navbar-icon-btn navbar-trending-btn" aria-label="Trending Products" title="Trending Products">
            <FiTrendingUp />
            {trendingCount > 0 && <span className="icon-badge">{trendingCount}</span>}
          </Link>

          {/* Wishlist */}
          <Link to="/wishlist" className="navbar-icon-btn navbar-wishlist-btn" aria-label="Wishlist" title="Wishlist">
            <FiHeart />
            {wishlistCount > 0 && <span className="icon-badge">{wishlistCount}</span>}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="navbar-icon-btn navbar-cart-btn" aria-label="Shopping Cart" title="Shopping Cart">
            <FiShoppingCart />
            {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
          </Link>

          {/* Order History */}
          {isLoggedIn && (
            <Link to="/order-history" className="navbar-icon-btn history-icon-btn" aria-label="Order History" title="Order History">
              <FiClock />
            </Link>
          )}

          {/* Profile / Login */}
          {isLoggedIn ? (
            <div className="profile-dropdown">
              <button type="button" className="navbar-icon-btn profile-trigger" aria-label="Account Menu" title="My Account">
                <FiUser />
              </button>
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-header">
                  <FiUser />
                  <span>{user?.email || "VIP User"}</span>
                </div>
                <Link to="/profile" onClick={closeMenu} title="Profile"><FiUser /><span>Profile</span></Link>
                <Link to="/settings" onClick={closeMenu} title="Settings"><FiSettings /><span>Settings</span></Link>
                <Link to="/wishlist" onClick={closeMenu} title="Saved Items"><FiBookmark /><span>Saved Items</span></Link>
                <button type="button" className="profile-dropdown-logout" onClick={handleLogout} title="Logout">
                  <FiLogOut /><span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="cta-btn small desktop-login-button" aria-label="Login" title="Login">
              Login
            </Link>
          )}

          {/* Burger Menu */}
          <button
            type="button"
            className={`navbar-burger ${menuOpen ? "open" : ""}`}
            onClick={() => {
              setMenuOpen((current) => !current);
              setDropdownOpen(false);
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            title="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
</div>
    </nav>
  );
}