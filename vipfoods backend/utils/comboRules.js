export function matchesComboRule(product, rule) {
  return String(product.category?._id || product.category) === String(rule.category) &&
    (!rule.subCategory || product.subCategory === rule.subCategory);
}
export function validateComboRules(rules, itemCount) {
  if (!Array.isArray(rules)) throw new Error("Invalid combo category requirements.");
  if (!rules.length) return;
  if (rules.some(r => !r.category || !Number.isInteger(r.quantity) || r.quantity < 1) ||
      rules.reduce((sum, r) => sum + r.quantity, 0) !== Number(itemCount)) {
    throw new Error("Category quantities must be positive whole numbers and total the items per combo.");
  }
  rules.forEach((rule, i) => {
    if (rules.slice(0, i).some(other => String(other.category) === String(rule.category) &&
        (!other.subCategory || !rule.subCategory || other.subCategory === rule.subCategory))) {
      throw new Error("Choose separate, non-overlapping category/subcategory groups.");
    }
  });
}
