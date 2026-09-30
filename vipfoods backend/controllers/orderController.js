import User from "../models/User.js";
import { priceOnlineOrder } from "../utils/priceOnlineOrder.js";
import { paymentError, toPaise, verifyRazorpayPayment } from "../utils/razorpayPayment.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
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
    const customerId = req.user?._id;
    if (!customerId) return res.status(401).json({ success: false, message: "Login required" });
    const body = req.body;
    const { paymentMethod, shippingAddress, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    if (!["ONLINE", "COD"].includes(paymentMethod)) throw paymentError("Invalid payment method.");
    const walletPaise = toPaise(body.walletAmountUsed || 0);
    if (paymentMethod !== "ONLINE" && walletPaise > 0) throw paymentError("Wallet balance is available only for online payments.");
    const state = (shippingAddress?.state || "").trim().toLowerCase();
    const codCharge = paymentMethod === "COD" ? (["ap", "andhra pradesh"].includes(state) ? 50 : 75) : 0;
    const paymentReference = razorpayOrderId
      ? `razorpay:${razorpayOrderId}`
      : walletPaise > 0 && typeof body.checkoutPaymentId === "string" && body.checkoutPaymentId.length <= 100
        ? `wallet:${customerId}:${body.checkoutPaymentId}` : undefined;
    if (walletPaise > 0 && !paymentReference) throw paymentError("Missing checkout payment reference.");
    if (paymentReference) {
      const existing = await Order.findOne({ paymentReference });
      if (existing) {
        if (String(existing.customer) !== String(customerId)) throw paymentError("Payment belongs to another account.");
        return res.json({ success: true, order: existing });
      }
    }

    let subtotal = Number(body.subtotal);
    let discount = Number(body.discount || 0);
    let items = body.items;
    if (paymentMethod === "ONLINE" || items?.some((item) => item.comboOffer)) {
      ({ items, subtotal, discount } = await priceOnlineOrder(items, body.coupon));
    }
    const totalPaise = Math.max(0, toPaise(subtotal) - toPaise(discount)) + toPaise(codCharge);
    if (walletPaise > totalPaise) throw paymentError("Wallet amount exceeds the order total.");
    const gatewayPaise = paymentMethod === "ONLINE" ? totalPaise - walletPaise : toPaise(codCharge);
    if (paymentMethod === "ONLINE" && toPaise(body.grandTotal) !== gatewayPaise) {
      throw paymentError("Order total has changed. Please refresh checkout before paying.");
    }
    if (gatewayPaise > 0 && (paymentMethod === "ONLINE" || body.codChargePaid)) {
      await verifyRazorpayPayment({
        razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature,
      }, customerId, "checkout", gatewayPaise);
    }
    const orderData = {
      orderNumber: generateOrderNumber(), customer: customerId, items, shippingAddress,
      paymentMethod, subtotal, discount, grandTotal: totalPaise / 100, codCharge,
      walletAmountUsed: walletPaise / 100, paymentReference,
      paymentStatus: paymentMethod === "ONLINE" ? "PAID" : body.codChargePaid ? "PARTIALLY_PAID" : "PENDING",
      onlinePaidAmount: paymentMethod === "ONLINE" || body.codChargePaid ? gatewayPaise / 100 : 0,
      remainingAmount: paymentMethod === "ONLINE" ? 0 : (totalPaise - (body.codChargePaid ? gatewayPaise : 0)) / 100,
      coupon: body.coupon || null, notes: body.notes, codChargePaid: Boolean(body.codChargePaid),
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
    };
    let order;
    try {
      // A failed order insert rolls back the wallet debit and its transaction history.
      await mongoose.connection.transaction(async (session) => {
        if (paymentReference) {
          const existing = await Order.findOne({ paymentReference }).session(session);
          if (existing) { order = existing; return; }
        }
        if (walletPaise > 0) {
          const user = await User.findOneAndUpdate(
            { _id: customerId, walletBalance: { $gte: walletPaise / 100 } },
            { $inc: { walletBalance: -walletPaise / 100 }, $push: { walletTransactions: {
              type: "debit", amount: walletPaise / 100, paymentReference,
              description: `Paid through wallet — Order ${orderData.orderNumber}`, createdAt: new Date(),
            } } },
            { new: true, session }
          );
          if (!user) throw paymentError("Insufficient wallet balance. Please refresh checkout.");
        }
        [order] = await Order.create([orderData], { session });
        if (body.coupon) await Coupon.findByIdAndUpdate(body.coupon, { $inc: { usedCount: 1 } }, { session });
      });
    } catch (error) {
      // A repeated callback may race the original order insertion.
      if (error.code !== 11000 || !paymentReference) throw error;
      order = await Order.findOne({ paymentReference, customer: customerId });
      if (!order) throw error;
    }
    return res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
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

    const previousStatus = order.orderStatus;
    order.orderStatus = status || order.orderStatus;

    await order.save();

    // Trigger Notification for the customer when order status changes
    if (order.customer && status && status !== previousStatus) {
      let title = `Order Status: ${status}`;
      let message = `Your Order #${order.orderNumber} status has been updated to ${status}.`;

      if (status === "Accepted") {
        title = "Order Accepted! 🎉";
        message = `Great news! Your Order #${order.orderNumber} has been accepted by the store and is being prepared.`;
      } else if (status === "Packing") {
        title = "Order Packing 📦";
        message = `Your Order #${order.orderNumber} is now being packed with fresh items.`;
      } else if (status === "Shipped") {
        title = "Order Shipped! 🚚";
        message = `Your Order #${order.orderNumber} has been dispatched and is on its way to you!`;
      } else if (status === "Delivered") {
        title = "Order Delivered! ✅";
        message = `Your Order #${order.orderNumber} has been delivered. Thank you for shopping with VIP Foods!`;
      } else if (status === "Cancelled") {
        title = "Order Cancelled ⚠️";
        message = `Your Order #${order.orderNumber} has been cancelled.`;
      }

      try {
        await Notification.create({
          title,
          message,
          type: "order",
          targetUser: order.customer,
          isActive: true,
        });
      } catch (notifErr) {
        console.error("Failed to create order notification:", notifErr);
      }
    }

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
