import Coupon from "../models/Coupon.js";

// ✅ Get all coupons
export const getCoupons = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? { code: new RegExp(search, "i") } : {};
    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get single coupon by ID
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: "Coupon not found" });
    }
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Create a new coupon
export const createCoupon = async (req, res) => {
    console.log("CREATE COUPON HIT");
console.log(req.body);
  try {
    console.log("CreateCoupon hit:", req.body); // debug log
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    console.error("CreateCoupon error:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// ✅ Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) {
      return res.status(404).json({ success: false, error: "Coupon not found" });
    }
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ✅ Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: "Coupon not found" });
    }
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
