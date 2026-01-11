import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SEED_PRODUCTS } from "../../../_data/seedProducts";
import ProductClient from "./product-client";

type PageProps = {
  params: { slug: string };
};

function getProductBySlug(slug: string) {
  return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export function generateMetadata({ params }: PageProps): Metadata {
  const product = getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product not found",
      description: "The product you are looking for does not exist on CLORY WEARS."
    };
  }

  const img = product.images?.[0] ?? "/images/placeholder.jpg";

  return {
    title: product.name,
    description: product.subtitle,
    openGraph: {
      title: `${product.name} — CLORY WEARS`,
      description: product.subtitle,
      images: [{ url: img }]
    }
  };
}

export default function ProductPage({ params }: PageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  return <ProductClient product={product} />;
}