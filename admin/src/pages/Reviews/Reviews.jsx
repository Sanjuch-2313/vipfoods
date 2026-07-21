import { useEffect, useState } from "react";
import { Trash2, CheckCircle } from "lucide-react";

import {
  getReviews,
  deleteReview,
  approveReview,
} from "../../services/reviewService";

import "../../styles/Reviews.css";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setLoading(true);

      const response = await getReviews();

      console.log("Reviews API Response:", response);

      if (Array.isArray(response)) {
        setReviews(response);
      } else if (response.reviews) {
        setReviews(response.reviews);
      } else if (response.data) {
        setReviews(response.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Reviews Error:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
      }

      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      await deleteReview(id);
      await loadReviews();
    } catch (error) {
      console.error(error);
      alert("Failed to delete review");
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveReview(id);
      await loadReviews();
    } catch (error) {
      console.error(error);
      alert("Failed to approve review");
    }
  };

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <h1>Customer Reviews</h1>
      </div>

      <div className="table-wrapper">
        <table className="reviews-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Order No</th>
              <th>Rating</th>
              <th>Title</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  Loading reviews...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No Reviews Found
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.customerName || "-"}</td>

                  <td>{review.orderNumber || "-"}</td>

                  <td>{"⭐".repeat(review.rating || 0)}</td>

                  <td>{review.title || "-"}</td>

                  <td>{review.comment || "-"}</td>

                  <td>
                    {review.approved ? (
                      <span className="approved-badge">
                        Approved
                      </span>
                    ) : (
                      <span className="pending-badge">
                        Pending
                      </span>
                    )}
                  </td>

                  <td>
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="action-buttons">
                    {!review.approved && (
                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(review._id)}
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(review._id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}