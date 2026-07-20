import api from "./api";

/* Get active banner (Frontend use) */
export const getHomeBanner = async () => {
  const { data } = await api.get("/home-banner");
  return data;
};

/* Get all banners (Admin use) */
export const getAllHomeBanners = async () => {
  const { data } = await api.get("/home-banner/all");
  return data;
};

/* Create banner */
export const createHomeBanner = async (formData) => {
  const { data } = await api.post("/home-banner", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

/* Update banner */
export const updateHomeBanner = async (id, formData) => {
  const { data } = await api.put(`/home-banner/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

/* Delete banner */
export const deleteHomeBanner = async (id) => {
  const { data } = await api.delete(`/home-banner/${id}`);
  return data;
};