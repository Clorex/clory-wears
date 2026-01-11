import type { Metadata } from "next";
import CartClient from "./cart-client";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your items, adjust quantity, then proceed to checkout on CLORY WEARS."
};

export default function CartPage() {
  return <CartClient />;
}