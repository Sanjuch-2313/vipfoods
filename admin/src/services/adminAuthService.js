import api from "./api";

const TOKEN_KEY   = "admin_token";
const EXPIRY_KEY  = "admin_token_expiry";
const TIMEOUT_MS  = 10 * 60 * 1000; // 10 minutes

/* ── Login ── */
export const adminLogin = async (credentials) => {
  const response = await api.post("/admin/auth/login", credentials);
  if (response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + TIMEOUT_MS));
  }
  return response.data;
};

/* ── Logout ── */
export const adminLogout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
};

/* ── Check whether still logged in (respects the 10-min expiry) ── */
export const isAdminLoggedIn = () => {
  const token  = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (!token) return false;
  // If no expiry stored yet (old sessions), treat as expired → force re-login
  if (!expiry) { adminLogout(); return false; }
  if (Date.now() > Number(expiry)) { adminLogout(); return false; }
  return true;
};

/* ── Refresh the inactivity window (call on every user interaction) ── */
export const refreshAdminExpiry = () => {
  if (localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + TIMEOUT_MS));
  }
};