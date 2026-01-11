import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "../_data/seedProducts";
import { formatNgn, truncate } from "../_lib/format";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0] ?? "/images/placeholder.jpg";

  return (
    <Link href={`/product/${product.slug}`} className={`${styles.card} fadeInUp`}>
      <div className={styles.imageWrap}>
        <Image
          src={img}
          alt={product.name}
          fill
          sizes="(max-width: 900px) 90vw, 320px"
          className={styles.image}
          priority={false}
        />

        <div className={styles.tagRow}>
          <span className={styles.tag}>{product.category === "trousers" ? "Trousers" : "Shirt"}</span>
          <span className={styles.tagAlt}>{formatNgn(product.priceNgn)}</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <div className={styles.title}>{product.name}</div>
          <span className={styles.icon} aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
        </div>

        <div className={styles.subtitle}>{truncate(product.subtitle, 72)}</div>

        <div className={styles.meta}>
          <div className={styles.metaLine}>
            <span className={styles.metaKey}>Colors:</span>{" "}
            <span className={styles.metaVal}>{product.colors.slice(0, 3).join(", ")}</span>
          </div>
          <div className={styles.metaLine}>
            <span className={styles.metaKey}>Sizes:</span>{" "}
            <span className={styles.metaVal}>{product.sizes.slice(0, 5).join(", ")}</span>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <span className={styles.cta}>View details</span>
        </div>
      </div>
    </Link>
  );
}