import { useEffect, useState } from "react";
import { FiCopy, FiPercent, FiRefreshCw, FiTag } from "react-icons/fi";
import api from "../services/api";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/coupons");
      setCoupons(data.coupons || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load active coupons right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 1800);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">Savings</p>
            <h1 className="mt-2 text-2xl font-extrabold text-gray-900">Coupons</h1>
          </div>

          <button
            type="button"
            onClick={fetchCoupons}
            className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-green-700 shadow-sm transition hover:bg-green-50"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
                <div className="mb-4 h-4 w-20 rounded bg-gray-200" />
                <div className="mb-3 h-8 w-28 rounded bg-gray-200" />
                <div className="mb-2 h-3 w-40 rounded bg-gray-200" />
                <div className="h-3 w-32 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[24px] border border-red-200 bg-red-50 p-5 text-center text-sm font-medium text-red-700">
            {error}
          </div>
        ) : coupons.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            No coupons are available right now. Please check back later.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {coupons.map((coupon) => (
              <div
                key={coupon._id || coupon.code}
                className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-dashed border-gray-200 bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-3 text-white">
                  <div className="flex items-center gap-2">
                    <FiTag size={16} />
                    <span className="text-xs font-bold uppercase tracking-[0.18em]">VIP Offer</span>
                  </div>
                  <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]">
                    Active
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Code</p>
                      <h3 className="mt-2 text-2xl font-black text-gray-900">{coupon.code}</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(coupon.code)}
                      className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-green-700 transition hover:bg-green-100"
                    >
                      <FiCopy size={14} />
                      {copiedCode === coupon.code ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="rounded-2xl bg-green-50 p-3 text-green-800">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <FiPercent size={16} />
                      {coupon.discount}% OFF
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center justify-between">
                      <span>Minimum order</span>
                      <span className="font-semibold text-gray-800">₹{coupon.minOrder || 0}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Expiry</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(coupon.expiry).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Usage limit</span>
                      <span className="font-semibold text-gray-800">{coupon.usageLimit || 1}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
