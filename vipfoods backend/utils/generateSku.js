export const generateSku = (productName, weight) => {
  const prefix = productName
    .trim()
    .split(" ")
    .map(word => word.substring(0, 3))
    .join("")
    .toUpperCase();

  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `VIP-${prefix}-${weight}-${random}`;
};