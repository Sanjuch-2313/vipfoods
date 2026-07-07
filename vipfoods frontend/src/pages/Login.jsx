import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";

import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      /*
       * Send email + password to backend.
       */

      const response = await loginUser(
        form.email.trim().toLowerCase(),
        form.password
      );

      const data = response.data;

      console.log("LOGIN RESPONSE:", data);

      /*
       * Make sure backend returned
       * successful authentication.
       */

      if (!data.success) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      /*
       * Make sure token exists.
       */

      if (!data.token) {
        throw new Error(
          "Authentication token was not received."
        );
      }

      /*
       * Save authenticated user and JWT
       * using AuthContext.
       */

      login(data.user, data.token);

      /*
       * Navigate to Home.
       *
       * showBrandIntro tells App.jsx
       * to display BrandIntro after login.
       */

      navigate("/", {
        replace: true,

        state: {
          showBrandIntro: true,
        },
      });

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to login. Please try again.";

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-bg">

      {/* BACKGROUND EFFECT */}

      <div className="auth-grain"></div>


      {/* FLOATING DECORATIONS */}

      <div
        className="auth-jar float-3d"
        aria-hidden="true"
      >
        🫙
      </div>

      <div
        className="auth-leaf float-3d"
        aria-hidden="true"
      >
        🌿
      </div>

      <div
        className="auth-apple float-3d"
        aria-hidden="true"
      >
        🍏
      </div>


      {/* LOGIN FORM */}

      <form
        className="glass-card auth-card"
        onSubmit={handleSubmit}
      >

        <p className="auth-brand">
          VIP Foods
        </p>


        <h2>
          Welcome Back
        </h2>


        <p className="auth-sub">
          Login to your VIP Foods account
        </p>


        {/* EMAIL */}

        <label htmlFor="login-email">
          Email
        </label>

        <input
          id="login-email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={loading}
          required
        />


        {/* PASSWORD */}

        <label htmlFor="login-password">
          Password
        </label>

        <input
          id="login-password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={loading}
          required
        />


        {/* LOGIN BUTTON */}

        <button
          type="submit"
          className="cta-btn full"
          disabled={loading}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>


        {/* REGISTER LINK */}

        <p className="auth-switch">

          Don't have an account?{" "}

          <Link to="/register">
            Register
          </Link>

        </p>

      </form>

    </div>
  );
}