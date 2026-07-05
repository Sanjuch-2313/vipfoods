export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-panel glass-card">{children}</div>
    </div>
  );
}
