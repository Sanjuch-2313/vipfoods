import api from "./api";

/* ===========================
   CREATE ORDER
=========================== */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to create order",
      }
    );
  }
};

/* ===========================
   CREATE RAZORPAY ORDER
=========================== */
export const createRazorpayOrder = async (amount) => {
  try {
    const response = await api.post("/payment/create-order", {
      amount,
    });

    return response.data;
  } catch (error) {
    console.error("CREATE RAZORPAY ORDER ERROR:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to create Razorpay order",
      }
    );
  }
};

/* ===========================
   VERIFY PAYMENT
=========================== */
export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post(
      "/payment/verify-payment",
      paymentData
    );

    return response.data;
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Payment verification failed",
      }
    );
  }
};

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