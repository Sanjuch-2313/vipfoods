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

    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    discountText: {
      type: String,
      default: "",
      trim: true,
    },

    minimumOrder: {
      type: Number,
      default: 0,
    },

    validTill: {
      type: String,
      default: "",
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