const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `"VIP Foods" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "VIP Foods Email Verification OTP",

    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">

        <h2>VIP Foods Email Verification</h2>

        <p>Thank you for registering with VIP Foods.</p>

        <p>Your verification OTP is:</p>

        <h1 style="letter-spacing: 5px;">
          ${otp}
        </h1>

        <p>This OTP is valid for 10 minutes.</p>

        <p>Do not share this OTP with anyone.</p>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;