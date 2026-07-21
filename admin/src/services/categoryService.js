import api from "./api";

export const getCategories = async () => {
  const { data } = await api.get("/categories");
  return data.categories || [];
};

export const getFeaturedCategories = async () => {
  const { data } = await api.get("/categories?featured=true");
  return data.categories || [];
};

export const createCategory = async (formData) => {
  const { data } = await api.post("/categories", formData);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};