import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BrandIntro from "./components/BrandIntro";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerify from "./pages/OtpVerify";
import NotFound from "./pages/NotFound";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import ScrollToTop from "./components/ScrollToTop";

const INTRO_SESSION_KEY = "vipfoods-intro-shown";

function AppRoutes() {
  const location = useLocation();

  const hideShell = [
    "/login",
    "/register",
    "/otp-verify",
  ].includes(location.pathname);

  const [showIntro, setShowIntro] = useState(() => {
    if (location.state?.showBrandIntro) {
      return true;
    }

    const introAlreadyShown = sessionStorage.getItem(INTRO_SESSION_KEY);
    if (!introAlreadyShown) {
      sessionStorage.setItem(INTRO_SESSION_KEY, "true");
      return true;
    }

    return false;
  });

  useEffect(() => {
    if (location.state?.showBrandIntro) {
      setShowIntro(true);
      window.history.replaceState(
        {},
        document.title,
        location.pathname + location.search + location.hash
      );
    }
  }, [location]);

  return (
    <>
      {/* BRAND INTRO */}
      {showIntro && (
        <BrandIntro onComplete={() => setShowIntro(false)} />
      )}

      <ScrollToTop />

      {/* NAVBAR */}
      {!hideShell && <Navbar />}

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-verify" element={<OtpVerify />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* FOOTER */}
      {!hideShell && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <LocationProvider>
            <AppRoutes />
          </LocationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
