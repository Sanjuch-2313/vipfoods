import {
  LayoutDashboard,
  Package,
  Folder,
  ShoppingCart,
  Users,
  TicketPercent,
  Star,
  Settings,
  Image,
  Bell,
  X,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const menus = [
  { name: "Combo Packs Offers", path: "/combo-offers", icon: <Package size={20} /> },
  { name: "Dashboard",          path: "/",             icon: <LayoutDashboard size={20} />, end: true },
  { name: "Products",           path: "/products",     icon: <Package size={20} /> },
  { name: "Categories",         path: "/categories",   icon: <Folder size={20} /> },
  { name: "Orders",             path: "/orders",       icon: <ShoppingCart size={20} /> },
  { name: "Customers",          path: "/customers",    icon: <Users size={20} /> },
  { name: "Coupons",            path: "/coupons",      icon: <TicketPercent size={20} /> },
  { name: "Reviews",            path: "/reviews",      icon: <Star size={20} /> },
  { name: "Home Banner",        path: "/home-banner",  icon: <Image size={20} /> },
  { name: "Notifications",      path: "/notifications",icon: <Bell size={20} /> },
  { name: "Settings",           path: "/settings",     icon: <Settings size={20} /> },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    onClose();
    logout("manual");
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`admin-sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        {/* Logo + close */}
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

        {/* Nav links */}
        <nav className="sidebar-menu">
          {menus.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) => (isActive ? "menu active" : "menu")}
              onClick={onClose}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout button — pinned to bottom */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}