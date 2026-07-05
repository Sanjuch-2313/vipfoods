import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email: form.email });
    navigate("/");
  };

  return (
    <div className="auth-page login-bg">
      <div className="auth-grain"></div>
      <div className="auth-jar float-3d">🫙</div>
      <div className="auth-leaf float-3d">🌿</div>
      <div className="auth-apple float-3d">🍏</div>

      <form className="glass-card auth-card" onSubmit={handleSubmit}>
        <p className="auth-brand">VIP Foods</p>
        <h2>Welcome Back</h2>
        <p className="auth-sub">Login to your VIP Foods account</p>

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />

        <button type="submit" className="cta-btn full">
          Login
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
