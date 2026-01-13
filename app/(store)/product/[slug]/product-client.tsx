"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Check, ChevronLeft, Minus, Plus, ShoppingBag, Info } from "lucide-react";

import type { Product } from "../../../_data/seedProducts";
import { formatNgn } from "../../../_lib/format";
import { useCart } from "../../../_providers/CartProvider";
import { useToast } from "../../../_providers/ToastProvider";
import styles from "./Product.module.css";

export default function ProductClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { show } = useToast();

  const images = product.images?.length ? product.images : ["/images/placeholder.jpg"];

  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState(product.colors?.[0] ?? "Default");
  const [size, setSize] = useState(product.sizes?.[0] ?? "One size");
  const [qty, setQty] = useState(1);

  const total = useMemo(() => product.priceNgn * qty, [product.priceNgn, qty]);

  function clampQty(n: number) {
    return Math.max(1, Math.min(10, Math.floor(n)));
  }

  const selectedImage = images[Math.min(activeImg, images.length - 1)];

  return (
    <div className={styles.wrap}>
      <div className="container">
        <div className={`${styles.breadcrumbs} fadeInUp`}>
          <Link href="/shop" className={styles.backLink}>
            <ChevronLeft size={16} />
            Back to Shop
          </Link>

          <div className={styles.crumbTrail} aria-label="Breadcrumb">
            <Link href="/" className={styles.crumb}>
              Home
            </Link>
            <span className={styles.crumbSep}>/</span>
            <Link href={`/${product.category}`} className={styles.crumb}>
              {product.category === "trousers" ? "Trousers" : "Shirts"}
            </Link>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbCurrent}>{product.name}</span>
          </div>
        </div>

        <section className={`${styles.grid} fadeInUp`}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 980px) 95vw, 560px"
                className={styles.mainImg}
              />

              <div className={styles.pricePill}>{formatNgn(product.priceNgn)}</div>
            </div>

            <div className={styles.thumbs} aria-label="Product images">
              {images.map((src, idx) => {
                const active = idx === activeImg;
                return (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    className={`${styles.thumbBtn} ${active ? styles.thumbActive : ""}`}
                    onClick={() => setActiveImg(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <div className={styles.thumbImage}>
                      <Image
                        src={src}
                        alt={`${product.name} image ${idx + 1}`}
                        fill
                        sizes="92px"
                        className={styles.thumbImg}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info + Variants */}
          <div className={styles.panel}>
            <div className={styles.top}>
              <div className={styles.categoryTag}>
                {product.category === "trousers" ? "Trousers" : "Shirts"}
              </div>

              <h1 className={styles.h1}>{product.name}</h1>
              <div className={styles.subtitle}>{product.subtitle}</div>
            </div>

            <div className={styles.desc}>{product.description}</div>

            <div className={styles.variantBlock}>
              <div>
                <div className={styles.variantTitle}>Choose color</div>
                <div className={styles.chips}>
                  {product.colors.map((c) => {
                    const active = c === color;
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                        onClick={() => setColor(c)}
                      >
                        {active ? <Check size={16} /> : null}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className={styles.variantTitle}>Choose size</div>
                <div className={styles.chips}>
                  {product.sizes.map((s) => {
                    const active = s === size;
                    return (
                      <button
                        key={s}
                        type="button"
                        className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                        onClick={() => setSize(s)}
                      >
                        {active ? <Check size={16} /> : null}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.qtyRow}>
              <div>
                <div className={styles.qtyLabel}>Quantity</div>
                <div className={styles.qtyHint}>Max 10 per order</div>
              </div>

              <div className={styles.qtyControls}>
                <button
                  type="button"
                  className={`btn btnGhost ${styles.qtyBtn}`}
                  onClick={() => setQty((q) => clampQty(q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>

                <div className={styles.qtyBox} aria-label={`Quantity: ${qty}`}>
                  {qty}
                </div>

                <button
                  type="button"
                  className={`btn btnGhost ${styles.qtyBtn}`}
                  onClick={() => setQty((q) => clampQty(q + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className={styles.totalRow}>
              <div className={styles.totalLabel}>Total</div>
              <div className={styles.totalValue}>{formatNgn(total)}</div>
            </div>

            <div className={styles.ctas}>
              <button
                type="button"
                className="btn btnPrimary"
                onClick={() => {
                  addItem(
                    {
                      id: product.id,
                      name: product.name,
                      category: product.category,
                      priceNgn: product.priceNgn,
                      image: selectedImage,
                      size,
                      color
                    },
                    qty
                  );

                  show({
                    kind: "success",
                    title: "Added to cart",
                    message: `${product.name} • ${color} • ${size} (x${qty})`
                  });
                }}
              >
                <ShoppingBag size={18} />
                Add to cart
              </button>

              <Link href="/cart" className="btn btnGhost">
                View cart
              </Link>
            </div>

            {/* Luxury-first info (no payment talk here) */}
            <div className={styles.infoBox}>
              <div className={styles.infoTitle}>
                <Info size={18} /> Delivery & fit note
              </div>
              <div className={styles.infoText}>
                Delivery fees are calculated at checkout based on your state. Need help choosing a size?
                Check the <Link href="/size-guide">Size Guide</Link> or <Link href="/contact">Contact support</Link>.
              </div>
            </div>

            <div className={styles.split}>
              <div className={styles.listBlock}>
                <div className={styles.listTitle}>Highlights</div>
                <ul className={styles.list}>
                  {product.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.listBlock}>
                <div className={styles.listTitle}>Details</div>
                <ul className={styles.list}>
                  {product.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.bottomNote}>
              Want a clean fit recommendation? Tell us your preferred look (fitted or relaxed) on the{" "}
              <Link href="/contact">Contact</Link> page.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}