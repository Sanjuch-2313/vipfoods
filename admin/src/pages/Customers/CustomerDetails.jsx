import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCustomerById } from "../../services/customerService.js";
import "../../styles/Customers.css";

export default function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getCustomerById(id)
      .then((data) => {
        setCustomer(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load customer details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p style={{ padding: "24px" }}>Loading customer details…</p>;
  if (error) return <p style={{ padding: "24px", color: "red" }}>{error}</p>;
  if (!customer) return <p style={{ padding: "24px" }}>Customer not found.</p>;

  const addresses = customer.addresses || [];
  const orders = customer.orders || [];

  return (
    <div className="customer-details" style={{ padding: "24px", maxWidth: "800px" }}>
      <Link to="/customers" style={{ color: "#6366f1", fontWeight: 600, marginBottom: "16px", display: "inline-block" }}>
        ← Back to Customers
      </Link>

      <h2 style={{ marginTop: "8px" }}>{customer.name || "—"}</h2>
      <p><strong>Email:</strong> {customer.email || "—"}</p>
      <p><strong>Phone:</strong> {customer.phone || "—"}</p>
      {customer.walletBalance !== undefined && (
        <p><strong>Wallet Balance:</strong> ₹{customer.walletBalance}</p>
      )}

      <h3 style={{ marginTop: "20px" }}>Addresses</h3>
      {addresses.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No addresses saved.</p>
      ) : (
        <ul>
          {addresses.map((addr, i) => (
            <li key={i} style={{ marginBottom: "8px" }}>
              {[addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.postalCode, addr.country]
                .filter(Boolean)
                .join(", ") || JSON.stringify(addr)}
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ marginTop: "20px" }}>Order History</h3>
      {orders.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No orders yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="customers-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber || order._id}</td>
                  <td>₹{order.grandTotal ?? 0}</td>
                  <td>{order.orderStatus || "—"}</td>
                  <td>{order.paymentMethod || "—"}</td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
