import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import generateOtp from "../utils/generateOtp.js";
import sendOtpEmail from "../services/emailService.js";

// ======================================================
// HASH OTP
// ======================================================

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
};


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
    const {
      name,
      email,
      mobile,
      password,
    } = req.body;


    // --------------------------------------------------
    // VALIDATE FIELDS
    // --------------------------------------------------

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    // --------------------------------------------------
    // NORMALIZE INPUT
    // --------------------------------------------------

    const normalizedName = name.trim();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const normalizedMobile = mobile.trim();


    // --------------------------------------------------
    // VALIDATE EMAIL
    // --------------------------------------------------

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }


    // --------------------------------------------------
    // VALIDATE MOBILE
    // --------------------------------------------------

    const mobilePattern = /^[6-9]\d{9}$/;

    if (!mobilePattern.test(normalizedMobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }


    // --------------------------------------------------
    // VALIDATE PASSWORD
    // --------------------------------------------------

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters",
      });
    }


    // --------------------------------------------------
    // FIND EXISTING USER
    // --------------------------------------------------

    const emailUser = await User.findOne({
      email: normalizedEmail,
    });

    const mobileUser = await User.findOne({
      mobile: normalizedMobile,
    });


    // --------------------------------------------------
    // VERIFIED EMAIL EXISTS
    // --------------------------------------------------

    if (emailUser?.isVerified) {
      return res.status(409).json({
        success: false,
        message:
          "Email already registered. Please login.",
      });
    }


    // --------------------------------------------------
    // VERIFIED MOBILE EXISTS
    // --------------------------------------------------

    if (mobileUser?.isVerified) {
      return res.status(409).json({
        success: false,
        message:
          "Mobile number already registered. Please login.",
      });
    }


    // --------------------------------------------------
    // EMAIL AND MOBILE BELONG TO DIFFERENT USERS
    // --------------------------------------------------

    if (
      emailUser &&
      mobileUser &&
      emailUser._id.toString() !==
        mobileUser._id.toString()
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Email and mobile number belong to different pending registrations.",
      });
    }


    // --------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );


    // --------------------------------------------------
    // GENERATE OTP
    // --------------------------------------------------

    const otp = generateOtp();

    const hashedOtp = hashOtp(otp);

    const otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );


    // --------------------------------------------------
    // CREATE OR UPDATE USER
    // --------------------------------------------------

    let user = emailUser || mobileUser;


    if (user) {
      user.name = normalizedName;

      user.email = normalizedEmail;

      user.mobile = normalizedMobile;

      user.password = hashedPassword;

      user.otp = hashedOtp;

      user.otpExpiresAt = otpExpiresAt;

      user.isVerified = false;

      await user.save();
    } else {
      user = await User.create({
        name: normalizedName,

        email: normalizedEmail,

        mobile: normalizedMobile,

        password: hashedPassword,

        otp: hashedOtp,

        otpExpiresAt,

        isVerified: false,
      });
    }


    // --------------------------------------------------
    // SEND OTP EMAIL
    // --------------------------------------------------

    try {
      await sendOtpEmail(
        normalizedEmail,
        otp
      );
    } catch (emailError) {
      console.error(
        "EMAIL SEND ERROR:",
        emailError.message
      );

      return res.status(500).json({
        success: false,

        message:
          "Registration saved, but OTP email could not be sent.",
      });
    }


    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "OTP sent successfully. Please verify your email.",

      email: user.email,
    });

  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );


    if (error.code === 11000) {
      return res.status(409).json({
        success: false,

        message:
          "Email or mobile number already registered.",
      });
    }


    return res.status(500).json({
      success: false,

      message:
        "Server error during registration",
    });
  }
};


// ======================================================
// VERIFY OTP
// ======================================================

const verifyOtp = async (req, res) => {
  try {
    const {
      email,
      otp,
    } = req.body;


    // --------------------------------------------------
    // VALIDATE INPUT
    // --------------------------------------------------

    if (!email || !otp) {
      return res.status(400).json({
        success: false,

        message:
          "Email and OTP are required",
      });
    }


    const normalizedEmail = email
      .trim()
      .toLowerCase();


    // --------------------------------------------------
    // FIND USER
    // --------------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });


    if (!user) {
      return res.status(404).json({
        success: false,

        message:
          "Registration not found",
      });
    }


    // --------------------------------------------------
    // ALREADY VERIFIED
    // --------------------------------------------------

    if (user.isVerified) {
      return res.status(409).json({
        success: false,

        message:
          "Email is already verified",
      });
    }


    // --------------------------------------------------
    // CHECK ACTIVE OTP
    // --------------------------------------------------

    if (
      !user.otp ||
      !user.otpExpiresAt
    ) {
      return res.status(400).json({
        success: false,

        message:
          "No active OTP. Please request another OTP.",
      });
    }


    // --------------------------------------------------
    // CHECK OTP EXPIRY
    // --------------------------------------------------

    if (
      user.otpExpiresAt.getTime() <
      Date.now()
    ) {
      return res.status(400).json({
        success: false,

        message:
          "OTP expired. Please request another OTP.",
      });
    }


    // --------------------------------------------------
    // HASH RECEIVED OTP
    // --------------------------------------------------

    const receivedOtpHash =
      hashOtp(otp);


    // --------------------------------------------------
    // COMPARE OTP
    // --------------------------------------------------

    if (
      receivedOtpHash !== user.otp
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid OTP",
      });
    }


    // --------------------------------------------------
    // VERIFY ACCOUNT
    // --------------------------------------------------

    user.isVerified = true;

    user.otp = null;

    user.otpExpiresAt = null;

    await user.save();


    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Email verified successfully. Registration completed.",
    });

  } catch (error) {
    console.error(
      "VERIFY OTP ERROR:",
      error
    );


    return res.status(500).json({
      success: false,

      message:
        "Server error during OTP verification",
    });
  }
};


// ======================================================
// RESEND OTP
// ======================================================

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;


    // --------------------------------------------------
    // VALIDATE EMAIL
    // --------------------------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,

        message:
          "Email is required",
      });
    }


    const normalizedEmail = email
      .trim()
      .toLowerCase();


    // --------------------------------------------------
    // FIND USER
    // --------------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });


    if (!user) {
      return res.status(404).json({
        success: false,

        message:
          "Registration not found",
      });
    }


    // --------------------------------------------------
    // CHECK VERIFICATION
    // --------------------------------------------------

    if (user.isVerified) {
      return res.status(409).json({
        success: false,

        message:
          "Account is already verified. Please login.",
      });
    }


    // --------------------------------------------------
    // GENERATE NEW OTP
    // --------------------------------------------------

    const otp = generateOtp();

    const hashedOtp = hashOtp(otp);

    const otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );


    // --------------------------------------------------
    // SEND EMAIL FIRST
    // --------------------------------------------------

    try {
      await sendOtpEmail(
        normalizedEmail,
        otp
      );
    } catch (emailError) {
      console.error(
        "RESEND OTP EMAIL ERROR:",
        emailError.message
      );


      return res.status(500).json({
        success: false,

        message:
          "Unable to send OTP email. Please try again.",
      });
    }


    // --------------------------------------------------
    // SAVE NEW OTP
    // --------------------------------------------------

    user.otp = hashedOtp;

    user.otpExpiresAt = otpExpiresAt;

    await user.save();


    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "New OTP sent successfully.",
    });

  } catch (error) {
    console.error(
      "RESEND OTP ERROR:",
      error
    );


    return res.status(500).json({
      success: false,

      message:
        "Server error while resending OTP",
    });
  }
};


// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;


    // --------------------------------------------------
    // VALIDATE INPUT
    // --------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,

        message:
          "Email and password are required",
      });
    }


    const normalizedEmail = email
      .trim()
      .toLowerCase();


    // --------------------------------------------------
    // FIND USER
    // --------------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });


    /*
     * Use same message for unknown email
     * and incorrect password.
     */

    if (!user) {
      return res.status(401).json({
        success: false,

        message:
          "Invalid email or password",
      });
    }


    // --------------------------------------------------
    // CHECK VERIFICATION
    // --------------------------------------------------

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,

        message:
          "Please verify your email before logging in",
      });
    }


    // --------------------------------------------------
    // COMPARE PASSWORD
    // --------------------------------------------------

    const passwordMatched =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatched) {
      return res.status(401).json({
        success: false,

        message:
          "Invalid email or password",
      });
    }


    // --------------------------------------------------
    // GENERATE JWT
    // --------------------------------------------------

    const token =
      generateToken(user);


    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Login successful",

      token,

      user: {
        id:
          user._id.toString(),

        name:
          user.name,

        email:
          user.email,

        mobile:
          user.mobile,
      },
    });

  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );


    return res.status(500).json({
      success: false,

      message:
        "Server error during login",
    });
  }
};


// ======================================================
// EXPORT CONTROLLERS
// ======================================================

export { registerUser, verifyOtp, resendOtp, loginUser };