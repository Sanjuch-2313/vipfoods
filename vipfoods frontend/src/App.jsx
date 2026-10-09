import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { lazy, Suspense, useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GuestWarningModal from "./components/GuestWarningModal";
import NotificationPopup from "./components/NotificationPopup";

import Home from "./pages/Home";
// These existing styles also style the home carousel, so keep them eager.
import "./pages/home.css";
const ComboPacks = lazy(() => import("./pages/ComboPacks"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const SocialCallback = lazy(() => import("./pages/SocialCallback"));
const Register = lazy(() => import("./pages/Register"));
const OrderSuccess = lazy(() => import("./pages/orderSuccess"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const AdminOrders = lazy(() => import("./pages/Orders"));
const CouponsPage = lazy(() => import("./pages/CouponsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const AddressesPage = lazy(() => import("./pages/AddressesPage"));
const PaymentMethodsPage = lazy(() => import("./pages/PaymentMethodsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
const LostPasswordPage = lazy(() => import("./pages/LostPasswordPage"));

const NotFound = lazy(() => import("./pages/NotFound"));

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import ScrollToTop from "./components/ScrollToTop";
const Shop = lazy(() => import("./pages/Shop"));


function AppRoutes() {
  const location = useLocation();

  const hideShell = [
    "/login",
    "/register",
    "/otp-verify",
    "/social-callback",
  ].includes(location.pathname);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  return (
    <>
      <ScrollToTop />

      {/* GUEST WARNING & NOTIFICATION POPUP */}
      <GuestWarningModal />
      <NotificationPopup />

      {/* NAVBAR */}
      {!hideShell && <Navbar />}

      {/* ROUTES */}
      <Suspense fallback={<div role="status" className="min-h-[50vh] flex items-center justify-center text-green-700">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/combo-packs" element={<ComboPacks />} />
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
        <Route path="/contact" element={<SupportPage />} />
        <Route path="/about" element={<InfoPage page="about" />} />
        <Route path="/blog" element={<InfoPage page="blog" />} />
        <Route path="/terms" element={<InfoPage page="terms" />} />
        <Route path="/privacy" element={<InfoPage page="privacy" />} />
        <Route path="/refund" element={<InfoPage page="refund" />} />
        <Route path="/shipping" element={<InfoPage page="shipping" />} />
        <Route path="/account" element={<Navigate to="/profile" replace />} />
        <Route path="/orders" element={<Navigate to="/my-orders" replace />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/social-callback" element={<SocialCallback />} />
        <Route path="/lost-password" element={<LostPasswordPage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>

      {/* FOOTER */}
      {!hideShell && <Footer />}
    </>
  );
}

function AppProviders() {
  return (
    <>
      <AuthProvider>
        <CartProvider>
          <LocationProvider>
            <AppRoutes />
          </LocationProvider>
        </CartProvider>
      </AuthProvider>
    </>
  );
}

const router = createBrowserRouter([{ path: "*", element: <AppProviders /> }]);
export default function App() { return <RouterProvider router={router} />; }
