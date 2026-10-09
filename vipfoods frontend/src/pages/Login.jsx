import vipLogo from "../assets/viplogo.jpg";
import { useSocialLogin } from "../hooks/useSocialLogin";
import SocialDevModal from "../components/SocialDevModal";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const {
    handleSocialClick,
    socialBusy,
    socialError,
    devModal,
    closeDevModal,
    confirmDevLogin,
  } = useSocialLogin();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      const response = await loginUser(
        form.email.trim().toLowerCase(),
        form.password
      );
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }
      if (!data.token) {
        throw new Error("Authentication token was not received.");
      }

      login(data.user, data.token);

      navigate(location.state?.returnTo === "/checkout" ? "/checkout" : "/", {
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
    <div className="min-h-screen bg-gradient-to-b from-[#43238a] via-[#3a1d7c] to-[#2c1463] flex flex-col justify-between font-sans">
      {/* Top Hero Section */}
      <div className="pt-10 pb-6 px-6 text-center flex flex-col items-center">
        <Link to="/" className="inline-block mb-3.5 transition-transform active:scale-95" aria-label="VIP Foods Home">
          <img src={vipLogo} alt="VIP Foods" className="h-16 sm:h-20 w-auto max-w-[280px] object-contain rounded-xl" />
        </Link>
        <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
          Shop Fresh, Shop Fast
        </h1>
        <p className="text-green-200 text-sm mt-1.5 font-medium">
          Groceries delivered in 10 minutes.
        </p>
      </div>

      {/* Bottom Sheet White Card */}
      <div className="bg-white rounded-t-[36px] shadow-2xl px-6 pt-6 pb-10 flex-1 max-w-lg mx-auto w-full">
        {socialError && <p role="alert" className="mb-4 text-sm text-red-600">{socialError}</p>}
        {socialBusy && <p role="status" className="mb-4 text-sm text-gray-600">Opening secure sign-in…</p>}
        {/* Login / Sign Up Tabs */}
        <div className="bg-gray-100 p-1 rounded-2xl flex max-w-sm mx-auto mb-6">
          <button
            type="button"
            className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-white text-green-700 shadow-xs transition-all"
          >
            Login
          </button>
          <Link
            to="/register"
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-gray-500 hover:text-gray-800 text-center transition-all"
          >
            Sign Up
          </Link>
        </div>

        {location.state?.sessionExpired && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Your session expired or is no longer valid. Log in again to continue checkout. Your cart has been kept.</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="border border-gray-200 rounded-2xl p-3 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <label
              htmlFor="login-email"
              className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5"
            >
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={loading}
              required
              className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-400"
            />
          </div>

          {/* Password Field */}
          <div className="border border-gray-200 rounded-2xl p-3 flex items-center justify-between focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <div className="flex-1">
              <label
                htmlFor="login-password"
                className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5"
              >
                Password
              </label>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                required
                className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-gray-400 hover:text-gray-600 p-1.5 focus:outline-none"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          {/* Stay signed in & Forgot Password */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 accent-green-600"
              />
              <span className="text-xs font-semibold text-gray-700">Stay signed in</span>
            </label>
            <button
              type="button"
              onClick={() => alert("Please contact support or check your email to reset password.")}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white py-3.5 px-4 rounded-2xl font-extrabold text-base shadow-sm hover:shadow active:scale-[0.99] transition-all disabled:opacity-70 mt-2"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider: LOGIN WITH */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <span className="relative bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            LOGIN WITH
          </span>
        </div>

        {/* Social Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={socialBusy}
            onClick={() => handleSocialClick("google")}
            className="w-full border-2 border-gray-900 rounded-2xl py-3 px-4 flex items-center justify-center gap-2.5 font-bold text-sm text-gray-900 hover:bg-gray-50 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <FcGoogle size={20} />
            <span>{socialBusy ? "Opening Google sign-in…" : "Continue with Google"}</span>
          </button>

          <button
            type="button"
            disabled={socialBusy}
            onClick={() => handleSocialClick("facebook")}
            className="w-full border-2 border-gray-900 rounded-2xl py-3 px-4 flex items-center justify-center gap-2.5 font-bold text-sm text-gray-900 hover:bg-gray-50 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <FaFacebook className="text-[#1877f2]" size={20} />
            <span>{socialBusy ? "Opening Facebook sign-in…" : "Continue with Facebook"}</span>
          </button>
        </div>
      </div>

      <SocialDevModal
        isOpen={devModal.open}
        onClose={closeDevModal}
        provider={devModal.provider}
        onConfirm={confirmDevLogin}
        busy={socialBusy}
        error={socialError}
      />
    </div>
  );
}