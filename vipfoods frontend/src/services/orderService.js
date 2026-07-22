import api from "./api";

const getErrorMessage = (error, fallback) => {
  return error.response?.data?.message || error.message || fallback;
};

/* ===========================
   CREATE ORDER
=========================== */
export const createOrder = async (orderPayload) => {
  try {
    const { data } = await api.post("/orders", orderPayload);
    return data;
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    throw new Error(getErrorMessage(error, "Failed to place order"));
  }
};

/* ===========================
   CREATE RAZORPAY ORDER
=========================== */
export const createRazorpayOrder = async (amount) => {
  try {
    const { data } = await api.post("/payment/create-order", {
      amount,
    });

    return data;
  } catch (error) {
    console.error("CREATE RAZORPAY ORDER ERROR:", error);
    throw new Error(getErrorMessage(error, "Failed to create Razorpay order"));
  }
};

/* ===========================
   VERIFY PAYMENT
=========================== */
export const verifyPayment = async (paymentData) => {
  try {
    const { data } = await api.post(
      "/payment/verify-payment",
      paymentData
    );

    return data;
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    throw new Error(getErrorMessage(error, "Payment verification failed"));
  }
};

/* ===========================
   GET MY ORDERS
=========================== */
export const getMyOrders = async () => {
  try {
    const { data } = await api.get("/orders/customer/my-orders");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch your orders"));
  }
};

/* ===========================
   GET ALL ORDERS
=========================== */
export const getOrders = async () => {
  try {
    const { data } = await api.get("/orders");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch orders"));
  }
};

/* ===========================
   UPDATE ORDER STATUS
=========================== */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data } = await api.put(`/orders/${orderId}/status`, {
      status,
    });

    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update order status"));
  }
};

/* ===========================
   DELETE ORDER
=========================== */
export const deleteOrder = async (orderId) => {
  try {
    const { data } = await api.delete(`/orders/${orderId}`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete order"));
  }
};