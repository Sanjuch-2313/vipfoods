import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiBell,
  FiCheckCircle,
  FiTag,
  FiShoppingBag,
  FiAlertCircle,
  FiInfo,
  FiCheck,
  FiTrash2,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'promo' | 'order'
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      if (isLoggedIn) {
        const { data } = await api.get("/notifications/user/all");
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      } else {
        const { data } = await api.get("/notifications/public");
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isLoggedIn]);

  const handleMarkAsRead = async (id) => {
    if (!isLoggedIn) return;
    try {
      await api.put(`/notifications/user/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!isLoggedIn) return;
    try {
      setActionLoading(true);
      await api.put("/notifications/user/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    } finally {
      setActionLoading(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "promo":
        return <FiTag size={18} className="text-pink-600" />;
      case "order":
        return <FiShoppingBag size={18} className="text-emerald-600" />;
      case "alert":
        return <FiAlertCircle size={18} className="text-amber-600" />;
      default:
        return <FiInfo size={18} className="text-purple-600" />;
    }
  };

  const getBgForType = (type) => {
    switch (type) {
      case "promo":
        return "bg-pink-100/80";
      case "order":
        return "bg-emerald-100/80";
      case "alert":
        return "bg-amber-100/80";
      default:
        return "bg-purple-100/80";
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "unread") return !item.isRead;
    if (filter === "promo") return item.type === "promo";
    if (filter === "order") return item.type === "order";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-gray-50 min-h-screen pb-32 font-sans">
      {/* 1. TOP HEADER (Deep Purple Gradient) */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-900 text-white px-4 pt-6 pb-8 rounded-b-[28px] shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all"
              aria-label="Go back"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p className="text-xs text-purple-200 mt-0.5">
                Stay updated on deals, orders & alerts
              </p>
            </div>
          </div>

          {unreadCount > 0 && isLoggedIn && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={actionLoading}
              className="text-xs font-bold text-purple-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <FiCheck size={14} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* 2. FILTER TABS */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 flex gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`flex-1 py-2 rounded-xl text-center transition-all ${
              filter === "all"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`flex-1 py-2 rounded-xl text-center transition-all ${
              filter === "unread"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("promo")}
            className={`flex-1 py-2 rounded-xl text-center transition-all ${
              filter === "promo"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Offers
          </button>
          <button
            type="button"
            onClick={() => setFilter("order")}
            className={`flex-1 py-2 rounded-xl text-center transition-all ${
              filter === "order"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* 3. NOTIFICATION LIST */}
      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-3">
        {loading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[22px] p-4 border border-gray-100 shadow-xs animate-pulse flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-2xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-[24px] p-8 text-center border border-gray-100 shadow-xs mt-6">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <FiBell size={28} />
            </div>
            <h3 className="font-black text-gray-900 text-base">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              {filter === "unread"
                ? "You're all caught up! Check back later for new offers and updates."
                : "We will notify you when deals, special discounts, or order updates arrive."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item._id}
              onClick={() => !item.isRead && handleMarkAsRead(item._id)}
              className={`rounded-[22px] p-4 sm:p-5 border transition-all cursor-pointer relative overflow-hidden flex items-start gap-3.5 ${
                item.isRead
                  ? "bg-white border-gray-100 shadow-2xs hover:bg-gray-50/80"
                  : "bg-white border-purple-200/90 shadow-sm ring-1 ring-purple-100"
              }`}
            >
              {/* Left Accent indicator for unread */}
              {!item.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 to-rose-500" />
              )}

              {/* Icon */}
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${getBgForType(
                  item.type
                )} flex items-center justify-center shrink-0 mt-0.5`}
              >
                {getIconForType(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                    {item.type || "update"}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently"}
                  </span>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-auto" />
                  )}
                </div>

                <h4
                  className={`text-sm sm:text-base leading-snug truncate ${
                    item.isRead ? "font-bold text-gray-800" : "font-black text-gray-900"
                  }`}
                >
                  {item.title}
                </h4>

                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {item.message}
                </p>

                {/* Mark as read button */}
                {!item.isRead && isLoggedIn && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(item._id);
                      }}
                      className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline"
                    >
                      <FiCheck size={13} />
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
