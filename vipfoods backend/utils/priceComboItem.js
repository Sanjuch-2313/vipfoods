import ComboOffer from "../models/ComboOffer.js";
import Product from "../models/Product.js";
import { normalizeComboSize } from "./comboSizes.js";
import { paymentError, toPaise } from "./razorpayPayment.js";

export async function priceComboItem(item) {
  const offer = await ComboOffer.findById(item.comboOffer);
  if (!offer?.active || !Number.isInteger(item.quantity) || item.quantity < 1) throw paymentError("This combo is unavailable.");
  const selections = item.comboSelections;
  if (!Array.isArray(selections) || !selections.length) throw paymentError("Choose items for your combo.");
  const products = await Product.find({ _id: { $in: selections.map((selection) => selection.product) }, isDeleted: false, active: true, published: true });
  let count = 0;
  const seen = new Set();
  const resolved = selections.map((selection) => {
    const product = products.find((product) => String(product._id) === String(selection.product));
    const variant = product?.variants.find((variant) => String(variant._id) === String(selection.variantId));
    const key = `${selection.product}:${selection.variantId}`;
    if (!variant || variant.inStock === false || normalizeComboSize(variant.weight) !== normalizeComboSize(offer.size) ||
        !Number.isInteger(selection.quantity) || selection.quantity < 1 || seen.has(key)) {
      throw paymentError("One of your combo items or sizes is unavailable. Please choose again.");
    }
    count += selection.quantity;
    seen.add(key);
    return { product: product._id, variantId: variant._id, productName: product.name, size: variant.weight, quantity: selection.quantity };
  });
  if (count !== offer.itemCount) throw paymentError(`Choose exactly ${offer.itemCount} items for this combo.`);
  const price = toPaise(offer.price) / 100;
  return { ...item, product: undefined, comboOffer: offer._id, productName: offer.name,
    image: offer.image || products[0]?.images?.[0] || "", comboSelections: resolved, variant: { weight: offer.size, price }, total: toPaise(price * item.quantity) / 100 };
}
