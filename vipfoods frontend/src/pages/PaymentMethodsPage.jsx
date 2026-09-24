import { useEffect, useState } from "react";
import { FiCreditCard, FiPlus, FiTrash2 } from "react-icons/fi";

const STORAGE_KEY = "vipfoods_payment_methods";

const defaultCards = [
  { id: 1, label: "Visa ending 2456", number: "•••• 2456", expiry: "09/29" },
  { id: 2, label: "MasterCard ending 9912", number: "•••• 9912", expiry: "12/27" },
];

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState(defaultCards);
  const [form, setForm] = useState({ label: "", number: "", expiry: "" });

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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.label || !form.number || !form.expiry) return;

    setCards((prev) => [
      {
        id: Date.now(),
        label: form.label,
        number: `•••• ${String(form.number).slice(-4)}`,
        expiry: form.expiry,
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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">Payments</p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">Payment methods</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {cards.map((card) => (
              <div key={card.id} className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-gray-900">
                    <div className="rounded-2xl bg-purple-50 p-2 text-purple-700">
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
              <input name="label" value={form.label} onChange={handleChange} placeholder="Card name" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white" />
              <input name="number" type="text" value={form.number} onChange={handleChange} placeholder="Card number" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white" />
              <input name="expiry" type="text" value={form.expiry} onChange={handleChange} placeholder="MM/YY" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white" />
            </div>

            <button type="submit" className="mt-4 w-full rounded-full bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700">
              Save card
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
