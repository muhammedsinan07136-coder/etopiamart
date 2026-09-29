import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  freeShippingThreshold: number;
}

const CART_STORAGE_KEY = 'etopiamart_cart_v1';
const FREE_SHIPPING_THRESHOLD = 0; // FREE Delivery across India
const STANDARD_DELIVERY_FEE = 0;  // 0 delivery charges

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    if (product.stock <= 0) {
      showToast('Out of Stock', `${product.name} is currently out of stock.`, 'error');
      return;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      
      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].quantity;
        const newQty = currentQty + quantityToAdd;

        if (newQty > product.stock) {
          showToast('Stock Limit Reached', `Only ${product.stock} units available in stock.`, 'info');
          return prevCart;
        }

        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        };
        return updated;
      } else {
        if (quantityToAdd > product.stock) {
          showToast('Stock Limit Reached', `Only ${product.stock} units available in stock.`, 'info');
          return prevCart;
        }
        return [...prevCart, { product, quantity: quantityToAdd }];
      }
    });

    showToast('Added to Cart', `${product.name} added to your cart.`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    showToast('Item Removed', 'Product removed from your cart.', 'info');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      const item = prevCart.find(i => i.product.id === productId);
      if (item && quantity > item.product.stock) {
        showToast('Stock Limit Reached', `Maximum ${item.product.stock} available.`, 'info');
        return prevCart;
      }
      return prevCart.map(i => i.product.id === productId ? { ...i, quantity } : i);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Free delivery across India
  const deliveryCharge = 0;
  const totalAmount = subtotal + deliveryCharge;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        deliveryCharge,
        totalAmount,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
