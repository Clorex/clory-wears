import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowRight, ShieldCheck } from "lucide-react";
import styles from "./Terms.module.css";

export const metadata: Metadata = {
  title: "Terms",
  description: "CLORY WEARS Terms — orders, pricing, delivery, returns, and support."
};

export default function TermsPage() {
  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className="fadeInUp">
            <div className={styles.badgeRow}>
              <span className="badge">
                <FileText size={16} /> Terms & Conditions
              </span>
            </div>

            <h1 className={styles.h1}>Terms & Conditions</h1>
            <p className={styles.sub}>
              These terms help protect both you and CLORY WEARS. By using this website and placing an order,
              you agree to the terms below.
            </p>

            <div className={styles.ctas}>
              <Link href="/shop" className="btn btnPrimary">
                Continue shopping <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className="btn btnGhost">
                Contact support
              </Link>
            </div>
          </div>

          <div className={`${styles.side} fadeInUp`}>
            <div className={`${styles.sideCard} card`}>
              <div className={styles.sideTitle}>
                <ShieldCheck size={18} /> Key points
              </div>
              <ul className={styles.tips}>
                <li>Checkout requires an account for order tracking.</li>
                <li>Delivery fees depend on selected state.</li>
                <li>Order confirmation steps are guided during checkout.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`${styles.card} card fadeInUp`}>
            <div className={styles.cardTitle}>1) Orders & accounts</div>
            <p className={styles.p}>
              To place an order, you need an account (email/password). This allows you to track your order history and
              manage order-related actions from your account page.
            </p>

            <div className={styles.cardTitle}>2) Pricing</div>
            <p className={styles.p}>
              Prices are displayed in <b>NGN (₦)</b>. Delivery (shipping) is calculated at checkout based on your selected
              state and address.
            </p>

            <div className={styles.cardTitle}>3) Checkout & payment</div>
            <p className={styles.p}>
              After you place an order, checkout will guide you through the confirmation steps required to complete your
              purchase. For security and clarity, payment instructions are presented <b>during checkout</b>.
            </p>

            <div className={styles.cardTitle}>4) Delivery</div>
            <p className={styles.p}>
              Ensure your address and phone number are correct. Delivery timelines can vary depending on your location and
              logistics.
            </p>

            <div className={styles.cardTitle}>5) Returns & exchange</div>
            <p className={styles.p}>
              See our <Link href="/returns">Returns & Exchange</Link> page for eligibility and guidance.
            </p>

            <div className={styles.cardTitle}>6) Support</div>
            <p className={styles.p}>
              If you have a question or issue, contact us via the <Link href="/contact">Contact</Link> page.
              If you already placed an order, include your order reference for faster support.
            </p>

            <div className={styles.small}>
              Last updated:{" "}
              {new Date().toLocaleDateString("en-NG", {
                year: "numeric",
                month: "short",
                day: "2-digit"
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}