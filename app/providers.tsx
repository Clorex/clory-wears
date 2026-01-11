"use client";

import React from "react";
import { AuthProvider } from "./_providers/AuthProvider";
import { CartProvider } from "./_providers/CartProvider";
import { ToastProvider } from "./_providers/ToastProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}