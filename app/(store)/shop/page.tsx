import type { Metadata } from "next";
import ShopClient from "./shop-client";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse all CLORY WEARS products — shirts and trousers with premium finishing."
};

export default function ShopPage() {
  return <ShopClient />;
}