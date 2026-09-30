import api from "./api";

// ============================
// GET ALL PRODUCTS
// ============================
export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data.products || [];
};

export const getShopProducts = async () => {
  const products = [];
  let page = 1;
  while (true) {
    const { data } = await api.get("/products", { params: { page, active: true } });
    const batch = data.products || [];
    products.push(...batch);
    if (batch.length < (data.resultPerPage || 12)) return products;
    page += 1;
  }
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
