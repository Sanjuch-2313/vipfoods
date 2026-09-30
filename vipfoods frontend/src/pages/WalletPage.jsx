import { useCallback, useEffect, useState } from "react";
import {
  FiCreditCard,
  FiTrendingUp,
  FiArrowLeft,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { loadRazorpayScript } from "../services/razorpay";


const PENDING_TOPUP_KEY = "wallet_pending_topup";

export default function WalletPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletError, setWalletError] = useState("");

  // Add Money state
  const [amount, setAmount] = useState("100");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupMessage, setTopupMessage] = useState(null);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      setWalletError("");
      const { data } = await api.get("/auth/me");
      if (data.success && data.user) {
        setBalance(data.user.walletBalance || 0);
        setTransactions(data.user.walletTransactions || []);
      } else {
        throw new Error("Wallet balance is unavailable.");
      }
    } catch (err) {
      console.error("Failed to load wallet", err);
      setWalletError("Could not refresh your balance. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWallet();
      window.addEventListener("focus", fetchWallet);
      return () => window.removeEventListener("focus", fetchWallet);
    } else {
      setBalance(0);
      setTransactions([]);
      setLoading(false);
    }
  }, [isLoggedIn, user?.id, user?._id, fetchWallet]);

  const confirmTopup = async (pending) => {
    if (String(pending.userId) !== String(user?.id || user?._id)) {
      throw new Error("Sign in to the account that made this wallet payment to finish verification.");
    }
    const { data } = await api.post("/auth/wallet/verify", pending.payment);
    if (!data.success) throw new Error(data.message || "Payment verification failed");
    sessionStorage.removeItem(PENDING_TOPUP_KEY);
    setBalance(data.walletBalance);
    setTopupMessage({ type: "success", text: data.message });
    await fetchWallet();
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (topupLoading) return;
    const pending = sessionStorage.getItem(PENDING_TOPUP_KEY);
    if (pending) {
      setTopupLoading(true);
      try {
        await confirmTopup(JSON.parse(pending));
      } catch (error) {
        setTopupMessage({ type: "error", text: `${error.response?.data?.message || error.message}. Retry to verify the previous payment without paying again.` });
      } finally {
        setTopupLoading(false);
      }
      return;
    }
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount < 1) {
      alert("Please enter a valid amount (minimum ₹1)");
      return;
    }

    try {
      setTopupLoading(true);
      setTopupMessage(null);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        alert("Failed to load payment gateway. Please check your internet connection.");
        setTopupLoading(false);
        return;
      }

      // Step 1: Create Razorpay order on backend
      const { data } = await api.post("/auth/wallet/create-order", {
        amount: numAmount,
      });

      if (!data.success || !data.order) {
        throw new Error(data.message || "Failed to create order");
      }

      const razorpayKey = data.key;
      if (!razorpayKey) throw new Error("Payment gateway key is unavailable.");

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: razorpayKey,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "VIP Foods",
        description: `Add ₹${numAmount} to VIP Foods Wallet`,
        order_id: data.order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.mobile || "",
        },
        theme: {
          color: "#7c3aed",
        },
        handler: async (response) => {
          try {
            const pending = {
              userId: user?.id || user?._id,
              payment: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            };
            sessionStorage.setItem(PENDING_TOPUP_KEY, JSON.stringify(pending));
            await confirmTopup(pending);
          } catch (verifyErr) {
            console.error("Verification error", verifyErr);
            setTopupMessage({
              type: "error",
              text: "Payment verification is pending. Retry to verify this payment without paying again.",
            });
          } finally {
            setTopupLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setTopupLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", (response) => {
        setTopupMessage({ type: "error", text: response.error?.description || "Payment failed. Please try again." });
        setTopupLoading(false);
      });
      paymentObject.open();
    } catch (err) {
      console.error("Wallet topup error", err);
      alert(err.response?.data?.message || err.message || "Failed to initiate payment");
      setTopupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 via-emerald-500 to-lime-500 pt-6 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <FiArrowLeft size={18} />
          </button>
          <h1 className="text-white text-xl font-bold">VIP Foods Wallet</h1>
          <p className="text-green-200 text-sm mt-0.5">
            Use wallet balance for instant online payments
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-14">
        {/* Balance Card */}
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-md mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Available Balance
              </p>
              <h2 className="text-4xl font-black text-gray-900">
                {loading ? "…" : walletError ? "Unavailable" : `₹${balance.toFixed(2)}`}
              </h2>
              {walletError && (
                <p role="alert" className="mt-2 text-xs text-red-600">
                  {walletError} <button type="button" onClick={fetchWallet} className="font-bold underline">Retry</button>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1.5 font-medium">
                {balance > 0
                  ? "Usable for online payments at checkout"
                  : "Add funds via Razorpay or earn via referrals"}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-md text-white">
              <FiCreditCard size={26} />
            </div>
          </div>
        </div>

        {/* Top-up Status Banner */}
        {topupMessage && (
          <div
            className={`mb-5 p-4 rounded-2xl flex items-center gap-3 border ${
              topupMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {topupMessage.type === "success" ? (
              <FiCheckCircle size={20} className="shrink-0" />
            ) : (
              <FiAlertCircle size={20} className="shrink-0" />
            )}
            <p className="text-xs font-bold">{topupMessage.text}</p>
          </div>
        )}

        {/* Add Money Form (Razorpay integration) */}
        <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-xs mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <FiPlus size={18} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900">
              Add Money to Wallet
            </h3>
          </div>

          <form onSubmit={handleAddMoney}>
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              Select or Enter Amount (₹)
            </label>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {["50", "100", "200", "500"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    amount === val
                      ? "border-green-600 bg-green-50 text-green-700 shadow-xs"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            <div className="relative mb-4">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 font-extrabold text-gray-900 text-base outline-none focus:border-green-600 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={topupLoading}
              className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-green-200 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
            >
              <FiCreditCard size={18} />
              {topupLoading ? "Processing payment..." : sessionStorage.getItem(PENDING_TOPUP_KEY) ? "Retry payment verification" : `Pay ₹${amount || 0} via Razorpay`}
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <FiTrendingUp size={16} className="text-gray-500" />
            <h3 className="text-sm font-bold text-gray-900">
              Transaction History
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <FiCreditCard size={24} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-500">
                No transactions yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Top-ups, referral bonuses and order payments will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions
                .slice()
                .reverse()
                .map((tx, idx) => (
                  <div
                    key={tx._id || idx}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {tx.description || (tx.type === "credit" ? "Credit" : "Debit")}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-black ${
                        tx.type === "credit"
                          ? "text-emerald-600"
                          : "text-gray-900"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}₹{(tx.amount || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
