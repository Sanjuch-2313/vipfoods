const normalize = (value) => String(value || "").trim().toLowerCase();

export function matchesCategory(product, category) {
  if (!category) return true;
  const productCategory = product.category;
  return [productCategory?._id, productCategory?.slug, productCategory?.name,
    typeof productCategory === "string" ? productCategory : ""]
    .filter(Boolean).some((value) => [category._id, category.slug, category.name]
      .filter(Boolean).some((candidate) => normalize(candidate) === normalize(value)));
}

export function filterAndSortProducts(products, category, subcategory, sort) {
  const result = products.filter((product) => matchesCategory(product, category) &&
    (!subcategory || [subcategory.name, subcategory.slug].some((value) => normalize(value) === normalize(product.subCategory))));
  const price = (product) => Number(product.variants?.[0]?.sellingPrice ?? product.offerPrice ?? product.price ?? 0);
  switch (sort) {
    case "price-asc": return result.sort((a, b) => price(a) - price(b));
    case "price-desc": return result.sort((a, b) => price(b) - price(a));
    case "name-asc": return result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    case "newest": return result.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
    default: return result;
  }
}
