import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";

import User from "../models/User.js";

// ======================================================
// RAZORPAY
// ======================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================================
// GENERATE JWT TOKEN
// ======================================================

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
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
// GENERATE REFERRAL CODE
// ======================================================

const createReferralCode = async (name) => {
  const cleanName = String(name || "VIP")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 5);

  const prefix = cleanName || "VIP";

  for (let i = 0; i < 10; i++) {
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    const code = `VIP${prefix}${randomPart}`;

    const existing = await User.findOne({
      referralCode: code,
    }).select("_id");

    if (!existing) {
      return code;
    }
  }

  // Extremely unlikely fallback
  return `VIP${Date.now().toString().slice(-8)}`;
};

const normalizeSavedArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => item !== null && item !== undefined).slice(0, 200);
};

const formatUserProfile = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  walletBalance: user.walletBalance || 0,
  referralCode: user.referralCode,
  walletTransactions: user.walletTransactions || [],
  savedAddresses: user.savedAddresses || [],
  savedCards: user.savedCards || [],
  cart: user.cart || [],
  wishlist: user.wishlist || [],
});

// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      referralCode,
    } = req.body || {};

    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, mobile and password are required.",
      });
    }

    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedMobile = String(mobile).trim();
    const normalizedReferralCode = referralCode
      ? String(referralCode).trim().toUpperCase()
      : "";

    if (normalizedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name.",
      });
    }

    // --------------------------------------------------
    // EMAIL VALIDATION
    // --------------------------------------------------

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    // --------------------------------------------------
    // MOBILE VALIDATION
    // --------------------------------------------------

    const mobilePattern = /^[6-9]\d{9}$/;

    if (!mobilePattern.test(normalizedMobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number. Enter a valid 10-digit number.",
      });
    }

    // --------------------------------------------------
    // PASSWORD VALIDATION
    // --------------------------------------------------

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    // --------------------------------------------------
    // CHECK EXISTING EMAIL
    // --------------------------------------------------

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    }).select("_id");

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // --------------------------------------------------
    // CHECK EXISTING MOBILE
    // --------------------------------------------------

    const existingMobile = await User.findOne({
      mobile: normalizedMobile,
    }).select("_id");

    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already registered.",
      });
    }

    // --------------------------------------------------
    // FIND REFERRER
    // --------------------------------------------------

    let referrer = null;

    if (normalizedReferralCode) {
      referrer = await User.findOne({
        referralCode: normalizedReferralCode,
      }).select("_id name referralCode");
    }

    // --------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------

    const hashedPassword = await bcrypt.hash(String(password), 12);

    // --------------------------------------------------
    // GENERATE UNIQUE REFERRAL CODE
    // --------------------------------------------------

    const generatedReferralCode =
      await createReferralCode(normalizedName);

    // --------------------------------------------------
    // CREATE USER
    // --------------------------------------------------

    const userData = {
      name: normalizedName,
      email: normalizedEmail,
      mobile: normalizedMobile,
      password: hashedPassword,
      isVerified: true,
      referralCode: generatedReferralCode,
    };

    // Only add referredBy when an actual referrer exists
    if (referrer && referrer._id) {
      userData.referredBy = referrer._id;
    }

    const user = await User.create(userData);

    // --------------------------------------------------
    // REFERRAL BONUS
    // --------------------------------------------------

    if (
      referrer &&
      referrer._id &&
      referrer._id.toString() !== user._id.toString()
    ) {
      const referralBonus = 50;

      // Give bonus to referrer
      await User.findByIdAndUpdate(
        referrer._id,
        {
          $inc: {
            walletBalance: referralBonus,
          },
          $push: {
            walletTransactions: {
              type: "credit",
              amount: referralBonus,
              description: `Referral bonus — ${normalizedName} joined`,
              createdAt: new Date(),
            },
          },
        },
        {
          new: true,
        }
      );

      // Give bonus to new user
      await User.findByIdAndUpdate(
        user._id,
        {
          $inc: {
            walletBalance: referralBonus,
          },
          $push: {
            walletTransactions: {
              type: "credit",
              amount: referralBonus,
              description:
                "Referral signup bonus — joined with a referral code",
              createdAt: new Date(),
            },
          },
        },
        {
          new: true,
        }
      );
    }

    // --------------------------------------------------
    // SUCCESS RESPONSE
    // --------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please login.",
      user: formatUserProfile(user),
    });
  } catch (error) {
    // --------------------------------------------------
    // ERROR HANDLING
    // --------------------------------------------------

    console.error("REGISTER ERROR:", error);

    // MongoDB duplicate key
    if (error?.code === 11000) {
      const duplicateField =
        Object.keys(error.keyPattern || {})[0];

      if (duplicateField === "email") {
        return res.status(409).json({
          success: false,
          message: "Email already registered.",
        });
      }

      if (duplicateField === "mobile") {
        return res.status(409).json({
          success: false,
          message: "Mobile number already registered.",
        });
      }

      if (duplicateField === "referralCode") {
        return res.status(409).json({
          success: false,
          message: "Please try registration again.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    // Mongoose validation error
    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors || {}).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message:
          messages.length > 0
            ? messages.join(", ")
            : "Invalid user information.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
      ...(process.env.NODE_ENV !== "production" && {
        error: error.message,
      }),
    });
  }
};

// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatched = await bcrypt.compare(
      String(password),
      user.password
    );

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: formatUserProfile(user),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// ======================================================
// GET CURRENT USER
// ======================================================

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -otp -otpExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: formatUserProfile(user),
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const syncProfile = async (req, res) => {
  try {
    const {
      savedAddresses,
      savedCards,
      cart,
      wishlist,
    } = req.body || {};

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          savedAddresses: normalizeSavedArray(savedAddresses),
          savedCards: normalizeSavedArray(savedCards),
          cart: normalizeSavedArray(cart),
          wishlist: normalizeSavedArray(wishlist),
        },
      },
      { new: true }
    ).select("-password -otp -otpExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: formatUserProfile(user),
    });
  } catch (error) {
    console.error("SYNC PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to sync profile data.",
    });
  }
};

// ======================================================
// WALLET — CREATE RAZORPAY ORDER
// ======================================================

const createWalletOrder = async (req, res) => {
  try {
    const { amount } = req.body || {};

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 1) {
      return res.status(400).json({
        success: false,
        message: "Minimum ₹1 required.",
      });
    }

    const amountInPaise = Math.round(numericAmount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `wallet_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("WALLET ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create order.",
    });
  }
};

// ======================================================
// WALLET — VERIFY & CREDIT
// ======================================================

const verifyWalletPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body || {};

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details.",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET is missing");
    }

    const generated = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generated !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const creditAmount = Number(amount) || 0;

    if (creditAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet amount.",
      });
    }

    user.walletBalance =
      (user.walletBalance || 0) + creditAmount;

    if (!Array.isArray(user.walletTransactions)) {
      user.walletTransactions = [];
    }

    user.walletTransactions.push({
      type: "credit",
      amount: creditAmount,
      description: "Wallet top-up via Razorpay",
      createdAt: new Date(),
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: `₹${creditAmount} added to wallet`,
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error("VERIFY WALLET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ======================================================
// WALLET — USE BALANCE
// ======================================================

const useWalletBalance = async (req, res) => {
  try {
    const { amount, description } = req.body || {};

    const deduct = Number(amount);

    if (!deduct || deduct <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const currentBalance = Number(user.walletBalance || 0);

    if (currentBalance < deduct) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance.",
      });
    }

    user.walletBalance = currentBalance - deduct;

    if (!Array.isArray(user.walletTransactions)) {
      user.walletTransactions = [];
    }

    user.walletTransactions.push({
      type: "debit",
      amount: deduct,
      description: description || "Order payment",
      createdAt: new Date(),
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: `₹${deduct} deducted from wallet`,
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error("USE WALLET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

export {
  registerUser,
  loginUser,
  getMe,
  syncProfile,
  createWalletOrder,
  verifyWalletPayment,
  useWalletBalance,
};