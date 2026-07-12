import { useEffect, useState } from "react";
import { getMyOrders } from "../services/orderService";
import "./myOrders.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getMyOrders();
        setOrders(res.orders || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <main className="section-wrap my-orders-page">
      <h2>My Orders</h2>

      {loading && <p>Loading orders...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p>You have no orders yet.</p>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <h3>Order #{order.orderNumber}</h3>
            <p>Status: {order.orderStatus}</p>
            <p>Payment: {order.paymentStatus}</p>
            <p>Total: ₹{order.grandTotal}</p>
            <p>Placed on: {new Date(order.createdAt).toLocaleString()}</p>

            <div className="order-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-item">
                  <img src={item.image} alt={item.productName} />
                  <div>
                    <p>{item.productName}</p>
                    <p>Qty: {item.quantity}</p>
                    <p>₹{item.variant?.price || item.total}</p>
                  </div>
                  <p>Subtotal: ₹{item.total}</p>
                </div>
              ))}
            </div>

            <div className="shipping-info">
              <h4>Shipping Address</h4>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
