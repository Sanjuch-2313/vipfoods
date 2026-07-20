import mongoose from "mongoose";

const homeBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },

    buttonText: {
      type: String,
      default: "Shop Now",
    },

    buttonLink: {
      type: String,
      default: "/products",
    },

    image: {
      type: String,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("HomeBanner", homeBannerSchema);