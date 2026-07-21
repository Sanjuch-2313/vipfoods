import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import api from "../services/api";
import "./orderSuccess.css";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const EXPERIENCE_OPTIONS = [
  { value: "excellent", emoji: "😊", label: "Excellent" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "average", emoji: "😐", label: "Average" },
];

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const { state } = useLocation();

  const order = state?.order;

  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [experience, setExperience] = useState("excellent");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayedRating = hoveredRating || rating;

  const submitReview = async () => {
    console.log("========== SUBMIT REVIEW ==========");
    console.log("Order:", order);

    if (!order) {
      alert(
        "Order information is missing. Please place the order again without refreshing this page."
      );
      return;
    }

    const productId =
      typeof order.items?.[0]?.product === "object"
        ? order.items[0]?.product?._id
        : order.items?.[0]?.product;

    const customerId =
      typeof order.customer === "object"
        ? order.customer?._id
        : order.customer;

    const payload = {
      order: order._id,
      orderNumber: order.orderNumber,
      product: productId || null,
      customer: customerId,
      customerName:
        order.shippingAddress?.fullName ||
        order.shippingAddress?.name ||
        "",
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
    };

    console.log("Payload:", payload);

    try {
      setLoading(true);

      const response = await api.post("/reviews", payload);

      console.log("Review Success:", response.data);

      setSubmitted(true);
    } catch (err) {
      console.error("Review Error:", err);

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Response:", err.response.data);

        alert(
          err.response.data?.message ||
            err.response.data?.error ||
            "Unable to submit review."
        );
      } else {
        alert(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section-wrap order-success-page">
      <div className="glass-card success-card">
        <h2>🎉 Order Received!</h2>

        <p>Your order number is:</p>

        <h3 className="order-number">{orderNumber}</h3>

        <p>We'll notify you when it's packed and shipped.</p>

        {!submitted ? (
          <>
            <hr />

            <div className="review-section">
              <h3 className="review-heading">Rate Your Experience</h3>

              <div className="star-rating" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`star-btn ${value <= displayedRating ? "star-btn--filled" : ""}`}
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                    aria-checked={rating === value}
                    role="radio"
                  >
                    ★
                  </button>
                ))}
              </div>

              <p className="rating-label">
                {"⭐".repeat(displayedRating)} {RATING_LABELS[displayedRating]}
              </p>

              <div className="experience-block">
                <span className="experience-label">Overall Experience</span>

                <div className="experience-pills">
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`experience-pill ${
                        experience === option.value ? "experience-pill--active" : ""
                      }`}
                      onClick={() => setExperience(option.value)}
                    >
                      <span className="experience-pill__emoji">{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="review-field">
                <input
                  type="text"
                  placeholder="Summarize your experience"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="review-input"
                />
              </div>

              <div className="review-field">
                <textarea
                  rows="4"
                  placeholder="What did you like? What can we improve?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="review-textarea"
                />
              </div>

              <button
                className="submit-review-btn"
                onClick={submitReview}
                disabled={loading}
              >
                {loading ? (
                  <span className="submit-review-btn__loading">
                    <span className="spinner" aria-hidden="true"></span>
                    Submitting...
                  </span>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="thank-you-block">
            <div className="thank-you-icon" aria-hidden="true">
              <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="26" cy="26" r="25" fill="#16a34a" />
                <path
                  d="M15 27L22.5 34.5L37.5 18.5"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3>Thank you!</h3>
            <p>
              Your review has been submitted successfully and is awaiting admin
              approval.
            </p>
          </div>
        )}

        <Link to="/" className="cta-btn full continue-shopping-btn">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}