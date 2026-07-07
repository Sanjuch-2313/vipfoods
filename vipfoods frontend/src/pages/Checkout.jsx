import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  // Phase 1 – Customer Details (shipping address form)
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
  });

  // Phase 2 – Order Summary
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.offerPrice || item.price) * item.quantity,
    0
  );

  // Phase 3 – Coupon System (disabled until backend endpoint exists)
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // Phase 4 – Delivery Charges
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        const settings = res.data.settings || {};
        setDeliveryCharge(
          subtotal >= (settings.freeShippingThreshold || 0)
            ? 0
            : (settings.shippingFlatRate || 0)
        );
        setTaxRate(settings.taxRate || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, [subtotal]);

  // Phase 5 – Payment
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Phase 6 – Place Order
  const placeOrder = async () => {
    // ✅ 5. Check login
    if (!user) {
      alert("Please login before placing an order.");
      navigate("/login");
      return;
    }

    // ✅ 7. Empty cart protection
    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    // ✅ 6. Validate form
    if (
      !customer.name ||
      !customer.phone ||
      !customer.address1 ||
      !customer.city ||
      !customer.state ||
      !customer.pincode
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const grandTotal =
        subtotal - discount + deliveryCharge + (subtotal * taxRate) / 100;

      // ✅ Items mapping
      const items = cartItems.map(item => ({
        product: item.id,
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

      // ✅ Shipping address mapping
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

      // ✅ Order payload
      const orderPayload = {
        customer: user._id, // ObjectId only
        items,
        shippingAddress,
        paymentMethod, // "COD" or "ONLINE"
        subtotal,
        discount,
        deliveryCharge,
        grandTotal,
      };

      const res = await api.post("/orders", orderPayload);
      clearCart();
      // ✅ 3. Success page navigation
      navigate(`/order-success/${res.data.order.orderNumber}`);
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  };

  return (
    <main className="section-wrap checkout-page">
      <h2>Checkout</h2>

      {/* Phase 1 – Customer Details */}
      <section className="checkout-section">
        <h3>Customer Details</h3>
        <form className="checkout-form">
          <input
            placeholder="Full Name"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
          <input
            placeholder="Phone Number"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          />
          <input
            placeholder="Email"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
          />
          <input
            placeholder="Address Line 1"
            value={customer.address1}
            onChange={(e) => setCustomer({ ...customer, address1: e.target.value })}
          />
          <input
            placeholder="Address Line 2"
            value={customer.address2}
            onChange={(e) => setCustomer({ ...customer, address2: e.target.value })}
          />
          <input
            placeholder="City"
            value={customer.city}
            onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
          />
          <input
            placeholder="State"
            value={customer.state}
            onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
          />
          <input
            placeholder="Postal Code"
            value={customer.pincode}
            onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
          />
          <input
            placeholder="Country"
            value={customer.country}
            onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
          />
        </form>
      </section>

      {/* Phase 2 – Order Summary */}
      <section className="checkout-section">
        <h3>Order Summary</h3>
        <div className="order-summary">
          {cartItems.map((item) => (
            <div key={item.id} className="order-item">
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
        <p>Total: ₹{subtotal}</p>
      </section>

      {/* Phase 3 – Coupon System (disabled for now) */}
      <section className="checkout-section">
        <h3>Coupon</h3>
        <input
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button type="button" disabled>Apply (coming soon)</button>
        {discount > 0 && (
          <div>
            <p>Discount: -₹{discount}</p>
            <button type="button" onClick={() => setDiscount(0)}>Remove Coupon</button>
          </div>
        )}
      </section>

      {/* Phase 4 – Delivery Charges */}
      <section className="checkout-section">
        <h3>Delivery & Tax</h3>
        <p>Delivery Charge: ₹{deliveryCharge}</p>
        <p>Tax: {taxRate}%</p>
      </section>

      {/* Phase 5 – Payment */}
      <section className="checkout-section">
        <h3>Payment Method</h3>
        <label>
          <input
            type="radio"
            value="COD"
            checked={paymentMethod === "COD"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Cash on Delivery
        </label>
        <label>
          <input
            type="radio"
            value="ONLINE"
            checked={paymentMethod === "ONLINE"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Online Payment (Razorpay)
        </label>
      </section>

      {/* Phase 6 – Place Order */}
      <section className="checkout-section">
        <h3>Place Order</h3>
        <button type="button" className="cta-btn full" onClick={placeOrder}>
          Place Order
        </button>
      </section>
    </main>
  );
}
