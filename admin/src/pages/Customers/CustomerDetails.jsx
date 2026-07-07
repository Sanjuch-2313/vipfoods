import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCustomerById } from "../../services/customerService.js";
import "../../styles/Customers.css";

export default function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    getCustomerById(id).then(setCustomer);
  }, [id]);

  if (!customer) return <p>Loading...</p>;

  return (
    <div className="customer-details">
      <h2>{customer.name}</h2>
      <p><strong>Email:</strong> {customer.email}</p>
      <p><strong>Phone:</strong> {customer.phone}</p>

      <h3>Addresses</h3>
      <ul>
        {customer.addresses.map((addr, i) => (
          <li key={i}>
            {addr.line1}, {addr.city}, {addr.state}, {addr.country} - {addr.zip}
          </li>
        ))}
      </ul>

      <h3>Order History</h3>
      <ul>
        {customer.orders.map((order) => (
          <li key={order._id}>
            Order #{order.orderId} — ₹{order.totalAmount} — {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
