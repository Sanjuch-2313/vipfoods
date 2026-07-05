const express = require("express");

const {
  registerUser,
  verifyOtp,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);

router.post("/verify-otp", verifyOtp);

module.exports = router;