const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
},
});

const verifyEmailConnection = async () => {
  try {
    await transporter.verify();

    console.log("Gmail SMTP connection successful");
  } catch (error) {
    console.error("Gmail SMTP connection failed:");
    console.error(error);
  }
};

verifyEmailConnection();

const sendOtpEmail = async (email, otp) => {
  console.log("Attempting to send OTP email to:", email);

  const info = await transporter.sendMail({
    from: `"VIP Foods" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "VIP Foods Email Verification OTP",

    text: `Your VIP Foods verification OTP is ${otp}. This OTP expires in 10 minutes.`,

    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>VIP Foods Email Verification</h2>

        <p>Thank you for registering with VIP Foods.</p>

        <p>Your verification OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP expires in 10 minutes.</p>

        <p>Do not share this OTP with anyone.</p>
      </div>
    `,
  });

  console.log("OTP email sent successfully:", info.messageId);

  return info;
};

module.exports = sendOtpEmail;