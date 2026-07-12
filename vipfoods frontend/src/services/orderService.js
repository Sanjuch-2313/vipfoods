import api from "./api";

const getErrorMessage = (error, fallback) => {
  return error.response?.data?.message || error.message || fallback;
};

export const createOrder = async (orderPayload) => {
  try {
    const { data } = await api.post("/orders", orderPayload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to place order"));
  }
};

export const getMyOrders = async () => {
  try {
    const { data } = await api.get("/orders/customer/my-orders");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch your orders"));
  }
};

export const getOrders = async () => {
  try {
    const { data } = await api.get("/orders");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch orders"));
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data } = await api.put(`/orders/${orderId}/status`, { status });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update order status"));
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const { data } = await api.delete(`/orders/${orderId}`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete order"));
  }
};
