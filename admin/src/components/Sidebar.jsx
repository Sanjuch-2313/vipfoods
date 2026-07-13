import {
  LayoutDashboard,
  Package,
  Folder,
  ShoppingCart,
  Users,
  TicketPercent,
  Star,
  Settings,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const menus = [
  { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
  { name: "Products", path: "/products", icon: <Package size={20} /> },
  { name: "Categories", path: "/categories", icon: <Folder size={20} /> },
  { name: "Orders", path: "/orders", icon: <ShoppingCart size={20} /> },
  { name: "Customers", path: "/customers", icon: <Users size={20} /> },
  { name: "Coupons", path: "/coupons", icon: <TicketPercent size={20} /> },
  { name: "Reviews", path: "/reviews", icon: <Star size={20} /> },
  { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`admin-sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <h2 className="logo">VIP Foods</h2>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {menus.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => (isActive ? "menu active" : "menu")}
            onClick={onClose}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </aside>
    </>
  );
}
