import express from "express";
import upload from "../middleware/uploadMiddleware.js";

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Create Category
router.post(
  "/",
  upload.single("image"),
  createCategory
);

// Get All Categories
router.get(
  "/",
  getCategories
);

// Update Category
router.put(
  "/:id",
  upload.single("image"),
  updateCategory
);

// Delete Category
router.delete(
  "/:id",
  deleteCategory
);

export default router;