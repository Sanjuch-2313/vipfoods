import express from "express";

import {
  registerUser,
  loginUser,
  getMe,
  syncProfile,
  createWalletOrder,
  verifyWalletPayment,
  useWalletBalance,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, syncProfile);
router.post("/wallet/create-order", protect, createWalletOrder);
router.post("/wallet/verify", protect, verifyWalletPayment);
router.post("/wallet/use", protect, useWalletBalance);

export default router;