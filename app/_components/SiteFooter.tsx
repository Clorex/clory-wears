import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={`${styles.top} fadeInUp`}>
          <div className={styles.brandBlock}>
            <div className={styles.brandRow}>
              <span className={styles.brandMark} />
              <div className={styles.brandText}>
                <div className={styles.brandName}>CLORY WEARS</div>
                <div className={styles.tagline}>
                  Premium essentials — clean cuts, confident fits.
                </div>
              </div>
            </div>

            <div className={styles.note}>
              Designed for sharp everyday looks: office, outings, and events. Crafted for comfort, structure, and confidence.
            </div>
          </div>

          <div className={styles.linksBlock}>
            <div className={styles.col}>
              <div className={styles.colTitle}>Shop</div>
              <Link className={styles.link} href="/shop">
                All Products
              </Link>
              <Link className={styles.link} href="/trousers">
                Trousers
              </Link>
              <Link className={styles.link} href="/shirts">
                Shirts
              </Link>
              <Link className={styles.link} href="/cart">
                Cart
              </Link>
            </div>

            <div className={styles.col}>
              <div className={styles.colTitle}>Support</div>
              <Link className={styles.link} href="/contact">
                Contact
              </Link>
              <Link className={styles.link} href="/size-guide">
                Size Guide
              </Link>
              <Link className={styles.link} href="/returns">
                Returns & Exchange
              </Link>
              <Link className={styles.link} href="/terms">
                Terms
              </Link>
            </div>

            <div className={styles.col}>
              <div className={styles.colTitle}>Account</div>
              <Link className={styles.link} href="/login">
                Login / Register
              </Link>
              <Link className={styles.link} href="/account">
                My Orders
              </Link>
              <div className={styles.small}>
                Sign in to track orders and manage your details smoothly.
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.copy}>© {year} CLORY WEARS. All rights reserved.</div>
          <div className={styles.mini}>Luxury in pink & white.</div>
        </div>
      </div>
    </footer>
  );
}