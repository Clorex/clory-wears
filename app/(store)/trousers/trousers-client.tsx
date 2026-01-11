"use client";

import React, { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";

import ProductCard from "../../_components/ProductCard";
import { SEED_PRODUCTS } from "../../_data/seedProducts";
import { formatNgn } from "../../_lib/format";
import styles from "./Category.module.css";

type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";

function sortProducts(items: any[], sort: SortKey) {
  const arr = [...items];
  if (sort === "price-asc") return arr.sort((a, b) => a.priceNgn - b.priceNgn);
  if (sort === "price-desc") return arr.sort((a, b) => b.priceNgn - a.priceNgn);
  if (sort === "name-asc") return arr.sort((a, b) => a.name.localeCompare(b.name));
  return arr;
}

export default function TrousersClient() {
  const trousers = useMemo(
    () => SEED_PRODUCTS.filter((p) => p.category === "trousers"),
    []
  );

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = trousers;

    if (q) {
      items = items.filter((p) => {
        const hay = [p.name, p.subtitle, p.description, p.colors.join(" "), p.sizes.join(" ")]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return sortProducts(items, sort);
  }, [query, sort, trousers]);

  const minPrice = useMemo(() => Math.min(...trousers.map((p) => p.priceNgn)), [trousers]);
  const maxPrice = useMemo(() => Math.max(...trousers.map((p) => p.priceNgn)), [trousers]);

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={`${styles.heroText} fadeInUp`}>
            <div className={styles.badgeRow}>
              <span className="badge">
                <Sparkles size={16} />
                Trousers • {formatNgn(minPrice)} – {formatNgn(maxPrice)}
              </span>
            </div>
            <h1 className={styles.h1}>Trousers</h1>
            <p className={styles.sub}>
              Clean lines, premium drape, and confident fit. Choose a trouser, select your waist size and
              color, add to cart, then checkout.
            </p>
          </div>

          <div className={`${styles.filters} fadeInUp`}>
            <div className={styles.field}>
              <label className="label" htmlFor="trousers-search">
                Search trousers
              </label>
              <div className={styles.searchWrap}>
                <Search size={18} className={styles.searchIcon} aria-hidden="true" />
                <input
                  id="trousers-search"
                  className={`input ${styles.searchInput}`}
                  placeholder="Try: slim, cargo, black, 32…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className="label" htmlFor="trousers-sort">
                Sort
              </label>
              <select
                id="trousers-sort"
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

            <div className={styles.quickRow}>
              <div className={styles.count}>
                Showing <b>{filtered.length}</b> trouser{filtered.length === 1 ? "" : "s"}
              </div>
              <button
                type="button"
                className="btn btnGhost"
                onClick={() => {
                  setQuery("");
                  setSort("featured");
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {filtered.length === 0 ? (
            <div className={`${styles.empty} card fadeInUp`}>
              <div className={styles.emptyTitle}>No trousers found</div>
              <div className={styles.emptyText}>Try another search term or reset the filter.</div>
              <button
                type="button"
                className="btn btnPrimary"
                onClick={() => {
                  setQuery("");
                  setSort("featured");
                }}
              >
                Reset
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