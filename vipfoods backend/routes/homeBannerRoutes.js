import express from "express";

import upload from "../middleware/uploadMiddleware.js";

import {
  createBanner,
  getBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
} from "../controllers/homeBannerController.js";

const router = express.Router();

router.get("/", getBanner);

router.get("/all", getAllBanners);

router.post(
  "/",
  upload.array("image", 1),
  createBanner
);

router.put(
  "/:id",
  upload.array("image", 1),
  updateBanner
);

router.delete("/:id", deleteBanner);

export default router;