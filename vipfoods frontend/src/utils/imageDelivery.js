// Optimize unsigned Cloudinary uploads without changing stored image URLs.
export function imageDelivery(src, width = 640) {
  if (typeof src !== "string") return src;
  const match = src.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/);
  return match ? `${match[1]}f_auto,q_auto,c_limit,w_${width}/${match[2]}` : src;
}
