import express from "express";
import rateLimit from "express-rate-limit";
import { adminLogin } from "../controllers/adminAuthController.js";

const router = express.Router();

// Max 5 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, adminLogin);

export default router;