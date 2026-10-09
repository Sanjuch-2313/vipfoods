import express from "express";

import {
  registerUser,
  loginUser,
  getMe,
  createWalletOrder,
  verifyWalletPayment,
  useWalletBalance,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

import rateLimit from "express-rate-limit";
import { getSocialStatus, startSocialLogin, socialCallback, finishSocialLogin } from "../controllers/socialAuthController.js";
const router = express.Router();
const socialLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false });
router.get("/social/status", getSocialStatus);
router.post("/social/:provider/start", socialLimit, startSocialLogin);
router.get("/social/:provider/callback", socialLimit, socialCallback);
router.post("/social/finish", socialLimit, finishSocialLogin);

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", protect, getMe);
router.post("/wallet/create-order", protect, createWalletOrder);
router.post("/wallet/verify", protect, verifyWalletPayment);
router.post("/wallet/use", protect, useWalletBalance);

export default router;