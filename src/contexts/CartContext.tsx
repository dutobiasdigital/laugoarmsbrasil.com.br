"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number; // centavos
  quantity: number;
  variationId?: string;
  variationName?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variationId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variationId?: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "laugo_cart_v1";

function itemKey(productId: string, variationId?: string) {
  return productId + "|" + (variationId ?? "");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems]       = useState<CartItem[]>([]);
  const [ready, setReady]       = useState(false);
  const [drawerOpen, setDrawer] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const addItem = useCallback((incoming: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems(prev => {
      const k = itemKey(incoming.productId, incoming.variationId);
      const exists = prev.find(i => itemKey(i.productId, i.variationId) === k);
      if (exists) {
        return prev.map(i =>
          itemKey(i.productId, i.variationId) === k
            ? { ...i, quantity: i.quantity + (incoming.quantity ?? 1) }
            : i
        );
      }
      return [...prev, { ...incoming, quantity: incoming.quantity ?? 1 }];
    });
    setDrawer(true);
  }, []);

  const removeItem = useCallback((productId: string, variationId?: string) => {
    setItems(prev => prev.filter(i => itemKey(i.productId, i.variationId) !== itemKey(productId, variationId)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variationId?: string) => {
    const k = itemKey(productId, variationId);
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => itemKey(i.productId, i.variationId) !== k));
    } else {
      setItems(prev => prev.map(i => itemKey(i.productId, i.variationId) === k ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart   = useCallback(() => setItems([]), []);
  const openDrawer  = useCallback(() => setDrawer(true), []);
  const closeDrawer = useCallback(() => setDrawer(false), []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count, drawerOpen, openDrawer, closeDrawer }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
