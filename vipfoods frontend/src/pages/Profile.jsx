import { useState } from "react";
import { FiChevronDown, FiLogOut, FiUser, FiShield, FiHeart } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./home.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <main className="section-wrap profile-page">
      <section className="section-heading profile-heading">
        <p>My Account</p>
        <h2>Profile settings and saved preferences</h2>
      </section>

      <div className="profile-card glass-card">
        <div className="profile-header">
          <div className="profile-avatar">{user?.email?.charAt(0).toUpperCase() || "V"}</div>
          <div>
            <p className="profile-name">{user?.email || "VIP Foods User"}</p>
            <p className="profile-email">{user?.email || "example@vipfoods.com"}</p>
          </div>
          <button className="profile-dropdown-toggle" onClick={() => setOpen(!open)}>
            <span>Account</span>
            <FiChevronDown />
          </button>
        </div>

        {open && (
          <div className="profile-dropdown glass-card">
            <button type="button" className="profile-dropdown-item">
              <FiUser /> Profile
            </button>
            <button type="button" className="profile-dropdown-item">
              <FiShield /> Security
            </button>
            <button type="button" className="profile-dropdown-item">
              <FiHeart /> Saved items
            </button>
            <button type="button" className="profile-dropdown-item logout" onClick={logout}>
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
