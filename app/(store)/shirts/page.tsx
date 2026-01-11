import type { Metadata } from "next";
import ShirtsClient from "./shirts-client";

export const metadata: Metadata = {
  title: "Shirts",
  description: "Shop premium shirts from CLORY WEARS — crisp collars, clean cuffs, confident fits."
};

export default function ShirtsPage() {
  return <ShirtsClient />;
}