import express from "express";
import {
  getReviews,
  getReviewById,
  createReview,
  approveReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();



// Customer
router.post("/", createReview);

// Admin
router.get("/", getReviews);
router.get("/:id", getReviewById);
router.patch("/:id/approve", approveReview);
router.delete("/:id", deleteReview);

export default router;