export const categories = [
  { id: "pickles", label: "VIP Pickles" },
  { id: "snacks", label: "Home Snacks" },
  { id: "fresh", label: "VIP Fresh" },
  { id: "spices", label: "VIP Spices" },
  { id: "dairy", label: "VIP Dairy" },
];

export const products = [
  {
    id: "pickles-mango",
    name: "Mango Avakaya",
    category: "pickles",
    veg: true,
    trending: true,
    tag: "Classic",
    weights: {
      "250g": 249,
      "500g": 449,
      "1kg": 849,
      "2kg": 1599,
    },
    image:
      "https://images.unsplash.com/photo-1559628238-8b6d554f053e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "pickles-gongura",
    name: "Gongura Pickle",
    category: "pickles",
    veg: true,
    trending: false,
    tag: "Tangy",
    weights: {
      "250g": 229,
      "500g": 429,
      "1kg": 799,
      "2kg": 1499,
    },
    image:
      "https://images.unsplash.com/photo-1549888834-04956cbb7111?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "pickles-lemon",
    name: "Lemon Pickle",
    category: "pickles",
    veg: true,
    trending: false,
    tag: "Sun cured",
    weights: {
      "250g": 199,
      "500g": 379,
      "1kg": 699,
      "2kg": 1299,
    },
    image:
      "https://images.unsplash.com/photo-1516685018646-549e3457e12d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "pickles-chicken",
    name: "Chicken Pickle",
    category: "pickles",
    veg: false,
    trending: true,
    tag: "Spicy",
    weights: {
      "250g": 349,
      "500g": 649,
      "1kg": 1249,
      "2kg": 2399,
    },
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "snacks-boondi",
    name: "Karam Boondi",
    category: "snacks",
    veg: true,
    trending: false,
    tag: "Crunchy",
    weights: {
      "200g": 149,
      "400g": 279,
      "800g": 529,
      "2kg": 1299,
    },
    image:
      "https://images.unsplash.com/photo-1621534739117-95657e04eaa4?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "fresh-tomato",
    name: "Tomato Basket",
    category: "fresh",
    veg: true,
    trending: false,
    tag: "Farm fresh",
    weights: {
      "500g": 99,
      "1kg": 189,
      "2kg": 349,
    },
    image:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "spices-turmeric",
    name: "Turmeric Powder",
    category: "spices",
    veg: true,
    trending: true,
    tag: "Pure",
    weights: {
      "100g": 179,
      "250g": 399,
      "500g": 749,
      "2kg": 2899,
    },
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "dairy-milk",
    name: "Farm Milk",
    category: "dairy",
    veg: true,
    trending: true,
    tag: "Fresh",
    weights: {
      "500ml": 79,
      "1L": 149,
      "2L": 289,
    },
    image:
      "https://images.unsplash.com/photo-1550559384-52e8d26cc0b8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "dairy-ghee",
    name: "Pure Ghee",
    category: "dairy",
    veg: true,
    trending: true,
    tag: "Rich",
    weights: {
      "200ml": 349,
      "500ml": 799,
      "1L": 1499,
      "2L": 2899,
    },
    image:
      "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80",
  },
  // …continue for all other products in the same pattern…
];

export function getProducts(filter = {}) {
  const { category, search, vegFilter, sortBy, trending } = filter;
  let result = [...products];

  if (category && category !== "all") {
    result = result.filter((item) => item.category === category);
  }

  if (typeof trending === "boolean" && trending) {
    result = result.filter((item) => item.trending);
  }

  if (search) {
    const lowerSearch = search.toLowerCase();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerSearch) ||
        item.tag.toLowerCase().includes(lowerSearch) ||
        item.category.toLowerCase().includes(lowerSearch),
    );
  }

  if (vegFilter && vegFilter !== "all") {
    result = result.filter((item) => (vegFilter === "veg" ? item.veg : !item.veg));
  }

  if (sortBy === "price-asc") {
    result.sort((a, b) => {
      const aMin = Math.min(...Object.values(a.weights));
      const bMin = Math.min(...Object.values(b.weights));
      return aMin - bMin;
    });
  } else if (sortBy === "price-desc") {
    result.sort((a, b) => {
      const aMax = Math.max(...Object.values(a.weights));
      const bMax = Math.max(...Object.values(b.weights));
      return bMax - aMax;
    });
  }

  return result;
}

export function getCategoryLabel(category) {
  const entry = categories.find((item) => item.id === category);
  return entry ? entry.label : "All VIP Foods";
}

export function getWeightOptions(product) {
  if (!product?.weights) return [];

  if (Array.isArray(product.weights)) {
    return product.weights;
  }

  return Object.entries(product.weights).map(([label, price]) => ({ label, price }));
}

export function getDefaultWeight(product) {
  const [firstWeight] = getWeightOptions(product);
  return firstWeight?.label || firstWeight?.value || "";
}

export function getProductPrice(product, weight) {
  if (!product?.weights) return null;

  if (Array.isArray(product.weights)) {
    const selected = product.weights.find((item) => item.label === weight || item.value === weight);
    return selected?.price ?? selected?.value ?? null;
  }

  return product.weights[weight] ?? null;
}
