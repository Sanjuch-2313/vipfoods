import "./Button.css";
import { FiLoader } from "react-icons/fi";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  iconRight,
  loading = false,
  className = "",
  ...props
}) {
  const classes = [
    "app-btn",
    `app-btn-${variant}`,
    `app-btn-${size}`,
    fullWidth ? "app-btn-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {loading ? <FiLoader className="btn-spinner" /> : icon}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}
