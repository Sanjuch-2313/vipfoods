import { useEffect, useState } from "react";

import {
  deleteOrder,
  getOrders,
  updateOrderStatus,
} from "../services/orderService";

const ORDER_STATUSES = [
  "Pending",
  "Accepted",
  "Packing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getOrders();
      setOrders(res.orders || []);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Failed to update order status");
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Delete this order?")) {
      return;
    }

    try {
      await deleteOrder(orderId);
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Failed to delete order");
    }
  };

  return (
    <main className="section-wrap">
      <h2>Orders</h2>

      {loading && <p>Loading orders...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p>No orders found.</p>
      )}

      {orders.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customer?.name || "Customer"}</td>
                  <td>₹{order.grandTotal}</td>
                  <td>
                    <select
                      value={order.orderStatus}
                      onChange={(event) =>
                        handleStatusChange(order._id, event.target.value)
                      }
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(order._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
