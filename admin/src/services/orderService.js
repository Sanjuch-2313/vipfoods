import api from "./api";

/* ===========================
   GET ALL ORDERS
=========================== */
export const getOrders = async () => {
  const response = await api.get("/orders");
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
export const updateOrderStatus = async (
  id,
  orderStatus
) => {
  const response = await api.put(`/orders/${id}`, {
    orderStatus,
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