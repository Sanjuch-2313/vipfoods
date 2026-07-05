import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      {/* Brand / Organization Info */}
      <div className="footer-brand">
        <span>VIP</span> Foods
        <p className="footer-org-info">
          <strong>Name of organization:</strong> Village Inti Products and Foods (VIP Food’s)<br />
          <strong>Full Address:</strong> 14-26 Telaprolu, Tenali Mandal, Guntur: 522202<br />
          <strong>Phone:</strong> <a href="tel:9966817199">9966 81 71 99</a>
        </p>
      </div>

      {/* Columns */}
      <div className="footer-columns">
        <div>
          <h4>Quick Links</h4>
          <Link to="/about">About us</Link>
          <Link to="/contact">Contact us</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/account">My account</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/lost-password">Lost password</Link>
        </div>

        <div>
          <h4>Our Policies</h4>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/refund">Refund and Returns Policy</Link>
          <Link to="/shipping">Shipping & Cancellation Policy</Link>
        </div>

        <div>
          <h4>Categories</h4>
          <Link to="/products?category=dairy">VIP Dairy</Link>
          <Link to="/products?category=pickle">VIP Pickle</Link>
          <Link to="/products?category=fresh">VIP Fresh</Link>
          <Link to="/products?category=fruits">Fruits & Vegetables</Link>
          <Link to="/products?category=non-veg-pickle">Non Veg Pickle</Link>
          <Link to="/products?category=veg-pickle">Veg Pickle</Link>
          <Link to="/products?category=snacks">VIP Snacks</Link>
          <Link to="/products?category=spices">VIP Spices</Link>
        </div>
      </div>

      {/* Footer Note */}
      <p className="footer-note">© 2026 VIP Foods. All rights reserved.</p>
      <p className="footer-note">Designed and Developed by Syam C & Sanju Choppara.</p>
    </footer>
  );
}
