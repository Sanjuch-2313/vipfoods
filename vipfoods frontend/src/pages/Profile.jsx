import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiPhone,
  FiMail,
  FiLogOut,
  FiLogIn,
  FiCreditCard,
  FiCheck,
  FiChevronRight,
  FiMapPin,
  FiSettings,
  FiHelpCircle,
  FiShoppingBag,
  FiShare2,
  FiCopy,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getMyOrders } from "../services/orderService";

// Coupon Ticket SVG icon
function CouponTicketIcon({ className = "w-6 h-6" }) {
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
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
      <line x1="9" y1="12" x2="15" y2="12" strokeDasharray="2 2" />
    </svg>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  const [orderCount, setOrderCount] = useState(0);
  const [couponCount, setCouponCount] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance || 0);
  const [referralCode, setReferralCode] = useState(user?.referralCode || "");
  const [copied, setCopied] = useState(false);

  const userName =
    user?.name || (user?.email ? user.email.split("@")[0] : "Guest User");
  const userEmail = user?.email || "";
  const userPhone = user?.phone || user?.mobile || "";

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user profile info (wallet & referral)
      try {
        const { data } = await api.get("/auth/me");
        if (data.success && data.user) {
          setWalletBalance(data.user.walletBalance || 0);
          if (data.user.referralCode) setReferralCode(data.user.referralCode);
        }
      } catch (err) {
        console.error("User me fetch failed", err);
      }
      // Fetch orders
      try {
        const data = await getMyOrders();
        const orders = Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data)
          ? data
          : [];
        setOrderCount(orders.length);
        setRecentOrders(orders.slice(0, 3));
      } catch (err) {
        console.error("Orders fetch failed", err);
      } finally {
        setOrdersLoading(false);
      }

      // Fetch coupons count
      try {
        const { data } = await api.get("/coupons");
        setCouponCount(
          Array.isArray(data?.coupons) ? data.coupons.length : 0
        );
      } catch (err) {
        console.error("Coupons fetch failed", err);
      }
    };

    if (isLoggedIn) {
      fetchData();
    } else {
      setOrdersLoading(false);
    }
  }, [isLoggedIn]);

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return "text-emerald-600 bg-emerald-50";
      case "cancelled":
        return "text-red-500 bg-red-50";
      case "pending":
        return "text-amber-600 bg-amber-50";
      default:
        return "text-green-600 bg-green-50";
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-28 font-sans">
      {/* Header gradient */}
      <div className="bg-gradient-to-br from-green-700 via-emerald-500 to-lime-500 pt-6 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white text-xl font-bold">My Profile</h1>
          <p className="text-green-200 text-sm mt-0.5">
            Manage your account & orders
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-14">
        {/* User Card */}
        <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-gray-100 shadow-md flex items-center justify-between mb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar circle with initials */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 truncate leading-snug">
                {userName}
              </h3>
              <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                {userEmail || "No email set"}
              </p>
              {userPhone ? (
                <p className="text-xs text-gray-400 truncate">{userPhone}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 flex items-center justify-center transition-colors shrink-0"
            aria-label="Edit Profile"
          >
            <FiEdit2 size={17} />
          </button>
        </div>

        {/* 3 Metric Cards: Wallet, Orders, Coupons */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {/* Wallet */}
          <div
            onClick={() => navigate("/wallet")}
            className="bg-white rounded-[22px] p-4 text-center border border-gray-100 shadow-xs flex flex-col items-center justify-center cursor-pointer hover:shadow-sm transition-shadow"
          >
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mb-2">
              <FiCreditCard className="text-green-600" size={18} />
            </div>
            <span className="font-extrabold text-base text-gray-900 block leading-tight">
              ₹{walletBalance.toFixed(2)}
            </span>
            <span className="text-[11px] text-gray-400 font-medium mt-1">
              Wallet
            </span>
          </div>

          {/* Orders */}
          <div
            onClick={() => navigate("/my-orders")}
            className="bg-white rounded-[22px] p-4 text-center border border-gray-100 shadow-xs flex flex-col items-center justify-center cursor-pointer hover:shadow-sm transition-shadow"
          >
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mb-2">
              <FiShoppingBag className="text-green-600" size={18} />
            </div>
            <span className="font-extrabold text-base text-gray-900 block leading-tight">
              {ordersLoading ? "…" : orderCount}
            </span>
            <span className="text-[11px] text-gray-400 font-medium mt-1">
              Orders
            </span>
          </div>

          {/* Coupons */}
          <div
            onClick={() => navigate("/coupons")}
            className="bg-white rounded-[22px] p-4 text-center border border-gray-100 shadow-xs flex flex-col items-center justify-center cursor-pointer hover:shadow-sm transition-shadow"
          >
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mb-2">
              <CouponTicketIcon className="w-4.5 h-4.5 text-green-600" />
            </div>
            <span className="font-extrabold text-base text-gray-900 block leading-tight">
              {couponCount}
            </span>
            <span className="text-[11px] text-gray-400 font-medium mt-1">
              Coupons
            </span>
          </div>
        </div>

        {/* Referral Card (Earn ₹25 per friend) */}
        {isLoggedIn && referralCode && (
          <div className="bg-gradient-to-r from-green-700 via-emerald-500 to-teal-500 rounded-[24px] p-5 text-white mb-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full text-white inline-block mb-2">
                  Refer & Earn ₹25
                </span>
                <h3 className="font-extrabold text-base leading-snug">
                  Invite friends & earn ₹25!
                </h3>
                <p className="text-xs text-green-100 mt-1 max-w-xs">
                  When a friend joins using your code, both of you get ₹25 credited to your wallets.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-2xl p-2 border border-white/20">
              <div className="flex-1 px-2">
                <p className="text-[10px] uppercase font-bold text-green-200">Your Code</p>
                <p className="font-black text-sm tracking-wider">{referralCode}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(referralCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-2 bg-white text-green-700 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-green-50 active:scale-95 transition-all"
              >
                {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
              {navigator.share && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.share({
                      title: "Join VIP Foods",
                      text: `Use my referral code ${referralCode} to get fresh groceries delivered in 10 minutes!`,
                      url: window.location.origin,
                    });
                  }}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all"
                  aria-label="Share referral code"
                >
                  <FiShare2 size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {isLoggedIn && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Recent Orders
              </h4>
              <button
                onClick={() => navigate("/my-orders")}
                className="text-[11px] font-bold text-green-600 uppercase tracking-wider"
              >
                View All
              </button>
            </div>

            <div className="bg-white rounded-[22px] border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
              {ordersLoading ? (
                <div className="p-5 text-center text-sm text-gray-400">
                  Loading orders…
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-6 text-center">
                  <FiShoppingBag className="mx-auto text-gray-300 mb-2" size={28} />
                  <p className="text-sm text-gray-400 font-medium">
                    No orders yet
                  </p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Start shopping to see your orders here
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-3 text-xs font-bold text-green-600 bg-green-50 px-4 py-1.5 rounded-full"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => navigate("/my-orders")}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                        <FiShoppingBag className="text-green-500" size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {order.items?.length || 0} item
                          {(order.items?.length || 0) !== 1 ? "s" : ""} ·{" "}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short" }
                              )
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus || "Processing"}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ₹{(order.grandTotal || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Account Information */}
        <div className="mb-5">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
            Account Information
          </h4>
          <div className="bg-white rounded-[22px] border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
            {userEmail ? (
              <div className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <FiMail className="text-gray-500" size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium">Email</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {userEmail}
                  </p>
                </div>
              </div>
            ) : null}

            {userPhone ? (
              <div className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <FiPhone className="text-gray-500" size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium">Phone</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {userPhone}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-5">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
            Quick Links
          </h4>
          <div className="bg-white rounded-[22px] border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
            {[
              { label: "My Addresses", icon: FiMapPin, path: "/addresses" },
              { label: "Settings", icon: FiSettings, path: "/settings" },
              { label: "Support", icon: FiHelpCircle, path: "/support" },
            ].map(({ label, icon: Icon, path }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(path)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon className="text-gray-500" size={15} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {label}
                  </span>
                </div>
                <FiChevronRight className="text-gray-400" size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Logout / Login */}
        <div className="pt-2">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={logout}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 rounded-[20px] py-3.5 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-[20px] py-3.5 px-4 font-bold text-sm flex items-center justify-center gap-2 shadow transition-opacity hover:opacity-90"
            >
              <FiLogIn size={16} />
              Login to Your Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
