import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowRight, ShieldCheck } from "lucide-react";
import styles from "./Terms.module.css";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "CLORY WEARS Terms — store rules, payment process, delivery notes, and responsibilities."
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
                <li>Checkout requires an account for order tracking and receipt uploads.</li>
                <li>Payment is via transfer and confirmed manually after receipt review.</li>
                <li>Delivery fees depend on selected state.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`${styles.card} card fadeInUp`}>
            <div className={styles.cardTitle}>1) Orders & account</div>
            <p className={styles.p}>
              To place an order, you need an account (email/password). This helps us link your order,
              receipt upload and confirmation to your profile.
            </p>

            <div className={styles.cardTitle}>2) Pricing</div>
            <p className={styles.p}>
              Prices are displayed in <b>NGN (₦)</b>. Shipping is added at checkout based on your selected state.
            </p>

            <div className={styles.cardTitle}>3) Payment method (Transfer)</div>
            <p className={styles.p}>
              Payment is made via transfer to our OPay account. After payment, you upload your receipt and click{" "}
              <b>I have made payment</b>. We then review and confirm.
            </p>

            <div className={styles.payBox}>
              <div className={styles.payTitle}>Payment details</div>
              <div className={styles.payLine}>
                <span className={styles.k}>Account Number:</span> 8059086041
              </div>
              <div className={styles.payLine}>
                <span className={styles.k}>Account Name:</span> Itabita Miracle
              </div>
              <div className={styles.payLine}>
                <span className={styles.k}>Bank:</span> OPay
              </div>
            </div>

            <div className={styles.cardTitle}>4) Delivery</div>
            <p className={styles.p}>
              Delivery fees depend on your state selection at checkout. Ensure your address and phone number are correct.
            </p>

            <div className={styles.cardTitle}>5) Returns & exchange</div>
            <p className={styles.p}>
              See our <Link href="/returns">Returns & Exchange</Link> page for eligibility and guidance.
            </p>

            <div className={styles.cardTitle}>6) Support</div>
            <p className={styles.p}>
              If you have a question or issue, contact us via the <Link href="/contact">Contact</Link> page.
              Include your order reference if available.
            </p>

            <div className={styles.small}>
              Last updated: {new Date().toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "2-digit" })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}