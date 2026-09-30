import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay payment keys are not configured.");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export function paymentError(message) {
  return Object.assign(new Error(message), { statusCode: 400 });
}

export function toPaise(value) {
  const amount = Number(value);
  const paise = Math.round(amount * 100);
  if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(paise)) {
    throw paymentError("Invalid payment amount.");
  }
  return paise;
}

export async function verifyRazorpayPayment(details, userId, purpose, expectedAmount) {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = details;
  if (!orderId || !paymentId || typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) {
    throw paymentError("Missing or invalid payment details.");
  }
  const gateway = getRazorpay();
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`).digest();
  if (!crypto.timingSafeEqual(expected, Buffer.from(signature, "hex"))) {
    throw paymentError("Invalid payment signature.");
  }
  const [order, initialPayment] = await Promise.all([
    gateway.orders.fetch(orderId), gateway.payments.fetch(paymentId),
  ]);
  let payment = initialPayment;
  if (order.notes?.userId !== String(userId) || order.notes?.purpose !== purpose ||
      payment.order_id !== orderId || payment.currency !== "INR" || order.currency !== "INR" ||
      Number(payment.amount) !== Number(order.amount) ||
      (expectedAmount !== undefined && Number(payment.amount) !== expectedAmount)) {
    throw paymentError("Payment does not match this order or account.");
  }
  if (payment.status === "authorized") {
    try {
      payment = await gateway.payments.capture(paymentId, Number(payment.amount), "INR");
    } catch {
      // Automatic capture may have completed while this request was in flight.
      payment = await gateway.payments.fetch(paymentId);
    }
  }
  if (payment.status !== "captured" || Number(payment.amount_refunded || 0) > 0) {
    throw paymentError("Payment has not been captured. Please retry verification.");
  }
  return payment;
}
