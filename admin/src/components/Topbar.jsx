import { Bell, Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="search-box">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search..."
        />
      </div>

      <div className="top-right">
        <Bell />

        <img
          src="https://ui-avatars.com/api/?name=Admin"
          alt=""
        />
      </div>
    </header>
  );
}