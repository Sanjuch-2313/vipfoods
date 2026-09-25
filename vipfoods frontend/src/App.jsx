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
import GuestWarningModal from "./components/GuestWarningModal";
import NotificationPopup from "./components/NotificationPopup";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrderSuccess from "./pages/orderSuccess";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./pages/Orders";
import CouponsPage from "./pages/CouponsPage";
import SettingsPage from "./pages/SettingsPage";
import WalletPage from "./pages/WalletPage";
import AddressesPage from "./pages/AddressesPage";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import SupportPage from "./pages/SupportPage";
import NotificationsPage from "./pages/NotificationsPage";

import NotFound from "./pages/NotFound";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import ScrollToTop from "./components/ScrollToTop";
import Shop from "./pages/Shop";

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

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  return (
    <>
      {/* BRAND INTRO */}
      {showIntro && (
        <BrandIntro onComplete={() => setShowIntro(false)} />
      )}

      <ScrollToTop />

      {/* GUEST WARNING & NOTIFICATION POPUP */}
      <GuestWarningModal />
      <NotificationPopup />

      {/* NAVBAR */}
      {!hideShell && <Navbar />}

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/addresses" element={<AddressesPage />} />
        <Route path="/payment-methods" element={<PaymentMethodsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/shop" element={<Shop />} />
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
