'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: number;
  productId?: string;  // Printify product ID (string)
  variantId: number;
  title: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: number, variantId: number, quantity: number) => void;
  removeFromCart: (id: number, variantId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Load cart from localStorage on mount
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('printify-cart');
        if (!savedCart) return [];
        
        const parsedCart = JSON.parse(savedCart);
        // Validate that all items have required variantId field
        // If old cart items exist without variantId, clear the cart
        const isValid = Array.isArray(parsedCart) && parsedCart.every((item: any) => 
          item.id && item.variantId && item.title && item.price !== undefined && item.quantity
        );
        
        return isValid ? parsedCart : [];
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        return [];
      }
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('printify-cart', JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) => i.id === item.id && i.variantId === item.variantId ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i);
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (id: number, variantId: number) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.variantId === variantId)));
  };

  const updateQuantity = (id: number, variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, variantId);
      return;
    }
    setCart((prev) => prev.map((i) => i.id === id && i.variantId === variantId ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
