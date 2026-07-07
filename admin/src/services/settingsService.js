import axios from "axios";

const API_URL = "http://localhost:5001/api/settings";

export const getSettings = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const updateSettings = async (settings) => {
  const res = await axios.put(API_URL, settings);
  return res.data;
};
