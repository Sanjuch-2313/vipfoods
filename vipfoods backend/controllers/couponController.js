import Coupon from "../models/Coupon.js";

// ✅ Get all coupons
export const getCoupons = async (req, res) => {
  try {
    const { search } = req.query;

    const query = search
      ? { code: new RegExp(search, "i") }
      : {};

    const coupons = await Coupon.find(query).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      coupons,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ✅ Get active coupons (For Home Banner Dropdown)
export const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      coupons,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ✅ Get single coupon by ID
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: "Coupon not found",
      });
    }

    res.json({
      success: true,
      coupon,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ✅ Create coupon
export const createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);

    await coupon.save();

    res.status(201).json({
      success: true,
      coupon,
    });
  } catch (err) {
    console.error(err);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// ✅ Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: "Coupon not found",
      });
    }

    res.json({
      success: true,
      coupon,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// ✅ Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: "Coupon not found",
      });
    }

    res.json({
      success: true,
      message: "Coupon deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ✅ Validate Coupon (Checkout)
export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal, category = "all" } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Expiry Check
    if (coupon.expiry && new Date() > coupon.expiry) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    // Minimum Order Check
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order should be ₹${coupon.minOrder}`,
      });
    }

    // Category Check
    if (
      coupon.categoryScope !== "all" &&
      coupon.categoryScope !== category
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not applicable for this category",
      });
    }

    // Usage Limit Check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    const discountAmount = (subtotal * coupon.discount) / 100;

    return res.json({
      success: true,
      coupon,
      discountAmount,
      finalAmount: subtotal - discountAmount,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};