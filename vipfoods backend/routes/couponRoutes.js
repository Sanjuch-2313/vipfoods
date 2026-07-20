import express from "express";
import {
  getCoupons,
  getActiveCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

// Get all coupons
router.get("/", getCoupons);

// Get active coupons (For Home Banner)
router.get("/active", getActiveCoupons);

// Get coupon by ID
router.get("/:id", getCouponById);

// Create coupon
router.post("/", createCoupon);

// Update coupon
router.put("/:id", updateCoupon);

// Delete coupon
router.delete("/:id", deleteCoupon);

export default router;