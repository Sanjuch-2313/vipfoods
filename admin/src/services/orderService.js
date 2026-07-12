import api from "./api";

/* ===========================
   GET MY ORDERS
=========================== */
export const getMyOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

/* ===========================
   GET ALL ORDERS (ADMIN)
=========================== */
export const getOrders = async (params = {}) => {
  const response = await api.get("/orders", {
    params,
  });

  return response.data;
};

/* ===========================
   GET SINGLE ORDER
=========================== */
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data.order;
};

/* ===========================
   UPDATE ORDER STATUS
=========================== */
export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, {
    status,
  });

  return response.data;
};

/* ===========================
   DELETE ORDER
=========================== */
export const deleteOrder = async (id) => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};