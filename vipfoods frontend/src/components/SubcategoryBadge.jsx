import React from "react";

/**
 * Color map — purely frontend, based on subcategory name.
 * Admin just sets the name; the frontend assigns the color automatically.
 */
const COLOR_MAP = [
  { pattern: /non[- ]?veg|meat|chicken|mutton|pork|beef|lamb/i, color: "#dc2626" },   // Red
  { pattern: /fish|seafood|prawn|shrimp|crab|lobster/i,         color: "#e85d04" },   // Orange-red
  { pattern: /egg/i,                                             color: "#f97316" },   // Orange
  { pattern: /dairy|milk|cheese|paneer|curd|butter|ghee|cream/i, color: "#2563eb" },  // Blue
  { pattern: /organic/i,                                         color: "#0d9488" },   // Teal
  { pattern: /spice|masala|herb/i,                               color: "#d97706" },   // Amber
  { pattern: /snack|chips|biscuit|cookie|cracker/i,              color: "#7c3aed" },   // Purple
  { pattern: /pickle|achar/i,                                    color: "#65a30d" },   // Lime
  { pattern: /sweet|dessert|mithai|chocolate/i,                  color: "#db2777" },   // Pink
  { pattern: /beverage|drink|juice|tea|coffee/i,                 color: "#0891b2" },   // Cyan
  { pattern: /grain|rice|wheat|flour|pulse|lentil|dal/i,         color: "#b45309" },   // Brown
  { pattern: /fruit|fresh|vegetable|veggie/i,                    color: "#16a34a" },   // Green
  { pattern: /veg/i,                                             color: "#00875a" },   // Dark green (veg — must come last)
];

const DEFAULT_COLOR = "#00875a"; // fallback green

/** Resolve color purely from subcategory name */
function colorFromName(name) {
  if (!name) return DEFAULT_COLOR;
  for (const entry of COLOR_MAP) {
    if (entry.pattern.test(name)) return entry.color;
  }
  return DEFAULT_COLOR;
}

/**
 * Resolve the badge color for a product.
 * Priority: categories list lookup → name auto-detect
 * (admin-stored color is no longer used)
 */
export function getSubcategoryColor(product, categories = []) {
  if (!product) return DEFAULT_COLOR;

  const subName = (product.subCategory || "").trim();

  // 1. Check populated product.category.subCategories (populated by backend)
  if (product.category && typeof product.category === "object" && Array.isArray(product.category.subCategories)) {
    const match = product.category.subCategories.find(
      (s) => (s.name || "").toLowerCase() === subName.toLowerCase()
    );
    // Even if found, use frontend color map (not stored color)
    if (match) return colorFromName(match.name || subName);
  }

  // 2. Check categories list passed from parent component
  if (Array.isArray(categories) && categories.length > 0) {
    const catId = typeof product.category === "object" ? product.category?._id : product.category;
    const cat = categories.find((c) => c._id === catId || c.slug === catId);
    if (cat && Array.isArray(cat.subCategories)) {
      const match = cat.subCategories.find(
        (s) => (s.name || "").toLowerCase() === subName.toLowerCase()
      );
      if (match) return colorFromName(match.name || subName);
    }
  }

  // 3. Name-based auto-detect
  return colorFromName(subName);
}

/** Decide icon type from subcategory name */
function iconType(name) {
  if (/non[- ]?veg|meat|chicken|mutton|pork|beef|lamb|fish|seafood|prawn|shrimp|crab|lobster|egg/i.test(name)) {
    return "nonveg";
  }
  return "veg";
}

export default function SubcategoryBadge({ product, categories = [], className = "" }) {
  if (!product) return null;

  const rawName = (product.subCategory && String(product.subCategory).trim()) || "";
  if (!rawName) return null; // no badge if product has no subcategory

  const color = getSubcategoryColor(product, categories);
  const type = iconType(rawName);

  return (
    <div
      className={`w-full py-1 px-3 flex items-center justify-center gap-1.5 text-white text-[11px] font-black tracking-wider uppercase select-none shrink-0 ${className}`}
      style={{ backgroundColor: color }}
      title={rawName}
    >
      {type === "nonveg" ? (
        /* Non-Veg: bordered square + triangle */
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="3" stroke="#fff" strokeWidth="2.5" />
          <polygon points="12,6 18,17 6,17" fill="#fff" />
        </svg>
      ) : (
        /* Veg: bordered square + circle dot */
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="3" stroke="#fff" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="5" fill="#fff" />
        </svg>
      )}
      <span className="truncate leading-none">{rawName}</span>
    </div>
  );
}
