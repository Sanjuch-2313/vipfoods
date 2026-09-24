import Notification from "../models/Notification.js";

// ==========================================
// ADMIN: Create & Send Notification
// ==========================================
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, targetUser } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      type: type || "info",
      targetUser: targetUser || null,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating notification",
    });
  }
};

// ==========================================
// ADMIN: Get All Notifications
// ==========================================
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("targetUser", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("GET ALL NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching notifications",
    });
  }
};

// ==========================================
// ADMIN: Delete Notification
// ==========================================
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting notification",
    });
  }
};

// ==========================================
// USER: Get Active / Pop Notifications for current user
// ==========================================
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch broadcast (targetUser: null) or targeted to this user
    // and that hasn't been read by this user yet
    const notifications = await Notification.find({
      isActive: true,
      $or: [{ targetUser: null }, { targetUser: userId }],
      readBy: { $ne: userId },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("GET USER NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching user notifications",
    });
  }
};

// ==========================================
// USER: Mark Notification as Read/Dismissed
// ==========================================
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await Notification.findByIdAndUpdate(id, {
      $addToSet: { readBy: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("MARK READ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error marking notification as read",
    });
  }
};

// ==========================================
// USER: Get All Notifications (with isRead flag)
// ==========================================
export const getUserAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      isActive: true,
      $or: [{ targetUser: null }, { targetUser: userId }],
    }).sort({ createdAt: -1 });

    const formatted = notifications.map((n) => ({
      ...n.toObject(),
      isRead: n.readBy?.some((id) => id.toString() === userId.toString()),
    }));

    return res.status(200).json({
      success: true,
      notifications: formatted,
    });
  } catch (error) {
    console.error("GET USER ALL NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching notifications",
    });
  }
};

// ==========================================
// USER: Mark All Notifications Read
// ==========================================
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      {
        isActive: true,
        $or: [{ targetUser: null }, { targetUser: userId }],
      },
      {
        $addToSet: { readBy: userId },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error marking all notifications as read",
    });
  }
};

// ==========================================
// PUBLIC: Get Broadcast Notifications (for guest visitors)
// ==========================================
export const getPublicNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      isActive: true,
      targetUser: null,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications: notifications.map((n) => ({
        ...n.toObject(),
        isRead: false,
      })),
    });
  } catch (error) {
    console.error("GET PUBLIC NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching announcements",
    });
  }
};

