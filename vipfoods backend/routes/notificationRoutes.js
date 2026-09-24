import express from "express";
import {
  createNotification,
  getAllNotifications,
  deleteNotification,
  getUserNotifications,
  markNotificationRead,
  getUserAllNotifications,
  markAllNotificationsRead,
  getPublicNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes (can also be called by admin panel)
router.post("/", createNotification);
router.get("/", getAllNotifications);
router.delete("/:id", deleteNotification);

// User notification routes
router.get("/user/unread", protect, getUserNotifications);
router.get("/user/all", protect, getUserAllNotifications);
router.put("/user/:id/read", protect, markNotificationRead);
router.put("/user/read-all", protect, markAllNotificationsRead);

// Public announcements (for guests / fallback)
router.get("/public", getPublicNotifications);

export default router;

