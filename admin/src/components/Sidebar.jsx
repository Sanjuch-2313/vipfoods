import {
  LayoutDashboard,
  Package,
  Folder,
  ShoppingCart,
  Users,
  TicketPercent,
  Star,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menus = [
  {
    name: "Dashboard",
    path: "/",
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: "Products",
    path: "/products",
    icon: <Package size={20} />,
  },
  {
    name: "Categories",
    path: "/categories",
    icon: <Folder size={20} />,
  },
  {
    name: "Orders",
    path: "/orders",
    icon: <ShoppingCart size={20} />,
  },
  {
    name: "Customers",
    path: "/customers",
    icon: <Users size={20} />,
  },
  {
    name: "Coupons",
    path: "/coupons",
    icon: <TicketPercent size={20} />,
  },
  {
    name: "Reviews",
    path: "/reviews",
    icon: <Star size={20} />,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <Settings size={20} />,
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">VIP Foods</h2>

      {menus.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            isActive ? "menu active" : "menu"
          }
        >
          {item.icon}

          <span>{item.name}</span>
        </NavLink>
      ))}
    </aside>
  );
}