import api from "./api";

// ✅ Create new order
export const createOrder = async (orderData) => {
  try {
    const res = await api.post("/orders", orderData);
    return res.data;
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    throw error.response?.data || { success: false, message: "Failed to create order" };
  }
};

// ✅ Get logged‑in user's orders
export const getMyOrders = async () => {
  try {
    const res = await api.get("/orders/my-orders");
    return res.data;
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);
    throw error.response?.data || { success: false, message: "Failed to fetch orders" };
  }
};

// ✅ Get single order by ID
export const getOrderById = async (id) => {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    throw error.response?.data || { success: false, message: "Failed to fetch order" };
  }
};

// ✅ Admin: Get all orders
export const getAllOrders = async (params = {}) => {
  try {
    const res = await api.get("/orders", { params });
    return res.data;
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);
    throw error.response?.data || { success: false, message: "Failed to fetch orders" };
  }
};

// ✅ Admin: Update order status
export const updateOrderStatus = async (id, status) => {
  try {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    throw error.response?.data || { success: false, message: "Failed to update order status" };
  }
};

// ✅ Admin: Delete order
export const deleteOrder = async (id) => {
  try {
    const res = await api.delete(`/orders/${id}`);
    return res.data;
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);
    throw error.response?.data || { success: false, message: "Failed to delete order" };
  }
};
