import type { Metadata } from "next";
import TrousersClient from "./trousers-client";

export const metadata: Metadata = {
  title: "Trousers",
  description: "Shop premium trousers from CLORY WEARS — slim, straight, tapered, formal and cargo styles."
};

export default function TrousersPage() {
  return <TrousersClient />;
}