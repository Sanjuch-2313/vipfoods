import api from "./api";

// ✅ Get all reviews
export const getReviews = async (params = {}) => {
  const response = await api.get("/reviews", {
    params,
  });

  return response.data;
};

// ✅ Get single review
export const getReviewById = async (id) => {
  const response = await api.get(`/reviews/${id}`);

  return response.data;
};

// ✅ Approve review
export const approveReview = async (id) => {
  const response = await api.patch(`/reviews/${id}/approve`);

  return response.data;
};

// ✅ Delete review
export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`);

  return response.data;
};