/* eslint-disable react/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("vipfoods_cart") || "[]");
      return Array.isArray(saved) ? saved.filter(item => item?.id && Number.isInteger(item.quantity) && item.quantity > 0) : [];
    } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem("vipfoods_cart", JSON.stringify(cartItems)); }
    catch { /* Continue in memory when browser storage is unavailable. */ }
  }, [cartItems]);
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("vipfoods_wishlist") || "[]");
      return Array.isArray(saved) ? saved.filter((item) => item?.id || item?._id).map(item => ({ ...item, id: item.id || item._id })) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("vipfoods_wishlist", JSON.stringify(wishlistItems));
    } catch {
      // Keep the wishlist usable if browser storage is unavailable.
    }
  }, [wishlistItems]);

  // Create unique key for cart items based on product id and weight
  const getCartItemKey = (product) => `${product.id}-${product.weight || 'default'}`;

  const addToCart = (product) => {
    setCartItems((current) => {
      const cartKey = getCartItemKey(product);
      const existing = current.find((item) => getCartItemKey(item) === cartKey);
      if (existing) {
        return current.map((item) =>
          getCartItemKey(item) === cartKey ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, weight) => {
    setCartItems((current) =>
      current.filter((item) => !(item.id === productId && item.weight === weight))
    );
  };

  const updateCartQuantity = (productId, weight, quantity) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === productId && item.weight === weight ? { ...item, quantity } : item
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleWishlist = (product) => {
    const id = product._id || product.id;
    if (!id) return;
    setWishlistItems((current) => {
      const exists = current.find((item) => item.id === id);
      if (exists) {
        return current.filter((item) => item.id !== id);
      }
      const variant = product.variants?.find((item) => String(item.weight) === String(product.weight)) || product.variants?.[0];
      const price = variant?.sellingPrice ?? product.offerPrice ?? product.price ?? 0;
      return [...current, {
        ...product,
        id,
        image: product.image || product.images?.[0] || "",
        weight: variant?.weight ?? product.weight ?? Object.keys(product.weights || {})[0] ?? "",
        sku: variant?.sku || product.sku || "",
        price,
        offerPrice: price,
      }];
    });
  };

  const value = useMemo(
    () => ({
      cartItems,
      wishlistItems,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
    }),
    [cartItems, wishlistItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
