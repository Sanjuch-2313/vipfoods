import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// ✅ Create new order (Customer)
router.post("/", protect, createOrder);

// ✅ Get logged‑in user's orders
router.get("/customer/my-orders", protect, getMyOrders);
router.get("/my-orders", protect, getMyOrders);

// ✅ Get single order by ID
router.get("/:id", protect, getOrderById);

// ✅ Admin: Get all orders
router.get("/", getAllOrders);

// ✅ Admin: Update order status
router.put("/:id/status", updateOrderStatus);

// ✅ Admin: Delete order
router.delete("/:id", deleteOrder);
router.get("/", adminAuth, getAllOrders);
router.put("/:id/status", adminAuth, updateOrderStatus);
router.delete("/:id", adminAuth, deleteOrder);

export default router;
