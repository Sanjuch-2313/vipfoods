import { useState } from "react";
import { FiHeadphones, FiMail, FiPhone } from "react-icons/fi";

export default function SupportPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">Help</p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">Support</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-3 text-gray-900">
                <div className="rounded-2xl bg-purple-50 p-2 text-purple-700">
                  <FiHeadphones size={18} />
                </div>
                <span className="text-lg font-bold">Need help?</span>
              </div>
              <p className="text-sm text-gray-600">Our support team can help with orders, returns, delivery, and account issues.</p>
            </div>

            <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
              <div className="space-y-3 text-sm text-gray-700">
                <p className="flex items-center gap-3"><FiPhone size={16} className="text-purple-600" /> +91 98765 43210</p>
                <p className="flex items-center gap-3"><FiMail size={16} className="text-purple-600" /> support@vipfood.in</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Your email" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white" />
              <textarea name="message" value={form.message} onChange={handleChange} rows="6" placeholder="Tell us how we can help" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white" />

              {submitted && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  Your support message has been sent.
                </div>
              )}

              <button type="submit" className="w-full rounded-full bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700">
                Send request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
