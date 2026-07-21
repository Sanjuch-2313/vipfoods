import api from "./api";

export const getCategories = async () => {
  const { data } = await api.get("/categories?active=true");
  return data.categories;
};

export const getFeaturedCategories = async () => {
  const { data } = await api.get("/categories?active=true&featured=true");
  return data.categories;
};