import api from "./api";

export const getHomeBanner = async () => {
  const { data } = await api.get("/home-banner");
  return data;
};

export const getAllHomeBanners = async () => {
  const { data } = await api.get("/home-banner/all");
  return data;
};