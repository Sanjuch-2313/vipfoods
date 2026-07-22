import api from "./api";

// ==============================
// Get All Categories
// ==============================
export const getCategories = async () => {
  const { data } = await api.get("/categories");
  return data.categories || [];
};

// ==============================
// Get Featured Categories
// ==============================
export const getFeaturedCategories = async () => {
  const { data } = await api.get("/categories?featured=true");
  return data.categories || [];
};

// ==============================
// Create Category
// ==============================
export const createCategory = async (formData) => {
  const { data } = await api.post("/categories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

// ==============================
// Update Category
// ==============================
export const updateCategory = async (id, formData) => {
  const { data } = await api.put(`/categories/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

// ==============================
// Delete Category
// ==============================
export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};