import api from "./api";

export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data.order;
};

export const updateOrderStatus = async (id, orderStatus) => {
  const response = await api.put(`/orders/${id}`, {
    orderStatus,
  });

  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};