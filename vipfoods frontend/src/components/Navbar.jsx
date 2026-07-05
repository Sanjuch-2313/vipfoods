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

import { products } from "../services/productService";

import SearchBar from "./SearchBar";
import LocationPicker from "./LocationPicker";

import logo from "../assets/logo.png";

import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { cartItems, wishlistItems } = useCart();

  const { user, isLoggedIn, logout } = useAuth();

  // ==============================
  // COUNTS
  // ==============================

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const wishlistCount = wishlistItems.length;

  const trendingCount = products.filter(
    (product) => product.trending
  ).length;

  // ==============================
  // NAVBAR SCROLL BEHAVIOUR
  // ==============================

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;

      setScrolled(currentY > 20);

      if (currentY < 80) {
        setHidden(false);
      } else if (currentY > lastY) {
        setHidden(true);
      } else if (currentY < lastY) {
        setHidden(false);
      }

      lastY = currentY;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  // ==============================
  // LOGOUT
  // ==============================

  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      className={`navbar ${
        scrolled ? "navbar-scrolled" : ""
      } ${hidden ? "navbar-hidden" : ""}`}
    >
      <div className="navbar-inner">

        {/* ==============================
            LOGO
        ============================== */}

        <div className="navbar-logo-section">
          <Link
            to="/"
            className="navbar-logo"
          >
            <img
              src={logo}
              alt="VIP Foods Logo"
            />
          </Link>

          <div className="navbar-logo-text">
            <span>VIP Foods</span>
          </div>
        </div>

        {/* ==============================
            LOCATION
        ============================== */}

        <LocationPicker
          onLocationChange={(
            address,
            coords
          ) => {
            console.log(
              "Selected delivery location:",
              address,
              coords
            );
          }}
        />

        {/* ==============================
            NAVIGATION LINKS
        ============================== */}

        <div
          className={`navbar-links ${
            menuOpen ? "open" : ""
          }`}
        >
          <NavLink
            to="/"
            onClick={() =>
              setMenuOpen(false)
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            onClick={() =>
              setMenuOpen(false)
            }
          >
            Products
          </NavLink>

          {/* ==============================
              CATEGORY DROPDOWN
          ============================== */}

          <div
            className="nav-dropdown"
            onMouseEnter={() =>
              setDropdownOpen(true)
            }
            onMouseLeave={() =>
              setDropdownOpen(false)
            }
          >
            <button
              type="button"
              className="nav-dropdown-trigger"
            >
              Categories

              <FiChevronDown />
            </button>

            <div
              className={`nav-dropdown-menu ${
                dropdownOpen
                  ? "open"
                  : ""
              }`}
            >
              <Link
                to="/products?category=pickles"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                VIP Pickles
              </Link>

              <Link
                to="/products?category=snacks"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Home Snacks
              </Link>

              <Link
                to="/products?category=fresh"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                VIP Fresh
              </Link>

              <Link
                to="/products?category=spices"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                VIP Spices
              </Link>
            </div>
          </div>
        </div>

        {/* ==============================
            SEARCH
        ============================== */}

        <SearchBar />

        {/* ==============================
            NAVBAR ACTIONS
        ============================== */}

        <div className="navbar-actions">
  {/* TRENDING */}

  <Link
    to="/products?trending=true"
    className="navbar-icon-btn"
    aria-label="Trending"
    title="Trending Products"
  >
    <FiTrendingUp />

    {trendingCount > 0 && (
      <span className="icon-badge">
        {trendingCount}
      </span>
    )}
  </Link>

  {/* WISHLIST */}

  <Link
    to="/wishlist"
    className="navbar-icon-btn"
    aria-label="Wishlist"
    title="Wishlist"
  >
    <FiHeart />

    {wishlistCount > 0 && (
      <span className="icon-badge">
        {wishlistCount}
      </span>
    )}
  </Link>

  {/* CART */}

  <Link
    to="/cart"
    className="navbar-icon-btn"
    aria-label="Cart"
    title="Cart"
  >
    <FiShoppingCart />

    {cartCount > 0 && (
      <span className="icon-badge">
        {cartCount}
      </span>
    )}
  </Link>

  {/* ORDER HISTORY - SEPARATE ICON */}

  {isLoggedIn && (
    <Link
      to="/order-history"
      className="navbar-icon-btn history-icon-btn"
      aria-label="Order History"
      title="Order History"
    >
      <FiClock />
    </Link>
  )}

  {/* PROFILE */}

  {isLoggedIn ? (
    <div className="profile-dropdown">
      <button
        type="button"
        className="navbar-icon-btn profile-trigger"
        aria-label="Account menu"
        title="Account"
      >
        <FiUser />
      </button>

      <div className="profile-dropdown-menu">
        <div className="profile-dropdown-header">
          <FiUser className="profile-dropdown-user-icon" />

          <span>
            {user?.email || "VIP User"}
          </span>
        </div>

        <Link to="/profile">
          <FiUser />
          <span>Profile</span>
        </Link>

        <Link to="/settings">
          <FiSettings />
          <span>Settings</span>
        </Link>

        <Link to="/wishlist">
          <FiBookmark />
          <span>Saved Items</span>
        </Link>

        <button
          type="button"
          className="profile-dropdown-logout"
          onClick={handleLogout}
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </div>
  ) : (
    <Link
      to="/login"
      className="cta-btn small"
    >
      Login
    </Link>
  )}

  {/* MOBILE BURGER */}

  <button
    type="button"
    className={`navbar-burger ${
      menuOpen ? "open" : ""
    }`}
    onClick={() =>
      setMenuOpen((current) => !current)
    }
    aria-label="Menu"
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