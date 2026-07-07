import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus, deleteOrder } from "../../services/orderService.js";
import "../../styles/Orders.css";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrderById(id).then(setOrder);
  }, [id]);

  if (!order) return <p>Loading...</p>;

  const handleStatusUpdate = async (status) => {
    await updateOrderStatus(id, status);
    const updated = await getOrderById(id);
    setOrder(updated);
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this order?")) {
      await deleteOrder(id);
      navigate("/orders");
    }
  };

  return (
    <div className="order-details">
      <h2>Order #{order.orderId || order._id}</h2>

      <div className="order-section">
        <h3>Customer Info</h3>
        <p><strong>Name:</strong> {order.customer?.name}</p>
        <p><strong>Email:</strong> {order.customer?.email}</p>
        <p><strong>Phone:</strong> {order.customer?.phone}</p>
      </div>

      <div className="order-section">
        <h3>Shipping Address</h3>
        <p>{order.shippingAddress?.line1}</p>
        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
        <p>{order.shippingAddress?.country} - {order.shippingAddress?.zip}</p>
      </div>

      <div className="order-section">
        <h3>Payment</h3>
        <p><strong>Method:</strong> {order.payment?.method}</p>
        <p><strong>Transaction ID:</strong> {order.payment?.transactionId}</p>
        <p><strong>Total:</strong> ₹{order.totalAmount}</p>
      </div>

      <div className="order-section">
        <h3>Status</h3>
        <p>
          <span className={`status-badge ${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </p>
        <div className="order-actions">
          <button onClick={() => handleStatusUpdate("Processing")}>Process</button>
          <button onClick={() => handleStatusUpdate("Shipped")}>Ship</button>
          <button onClick={() => handleStatusUpdate("Delivered")}>Deliver</button>
          <button onClick={() => handleStatusUpdate("Cancelled")}>Cancel</button>
        </div>
      </div>

      <div className="order-section">
        <h3>Items</h3>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Variant</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item._id}>
                <td>{item.product?.name}</td>
                <td>{item.variant?.weight}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="order-section">
        <button className="delete-btn" onClick={handleDelete}>Delete Order</button>
      </div>
    </div>
  );
}
