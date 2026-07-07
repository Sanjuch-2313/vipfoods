import api from "./api";

// ============================
// GET ALL PRODUCTS
// ============================
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", {
    params,
  });

  return response.data.products || [];
};

// ============================
// GET SINGLE PRODUCT
// ============================
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);

  return response.data.product;
};

// ============================
// HELPERS
// ============================
export function getWeightOptions(product) {
  if (!product?.weights) return [];

  return Object.entries(product.weights).map(([label, price]) => ({
    label,
    price,
  }));
}

export function getDefaultWeight(product) {
  const first = getWeightOptions(product)[0];
  return first?.label || "";
}

export function getProductPrice(product, weight) {
  return product?.weights?.[weight] ?? product?.price ?? 0;
}