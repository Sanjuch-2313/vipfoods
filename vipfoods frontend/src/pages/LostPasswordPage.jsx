import { useState } from "react";
import { Link } from "react-router-dom";

export default function LostPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-md rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Account</p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">Reset your password</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Enter the email address connected to your VIP Foods account and we will help you get back in.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white"
            required
          />

          <button
            type="submit"
            className="w-full rounded-full bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            Send reset instructions
          </button>
        </form>

        {submitted && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            A reset link has been prepared for {email || "your email"}. Please check your inbox or contact support.
          </div>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Back to <Link to="/login" className="font-bold text-green-600">Login</Link>
        </p>
      </div>
    </div>
  );
}
