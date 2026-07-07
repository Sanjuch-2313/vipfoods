import express from "express";
import upload from "../middleware/uploadMiddleware.js";


import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  updateVariantStock,
  getLowStockProducts,
} from "../controllers/productController.js";

const router = express.Router();

/* ===========================
   PRODUCT CRUD
=========================== */

// Create Product
router.post(
  "/",
  upload.array("images", 10),
  createProduct
);

// Get All Products
router.get(
  "/",
  getProducts
);

// Low Stock Products
router.get(
  "/inventory/low-stock",
  getLowStockProducts
);

// Get Single Product
router.get(
  "/:id",
  getProduct
);

// Update Product
router.put(
  "/:id",
  upload.array("images", 10),
  updateProduct
);

// Update Variant Stock
router.patch(
  "/:productId/variants/:variantId/stock",
  updateVariantStock
);

// Restore Product
router.put(
  "/restore/:id",
  restoreProduct
);

// Soft Delete Product
router.delete(
  "/:id",
  deleteProduct
);

export default router;