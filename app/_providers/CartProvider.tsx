"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string; // product id or slug
  name: string;
  category: "trousers" | "shirts";
  priceNgn: number;

  image: string; // e.g. "/images/trouser-1.jpg"

  // variants
  size: string; // e.g. "M", "32", etc.
  color: string; // e.g. "Black", "Wine"

  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (key: { id: string; size: string; color: string }) => void;
  setQuantity: (key: { id: string; size: string; color: string }, quantity: number) => void;
  clearCart: () => void;

  totalItems: number;
  subtotalNgn: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "clorywears_cart_v1";

function keyOf(i: { id: string; size: string; color: string }) {
  return `${i.id}__${i.size}__${i.color}`.toLowerCase();
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart once
  useEffect(() => {
    const data = safeParse<CartItem[]>(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(data)) {
      // minimal validation
      const cleaned = data
        .filter((x) => x && typeof x.id === "string" && typeof x.quantity === "number")
        .map((x) => ({ ...x, quantity: Math.max(1, Math.min(99, Math.floor(x.quantity))) }));
      setItems(cleaned);
    }
  }, []);

  // Persist cart
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    const quantity = Math.max(1, Math.min(99, Math.floor(qty)));

    setItems((prev) => {
      const k = keyOf(item);
      const idx = prev.findIndex((p) => keyOf(p) === k);

      if (idx === -1) {
        return [...prev, { ...item, quantity }];
      }

      const next = [...prev];
      next[idx] = { ...next[idx], quantity: Math.min(99, next[idx].quantity + quantity) };
      return next;
    });
  };

  const removeItem: CartContextValue["removeItem"] = ({ id, size, color }) => {
    const k = keyOf({ id, size, color });
    setItems((prev) => prev.filter((p) => keyOf(p) !== k));
  };

  const setQuantity: CartContextValue["setQuantity"] = ({ id, size, color }, quantity) => {
    const q = Math.max(1, Math.min(99, Math.floor(quantity)));
    const k = keyOf({ id, size, color });

    setItems((prev) =>
      prev.map((p) => (keyOf(p) === k ? { ...p, quantity: q } : p))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotalNgn = useMemo(
    () => items.reduce((sum, i) => sum + i.priceNgn * i.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      totalItems,
      subtotalNgn,
    }),
    [items, totalItems, subtotalNgn]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}