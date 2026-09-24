import { useState, useEffect } from "react";
import { Bell, Send, Trash2, Users, AlertCircle, CheckCircle } from "lucide-react";
import api from "../../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info",
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/notifications");
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      alert("Please provide both title and message");
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);
      const { data } = await api.post("/notifications", {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
      });

      if (data.success) {
        setFeedback({
          type: "success",
          text: "Notification sent successfully! Users will see it when they login.",
        });
        setForm({ title: "", message: "", type: "info" });
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        text: err.response?.data?.message || "Failed to send notification",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;

    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
      alert("Failed to delete notification");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Bell className="text-purple-600" size={26} />
            User Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Broadcast messages and announcements that pop up when users log in.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle size={20} className="shrink-0" />
          ) : (
            <AlertCircle size={20} className="shrink-0" />
          )}
          <p className="text-sm font-semibold">{feedback.text}</p>
        </div>
      )}

      {/* Grid: Create Form on Left, Sent List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Broadcast Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Send size={18} className="text-purple-600" />
            Send New Notification
          </h2>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Notification Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 outline-none focus:border-purple-600 focus:bg-white transition-all"
              >
                <option value="info">Information (Blue)</option>
                <option value="promo">Promo & Offers (Purple)</option>
                <option value="alert">Important Alert (Orange)</option>
                <option value="order">Order Update (Green)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Weekend Flash Sale! 🎉"
                required
                className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 outline-none focus:border-purple-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Message Content
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder="Enter announcement details to display in user popup..."
                required
                className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 outline-none focus:border-purple-600 focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="bg-purple-50 p-3 rounded-xl flex items-center gap-2 text-xs text-purple-800 font-medium">
              <Users size={16} className="shrink-0 text-purple-600" />
              <span>Will be sent to all users and shown upon next login.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? "Sending..." : "Send to All Users"}
            </button>
          </form>
        </div>

        {/* Existing Notifications List */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell size={18} className="text-purple-600" />
            Sent Notifications ({notifications.length})
          </h2>

          {loading ? (
            <p className="text-sm text-gray-400 py-8 text-center">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm font-semibold text-gray-500">No notifications sent yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Use the form on the left to send one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 flex items-start justify-between gap-3 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        {n.type || "info"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 truncate">{n.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[11px] text-gray-400 mt-2">
                      Read by {n.readBy?.length || 0} user{n.readBy?.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(n._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
