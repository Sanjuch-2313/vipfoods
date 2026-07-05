const nodemailer = require("nodemailer");
const dns = require("node:dns");

// Prefer IPv4 because the previous connection attempted IPv6.
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },

  requireTLS: true,

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,

  tls: {
    minVersion: "TLSv1.2",
  },
});

const sendOtpEmail = async (email, otp) => {
  try {
    console.log("Attempting to send OTP email to:", email);

    const info = await transporter.sendMail({
      from: `"VIP Foods" <${process.env.EMAIL_USER}>`,
      to: email,

      subject: "VIP Foods Email Verification OTP",

      text: `Your VIP Foods verification OTP is ${otp}. It expires in 10 minutes.`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 30px;">
          <h1>VIP Foods</h1>

          <h2>Verify Your Email</h2>

          <p>Thank you for registering with VIP Foods.</p>

          <p>Your verification OTP is:</p>

          <div style="
            padding: 18px;
            margin: 20px 0;
            background: #f5f5f5;
            border-radius: 10px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
          ">
            ${otp}
          </div>

          <p>This OTP expires in 10 minutes.</p>

          <p>Do not share this OTP with anyone.</p>
        </div>
      `,
    });

    console.log("OTP EMAIL SENT SUCCESSFULLY:", info.messageId);

    return info;
  } catch (error) {
    console.error("NODEMAILER EMAIL ERROR:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });

    throw error;
  }
};

module.exports = sendOtpEmail;