/* eslint-disable react/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

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

  const toggleWishlist = (product) => {
    setWishlistItems((current) => {
      const exists = current.find((item) => item.id === product.id);
      if (exists) {
        return current.filter((item) => item.id !== product.id);
      }
      return [...current, product];
    });
  };

  const value = useMemo(
    () => ({
      cartItems,
      wishlistItems,
      addToCart,
      removeFromCart,
      updateCartQuantity,
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
