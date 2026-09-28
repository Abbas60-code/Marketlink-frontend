import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'marketlink_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      const stockLimit = (product.stock !== undefined && product.stock !== null && !isNaN(product.stock))
        ? Number(product.stock)
        : 9999;
      if (existing) {
        const currentQty = existing.cartQty || existing.quantity || 1;
        const newQty = Math.min(currentQty + quantity, stockLimit);
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, cartQty: newQty, quantity: newQty }
            : item
        );
      }
      const initialQty = Math.min(quantity, stockLimit);
      return [...prev, { ...product, cartQty: initialQty, quantity: initialQty }];
    });
    // Auto-open drawer when product is added
    setDrawerOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id !== productId) return item;
        const stockLimit = (item.stock !== undefined && item.stock !== null && !isNaN(item.stock))
          ? Number(item.stock)
          : 9999;
        const validQty = Math.min(qty, stockLimit);
        return { ...item, cartQty: validQty, quantity: validQty };
      })
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, item) => sum + (Number(item.cartQty || item.quantity) || 1), 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.cartQty || item.quantity) || 1), 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQty, updateQuantity: updateQty, clearCart,
      cartCount, cartTotal,
      drawerOpen, openDrawer, closeDrawer,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
