import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    if (!email || !password || !secretKey) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and secret key are required",
      });
    }

    // 1. Check secret key first (cheapest check, fails fast)
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 2. Check email
    if (email.trim().toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3. Check password against stored hash
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. Issue short-lived JWT
    const token = jwt.sign(
      { role: "admin", email: process.env.ADMIN_EMAIL },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("========== ADMIN LOGIN ERROR ==========");
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};