import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create Razorpay Order
router.post("/create-order", createOrder);

// Verify Payment
router.post("/verify-payment", verifyPayment);

export default router;