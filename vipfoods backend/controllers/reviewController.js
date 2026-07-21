import Review from "../models/Review.js";

// ✅ Get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: "customer",
        select: "name email",
      })
      .populate({
        path: "product",
        select: "name",
      })
      .populate({
        path: "order",
        select: "orderNumber",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ Get single review
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("customer", "name email")
      .populate("order", "orderNumber")
      .populate("product", "name");

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    res.json({
      success: true,
      review,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ✅ Create Review
export const createReview = async (req, res) => {
  try {
    const {
      order,
      orderNumber,
      product,
      customer,
      customerName,
      rating,
      title,
      comment,
    } = req.body;

    // Prevent duplicate review for same order
const exists = await Review.findOne({
  order,
  customer,
});
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Review already submitted for this order.",
      });
    }

    const review = await Review.create({
      order,
      orderNumber,
      product,
      customer,
      customerName,
      rating,
      title,
      comment,
    });

    res.status(201).json({
      success: true,
      review,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// ✅ Approve Review
export const approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    res.json({
      success: true,
      review,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ✅ Delete Review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    res.json({
      success: true,
      message: "Review deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};