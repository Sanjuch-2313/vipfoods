import { useState, useEffect } from "react";
import { getOrders, deleteOrder, updateOrderStatus } from "../../services/orderService.js";
import "../../styles/Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, page, month, year, date]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getOrders({ search, status: statusFilter, page, month, year, date });
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this order?")) {
      try {
        await deleteOrder(id);
        fetchOrders();
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to delete order");
      }
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update order");
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrderId((current) => (current === id ? null : id));
  };

  const paymentBadgeClass = (status) => {
    switch (status) {
      case "Paid":
        return "payment-badge paid";
      case "Failed":
        return "payment-badge failed";
      case "Refunded":
        return "payment-badge refunded";
      default:
        return "payment-badge pending";
    }
  };

  return (
    <div className="orders-page">
      <h2>Orders</h2>

      <div className="orders-filters">
        <input
          type="text"
          placeholder="Search by customer or order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Packing">Packing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">All Months</option>
          {["January","February","March","April","May","June","July","August","September","October","November","December"]
            .map((m, idx) => <option key={idx} value={idx+1}>{m}</option>)}
        </select>

        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p className="orders-error">{error}</p>}

      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Order Status</th>
            <th>Payment</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <>
              <tr
                key={o._id}
                className="order-row"
                onClick={() => toggleExpand(o._id)}
              >
                <td>{o.orderNumber || o._id}</td>
                <td>
                  <div className="customer-cell">
                    <strong>{o.customer?.name || "Customer"}</strong>
                    {o.customer?.email && <span>{o.customer.email}</span>}
                  </div>
                </td>
                <td>₹{o.grandTotal ?? 0}</td>
                <td>
                  <span className={`status-badge ${(o.orderStatus || "Pending").toLowerCase()}`}>
                    {o.orderStatus || "Pending"}
                  </span>
                </td>
                <td>
                  <span className={paymentBadgeClass(o.paymentStatus)}>
                    {o.paymentStatus || "Pending"}
                  </span>
                  <span className="payment-method-tag">{o.paymentMethod}</span>
                </td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleStatusUpdate(o._id, "Accepted")}>Accept</button>
                  <button onClick={() => handleStatusUpdate(o._id, "Packing")}>Pack</button>
                  <button onClick={() => handleStatusUpdate(o._id, "Shipped")}>Ship</button>
                  <button onClick={() => handleStatusUpdate(o._id, "Delivered")}>Deliver</button>
                  <button className="delete-btn" onClick={() => handleDelete(o._id)}>Delete</button>
                </td>
              </tr>

              {expandedOrderId === o._id && (
                <tr className="order-expand-row" key={`${o._id}-expand`}>
                  <td colSpan={7}>
                    <div className="order-expand-content">
                      <div className="order-expand-items">
                        <h4>Items Ordered</h4>
                        {(o.items || []).map((item, idx) => (
                          <div className="order-expand-item" key={idx}>
                            {item.image && (
                              <img src={item.image} alt={item.productName} />
                            )}
                            <div className="order-expand-item-info">
                              <strong>{item.productName}</strong>
                              <span>
                                {item.variant?.weight && `${item.variant.weight} · `}
                                Qty: {item.quantity}
                              </span>
                            </div>
                            <span className="order-expand-item-total">
                              ₹{item.total}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="order-expand-shipping">
                        <h4>Shipping Address</h4>
                        {o.shippingAddress ? (
                          <>
                            <p>{o.shippingAddress.fullName} · {o.shippingAddress.phone}</p>
                            <p>
                              {o.shippingAddress.addressLine1}
                              {o.shippingAddress.addressLine2 ? `, ${o.shippingAddress.addressLine2}` : ""}
                            </p>
                            <p>
                              {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.postalCode}
                            </p>
                          </>
                        ) : (
                          <p>No address on file</p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}