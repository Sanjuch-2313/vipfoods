export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function createId(prefix, value) {
  return `${prefix}-${value.toString().toLowerCase().replace(/\s+/g, "-")}`;
}
