import type { Metadata } from "next";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Checkout on CLORY WEARS — select your delivery state, get shipping fee, pay via transfer, upload receipt and confirm payment."
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}