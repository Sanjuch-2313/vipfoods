// src/services/couponService.js
import api from "./api.js";

export const getCoupons = async (params = {}) => {
  const res = await api.get("/coupons", { params });   // ✅ works if backend is /api/coupons
  return res.data;
};

export const getCouponById = async (id) => {
  const res = await api.get(`/coupons/${id}`);
  return res.data;
};

export const createCoupon = async (data) => {
  const res = await api.post("/coupons", data);
  return res.data;
};

export const updateCoupon = async (id, data) => {
  const res = await api.put(`/coupons/${id}`, data);
  return res.data;
};

export const deleteCoupon = async (id) => {
  const res = await api.delete(`/coupons/${id}`);
  return res.data;
};
