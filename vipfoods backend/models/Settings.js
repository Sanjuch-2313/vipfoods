import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: "VIP Foods" },
  logoUrl: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  address: { type: String },
  currency: { type: String, default: "INR" },
  taxRate: { type: Number, default: 0 },
  shippingFlatRate: { type: Number, default: 0 },
  freeShippingThreshold: { type: Number, default: 0 },
  paymentGateways: { type: [String], default: [] },
  seoMetaTitle: { type: String },
  seoMetaDescription: { type: String },
  themeColor: { type: String, default: "#2563eb" }
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
