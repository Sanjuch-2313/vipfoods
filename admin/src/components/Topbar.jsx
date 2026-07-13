import { Bell, Search, Menu } from "lucide-react";
import "./Topbar.css";

export default function Topbar({ onMenuClick }) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar-menu-btn"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="search-box">
        <Search size={18} />
        <input type="text" placeholder="Search..." />
      </div>

      <div className="top-right">
        <Bell />
        <img src="https://ui-avatars.com/api/?name=Admin" alt="" />
      </div>
    </header>
  );
}
