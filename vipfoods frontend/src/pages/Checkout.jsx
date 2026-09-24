import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiShield,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiCreditCard,
  FiDollarSign,
  FiCheck,
  FiPercent,
  FiArrowLeft,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
} from "../services/orderService";
import api from "../services/api";

const CHECKOUT_STORAGE_KEY = "checkout_form_state";
const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function getCodCharge(paymentMethod, state) {
  if (paymentMethod !== "COD") return 0;
  if (!state || !state.trim()) return 75; // Default COD advance if state not yet specified
  const norm = state.trim().toLowerCase();
  return norm === "andhra pradesh" || norm === "ap" ? 50 : 75;
}

function loadStoredCheckoutState() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to read saved checkout details", err);
    return null;
  }
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Coupon Ticket Icon matching Image 1
function CouponIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
      <line x1="9" y1="9" x2="15" y2="9" strokeDasharray="2 2" />
      <line x1="9" y1="15" x2="15" y2="15" strokeDasharray="2 2" />
    </svg>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  const storedState = loadStoredCheckoutState();

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: user?.email || "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    ...storedState?.customer,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [editingAddress, setEditingAddress] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [changingPayment, setChangingPayment] = useState(false);

  // Location autofill
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponStatus, setCouponStatus] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState(storedState?.paymentMethod || "COD");

  // Wallet
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

  // Order placement
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Fetch wallet balance if logged in
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (data.success && data.user) {
          setWalletBalance(data.user.walletBalance || 0);
        }
      } catch (err) {
        console.error("Wallet fetch error on checkout", err);
      }
    };
    fetchWallet();
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.offerPrice || item.price || 0) * item.quantity,
    0
  );
  const codCharge = getCodCharge(paymentMethod, customer.state);
  // Delivery fee completely removed in checkout page
  const deliveryFee = 0;

  const totalBeforeWallet = Math.max(0, subtotal - discount + codCharge);
  // Wallet deduction ONLY works for ONLINE payment as per user requirement: "for cod wallet option doesnt works"
  const walletDeduction =
    paymentMethod === "ONLINE" && useWallet
      ? Math.min(walletBalance, totalBeforeWallet)
      : 0;
  const grandTotal = Math.max(0, totalBeforeWallet - walletDeduction);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        CHECKOUT_STORAGE_KEY,
        JSON.stringify({ customer, paymentMethod })
      );
    } catch (err) {
      console.error("Failed to save checkout details", err);
    }
  }, [customer, paymentMethod]);

  const updateCustomer = (field, value) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Coupon validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || couponLoading || coupon) return;

    try {
      setCouponLoading(true);
      setCouponMessage("");
      setCouponStatus(null);

      const { data } = await api.post("/coupons/validate", {
        code: couponCode.trim(),
        subtotal,
        category: "all",
      });

      setCoupon(data.coupon);
      setDiscount(data.discountAmount);
      setCouponStatus("success");
      setCouponMessage("Coupon Applied Successfully");
    } catch (err) {
      setCoupon(null);
      setDiscount(0);
      setCouponStatus("error");
      setCouponMessage(err.response?.data?.message || "Invalid Coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setDiscount(0);
    setCouponCode("");
    setCouponMessage("");
    setCouponStatus(null);
  };

  // Current location detector
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location is not supported on this device.");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) throw new Error("Unable to fetch address");
          const data = await response.json();
          const addr = data.address || {};

          const road = [addr.road, addr.suburb].filter(Boolean).join(", ");
          const city = addr.city || addr.town || addr.village || addr.county || "";
          const stateName = addr.state || "";
          const pincode = addr.postcode || "";
          const country = addr.country || "India";

          setCustomer((prev) => ({
            ...prev,
            address1: road || prev.address1 || "My Location",
            city: city || prev.city,
            state: stateName || prev.state,
            pincode: pincode || prev.pincode,
            country: country || prev.country,
          }));

          setFieldErrors({});
          setEditingAddress(false);
        } catch (err) {
          console.error(err);
          setLocationError("Could not detect address. Please enter manually.");
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setLocationError("Location access denied. Please enter address manually.");
        setLocationLoading(false);
      }
    );
  };

  const validate = () => {
    const errors = {};
    if (!customer.name.trim()) errors.name = "Name is required";
    if (!customer.phone.trim()) errors.phone = "Phone number is required";
    if (!customer.address1.trim()) errors.address1 = "Address is required";
    if (!customer.city.trim()) errors.city = "City is required";
    if (!customer.state.trim()) errors.state = "State is required";
    if (!customer.pincode.trim()) errors.pincode = "Pincode is required";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setEditingAddress(true);
      return false;
    }
    return true;
  };

  const buildOrderPayload = () => {
    const items = cartItems.map((item) => ({
      product: item._id || item.id,
      productName: item.name,
      image: item.image,
      variant: {
        weight: item.weight,
        sku: item.sku || "",
        price: item.offerPrice || item.price,
      },
      quantity: item.quantity,
      total: (item.offerPrice || item.price) * item.quantity,
    }));

    const shippingAddress = {
      fullName: customer.name,
      phone: customer.phone,
      addressLine1: customer.address1,
      addressLine2: customer.address2,
      city: customer.city,
      state: customer.state,
      postalCode: customer.pincode,
      country: customer.country,
    };

    return {
      customer: user?.id || user?._id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount,
      codCharge,
      grandTotal,
      coupon: coupon?._id || null,
    };
  };

  const finalizeOrderSuccess = (order) => {
    clearCart();
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
    navigate(`/order-success/${order.orderNumber}`, {
      state: { order },
    });
  };

  const placeCodOrder = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setOrderError("Unable to load payment gateway.");
      return;
    }

    if (codCharge > 0) {
      const { order: razorpayOrder } = await createRazorpayOrder(codCharge);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: "VIP Foods",
        description: "COD Delivery Charge",
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        theme: { color: "#f43f5e" },
        handler: async (response) => {
          try {
            const verification = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verification.success) {
              setOrderError("Payment verification failed.");
              return;
            }

            const orderPayload = {
              ...buildOrderPayload(),
              codChargePaid: true,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };

            const res = await createOrder(orderPayload);
            finalizeOrderSuccess(res.order);
          } catch (err) {
            console.error(err);
            setOrderError(err.message);
          } finally {
            setPlacing(false);
          }
        },
      };
      new window.Razorpay(options).open();
    } else {
      const orderPayload = buildOrderPayload();
      const res = await createOrder(orderPayload);
      finalizeOrderSuccess(res.order);
      setPlacing(false);
    }
  };

  const placeOnlineOrder = async () => {
    // If order is completely covered by wallet balance (grandTotal === 0)
    if (grandTotal === 0 && walletDeduction > 0) {
      try {
        await api.post("/auth/wallet/use", {
          amount: walletDeduction,
          description: "Full wallet payment for order",
        });
        const orderPayload = {
          ...buildOrderPayload(),
          paymentStatus: "Paid",
          paymentMethod: "WALLET",
          walletAmountUsed: walletDeduction,
        };
        const res = await createOrder(orderPayload);
        finalizeOrderSuccess(res.order);
      } catch (err) {
        console.error(err);
        setOrderError(err.response?.data?.message || err.message || "Failed to process wallet payment");
      } finally {
        setPlacing(false);
      }
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setOrderError("Unable to load payment gateway. Please try again.");
      return;
    }

    const { order: razorpayOrder } = await createRazorpayOrder(grandTotal);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: razorpayOrder.id,
      name: "VIP Foods",
      description: "Order Payment",
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      theme: { color: "#f43f5e" },
      handler: async (response) => {
        try {
          const verification = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (!verification?.success) {
            setOrderError("Payment verification failed. Please try again.");
            setPlacing(false);
            return;
          }

          // Deduct partial wallet amount if used
          if (walletDeduction > 0) {
            try {
              await api.post("/auth/wallet/use", {
                amount: walletDeduction,
                description: `Partial wallet payment with order`,
              });
            } catch (wErr) {
              console.error("Wallet deduction failed after payment", wErr);
            }
          }

          const orderPayload = {
            ...buildOrderPayload(),
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            walletAmountUsed: walletDeduction,
          };

          const res = await createOrder(orderPayload);
          finalizeOrderSuccess(res.order);
        } catch (err) {
          console.error(err);
          setOrderError(err.message || "Payment verification failed");
        } finally {
          setPlacing(false);
        }
      },
      modal: {
        ondismiss: () => {
          setOrderError("Payment was cancelled.");
          setPlacing(false);
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.on("payment.failed", (response) => {
      console.error("Razorpay payment failed:", response.error);
      setOrderError(response.error?.description || "Payment failed. Please try again.");
      setPlacing(false);
    });
    razorpayInstance.open();
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    if (!validate()) return;

    try {
      setPlacing(true);
      setOrderError("");

      if (paymentMethod === "COD") {
        await placeCodOrder();
      } else {
        await placeOnlineOrder();
      }
    } catch (err) {
      console.error(err);
      setOrderError(err.message || "Failed to place order");
      setPlacing(false);
    }
  };

  const formattedAddress = customer.address1
    ? `${customer.address1}${customer.city ? `, ${customer.city}` : ""}${customer.state ? `, ${customer.state}` : ""}`
    : "123 Main Street, New York";

  return (
    <div className="bg-gray-50 min-h-screen pb-32 font-sans">
      <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* ============================================================ */}
          {/* LEFT COLUMN: 3-Step Review Card (Matching Image 1) */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
              {/* ------------------------------------------------------------ */}
              {/* STEP 1: Delivery Details */}
              {/* ------------------------------------------------------------ */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                      Delivery Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingAddress((prev) => !prev)}
                    className="text-xs sm:text-sm font-bold text-[#f43f5e] hover:text-[#e11d48] transition-colors"
                  >
                    {editingAddress ? "Done" : "Change"}
                  </button>
                </div>

                {/* Summary View */}
                {!editingAddress ? (
                  <div className="flex items-start gap-3 pl-9">
                    <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 shrink-0 mt-0.5">
                      <FiHome size={17} />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-gray-900 leading-snug">
                        Home: {formattedAddress}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Time: Today, 4:00 PM - 6:00 PM
                      </p>
                      {customer.name && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Recipient: {customer.name} ({customer.phone})
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Editable Address Form */
                  <div className="pl-0 sm:pl-9 pt-2 space-y-3">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locationLoading}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-colors"
                    >
                      <FiMapPin size={14} />
                      {locationLoading ? "Detecting location..." : "Use Current Location"}
                    </button>
                    {locationError && (
                      <p className="text-xs text-red-500">{locationError}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={customer.name}
                          onChange={(e) => updateCustomer("name", e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-200 outline-none focus:border-purple-500"
                        />
                        {fieldErrors.name && (
                          <span className="text-[10px] text-red-500">{fieldErrors.name}</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone Number *"
                          value={customer.phone}
                          onChange={(e) => updateCustomer("phone", e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-200 outline-none focus:border-purple-500"
                        />
                        {fieldErrors.phone && (
                          <span className="text-[10px] text-red-500">{fieldErrors.phone}</span>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Address Line 1 (Street, Building) *"
                      value={customer.address1}
                      onChange={(e) => updateCustomer("address1", e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-200 outline-none focus:border-purple-500"
                    />
                    {fieldErrors.address1 && (
                      <span className="text-[10px] text-red-500">{fieldErrors.address1}</span>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="City *"
                        value={customer.city}
                        onChange={(e) => updateCustomer("city", e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-200 outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={customer.state}
                        onChange={(e) => updateCustomer("state", e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-200 outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="Pincode *"
                        value={customer.pincode}
                        onChange={(e) => updateCustomer("pincode", e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-200 outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* STEP 2: Items in Cart */}
              {/* ------------------------------------------------------------ */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                      Items in Cart ({totalItemsCount})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowItems((prev) => !prev)}
                    className="text-xs sm:text-sm font-bold text-[#f43f5e] hover:text-[#e11d48] transition-colors"
                  >
                    {showItems ? "Hide Items" : "Show/Hide Items"}
                  </button>
                </div>

                {/* Expandable Cart Items */}
                {showItems && (
                  <div className="mt-4 pl-0 sm:pl-9 space-y-2.5 pt-2 border-t border-gray-50">
                    {cartItems.map((item) => (
                      <div
                        key={`${item._id || item.id}-${item.weight}`}
                        className="flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover bg-gray-50 shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <div className="truncate">
                            <p className="font-bold text-gray-900 truncate">{item.name}</p>
                            <p className="text-gray-400 text-[11px]">
                              {item.weight} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-extrabold text-gray-900 shrink-0">
                          ₹{(item.offerPrice || item.price || 0) * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* STEP 3: Payment Method */}
              {/* ------------------------------------------------------------ */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                      Payment Method
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChangingPayment((prev) => !prev)}
                    className="text-xs sm:text-sm font-bold text-[#f43f5e] hover:text-[#e11d48] transition-colors"
                  >
                    {changingPayment ? "Done" : "Change"}
                  </button>
                </div>

                {!changingPayment ? (
                  <div className="flex items-start gap-3 pl-9">
                    <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 shrink-0 mt-0.5">
                      {paymentMethod === "COD" ? <FiDollarSign size={17} /> : <FiCreditCard size={17} />}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-gray-900 leading-snug">
                        {paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {paymentMethod === "COD"
                          ? "Pay in cash at the time of delivery"
                          : "Pay securely via UPI / Cards / Netbanking"}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Payment Options Selector */
                  <div className="pl-0 sm:pl-9 space-y-2 pt-1">
                    <label
                      onClick={() => setPaymentMethod("COD")}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "COD"
                          ? "border-purple-600 bg-purple-50/50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FiDollarSign size={18} className="text-purple-600" />
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-gray-900">Cash on Delivery</p>
                          <p className="text-[11px] text-gray-500">Pay cash when package arrives</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="accent-purple-600"
                      />
                    </label>

                    <label
                      onClick={() => setPaymentMethod("ONLINE")}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "ONLINE"
                          ? "border-purple-600 bg-purple-50/50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FiCreditCard size={18} className="text-purple-600" />
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-gray-900">Online Payment</p>
                          <p className="text-[11px] text-gray-500">UPI, Credit/Debit Cards, Netbanking</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="ONLINE"
                        checked={paymentMethod === "ONLINE"}
                        onChange={() => setPaymentMethod("ONLINE")}
                        className="accent-purple-600"
                      />
                    </label>

                    {/* Wallet Option for Online Payment */}
                    {paymentMethod === "ONLINE" && (
                      <div className="mt-2 p-3 rounded-2xl bg-purple-50/70 border border-purple-200">
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={useWallet}
                              onChange={(e) => setUseWallet(e.target.checked)}
                              disabled={walletBalance <= 0}
                              className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                            />
                            <div>
                              <p className="text-xs font-bold text-gray-900">
                                Use VIP Foods Wallet
                              </p>
                              <p className="text-[11px] text-gray-500">
                                Available balance: ₹{walletBalance.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          {useWallet && walletDeduction > 0 && (
                            <span className="text-xs font-black text-purple-700 bg-white px-2 py-0.5 rounded-md shadow-2xs">
                              -₹{walletDeduction.toFixed(2)}
                            </span>
                          )}
                        </label>
                        {walletBalance <= 0 && (
                          <p className="text-[10px] text-gray-400 mt-1 pl-6">
                            Wallet empty. You can add money from your Wallet page!
                          </p>
                        )}
                      </div>
                    )}

                    {/* Note for COD */}
                    {paymentMethod === "COD" && (
                      <p className="text-[11px] text-gray-400 italic px-2 pt-1">
                        Note: Wallet balance cannot be applied for Cash on Delivery. Delivery fee is waived for COD!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: Promo Code & Order Summary (Matching Image 1) */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-4">
            {/* Promo Code Box */}
            <div className="bg-white rounded-[22px] p-3 sm:p-4 border border-gray-100 shadow-xs">
              <div className="flex items-center border border-gray-200 rounded-2xl p-1 focus-within:border-purple-500 transition-all">
                <div className="pl-3 pr-2 text-gray-500">
                  <CouponIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Enter a promo code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={Boolean(coupon)}
                  className="w-full text-xs sm:text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-400 py-2"
                />
                {!coupon ? (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-pink-50 hover:bg-pink-100 border border-pink-200 text-[#f43f5e] px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors disabled:opacity-50 shrink-0"
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1 shrink-0"
                  >
                    Remove
                  </button>
                )}
              </div>

              {couponMessage && (
                <p
                  className={`text-xs mt-2 px-1 font-semibold ${
                    couponStatus === "success" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-gray-100 shadow-xs space-y-3">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                {codCharge > 0 && paymentMethod === "COD" && (
                  <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1">
                    <div className="flex justify-between text-purple-900 font-bold text-xs">
                      <span>Pay Now via Razorpay (COD Advance)</span>
                      <span className="font-extrabold text-sm">₹{codCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 font-semibold text-[11px]">
                      <span>Remaining to pay on Delivery</span>
                      <span className="font-extrabold text-gray-900">
                        ₹{Math.max(0, subtotal - discount - codCharge).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-purple-700/80 italic mt-0.5">
                      ({customer.state && (customer.state.toLowerCase().includes("andhra") || customer.state.toLowerCase() === "ap") ? "Andhra Pradesh: ₹50" : "Other States: ₹75"} advance deducted from total)
                    </p>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Discount</span>
                  <span className="font-extrabold text-emerald-600">
                    -₹{discount.toFixed(2)}
                  </span>
                </div>
                {walletDeduction > 0 && (
                  <div className="flex justify-between text-purple-700 font-semibold bg-purple-50 p-1.5 rounded-lg">
                    <span>Wallet Applied</span>
                    <span className="font-extrabold">
                      -₹{walletDeduction.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {orderError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
                  {orderError}
                </div>
              )}

              {/* Large Pink Place Order Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white py-3.5 px-6 rounded-2xl font-extrabold text-base flex justify-between items-center shadow-md active:scale-[0.99] transition-all disabled:opacity-70"
              >
                <span>
                  {placing
                    ? "Processing..."
                    : paymentMethod === "COD"
                    ? "Pay Advance & Place COD Order"
                    : "Place Order"}
                </span>
                <span>
                  ₹{paymentMethod === "COD" ? codCharge.toFixed(2) : grandTotal.toFixed(2)}
                </span>
              </button>

              {/* Secure Checkout Banner */}
              <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-gray-500 font-semibold">
                <FiShield className="text-emerald-600" size={14} />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}