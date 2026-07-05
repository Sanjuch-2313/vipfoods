const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const generateOtp = require("../utils/generateOtp");
const sendOtpEmail = require("../services/emailService");


const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
};


// REGISTER USER

const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;


    // 1. Validate fields

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }


    // 2. Normalize input

    const normalizedName = name.trim();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const normalizedMobile = mobile.trim();


    // 3. Validate email

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }


    // 4. Validate Indian mobile number

    const mobilePattern = /^[6-9]\d{9}$/;

    if (!mobilePattern.test(normalizedMobile)) {
      return res.status(400).json({
        message: "Invalid mobile number",
      });
    }


    // 5. Validate password

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters",
      });
    }


    // 6. Search by email and mobile separately

    const emailUser = await User.findOne({
      email: normalizedEmail,
    });

    const mobileUser = await User.findOne({
      mobile: normalizedMobile,
    });


    // Verified account already exists

    if (emailUser?.isVerified) {
      return res.status(409).json({
        message: "Email already registered. Please login.",
      });
    }

    if (mobileUser?.isVerified) {
      return res.status(409).json({
        message:
          "Mobile number already registered. Please login.",
      });
    }


    // Prevent updating one pending account
    // with another pending account's email/mobile.

    if (
      emailUser &&
      mobileUser &&
      emailUser._id.toString() !== mobileUser._id.toString()
    ) {
      return res.status(409).json({
        message:
          "Email and mobile number belong to different pending registrations.",
      });
    }


    // 7. Hash password

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );


    // 8. Generate OTP

    const otp = generateOtp();

    const hashedOtp = hashOtp(otp);

    const otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );


    // 9. Create/update unverified user

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
      });
    }


    // 10. Send OTP email

    try {
      await sendOtpEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error(
        "EMAIL SEND ERROR:",
        emailError.message
      );

      return res.status(500).json({
        message:
          "Registration saved, but OTP email could not be sent.",
      });
    }


    // 11. Success

    return res.status(201).json({
      message:
        "OTP sent successfully. Please verify your email.",

      email: user.email,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);


    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Email or mobile number already registered.",
      });
    }


    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};


// VERIFY OTP

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;


    // 1. Validate input

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }


    const normalizedEmail = email
      .trim()
      .toLowerCase();


    // 2. Find user

    const user = await User.findOne({
      email: normalizedEmail,
    });


    if (!user) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }


    // 3. Already verified

    if (user.isVerified) {
      return res.status(409).json({
        message: "Email is already verified",
      });
    }


    // 4. Check active OTP

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        message:
          "No active OTP. Please register again.",
      });
    }


    // 5. Check expiry

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({
        message:
          "OTP expired. Please request another OTP.",
      });
    }


    // 6. Hash received OTP

    const receivedOtpHash = hashOtp(otp);


    // 7. Compare OTP

    if (receivedOtpHash !== user.otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }


    // 8. Verify account

    user.isVerified = true;

    user.otp = null;

    user.otpExpiresAt = null;

    await user.save();


    return res.status(200).json({
      message:
        "Email verified successfully. Registration completed.",
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      message:
        "Server error during OTP verification",
    });
  }
};


module.exports = {
  registerUser,
  verifyOtp,
};