import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

import "./login.css";
import "./register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // =========================
  // HANDLE REGISTER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Normalize inputs

    const name = form.name.trim();

    const email = form.email
      .trim()
      .toLowerCase();

    const mobile = form.mobile.trim();

    const password = form.password;

    const confirmPassword = form.confirmPassword;

    // =========================
    // NAME VALIDATION
    // =========================

    if (name.length < 2) {
      alert("Please enter a valid name.");
      return;
    }

    // =========================
    // EMAIL VALIDATION
    // =========================

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // =========================
    // MOBILE VALIDATION
    // =========================

    const mobilePattern = /^[6-9]\d{9}$/;

    if (!mobilePattern.test(mobile)) {
      alert(
        "Please enter a valid 10-digit mobile number starting with 6–9."
      );

      return;
    }

    // =========================
    // PASSWORD VALIDATION
    // =========================

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    // =========================
    // CONFIRM PASSWORD
    // =========================

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // =========================
    // DATA SENT TO BACKEND
    // =========================

    // Do NOT send confirmPassword.

    const userData = {
      name,
      email,
      mobile,
      password,
    };

    try {
      setLoading(true);

      console.log("Sending registration data:", {
        name,
        email,
        mobile,
      });

      const response = await registerUser(userData);

      console.log("REGISTER RESPONSE:", response.data);

      // Backend register route returns 201 Created.

      if (response.status === 201) {
        alert(
          response.data?.message ||
            "OTP sent successfully. Please check your email."
        );

        navigate("/otp-verify", {
          state: {
            email,
          },
        });
      }
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      // Backend responded with an error.

      if (error.response) {
        console.error(
          "BACKEND RESPONSE:",
          error.response.data
        );

        alert(
          error.response.data?.message ||
            "Registration failed."
        );

        return;
      }

      // Request was sent but backend did not respond.

      if (error.request) {
        alert(
          "Cannot connect to the backend server. Make sure the backend is running."
        );

        return;
      }

      // Other error.

      alert(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-bg">
      <div className="auth-grain"></div>

      <div className="auth-chilli float-3d">
        🌶️
      </div>

      <div className="auth-spice float-3d">
        🧂
      </div>

      <div className="auth-leaf auth-leaf-register float-3d">
        🌿
      </div>

      <form
        className="glass-card auth-card"
        onSubmit={handleSubmit}
      >
        <p className="auth-brand">
          VIP Foods
        </p>

        <h2>Create Account</h2>

        <p className="auth-sub">
          Join VIP Foods — pickles, fresh & spice
        </p>

        {/* FULL NAME */}

        <label htmlFor="name">
          Full Name
        </label>

        <input
          id="name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your name"
          autoComplete="name"
          disabled={loading}
          required
        />

        {/* EMAIL */}

        <label htmlFor="email">
          Email
        </label>

        <input
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={loading}
          required
        />

        {/* MOBILE */}

        <label htmlFor="mobile">
          Mobile Number
        </label>

        <input
          id="mobile"
          type="tel"
          name="mobile"
          value={form.mobile}
          onChange={(e) => {
            // Allow numbers only.

            const numbersOnly =
              e.target.value.replace(/\D/g, "");

            setForm((previousForm) => ({
              ...previousForm,
              mobile: numbersOnly,
            }));
          }}
          placeholder="10-digit mobile"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          disabled={loading}
          required
        />

        {/* PASSWORD */}

        <label htmlFor="password">
          Password
        </label>

        <input
          id="password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={6}
          disabled={loading}
          required
        />

        {/* CONFIRM PASSWORD */}

        <label htmlFor="confirmPassword">
          Confirm Password
        </label>

        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={6}
          disabled={loading}
          required
        />

        {/* REGISTER BUTTON */}

        <button
          type="submit"
          className="cta-btn full"
          disabled={loading}
        >
          {loading
            ? "Sending OTP..."
            : "Register"}
        </button>

        <p className="auth-switch">
          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}