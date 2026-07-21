import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/orderService";
import api from "../services/api";
import "./checkout.css";

const INDIAN_STATE_CODES = {
  "andhra pradesh": "Andhra Pradesh",
};

const CHECKOUT_STORAGE_KEY = "checkout_form_state";

function getCodCharge(paymentMethod, state) {
  if (paymentMethod !== "COD") return 0;
  if (!state.trim()) return 0;
  return state.trim().toLowerCase() === "andhra pradesh" ? 50 : 70;
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

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  const storedState = loadStoredCheckoutState();

  // Customer details — restored from sessionStorage if present, so a page
  // refresh doesn't wipe out what the user already typed.
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

  // Location autofill
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponStatus, setCouponStatus] = useState(null); // "success" | "error" | null
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState(storedState?.paymentMethod || "COD");

  // Order placement
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  // ---- Derived values (single source of truth, no duplicate calculations) ----
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.offerPrice || item.price) * item.quantity,
    0
  );
  const codCharge = getCodCharge(paymentMethod, customer.state);
  const grandTotal = subtotal - discount + codCharge;

  // Persist customer details + payment method on every change so a refresh
  // restores them. Coupon state is intentionally excluded — it's re-validated
  // against the live backend each time rather than trusted from storage.
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

  // ---- Coupon ----
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || couponLoading || coupon) return;

    try {
      setCouponLoading(true);
      setCouponMessage("");
      setCouponStatus(null);

      const { data } = await api.post("/coupons/validate", {
        code: couponCode,
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

  // ---- Use current location ----
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
            address1: road || prev.address1,
            city: city || prev.city,
            state: stateName || prev.state,
            pincode: pincode || prev.pincode,
            country: country || prev.country,
          }));

          setFieldErrors((prev) => ({
            ...prev,
            address1: undefined,
            city: undefined,
            state: undefined,
            pincode: undefined,
          }));
        } catch (err) {
          console.error(err);
          setLocationError("Could not detect your address. Please enter it manually.");
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Please enter your address manually."
            : "Could not get your location. Please enter your address manually."
        );
        setLocationLoading(false);
      }
    );
  };

  // ---- Validation ----
  const validate = () => {
    const errors = {};

    if (!customer.name.trim()) errors.name = "Name is required";
    if (!customer.phone.trim()) errors.phone = "Phone number is required";
    if (!customer.address1.trim()) errors.address1 = "Address is required";
    if (!customer.city.trim()) errors.city = "City is required";
    if (!customer.state.trim()) errors.state = "State is required";
    if (!customer.pincode.trim()) errors.pincode = "Pincode is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---- Place order ----
  const placeOrder = async () => {
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

      const orderPayload = {
        customer: user.id || user._id,
        items,
        shippingAddress,
        paymentMethod,
        subtotal,
        discount,
        codCharge,
        grandTotal,
        coupon: coupon?._id || null,
      };

      const res = await createOrder(orderPayload);
      clearCart();
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      navigate(`/order-success/${res.order.orderNumber}`, {
  state: {
    order: res.order,
  },
});
    } catch (err) {
      console.error(err);
      setOrderError(err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="section-wrap checkout-page">
      <h2>Checkout</h2>

      <div className="checkout-grid">
        {/* ---- Main column ---- */}
        <div className="checkout-col-main">
          <section className="checkout-card">
            <h3>Customer Details</h3>

            <button
              type="button"
              className="location-btn"
              onClick={handleUseCurrentLocation}
              disabled={locationLoading}
            >
              📍 {locationLoading ? "Detecting location..." : "Use Current Location"}
            </button>

            {locationError && <p className="field-error">{locationError}</p>}

            <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-field">
                <input
                  placeholder="Full Name"
                  value={customer.name}
                  onChange={(e) => updateCustomer("name", e.target.value)}
                />
                {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
              </div>

              <div className="form-field">
                <input
                  placeholder="Phone Number"
                  value={customer.phone}
                  onChange={(e) => updateCustomer("phone", e.target.value)}
                />
                {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
              </div>

              <div className="form-field">
                <input
                  placeholder="Email"
                  value={customer.email}
                  onChange={(e) => updateCustomer("email", e.target.value)}
                />
              </div>

              <div className="form-field">
                <input
                  placeholder="Address Line 1"
                  value={customer.address1}
                  onChange={(e) => updateCustomer("address1", e.target.value)}
                />
                {fieldErrors.address1 && (
                  <p className="field-error">{fieldErrors.address1}</p>
                )}
              </div>

              <div className="form-field">
                <input
                  placeholder="Address Line 2"
                  value={customer.address2}
                  onChange={(e) => updateCustomer("address2", e.target.value)}
                />
              </div>

              <div className="form-field">
                <input
                  placeholder="City"
                  value={customer.city}
                  onChange={(e) => updateCustomer("city", e.target.value)}
                />
                {fieldErrors.city && <p className="field-error">{fieldErrors.city}</p>}
              </div>

              <div className="form-field">
                <input
                  placeholder="State"
                  value={customer.state}
                  onChange={(e) => updateCustomer("state", e.target.value)}
                />
                {fieldErrors.state && <p className="field-error">{fieldErrors.state}</p>}
              </div>

              <div className="form-field">
                <input
                  placeholder="Postal Code"
                  value={customer.pincode}
                  onChange={(e) => updateCustomer("pincode", e.target.value)}
                />
                {fieldErrors.pincode && (
                  <p className="field-error">{fieldErrors.pincode}</p>
                )}
              </div>

              <div className="form-field">
                <input
                  placeholder="Country"
                  value={customer.country}
                  onChange={(e) => updateCustomer("country", e.target.value)}
                />
              </div>
            </form>
          </section>

          <section className="checkout-card">
            <h3>Coupon</h3>

            <div className="coupon-form">
              <input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={Boolean(coupon)}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || Boolean(coupon) || !couponCode.trim()}
              >
                {couponLoading ? "Applying..." : coupon ? "Applied" : "Apply Coupon"}
              </button>
            </div>

            {couponMessage && (
              <p className={couponStatus === "success" ? "coupon-success" : "coupon-error"}>
                {couponMessage}
              </p>
            )}

            {discount > 0 && (
              <div className="coupon-applied-row">
                <p>Discount: -₹{discount}</p>
                <button type="button" className="remove-coupon-btn" onClick={handleRemoveCoupon}>
                  Remove Coupon
                </button>
              </div>
            )}
          </section>
        </div>

        {/* ---- Side column ---- */}
        <div className="checkout-col-side">
          <section className="checkout-card checkout-summary-sticky">
            <h3>Order Summary</h3>

            <div className="order-summary">
              {cartItems.map((item) => (
                <div key={item._id || item.id} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <p>{item.name}</p>
                    <p>{item.weight}</p>
                    <p>Qty: {item.quantity}</p>
                    <p>₹{item.offerPrice || item.price}</p>
                  </div>
                  <p>Subtotal: ₹{(item.offerPrice || item.price) * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <p>Subtotal: ₹{subtotal}</p>
              <p>Coupon Discount: -₹{discount}</p>
              <p>COD Charge: ₹{codCharge}</p>
              <h3>Grand Total: ₹{grandTotal}</h3>
            </div>
          </section>

          <section className="checkout-card">
            <h3>Payment Method</h3>

            <label className="payment-option">
              <input
                type="radio"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>
                Cash on Delivery
                <small>
                  COD Charge: ₹{getCodCharge("COD", customer.state)}
                  <br />
                  Andhra Pradesh: ₹50 · Other states: ₹70
                </small>
              </span>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                value="ONLINE"
                checked={paymentMethod === "ONLINE"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>
                Online Payment
                <small>No COD Charge (Razorpay-ready)</small>
              </span>
            </label>
          </section>

          <section className="checkout-card">
            <button
              type="button"
              className="cta-btn full"
              onClick={placeOrder}
              disabled={placing}
            >
              {placing ? "Placing Order..." : "Place Order"}
            </button>
            {orderError && <p className="error-text">{orderError}</p>}
          </section>
        </div>
      </div>
    </main>
  );
}