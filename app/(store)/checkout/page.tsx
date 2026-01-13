import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Checkout on CLORY WEARS — confirm delivery details, then complete your order through the guided confirmation step."
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="section">
          <div className="container">
            <div className="card" style={{ padding: 18 }}>
              Loading checkout…
            </div>
          </div>
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}