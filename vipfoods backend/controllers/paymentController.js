import User from "../models/User.js";
import { priceOnlineOrder } from "../utils/priceOnlineOrder.js";
import { getRazorpay, toPaise, verifyRazorpayPayment, paymentError } from "../utils/razorpayPayment.js";

export const createOrder = async (req, res) => {
  try {
    const amount = toPaise(req.body.amount);
    if (amount < 100) return res.status(400).json({ success: false, message: "Minimum amount is ₹1" });
    if (req.body.checkout) {
      const checkout = req.body.checkout;
      if (checkout.paymentMethod !== "ONLINE") throw paymentError("Invalid online payment request.");
      const { subtotal, discount } = await priceOnlineOrder(checkout.items, checkout.coupon);
      const wallet = toPaise(checkout.walletAmountUsed || 0);
      const total = Math.max(0, toPaise(subtotal) - toPaise(discount));
      if (wallet > total || total - wallet !== amount) throw paymentError("Order total has changed. Please refresh checkout.");
      if (wallet > 0) {
        const user = await User.findById(req.user._id);
        if (!user || toPaise(user.walletBalance) < wallet) throw paymentError("Insufficient wallet balance. Please refresh checkout.");
      }
    }
    const order = await getRazorpay().orders.create({
      amount, currency: "INR", receipt: `receipt_${Date.now()}`,
      notes: { userId: String(req.user._id), purpose: "checkout" },
    });
    return res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.error?.description || error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    await verifyRazorpayPayment(req.body, req.user._id, "checkout");
    return res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Payment verification failed" });
  }
};
