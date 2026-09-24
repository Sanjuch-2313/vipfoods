import { useState, useEffect } from "react";
import { Bell, Send, Trash2, Users, AlertCircle, CheckCircle } from "lucide-react";
import api from "../../services/api";
import "./Notifications.css";

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

  /* helper: badge class based on type */
  const badgeClass = (type) => {
    const map = {
      info: "notif-badge notif-badge--info",
      promo: "notif-badge notif-badge--promo",
      alert: "notif-badge notif-badge--alert",
      order: "notif-badge notif-badge--order",
    };
    return map[type] || "notif-badge notif-badge--info";
  };

  return (
    <div className="notif-page">
      {/* Page Header */}
      <div className="notif-header">
        <div>
          <h1 className="notif-header__title">
            <Bell size={26} />
            User Notifications
          </h1>
          <p className="notif-header__subtitle">
            Broadcast messages and announcements that pop up when users log in.
          </p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`notif-feedback notif-feedback--${feedback.type}`}>
          {feedback.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <p>{feedback.text}</p>
        </div>
      )}

      {/* Two-Column Grid */}
      <div className="notif-grid">

        {/* ---- Create Form ---- */}
        <div className="notif-card">
          <h2 className="notif-card__heading">
            <Send size={18} />
            Send New Notification
          </h2>

          <form onSubmit={handleSend} className="notif-form">
            <div className="notif-form__group">
              <label className="notif-form__label">Notification Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="notif-form__select"
              >
                <option value="info">Information (Blue)</option>
                <option value="promo">Promo &amp; Offers (Purple)</option>
                <option value="alert">Important Alert (Orange)</option>
                <option value="order">Order Update (Green)</option>
              </select>
            </div>

            <div className="notif-form__group">
              <label className="notif-form__label">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Weekend Flash Sale! 🎉"
                required
                className="notif-form__input"
              />
            </div>

            <div className="notif-form__group">
              <label className="notif-form__label">Message Content</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder="Enter announcement details to display in user popup..."
                required
                className="notif-form__textarea"
              />
            </div>

            <div className="notif-hint">
              <Users size={16} />
              <span>Will be sent to all users and shown upon next login.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="notif-send-btn"
            >
              <Send size={16} />
              {submitting ? "Sending..." : "Send to All Users"}
            </button>
          </form>
        </div>

        {/* ---- Sent Notifications List ---- */}
        <div className="notif-card">
          <h2 className="notif-card__heading">
            <Bell size={18} />
            Sent Notifications ({notifications.length})
          </h2>

          {loading ? (
            <p className="notif-loading">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <Bell size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="notif-empty__title">No notifications sent yet</p>
              <p className="notif-empty__sub">Use the form on the left to send one.</p>
            </div>
          ) : (
            <div className="notif-list">
              {notifications.map((n) => (
                <div key={n._id} className="notif-item">
                  <div className="notif-item__body">
                    <div className="notif-item__meta">
                      <span className={badgeClass(n.type || "info")}>
                        {n.type || "info"}
                      </span>
                      <span className="notif-item__date">
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
                    <p className="notif-item__title">{n.title}</p>
                    <p className="notif-item__message">{n.message}</p>
                    <p className="notif-item__readby">
                      Read by {n.readBy?.length || 0} user
                      {n.readBy?.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(n._id)}
                    className="notif-delete-btn"
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
