import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogIn, FiUserPlus, FiX, FiGift, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const GUEST_WARNED_KEY = "vipfoods_guest_warned";

export default function GuestWarningModal() {
  const { isLoggedIn, authLoading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    // Check if user is not logged in and hasn't seen the warning yet
    const alreadyWarned = sessionStorage.getItem(GUEST_WARNED_KEY);
    if (!isLoggedIn && !alreadyWarned) {
      // Small timeout to allow home page / brand intro to stabilize
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, authLoading]);

  const handleDismiss = () => {
    sessionStorage.setItem(GUEST_WARNED_KEY, "true");
    setIsOpen(false);
  };

  const handleNavigate = (path) => {
    sessionStorage.setItem(GUEST_WARNED_KEY, "true");
    setIsOpen(false);
    navigate(path);
  };

  if (!isOpen || isLoggedIn) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-green-100 overflow-hidden text-center animate-in zoom-in-95 duration-200">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-green-600 via-pink-500 to-rose-500" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <FiX size={18} />
        </button>

        {/* Icon & Welcome */}
        <div className="w-16 h-16 mx-auto mb-4 mt-2 rounded-2xl bg-gradient-to-tr from-green-100 to-pink-100 flex items-center justify-center text-green-600 shadow-inner">
          <FiGift size={32} className="animate-bounce" />
        </div>

        <h3 className="text-xl font-black text-gray-900 leading-tight">
          Welcome to VIP Foods! 🛒
        </h3>
        <p className="text-sm text-gray-500 mt-2 mb-4 leading-relaxed">
          Sign in or create an account to unlock exclusive deals, earn ₹25 on every referral, and enjoy fast checkout!
        </p>

        {/* Highlight Banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-5 flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0">
            <FiShield size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-green-900">
              Refer & Earn ₹25
            </p>
            <p className="text-[11px] text-green-700">
              Invite friends with your referral code and both of you get ₹25 in your wallet.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => handleNavigate("/login")}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-green-200 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <FiLogIn size={18} />
            Login to Your Account
          </button>

          <button
            onClick={() => handleNavigate("/register")}
            className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm rounded-2xl border border-rose-200 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <FiUserPlus size={18} />
            Create New Account
          </button>

          <button
            onClick={handleDismiss}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600 py-2 transition-colors"
          >
            Continue as Guest for now
          </button>
        </div>
      </div>
    </div>
  );
}
