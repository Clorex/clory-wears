"use client";

import React, { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

import ProductCard from "../../_components/ProductCard";
import { SEED_PRODUCTS, type Product, type ProductCategory } from "../../_data/seedProducts";
import { formatNgn } from "../../_lib/format";
import styles from "./Shop.module.css";

type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";

function sortProducts(items: Product[], sort: SortKey): Product[] {
  const arr = [...items];

  if (sort === "price-asc") return arr.sort((a, b) => a.priceNgn - b.priceNgn);
  if (sort === "price-desc") return arr.sort((a, b) => b.priceNgn - a.priceNgn);
  if (sort === "name-asc") return arr.sort((a, b) => a.name.localeCompare(b.name));

  // featured: keep original seed order (curated feel)
  return arr;
}

export default function ShopClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | ProductCategory>("all");
  const [sort, setSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let items = SEED_PRODUCTS;

    if (category !== "all") {
      items = items.filter((p) => p.category === category);
    }

    if (q) {
      items = items.filter((p) => {
        const hay = [
          p.name,
          p.subtitle,
          p.description,
          p.category,
          p.colors.join(" "),
          p.sizes.join(" ")
        ]
          .join(" ")
          .toLowerCase();

        return hay.includes(q);
      });
    }

    return sortProducts(items, sort);
  }, [query, category, sort]);

  const minPrice = useMemo(() => Math.min(...SEED_PRODUCTS.map((p) => p.priceNgn)), []);
  const maxPrice = useMemo(() => Math.max(...SEED_PRODUCTS.map((p) => p.priceNgn)), []);

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={`${styles.heroText} fadeInUp`}>
            <div className={styles.badgeRow}>
              <span className="badge">
                <Sparkles size={16} />
                All products • {formatNgn(minPrice)} – {formatNgn(maxPrice)}
              </span>
            </div>

            <h1 className={styles.h1}>Shop CLORY WEARS</h1>
            <p className={styles.sub}>
              Browse the full catalog. Choose your size and color on each product page, add to cart,
              then checkout to get payment instructions and upload your receipt.
            </p>
          </div>

          <div className={`${styles.filters} fadeInUp`} aria-label="Shop filters">
            <div className={styles.filterHead}>
              <div className={styles.filterTitle}>
                <SlidersHorizontal size={18} />
                Filter & Sort
              </div>
              <div className={styles.count}>
                Showing <b>{filtered.length}</b> item{filtered.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className={styles.filterGrid}>
              <div className={styles.field}>
                <label className="label" htmlFor="shop-search">
                  Search
                </label>
                <div className={styles.searchWrap}>
                  <Search size={18} className={styles.searchIcon} aria-hidden="true" />
                  <input
                    id="shop-search"
                    className={`input ${styles.searchInput}`}
                    placeholder="Search trousers, shirts, colors, sizes…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="helper">Tip: try “Wine”, “Black”, “32”, “XL”.</div>
              </div>

              <div className={styles.field}>
                <label className="label" htmlFor="shop-category">
                  Category
                </label>
                <select
                  id="shop-category"
                  className="select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="all">All</option>
                  <option value="trousers">Trousers</option>
                  <option value="shirts">Shirts</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className="label" htmlFor="shop-sort">
                  Sort by
                </label>
                <select
                  id="shop-sort"
                  className="select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="name-asc">Name: A → Z</option>
                </select>
              </div>
            </div>

            <div className={styles.quickRow}>
              <button
                type="button"
                className={`btn btnGhost ${styles.quickBtn}`}
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setSort("featured");
                }}
              >
                Reset filters
              </button>

              <div className={styles.miniNote}>
                Payments are via <b>OPay transfer</b>, then receipt upload at checkout.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {filtered.length === 0 ? (
            <div className={`${styles.empty} card fadeInUp`}>
              <div className={styles.emptyTitle}>No results found</div>
              <div className={styles.emptyText}>
                Try a different keyword, switch category, or reset filters.
              </div>
              <button
                type="button"
                className="btn btnPrimary"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setSort("featured");
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}