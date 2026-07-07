import { useState, useEffect } from "react";
import { getOrders, deleteOrder, updateOrderStatus } from "../../services/orderService.js";
import "../../styles/Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // New filters
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, page, month, year, date]);

  const fetchOrders = async () => {
    const data = await getOrders({ search, status: statusFilter, page, month, year, date });
    setOrders(data.orders);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this order?")) {
      await deleteOrder(id);
      fetchOrders();
    }
  };

  const handleStatusUpdate = async (id, status) => {
    await updateOrderStatus(id, status);
    fetchOrders();
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
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* New Date Filters */}
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

      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o._id}</td>
              <td>{o.customer?.name}</td>
              <td>₹{o.totalAmount}</td>
              <td>
                <span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span>
              </td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleStatusUpdate(o._id, "Processing")}>Process</button>
                <button onClick={() => handleStatusUpdate(o._id, "Shipped")}>Ship</button>
                <button onClick={() => handleStatusUpdate(o._id, "Delivered")}>Deliver</button>
                <button className="delete-btn" onClick={() => handleDelete(o._id)}>Delete</button>
              </td>
            </tr>
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
