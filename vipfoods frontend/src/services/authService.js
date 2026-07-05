import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",

  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = (userData) => {
  return API.post(
    "/auth/register",
    userData
  );
};

export const verifyOtp = (otpData) => {
  return API.post(
    "/auth/verify-otp",
    otpData
  );
};