/* eslint-disable react/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../services/api";
import { useAuth } from "./AuthContext";

const CART_STORAGE_KEY = "vipfoods_cart";
const WISHLIST_STORAGE_KEY = "vipfoods_wishlist";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, isLoggedIn, updateUserProfile } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("CART STORAGE ERROR:", error);
      return [];
    }
  });
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("WISHLIST STORAGE ERROR:", error);
      return [];
    }
  });

  useEffect(() => {
    if (isLoggedIn && Array.isArray(user?.cart)) {
      setCartItems(user.cart);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(user.cart));
      return;
    }

    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      setCartItems(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error("CART RESTORE ERROR:", error);
      setCartItems([]);
    }
  }, [isLoggedIn, user?.cart]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("CART SAVE ERROR:", error);
    }

    if (!isLoggedIn) return;

    const timer = setTimeout(() => {
      api
        .put("/auth/profile", { cart: cartItems })
        .then(({ data }) => {
          if (data?.user) {
            updateUserProfile(data.user);
          }
        })
        .catch((error) => {
          console.error("CART SYNC ERROR:", error);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [cartItems, isLoggedIn, updateUserProfile]);

  useEffect(() => {
    if (isLoggedIn && Array.isArray(user?.wishlist)) {
      setWishlistItems(user.wishlist);
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(user.wishlist));
      return;
    }

    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      setWishlistItems(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error("WISHLIST RESTORE ERROR:", error);
      setWishlistItems([]);
    }
  }, [isLoggedIn, user?.wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error("WISHLIST SAVE ERROR:", error);
    }

    if (!isLoggedIn) return;

    const timer = setTimeout(() => {
      api
        .put("/auth/profile", { wishlist: wishlistItems })
        .then(({ data }) => {
          if (data?.user) {
            updateUserProfile(data.user);
          }
        })
        .catch((error) => {
          console.error("WISHLIST SYNC ERROR:", error);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [wishlistItems, isLoggedIn, updateUserProfile]);

  const getCartItemKey = (product) => `${product.id}-${product.weight || "default"}`;

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
