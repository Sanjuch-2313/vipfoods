import { useState, useEffect } from "react";
import { FiBell, FiX, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function NotificationPopup() {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setCurrentNotification(null);
      return;
    }

    const fetchUnread = async () => {
      try {
        const { data } = await api.get("/notifications/user/unread");
        if (data.success && Array.isArray(data.notifications) && data.notifications.length > 0) {
          setNotifications(data.notifications);
          setCurrentNotification(data.notifications[0]);
        }
      } catch (err) {
        // Soft fail if notification API is unavailable
        console.error("Failed to fetch unread notifications", err);
      }
    };

    fetchUnread();
  }, [isLoggedIn]);

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

  if (!currentNotification) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 left-4 md:left-auto md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-2xl p-4 shadow-2xl border border-green-200 flex items-start gap-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-600 to-rose-500" />

        <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
          <FiBell size={20} className="animate-pulse" />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-green-50 text-green-700">
              {currentNotification.type || "Update"}
            </span>
          </div>
          <h4 className="font-bold text-sm text-gray-900 mt-1 truncate">
            {currentNotification.title}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
            {currentNotification.message}
          </p>

          <button
            onClick={handleDismiss}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <FiCheckCircle size={14} />
            Got it, thanks!
          </button>
        </div>

        <button
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
