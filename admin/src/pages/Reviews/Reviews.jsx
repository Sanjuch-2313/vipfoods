import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import {
  getReviews,
  deleteReview,
} from "../../services/reviewService";

import "../../styles/Reviews.css";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  const loadReviews = async () => {
    try {
      const response = await getReviews();
      setReviews(response.reviews || []);
    } catch (error) {
      console.error(error);
      setReviews([]);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!ok) return;

    try {
      await deleteReview(id);
      loadReviews();
    } catch (error) {
      console.error(error);
      alert("Failed to delete review");
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
              <th>Product</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {reviews.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No Reviews Found
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review._id}>

                  <td>
                    {review.customer?.name || "-"}
                  </td>

                  <td>
                    {review.product?.name || "-"}
                  </td>

                  <td>
                    ⭐ {review.rating}
                  </td>

                  <td>
                    {review.comment || "-"}
                  </td>

                  <td>
                    {new Date(
                      review.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(review._id)
                      }
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