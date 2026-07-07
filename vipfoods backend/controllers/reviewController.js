import Review from "../models/Review.js";

// ✅ Get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("product", "name")
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get single review
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("product", "name")
      .populate("customer", "name email");

    if (!review) {
      return res.status(404).json({ success: false, error: "Review not found" });
    }
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Create review
export const createReview = async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ✅ Update review
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) {
      return res.status(404).json({ success: false, error: "Review not found" });
    }
    res.json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ✅ Delete review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: "Review not found" });
    }
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
