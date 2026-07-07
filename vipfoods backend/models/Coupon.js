import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true }, // percentage
  expiry: { type: Date, required: true },
  minOrder: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Coupon", couponSchema);
