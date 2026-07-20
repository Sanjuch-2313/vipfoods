import api from "./api";

export const getHomeBanner = async () => {
  const { data } = await api.get("/home-banner");
  return data;
};