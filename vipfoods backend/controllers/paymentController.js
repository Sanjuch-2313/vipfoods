import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =======================
// Create Razorpay Order
// =======================
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum amount is ₹1",
      });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("========== RAZORPAY CREATE ORDER ==========");
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.error?.description ||
        error.message ||
        "Unable to create Razorpay order",
    });
  }
};

// =======================
// Verify Payment
// =======================
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    console.log("\n========== VERIFY PAYMENT ==========");
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);
    console.log("Received Signature:", razorpay_signature);
    console.log("Razorpay Secret:", process.env.RAZORPAY_KEY_SECRET);

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("Generated Signature:", generatedSignature);

    if (generatedSignature !== razorpay_signature) {
      console.log("❌ SIGNATURE MISMATCH");

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
        receivedSignature: razorpay_signature,
        generatedSignature,
      });
    }

    console.log("✅ PAYMENT VERIFIED");

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("========== VERIFY PAYMENT ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};