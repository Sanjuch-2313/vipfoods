import { useEffect, useState } from "react";
import { FiCreditCard, FiPlus, FiTrash2 } from "react-icons/fi";

const STORAGE_KEY = "vipfoods_payment_methods";

const defaultCards = [
  { id: 1, label: "Visa ending 2456", number: "•••• 2456", expiry: "09/29" },
  { id: 2, label: "MasterCard ending 9912", number: "•••• 9912", expiry: "12/27" },
];

const sanitizeCardNumber = (value) => value.replace(/\D/g, "").slice(0, 16);

const formatCardNumber = (value) => {
  const digits = sanitizeCardNumber(value);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const luhnCheck = (digits) => {
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

const isValidExpiry = (expiry) => {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;

  const [monthPart, yearPart] = expiry.split("/");
  const month = Number(monthPart);
  const year = Number(`20${yearPart}`);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const expiryDate = new Date(year, month, 0, 23, 59, 59, 999);
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return expiryDate >= currentDate;
};

const isEligibleCard = ({ label, number, expiry }) => {
  const safeLabel = label.trim();
  const digits = sanitizeCardNumber(number);

  if (!safeLabel || digits.length < 12 || digits.length > 16) return false;
  if (!luhnCheck(digits)) return false;
  if (!isValidExpiry(expiry)) return false;

  return true;
};

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState(defaultCards);
  const [form, setForm] = useState({ label: "", number: "", expiry: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCards(JSON.parse(saved));
      } catch (error) {
        console.error("Payment methods parse failed", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "number") {
      setForm((prev) => ({ ...prev, number: formatCardNumber(value) }));
      return;
    }

    if (name === "expiry") {
      setForm((prev) => ({ ...prev, expiry: formatExpiry(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextForm = {
      label: form.label.trim(),
      number: form.number,
      expiry: form.expiry,
    };

    if (!isEligibleCard(nextForm)) {
      setError("Only valid, unexpired card details can be saved.");
      return;
    }

    setError("");

    setCards((prev) => [
      {
        id: Date.now(),
        label: nextForm.label,
        number: `•••• ${sanitizeCardNumber(nextForm.number).slice(-4)}`,
        expiry: nextForm.expiry,
      },
      ...prev,
    ]);

    setForm({ label: "", number: "", expiry: "" });
  };

  const handleDelete = (id) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">Payments</p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">Payment methods</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {cards.map((card) => (
              <div key={card.id} className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-gray-900">
                    <div className="rounded-2xl bg-green-50 p-2 text-green-700">
                      <FiCreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-base font-bold">{card.label}</p>
                      <p className="text-sm text-gray-500">{card.number} • {card.expiry}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(card.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <FiTrash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-gray-900">
              <FiPlus size={18} />
              <h3 className="text-lg font-bold">Add new card</h3>
            </div>

            <div className="space-y-3">
              <input name="label" value={form.label} onChange={handleChange} placeholder="Card name" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white" />
              <input name="number" type="text" value={form.number} onChange={handleChange} placeholder="Card number" inputMode="numeric" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white" />
              <input name="expiry" type="text" value={form.expiry} onChange={handleChange} placeholder="MM/YY" inputMode="numeric" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white" />
            </div>

            {error && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {error}
              </p>
            )}

            <button type="submit" className="mt-4 w-full rounded-full bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700">
              Save card
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
