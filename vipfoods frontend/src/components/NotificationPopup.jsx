import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiX, FiCheckCircle, FiPackage } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function NotificationPopup() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const shownPushIds = useRef(new Set());

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setCurrentNotification(null);
      shownPushIds.current.clear();
      return;
    }

    const fetchUnread = async () => {
      try {
        const { data } = await api.get("/notifications/user/unread");
        if (data.success && Array.isArray(data.notifications) && data.notifications.length > 0) {
          setNotifications(data.notifications);
          setCurrentNotification(data.notifications[0]);

          // Trigger native browser push notification for newly arrived notifications
          data.notifications.forEach((item) => {
            if (!shownPushIds.current.has(item._id)) {
              shownPushIds.current.add(item._id);

              if ("Notification" in window && Notification.permission === "granted") {
                try {
                  const push = new window.Notification(item.title, {
                    body: item.message,
                    icon: "/assets/logo.png",
                    badge: "/assets/logo.png",
                    tag: item._id,
                  });

                  push.onclick = () => {
                    window.focus();
                    if (item.type === "order") {
                      navigate("/my-orders");
                    }
                  };
                } catch (pushErr) {
                  console.error("Browser push notification error:", pushErr);
                }
              }
            }
          });
        }
      } catch (err) {
        // Soft fail if notification API is unavailable
        console.error("Failed to fetch unread notifications", err);
      }
    };

    fetchUnread();

    // Check for new notifications every 8 seconds while logged in
    const interval = setInterval(fetchUnread, 8000);

    // Also check immediately when tab gains focus
    const handleFocus = () => fetchUnread();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [isLoggedIn, navigate]);

  const handleDismiss = async () => {
    if (!currentNotification) return;

    try {
      await api.put(`/notifications/user/${currentNotification._id}/read`);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }

    // Move to next notification if any
    const remaining = notifications.filter((n) => n._id !== currentNotification._id);
    setNotifications(remaining);
    setCurrentNotification(remaining.length > 0 ? remaining[0] : null);
  };

  const handleViewOrders = () => {
    handleDismiss();
    navigate("/my-orders");
  };

  if (!currentNotification) return null;

  const isOrderNotification = currentNotification.type === "order";

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 left-4 md:left-auto md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-2xl p-4 shadow-2xl border border-green-200 flex items-start gap-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-green-500 to-rose-500" />

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          isOrderNotification ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
        }`}>
          {isOrderNotification ? (
            <FiPackage size={20} className="animate-bounce" />
          ) : (
            <FiBell size={20} className="animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
              isOrderNotification ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
            }`}>
              {currentNotification.type === "order" ? "Order Update" : (currentNotification.type || "Update")}
            </span>
          </div>
          <h4 className="font-bold text-sm text-gray-900 mt-1 truncate">
            {currentNotification.title}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
            {currentNotification.message}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {isOrderNotification && (
              <button
                type="button"
                onClick={handleViewOrders}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                <FiPackage size={14} />
                View Order
              </button>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                isOrderNotification
                  ? "text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200"
                  : "text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100"
              }`}
            >
              <FiCheckCircle size={14} />
              Got it
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
          aria-label="Dismiss notification"
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
}
