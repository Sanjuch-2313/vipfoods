import Category from "../models/Category.js";
import { matchesComboRule, validateComboRules } from "../utils/comboRules.js";
import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import ComboOffer from "../models/ComboOffer.js";
import Product from "../models/Product.js";
import { adminAuth } from "../middleware/adminAuth.js";

import { normalizeComboSize } from "../utils/comboSizes.js";

const router = express.Router();
async function listOffers(query) {
  const [offers, products] = await Promise.all([
    ComboOffer.find({ ...query, isDeleted: { $ne: true } }).sort("-createdAt").lean(),
    Product.find({ isDeleted: false, active: true, published: true }).lean(),
  ]);
  return offers.map((offer) => ({ ...offer, options: products.filter(product => !offer.selectionRules?.length || offer.selectionRules.some(rule => matchesComboRule(product, rule))).flatMap((product) =>
    product.variants.filter((variant) => variant.inStock !== false && normalizeComboSize(variant.weight) === normalizeComboSize(offer.size))
      .map((variant) => ({ product, variantId: variant._id }))
  ) }));
}
router.get("/", async (req, res) => {
  try {
    const offers = await listOffers({ active: true });
    res.json({ success: true, offers });
  } catch { res.status(500).json({ success: false, message: "Unable to load combo offers." }); }
});
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const offers = await listOffers({});
    res.json({ success: true, offers });
  } catch { res.status(500).json({ success: false, message: "Unable to load combo offers." }); }
});
async function saveOffer(req, res) {
  try {
    const { name, size, price, itemCount, active } = req.body;
    if (!name?.trim() || !size?.trim() || !Number.isFinite(Number(price)) || Number(price) < 1 ||
        !Number.isInteger(Number(itemCount)) || Number(itemCount) < 1 || Number(itemCount) > 100) {
      return res.status(400).json({ success: false, message: "Enter a name, price, size, item count." });
    }
    let rules = typeof req.body.selectionRules === "string" ? JSON.parse(req.body.selectionRules) : (req.body.selectionRules || []);
    if (Array.isArray(rules)) rules = rules.map(rule => ({ ...rule, quantity: Number(rule.quantity) }));
    validateComboRules(rules, itemCount);
    const selectionRules = [];
    for (const rule of rules) {
      const category = await Category.findById(rule.category);
      if (!category || (rule.subCategory && !category.subCategories.some(sub => sub.name === rule.subCategory))) {
        throw new Error("Choose a valid category and subcategory.");
      }
      selectionRules.push({ category: category._id, categoryName: category.name, subCategory: rule.subCategory || "", quantity: rule.quantity });
    }
    const data = { selectionRules, name, size, price: Math.round(Number(price) * 100) / 100, itemCount: Number(itemCount), active: active !== false && active !== "false" };
    if (req.file) data.image = req.file.path;
    else if (req.body.removeImage === "true") data.image = "";
    const offer = req.params.id
      ? await ComboOffer.findOneAndUpdate({ _id: req.params.id, isDeleted: { $ne: true } }, data, { new: true, runValidators: true })
      : await ComboOffer.create(data);
    if (!offer) return res.status(404).json({ success: false, message: "Combo offer not found." });
    res.json({ success: true, offer });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
}
router.post("/", adminAuth, upload.single("image"), saveOffer);
router.put("/:id", adminAuth, upload.single("image"), saveOffer);
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const offer = await ComboOffer.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, active: false } }, { new: true }
    );
    if (!offer) return res.status(404).json({ success: false, message: "Combo offer not found." });
    res.json({ success: true, message: "Combo offer deleted." });
  } catch { res.status(400).json({ success: false, message: "Unable to delete this combo offer." }); }
});
export default router;
