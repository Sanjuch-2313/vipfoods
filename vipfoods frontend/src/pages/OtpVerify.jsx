import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { verifyOtp } from "../services/authService";

import "./login.css";
import "./register.css";

export default function OtpVerify() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================
  // HANDLE OTP INPUT
  // ============================

  const handleOtpChange = (e) => {
    // Allow digits only.

    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
  };

  // ============================
  // VERIFY OTP
  // ============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Registration session missing. Please register again.");

      navigate("/register");

      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      alert("Please enter a valid 6-digit OTP.");

      return;
    }

    try {
      setLoading(true);

      const response = await verifyOtp({
        email,
        otp,
      });

      console.log(
        "OTP VERIFY RESPONSE:",
        response.data
      );

      if (response.status === 200) {
        alert(
          response.data?.message ||
            "Email verified successfully!"
        );

        // After successful registration,
        // redirect user to login.

        navigate("/login", {
          replace: true,
        });
      }
    } catch (error) {
      console.error(
        "OTP VERIFY ERROR:",
        error
      );

      if (error.response) {
        alert(
          error.response.data?.message ||
            "OTP verification failed."
        );

        return;
      }

      if (error.request) {
        alert(
          "Cannot connect to the backend server."
        );

        return;
      }

      alert(
        error.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-bg">
      <form
        className="glass-card auth-card"
        onSubmit={handleSubmit}
      >
        <p className="auth-brand">
          VIP Foods
        </p>

        <h2>Verify OTP</h2>

        <p className="auth-sub">
          Enter the 6-digit code sent to{" "}
          <strong>
            {email || "your email"}
          </strong>
        </p>

        <label htmlFor="otp">
          Enter OTP
        </label>

        <input
          id="otp"
          type="text"
          value={otp}
          onChange={handleOtpChange}
          placeholder="123456"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          disabled={loading}
          required
        />

        <button
          type="submit"
          className="cta-btn full"
          disabled={loading || otp.length !== 6}
        >
          {loading
            ? "Verifying..."
            : "Verify OTP"}
        </button>

        <p className="auth-switch">
          Entered the wrong email?{" "}

          <button
            type="button"
            className="link-btn"
            disabled={loading}
            onClick={() =>
              navigate("/register")
            }
          >
            Register Again
          </button>
        </p>
      </form>
    </div>
  );
}