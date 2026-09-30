export function normalizeComboSize(value) {
  const text = String(value || "").trim().toLowerCase().replace(/\s+/g, "");
  const match = text.match(/^(\d+(?:\.\d+)?)(kg|g|gm|grams?|ml|l|litres?|liters?)?$/);
  if (!match) return text;
  const unit = match[2] || "g";
  const amount = Number(match[1]);
  if (unit === "kg") return `${amount * 1000}g`;
  if (/^(l|litre|liter)/.test(unit)) return `${amount * 1000}ml`;
  return `${amount}${unit === "ml" ? "ml" : "g"}`;
}
