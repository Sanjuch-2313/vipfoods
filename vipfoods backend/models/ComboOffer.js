import mongoose from "mongoose";

const comboOfferSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  image: { type: String, default: "" },
  price: { type: Number, required: true, min: 1 },
  size: { type: String, required: true, trim: true },
  itemCount: { type: Number, required: true, min: 1, max: 100, validate: Number.isInteger },
  selectionRules: { type: [{
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    categoryName: String,
    subCategory: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1, validate: Number.isInteger },
  }], default: [] },
  isDeleted: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model("ComboOffer", comboOfferSchema);
