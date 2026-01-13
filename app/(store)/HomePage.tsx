import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Truck, Sparkles } from "lucide-react";

import styles from "./Home.module.css";
import { SEED_PRODUCTS } from "../_data/seedProducts";
import ProductCard from "../_components/ProductCard";

export default function HomePage() {
  const featured = SEED_PRODUCTS.slice(0, 4);

  const trousers = SEED_PRODUCTS.filter((p) => p.category === "trousers");
  const shirts = SEED_PRODUCTS.filter((p) => p.category === "shirts");

  const trouserCover = trousers[0]?.images?.[0] ?? "/images/trouser-1.jpg";
  const shirtCover = shirts[0]?.images?.[0] ?? "/images/shirt-1.jpg";

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={`${styles.heroText} fadeInUp`}>
            <div className={styles.heroBadge}>
              <span className="badge">
                <Sparkles size={16} />
                Premium pieces • Clean cuts • Confident fits
              </span>
            </div>

            <h1 className={styles.heroTitle}>
              CLORY WEARS — Premium <span className={styles.pink}>Trousers</span> &{" "}
              <span className={styles.pink}>Shirts</span>
            </h1>

            <p className={styles.heroDesc}>
              Step out with confidence. Explore premium shirts and trousers made for sharp looks, comfort,
              and everyday wear—work, outings, and events.
            </p>

            <div className={styles.heroCtas}>
              <Link href="/shop" className="btn btnPrimary">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link href="/size-guide" className="btn btnGhost">
                Size Guide
              </Link>
            </div>

            <div className={styles.heroTrust}>
              <div className={styles.trustItem}>
                <Truck size={18} />
                <span>State-based delivery fees</span>
              </div>
              <div className={styles.trustItem}>
                <BadgeCheck size={18} />
                <span>Quality finishing & clean stitching</span>
              </div>
              <div className={styles.trustItem}>
                <BadgeCheck size={18} />
                <span>Easy checkout with order tracking</span>
              </div>
            </div>
          </div>

          <div className={`${styles.heroVisual} fadeInUp`}>
            <div className={styles.visualCard}>
              <div className={styles.visualTop}>
                <div className={styles.visualChip}>New arrivals</div>
                <div className={styles.visualChipAlt}>CLORY WEARS</div>
              </div>

              <div className={styles.visualGrid}>
                <div className={styles.visualImg}>
                  <Image
                    src={trouserCover}
                    alt="Featured trouser"
                    fill
                    sizes="(max-width: 900px) 90vw, 520px"
                    className={styles.img}
                    priority
                  />
                </div>
                <div className={styles.visualImg}>
                  <Image
                    src={shirtCover}
                    alt="Featured shirt"
                    fill
                    sizes="(max-width: 900px) 90vw, 520px"
                    className={styles.img}
                    priority
                  />
                </div>
              </div>

              <div className={styles.visualBottom}>
                <div className={styles.visualBottomTitle}>How ordering works</div>
                <ol className={styles.steps}>
                  <li>Pick your product, size, and color</li>
                  <li>Checkout and confirm delivery details</li>
                  <li>Follow the guided payment confirmation step</li>
                </ol>

                <Link href="/shop" className={styles.visualLink}>
                  Browse all products <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className={`${styles.sectionHead} fadeInUp`}>
            <h2 className={styles.h2}>Shop by Category</h2>
            <p className={styles.sub}>
              Pick your lane—then choose the fit, color and size that matches your style.
            </p>
          </div>

          <div className={styles.categoryGrid}>
            <Link href="/trousers" className={`${styles.categoryCard} fadeInUp`}>
              <div className={styles.categoryImage}>
                <Image
                  src={trouserCover}
                  alt="Trousers"
                  fill
                  sizes="(max-width: 900px) 90vw, 520px"
                  className={styles.img}
                />
              </div>
              <div className={styles.categoryBody}>
                <div className={styles.categoryTitle}>Trousers</div>
                <div className={styles.categoryText}>
                  Slim, straight, tapered, formal and cargo styles—premium finishing and clean drape.
                </div>
                <div className={styles.categoryCta}>
                  Explore Trousers <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            <Link href="/shirts" className={`${styles.categoryCard} fadeInUp`}>
              <div className={styles.categoryImage}>
                <Image
                  src={shirtCover}
                  alt="Shirts"
                  fill
                  sizes="(max-width: 900px) 90vw, 520px"
                  className={styles.img}
                />
              </div>
              <div className={styles.categoryBody}>
                <div className={styles.categoryTitle}>Shirts</div>
                <div className={styles.categoryText}>
                  Crisp collars, clean cuffs, and confident fits—from office looks to outings.
                </div>
                <div className={styles.categoryCta}>
                  Explore Shirts <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section">
        <div className="container">
          <div className={`${styles.sectionHead} fadeInUp`}>
            <h2 className={styles.h2}>Best Sellers</h2>
            <p className={styles.sub}>
              Customer favorites—clean pieces that deliver strong fits and sharp looks.
            </p>
          </div>

          <div className={styles.productGrid}>
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className={styles.centerCta}>
            <Link href="/shop" className="btn btnPrimary">
              View Full Catalog <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* SHORT NOTES */}
      <section className={styles.notes}>
        <div className="container">
          <div className={`${styles.notesCard} card fadeInUp`}>
            <h3 className={styles.h3}>Quick Notes</h3>

            <div className={styles.noteGrid}>
              <div className={styles.noteItem}>
                <div className={styles.noteTitle}>Delivery</div>
                <div className={styles.noteText}>
                  Delivery fees depend on your state. Select your state at checkout to see the exact fee.
                </div>
              </div>

              <div className={styles.noteItem}>
                <div className={styles.noteTitle}>Payments</div>
                <div className={styles.noteText}>
                  Checkout includes a guided payment confirmation step so we can verify and process your order smoothly.
                </div>
              </div>

              <div className={styles.noteItem}>
                <div className={styles.noteTitle}>Returns</div>
                <div className={styles.noteText}>
                  If your size doesn’t fit, we’ll guide you through exchange based on our policy page.
                </div>
              </div>

              <div className={styles.noteItem}>
                <div className={styles.noteTitle}>Account</div>
                <div className={styles.noteText}>
                  Create an account to track orders and manage receipt uploads easily from your personalized page.
                </div>
              </div>
            </div>

            <div className={styles.notesCtas}>
              <Link href="/login" className="btn btnGhost">
                Login / Register
              </Link>
              <Link href="/contact" className="btn btnPrimary">
                Contact Support <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}