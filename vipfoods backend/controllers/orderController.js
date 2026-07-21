import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Generate unique order number
const generateOrderNumber = () => {
  return "VIP-" + uuidv4().slice(0, 8).toUpperCase();
};

// ✅ Create Order
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount = 0,
      grandTotal,
      notes,
      customer,
      coupon,
    } = req.body;

    const customerId = req.user?._id || customer;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }

    // COD Charge
    let codCharge = 0;

    if (paymentMethod === "COD") {
      const state = (shippingAddress?.state || "")
        .trim()
        .toLowerCase();

      codCharge =
        state === "andhra pradesh"
          ? 50
          : 70;
    }

    // Payment Details
    let onlinePaidAmount = 0;
    let remainingAmount = 0;
    let paymentStatus = "PENDING";

    if (paymentMethod === "ONLINE") {
      onlinePaidAmount = grandTotal;
      remainingAmount = 0;
      paymentStatus = "PAID";
    } else {
      onlinePaidAmount = codCharge;
      remainingAmount = grandTotal;
      paymentStatus = "PARTIALLY_PAID";
    }

    // Create Order
    const order = await Order.create({
      orderNumber: generateOrderNumber(),

      customer: customerId,

      items,

      shippingAddress,

      paymentMethod,

      paymentStatus,

      subtotal,

      discount,

      grandTotal,

      codCharge,

      onlinePaidAmount,

      remainingAmount,

      coupon,

      notes,
    });

    // Increase coupon usage count
    if (coupon) {
      await Coupon.findByIdAndUpdate(coupon, {
        $inc: {
          usedCount: 1,
        },
      });
    }

    // Return complete order
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("========== ORDER CREATE ERROR ==========");
    console.error(error);
    console.error(error.stack);
    console.error("========================================");

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("items.product", "name image")
      .sort("-createdAt");

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("========== GET ALL ORDERS ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get single order
export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("items.product", "name image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("========== GET ORDER ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user._id,
    })
      .populate("items.product", "name image")
      .sort("-createdAt");

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("========== GET MY ORDERS ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = status || order.orderStatus;

    await order.save();

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("========== UPDATE ORDER STATUS ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Delete order (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await order.deleteOne();

    return res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("========== DELETE ORDER ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};