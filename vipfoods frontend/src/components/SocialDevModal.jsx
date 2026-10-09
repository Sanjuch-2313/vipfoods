import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FiX, FiUser, FiMail, FiCheck, FiInfo } from "react-icons/fi";

export default function SocialDevModal({
  isOpen,
  onClose,
  provider = "google",
  onConfirm,
  busy = false,
  error = "",
}) {
  const isGoogle = provider === "google";
  const defaultEmail = isGoogle ? "google.user@vipfood.in" : "facebook.user@vipfood.in";
  const defaultName = isGoogle ? "Google Test User" : "Facebook Test User";

  const [useCustom, setUseCustom] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (useCustom) {
      const email = customEmail.trim() || defaultEmail;
      const name = customName.trim() || defaultName;
      onConfirm({ email, name });
    } else {
      onConfirm({ email: defaultEmail, name: defaultName });
    }
  };

  const handleSelectDefault = () => {
    setUseCustom(false);
    onConfirm({ email: defaultEmail, name: defaultName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 flex flex-col transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dev-modal-title"
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center shadow-sm">
              {isGoogle ? <FcGoogle size={28} /> : <FaFacebook className="text-[#1877f2]" size={28} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="dev-modal-title" className="text-lg font-bold text-gray-900">
                  {isGoogle ? "Sign in with Google" : "Sign in with Facebook"}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Dev Mode
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Instant test sign-in (no Google/Meta setup needed)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* Preset Test Account Card */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Choose a test account:
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={handleSelectDefault}
              className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                !useCustom
                  ? "border-green-600 bg-green-50/50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-gray-50/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                    isGoogle ? "bg-red-500" : "bg-[#1877f2]"
                  }`}
                >
                  {defaultName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{defaultName}</div>
                  <div className="text-xs text-gray-500 font-mono">{defaultEmail}</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                {!useCustom && <FiCheck className="stroke-[3]" />} Click to use
              </span>
            </button>
          </div>

          {/* Toggle Custom Account */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setUseCustom(!useCustom)}
              className="text-xs font-medium text-gray-600 hover:text-green-700 flex items-center gap-1 underline transition-colors"
            >
              {useCustom ? "← Use default test account" : "+ Or enter custom name / email"}
            </button>
          </div>

          {useCustom && (
            <form onSubmit={handleSubmit} className="space-y-3 pt-1 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={defaultName}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder={defaultEmail}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full mt-2 bg-green-700 hover:bg-green-800 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {busy ? "Signing in..." : `Continue as ${customName || "Custom User"}`}
              </button>
            </form>
          )}

          {/* Info note */}
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-[11px] text-gray-600 flex items-start gap-2">
            <FiInfo className="text-gray-400 mt-0.5 shrink-0" size={14} />
            <div>
              <span className="font-semibold text-gray-700">Production note:</span> To enable real {isGoogle ? "Google" : "Facebook"} OAuth accounts, set <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-[10px]">{isGoogle ? "GOOGLE_CLIENT_ID" : "FACEBOOK_CLIENT_ID"}</code> in <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-[10px]">vipfoods backend/.env</code>.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          {!useCustom && (
            <button
              type="button"
              disabled={busy}
              onClick={handleSelectDefault}
              className="px-5 py-2.5 text-xs font-bold text-white bg-green-700 hover:bg-green-800 rounded-xl shadow transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {busy ? "Signing in..." : "Continue with Test Account"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
