import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";

import User from "../models/User.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================================
// GENERATE JWT TOKEN
// ======================================================

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password, referralCode } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(normalizedMobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const existingMobile = await User.findOne({ mobile: normalizedMobile });
    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Find referrer if referralCode provided
    let referrer = null;
    if (referralCode && referralCode.trim()) {
      referrer = await User.findOne({
        referralCode: referralCode.trim().toUpperCase(),
      });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      mobile: normalizedMobile,
      password: hashedPassword,
      isVerified: true,
      referredBy: referrer ? referrer._id : null,
    });

    // Credit ₹50 to referrer's wallet
    if (referrer) {
      referrer.walletBalance = (referrer.walletBalance || 0) + 50;
      referrer.walletTransactions.push({
        type: "credit",
        amount: 50,
        description: `Referral bonus — ${normalizedName} joined`,
      });
      await referrer.save();
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please login.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or Mobile already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        walletBalance: user.walletBalance || 0,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// ======================================================
// GET CURRENT USER (ME)
// ======================================================

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp -otpExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        walletBalance: user.walletBalance || 0,
        referralCode: user.referralCode,
        walletTransactions: user.walletTransactions || [],
      },
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// WALLET — CREATE RAZORPAY ORDER (for top-up)
// ======================================================

const createWalletOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) < 1) {
      return res.status(400).json({ success: false, message: "Minimum ₹1 required" });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `wallet_${Date.now()}`,
    });

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("WALLET ORDER ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to create order" });
  }
};

// ======================================================
// WALLET — VERIFY & CREDIT (after Razorpay success)
// ======================================================

const verifyWalletPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    const generated = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const creditAmount = Number(amount) || 0;
    user.walletBalance = (user.walletBalance || 0) + creditAmount;
    user.walletTransactions.push({
      type: "credit",
      amount: creditAmount,
      description: `Wallet top-up via Razorpay`,
    });
    await user.save();

    return res.status(200).json({
      success: true,
      message: `₹${creditAmount} added to wallet`,
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error("VERIFY WALLET ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// WALLET — USE BALANCE (deduct during checkout)
// ======================================================

const useWalletBalance = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const deduct = Number(amount) || 0;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.walletBalance < deduct) {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
    }

    user.walletBalance -= deduct;
    user.walletTransactions.push({
      type: "debit",
      amount: deduct,
      description: description || "Order payment",
    });
    await user.save();

    return res.status(200).json({
      success: true,
      message: `₹${deduct} deducted from wallet`,
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error("USE WALLET ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  registerUser,
  loginUser,
  getMe,
  createWalletOrder,
  verifyWalletPayment,
  useWalletBalance,
};