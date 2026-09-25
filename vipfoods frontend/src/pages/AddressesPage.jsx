import { useEffect, useState } from "react";
import { FiMapPin, FiPlus, FiTrash2 } from "react-icons/fi";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "vipfoods_user_addresses";

const defaultAddresses = [
  {
    id: 1,
    name: "Home",
    line1: "12 Green Park Lane",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    phone: "+91 98765 43210",
  },
];

export default function AddressesPage() {
  const { user, isLoggedIn, updateUserProfile } = useAuth();
  const [addresses, setAddresses] = useState(defaultAddresses);
  const [form, setForm] = useState({
    name: "Home",
    line1: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    if (isLoggedIn && Array.isArray(user?.savedAddresses)) {
      setAddresses(user.savedAddresses);
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAddresses(JSON.parse(saved));
      } catch (error) {
        console.error("Address parse failed", error);
      }
    }
  }, [isLoggedIn, user?.savedAddresses]);

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
      return;
    }

    const timer = setTimeout(() => {
      api
        .put("/auth/profile", { savedAddresses: addresses })
        .then(({ data }) => {
          if (data?.user) {
            updateUserProfile(data.user);
          }
        })
        .catch((error) => {
          console.error("Address sync failed", error);
        });
    }, 150);

    return () => clearTimeout(timer);
  }, [addresses, isLoggedIn, updateUserProfile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const emptyFields = Object.values(form).some((value) => !String(value).trim());

    if (emptyFields) return;

    setAddresses((prev) => [
      {
        id: Date.now(),
        ...form,
      },
      ...prev,
    ]);

    setForm({
      name: "Home",
      line1: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
    });
  };

  const handleDelete = (id) => {
    setAddresses((prev) => prev.filter((address) => address.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">Account</p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">Addresses</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-gray-900">
                    <FiMapPin size={16} />
                    <span className="text-base font-bold">{address.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(address.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <FiTrash2 size={12} />
                    Delete
                  </button>
                </div>

                <p className="text-sm text-gray-700">{address.line1}</p>
                <p className="text-sm text-gray-700">{address.city}, {address.state} - {address.pincode}</p>
                <p className="mt-2 text-sm text-gray-700">{address.phone}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-gray-900">
              <FiPlus size={18} />
              <h3 className="text-lg font-bold">Add address</h3>
            </div>

            <div className="space-y-3">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Label (Home / Office)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white" />
              <input name="line1" value={form.line1} onChange={handleChange} placeholder="Street address" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white" />
                <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white" />
              </div>
            </div>

            <button type="submit" className="mt-4 w-full rounded-full bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700">
              Save address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
