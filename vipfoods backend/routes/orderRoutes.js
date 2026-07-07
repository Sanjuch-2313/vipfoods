import express from "express";

import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);

router.get("/", getOrders);

router.get("/:id", getOrder);

router.put("/:id", updateOrderStatus);

router.delete("/:id", deleteOrder);

export default router;