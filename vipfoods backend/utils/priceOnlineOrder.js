import { normalizeComboSize } from "./comboSizes.js";
import { priceComboItem } from "./priceComboItem.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { paymentError, toPaise } from "./razorpayPayment.js";

export async function priceOnlineOrder(inputItems, couponId) {
  let items = inputItems;
  let subtotal;
  let discount = 0;
  if (!Array.isArray(items) || !items.length) throw paymentError("Your cart is empty.");
  const products = await Product.find({ _id: { $in: items.filter((item) => !item.comboOffer).map((item) => item.product) } });
  items = await Promise.all(items.map(async (item) => {
    if (item.comboOffer) return priceComboItem(item);
    const product = products.find((product) => String(product._id) === String(item.product));
    const variant = product?.variants.find((variant) => item.variant?.sku
      ? variant.sku === item.variant.sku : normalizeComboSize(variant.weight) === normalizeComboSize(item.variant?.weight));
    if (!variant || !Number.isInteger(item.quantity) || item.quantity < 1) throw paymentError("Invalid product or quantity. Please refresh your cart.");
    const price = toPaise(variant.sellingPrice) / 100;
    return { ...item, variant: { ...item.variant, price }, total: toPaise(price * item.quantity) / 100 };
  }));
  subtotal = items.reduce((sum, item) => sum + toPaise(item.total), 0) / 100;
  discount = 0;
  if (couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon || coupon.expiry < new Date() || subtotal < coupon.minOrder ||
        (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) || coupon.categoryScope !== "all") {
      throw paymentError("Coupon is no longer valid. Please review checkout.");
    }
    discount = toPaise(subtotal * coupon.discount / 100) / 100;
  }
  return { items, subtotal, discount };
}
