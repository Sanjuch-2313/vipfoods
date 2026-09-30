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

import { getBill } from "../controllers/billController.js";

const router = express.Router();
router.get("/admin/:reference/bill", adminAuth, getBill);
router.get("/customer/:reference/bill", protect, getBill);

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
