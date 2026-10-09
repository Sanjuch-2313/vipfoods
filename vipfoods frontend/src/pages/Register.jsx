import vipLogo from "../assets/viplogo.jpg";
import { useSocialLogin } from "../hooks/useSocialLogin";
import SocialDevModal from "../components/SocialDevModal";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { registerUser } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const {
    handleSocialClick,
    socialBusy,
    socialError,
    devModal,
    closeDevModal,
    confirmDevLogin,
  } = useSocialLogin();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const mobile = form.mobile.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    if (name.length < 2) {
      alert("Please enter a valid name.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number starting with 6–9.");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const userData = {
  name,
  email,
  mobile,
  password,
};

if (form.referralCode.trim()) {
  userData.referralCode = form.referralCode.trim().toUpperCase();
}

    try {
      setLoading(true);
      const response = await registerUser(userData);

      if (response.status === 201) {
        alert("Registration Successful!");
        navigate("/login");
      }
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      if (error.response) {
        alert(error.response.data?.message || "Registration failed.");
        return;
      }
      if (error.request) {
        alert("Cannot connect to the backend server. Make sure the backend is running.");
        return;
      }
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#43238a] via-[#3a1d7c] to-[#2c1463] flex flex-col justify-between font-sans">
      {/* Top Hero Section */}
      <div className="pt-8 pb-5 px-6 text-center flex flex-col items-center">
        <Link to="/" className="inline-block mb-3 transition-transform active:scale-95" aria-label="VIP Foods Home">
          <img src={vipLogo} alt="VIP Foods" className="h-16 sm:h-20 w-auto max-w-[280px] object-contain rounded-xl" />
        </Link>
        <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
          Shop Fresh, Shop Fast
        </h1>
        <p className="text-green-200 text-sm mt-1 font-medium">
          Groceries delivered in 10 minutes.
        </p>
      </div>

      {/* Bottom Sheet White Card */}
      <div className="bg-white rounded-t-[36px] shadow-2xl px-6 pt-6 pb-10 flex-1 max-w-lg mx-auto w-full">
        {socialError && <p role="alert" className="mb-4 text-sm text-red-600">{socialError}</p>}
        {socialBusy && <p role="status" className="mb-4 text-sm text-gray-600">Opening secure sign-in…</p>}
        {/* Login / Sign Up Tabs */}
        <div className="bg-gray-100 p-1 rounded-2xl flex max-w-sm mx-auto mb-5">
          <Link
            to="/login"
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-gray-500 hover:text-gray-800 text-center transition-all"
          >
            Login
          </Link>
          <button
            type="button"
            className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-white text-green-700 shadow-xs transition-all"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div className="border border-gray-200 rounded-2xl p-2.5 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <label
              htmlFor="register-name"
              className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5"
            >
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              autoComplete="name"
              disabled={loading}
              required
              className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-400"
            />
          </div>

          {/* Email */}
          <div className="border border-gray-200 rounded-2xl p-2.5 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <label
              htmlFor="register-email"
              className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5"
            >
              Email address
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              required
              className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-400"
            />
          </div>

          {/* Mobile Number */}
          <div className="border border-gray-200 rounded-2xl p-2.5 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <label
              htmlFor="register-mobile"
              className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5"
            >
              Mobile Number
            </label>
            <input
              id="register-mobile"
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={(e) => {
                const numbersOnly = e.target.value.replace(/\D/g, "");
                setForm((prev) => ({ ...prev, mobile: numbersOnly }));
              }}
              placeholder="10-digit mobile number"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              disabled={loading}
              required
              className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="border border-gray-200 rounded-2xl p-2.5 flex items-center justify-between focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <div className="flex-1">
              <label
                htmlFor="register-password"
                className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5"
              >
                Password
              </label>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
                disabled={loading}
                required
                className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-gray-400 hover:text-gray-600 p-1 focus:outline-none"
              aria-label="Toggle password"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="border border-gray-200 rounded-2xl p-2.5 flex items-center justify-between focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <div className="flex-1">
              <label
                htmlFor="register-confirm-password"
                className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5"
              >
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
                disabled={loading}
                required
                className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-gray-400 hover:text-gray-600 p-1 focus:outline-none"
              aria-label="Toggle confirm password"
            >
              {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>

          {/* Referral Code (Optional) */}
          <div className="border border-green-200 bg-green-50/50 rounded-2xl p-2.5 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <div className="flex items-center justify-between mb-0.5">
              <label
                htmlFor="register-referral"
                className="block text-[10px] font-bold text-green-700 uppercase tracking-wider"
              >
                Referral Code (Optional)
              </label>
              <span className="text-[10px] font-extrabold text-rose-500">
                +₹50 for friend!
              </span>
            </div>
            <input
              id="register-referral"
              type="text"
              name="referralCode"
              value={form.referralCode}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  referralCode: e.target.value.toUpperCase(),
                }))
              }
              placeholder="e.g. VIPF2026"
              disabled={loading}
              className="w-full text-sm font-bold uppercase tracking-wider text-green-950 bg-transparent outline-none placeholder-green-300"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white py-3.5 px-4 rounded-2xl font-extrabold text-base shadow-sm hover:shadow active:scale-[0.99] transition-all disabled:opacity-70 mt-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider: SIGN UP WITH */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <span className="relative bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            OR SIGN UP WITH
          </span>
        </div>

        {/* Social Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={socialBusy}
            onClick={() => handleSocialClick("google")}
            className="w-full border-2 border-gray-900 rounded-2xl py-2.5 px-4 flex items-center justify-center gap-2.5 font-bold text-sm text-gray-900 hover:bg-gray-50 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <FcGoogle size={18} />
            <span>{socialBusy ? "Opening Google sign-in…" : "Continue with Google"}</span>
          </button>

          <button
            type="button"
            disabled={socialBusy}
            onClick={() => handleSocialClick("facebook")}
            className="w-full border-2 border-gray-900 rounded-2xl py-2.5 px-4 flex items-center justify-center gap-2.5 font-bold text-sm text-gray-900 hover:bg-gray-50 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <FaFacebook className="text-[#1877f2]" size={18} />
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
