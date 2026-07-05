import api from "./api";

export const registerUser = (userData) => {
  return api.post("/auth/register", userData);
};

export const verifyOtp = (otpData) => {
  return api.post("/auth/verify-otp", otpData);
};