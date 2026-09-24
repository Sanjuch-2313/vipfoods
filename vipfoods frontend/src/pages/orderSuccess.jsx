import { useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { FiCheck, FiStar } from "react-icons/fi";
import api from "../services/api";

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
  const navigate = useNavigate();

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
    if (!order) {
      alert("Order details not found to link this review. Thank you for your feedback!");
      setSubmitted(true);
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
      orderNumber: order.orderNumber || orderNumber,
      product: productId || null,
      customer: customerId,
      customerName:
        order.shippingAddress?.fullName ||
        order.shippingAddress?.name ||
        "Valued Customer",
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
    };

    try {
      setLoading(true);
      await api.post("/reviews", payload);
      setSubmitted(true);
    } catch (err) {
      console.error("Review Error:", err);
      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to submit review."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8fbf3] flex flex-col justify-between font-sans pb-24">
      {/* ============================================================ */}
      {/* 1. TOP CELEBRATION HERO WITH CONFETTI & GREEN CHECKMARK */}
      {/* ============================================================ */}
      <div className="relative pt-10 pb-8 px-6 text-center flex flex-col items-center overflow-hidden">
        {/* Confetti decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-85">
          <span className="absolute top-4 left-1/4 w-3.5 h-2 bg-pink-500 rounded-xs rotate-12"></span>
          <span className="absolute top-8 left-1/3 w-3 h-2 bg-cyan-400 rounded-xs -rotate-45"></span>
          <span className="absolute top-12 left-1/6 w-2.5 h-2.5 bg-yellow-400 rounded-xs rotate-45"></span>
          <span className="absolute top-16 left-1/12 w-4 h-1.5 bg-emerald-500 rounded-xs -rotate-12"></span>
          <span className="absolute top-4 right-1/4 w-3.5 h-2 bg-pink-500 rounded-xs -rotate-12"></span>
          <span className="absolute top-10 right-1/6 w-3 h-2 bg-purple-600 rounded-xs 45"></span>
          <span className="absolute top-16 right-1/3 w-2.5 h-2 bg-amber-400 rounded-xs rotate-12"></span>
          <span className="absolute top-20 right-1/12 w-3.5 h-1.5 bg-emerald-400 rounded-xs -rotate-45"></span>
        </div>

        {/* Large Green Checkmark (Matching Image 2) */}
        <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white border-4 sm:border-[5px] border-emerald-600 flex items-center justify-center text-emerald-600 shadow-md mb-2">
          <FiCheck size={48} strokeWidth={3.5} />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. WHITE CARD (Matching Image 2 + Customer Review Preserved) */}
      {/* ============================================================ */}
      <div className="bg-white rounded-t-[36px] sm:rounded-[36px] shadow-2xl px-6 pt-7 pb-10 max-w-lg sm:max-w-xl mx-auto w-full flex-1">
        <div className="text-center mb-6">
          <h1 className="font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1.5">
            We will notify you once your order is on its way.
          </p>
        </div>

        {/* Dashed Order Number Box */}
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/70 p-4 text-center mb-6">
          <span className="text-xs sm:text-sm font-medium text-gray-400 block">
            Your Order Number
          </span>
          <span className="font-extrabold text-xl sm:text-2xl text-gray-900 block mt-0.5 tracking-tight">
            #{orderNumber || "12345"}
          </span>

          {order && (
            <div className="mt-3 pt-3 border-t border-gray-200/80 flex justify-around text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Paid Now</span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  ₹{(order.onlinePaidAmount || (order.paymentMethod === "COD" ? (order.codCharge || 50) : order.grandTotal) || 0).toFixed(2)}
                </span>
              </div>
              {order.paymentMethod === "COD" && (
                <div>
                  <span className="text-gray-400 block text-[11px]">Pay on Delivery</span>
                  <span className="font-extrabold text-gray-900 text-sm">
                    ₹{(order.remainingAmount || Math.max(0, (order.grandTotal || 0) - (order.codCharge || 50))).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Action Buttons (Matching Image 2) */}
        <div className="space-y-3 mb-8">
          <button
            type="button"
            onClick={() => navigate("/my-orders")}
            className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white py-3.5 px-4 rounded-2xl font-extrabold text-sm sm:text-base shadow-sm active:scale-[0.99] transition-all"
          >
            Track My Order
          </button>

          <Link
            to="/"
            className="w-full border-2 border-[#f43f5e] text-[#f43f5e] hover:bg-pink-50 py-3.5 px-4 rounded-2xl font-extrabold text-sm sm:text-base text-center block active:scale-[0.99] transition-all"
          >
            Continue Shopping
          </Link>
        </div>

        {/* ============================================================ */}
        {/* 3. CUSTOMER REVIEW SECTION (Preserved from existing codebase) */}
        {/* ============================================================ */}
        <div className="pt-6 border-t border-gray-100">
          {!submitted ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                  Rate Your Experience
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Your feedback helps us serve you better
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    onMouseEnter={() => setHoveredRating(val)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125"
                  >
                    <FiStar
                      size={28}
                      className={
                        val <= displayedRating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200"
                      }
                    />
                  </button>
                ))}
              </div>

              <p className="text-center text-xs font-bold text-gray-700">
                {RATING_LABELS[displayedRating]}
              </p>

              {/* Experience Pills */}
              <div className="flex gap-2 justify-center">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExperience(opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      experience === opt.value
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Review Title Input */}
              <input
                type="text"
                placeholder="Summarize your experience"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold p-3 rounded-xl border border-gray-200 outline-none focus:border-purple-500"
              />

              {/* Review Comment Textarea */}
              <textarea
                rows="3"
                placeholder="What did you like? What can we improve?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold p-3 rounded-xl border border-gray-200 outline-none focus:border-purple-500 resize-none"
              />

              {/* Submit Review Button */}
              <button
                type="button"
                onClick={submitReview}
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50"
              >
                {loading ? "Submitting Review..." : "Submit Review"}
              </button>
            </div>
          ) : (
            /* Review Thank You Box */
            <div className="bg-emerald-50 rounded-2xl p-5 text-center border border-emerald-100">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                <FiCheck size={20} strokeWidth={3} />
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                Thank you for your review!
              </h4>
              <p className="text-xs text-emerald-800 mt-1">
                Your feedback has been submitted successfully.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}