import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminLogout,
  isAdminLoggedIn,
  refreshAdminExpiry,
} from "../services/adminAuthService";

/* ── Context ── */
const AuthContext = createContext(null);

const IDLE_MS       = 10 * 60 * 1000; // 10 minutes
const WARN_BEFORE   = 60 * 1000;       // show warning 1 min before logout
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];

export function AuthProvider({ children }) {
  const navigate    = useNavigate();
  const timerRef    = useRef(null);
  const warnRef     = useRef(null);
  const [warning, setWarning] = useState(false); // show "about to logout" banner

  /* ── Perform logout ── */
  const logout = useCallback((reason = "manual") => {
    clearTimeout(timerRef.current);
    clearTimeout(warnRef.current);
    adminLogout();
    setWarning(false);
    navigate("/login", { state: reason === "idle" ? { sessionExpired: true } : undefined, replace: true });
  }, [navigate]);

  /* ── Reset idle timer on every activity ── */
  const resetTimer = useCallback(() => {
    if (!isAdminLoggedIn()) return;
    refreshAdminExpiry();
    setWarning(false);

    clearTimeout(timerRef.current);
    clearTimeout(warnRef.current);

    // Show warning 1 min before expiry
    warnRef.current = setTimeout(() => setWarning(true), IDLE_MS - WARN_BEFORE);
    // Actually log out after full idle period
    timerRef.current = setTimeout(() => logout("idle"), IDLE_MS);
  }, [logout]);

  /* ── Attach / detach activity listeners ── */
  useEffect(() => {
    if (!isAdminLoggedIn()) return;

    resetTimer(); // start the timer immediately

    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, resetTimer, { passive: true })
    );

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(warnRef.current);
      ACTIVITY_EVENTS.forEach((ev) =>
        window.removeEventListener(ev, resetTimer)
      );
    };
  }, [resetTimer]);

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}

      {/* ── Idle warning banner ── */}
      {warning && (
        <div style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          background: "#1e293b",
          color: "#fff",
          padding: "14px 24px",
          borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,.35)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 14,
          fontWeight: 600,
          maxWidth: "calc(100vw - 32px)",
          whiteSpace: "nowrap",
        }}>
          <span>⏱️ Session expiring in 1 minute due to inactivity.</span>
          <button
            onClick={resetTimer}
            style={{
              background: "#4ade80",
              color: "#14213d",
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            Stay logged in
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
}

/* ── Hook ── */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
