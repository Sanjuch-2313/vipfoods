import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api/auth";

export const registerUser = async (formData) => {
  return axios.post(`${API_URL}/register`, formData);
};

export const verifyOtp = async (email, otp) => {
  return axios.post(`${API_URL}/verify-otp`, {
    email,
    otp,
  });
};

export const resendOtp = async (email) => {
  return axios.post(`${API_URL}/resend-otp`, {
    email,
  });
};

export const loginUser = async (email, password) => {
  return axios.post(`${API_URL}/login`, {
    email,
    password,
  });
};