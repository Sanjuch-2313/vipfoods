import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    discount: {
      type: Number,
      required: true,
    }, // Percentage

    expiry: {
      type: Date,
      required: true,
    },

    minOrder: {
      type: Number,
      default: 0,
    },

    usageLimit: {
      type: Number,
      default: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    categoryScope: {
      type: String,
      enum: ["all", "pickles", "dairy", "fresh"],
      default: "all",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);