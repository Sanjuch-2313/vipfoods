import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatsCard from "../../components/StatsCard";
import { getDashboardStats } from "../../services/dashboardService";

import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
} from "lucide-react";

import "./Dashboard.css";

const statusColors = {
  Pending: "status-pending",
  Accepted: "status-accepted",
  Packing: "status-packing",
  Shipped: "status-shipped",
  Delivered: "status-delivered",
  Cancelled: "status-cancelled",
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getDashboardStats();

        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setLowStockProducts(data.lowStockProducts || []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="stats-grid">
        <StatsCard
          title="Revenue"
          value={loading ? "..." : `₹${stats.totalRevenue.toLocaleString("en-IN")}`}
          color="#2ecc71"
          icon={<DollarSign />}
        />

        <StatsCard
          title="Orders"
          value={loading ? "..." : stats.totalOrders}
          color="#3498db"
          icon={<ShoppingBag />}
        />

        <StatsCard
          title="Customers"
          value={loading ? "..." : stats.totalCustomers}
          color="#9b59b6"
          icon={<Users />}
        />

        <StatsCard
          title="Products"
          value={loading ? "..." : stats.totalProducts}
          color="#f39c12"
          icon={<Package />}
        />
      </div>

      <div className="dashboard-grid">
        <div className="recent-orders">
          <h2>Recent Orders</h2>

          {loading ? (
            <p>Loading...</p>
          ) : recentOrders.length === 0 ? (
            <p>No Orders Yet</p>
          ) : (
            <div className="dashboard-order-list">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="dashboard-order-row"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <div className="dashboard-order-info">
                    <strong>#{order.orderNumber}</strong>
                    <span>{order.customer?.name || "Guest"}</span>
                  </div>
                  <div className="dashboard-order-meta">
                    <span className={`order-status-pill ${statusColors[order.orderStatus] || ""}`}>
                      {order.orderStatus}
                    </span>
                    <strong>₹{order.grandTotal}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="low-stock">
          <h2>Low Stock</h2>

          {loading ? (
            <p>Loading...</p>
          ) : lowStockProducts.length === 0 ? (
            <p>No Low Stock Products</p>
          ) : (
            <div className="dashboard-stock-list">
              {lowStockProducts.map((item, idx) => (
                <div key={idx} className="dashboard-stock-row">
                  {item.image && (
                    <img src={item.image} alt={item.name} />
                  )}
                  <div className="dashboard-stock-info">
                    <strong>{item.name}</strong>
                    <span>{item.weight}</span>
                  </div>
                  <span className="stock-count-badge">
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}