import api from "./api";

// ==============================
// Get All Active Categories
// ==============================
export const getCategories = async () => {
  const { data } = await api.get("/categories?active=true");
  return data;
};

// ==============================
// Get Featured Categories
// ==============================
export const getFeaturedCategories = async () => {
  const { data } = await api.get(
    "/categories?active=true&featured=true"
  );
  return data;
};

// ==============================
// Create Category
// ==============================
export const createCategory = async (formData) => {
  const { data } = await api.post(
    "/categories",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

// ==============================
// Delete Category
// ==============================
export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};