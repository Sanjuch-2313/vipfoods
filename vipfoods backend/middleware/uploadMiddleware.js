import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "vip-foods/categories",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: `${Date.now()}-${file.originalname
      .split(".")[0]
      .replace(/\s+/g, "-")}`,
  }),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed."));
    }
  },
});

export default upload;