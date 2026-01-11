import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import styles from "./Returns.module.css";

export const metadata: Metadata = {
  title: "Returns & Exchange",
  description:
    "CLORY WEARS Returns & Exchange policy — guidance on exchanges, delivery checks, and how to get support."
};

export default function ReturnsPage() {
  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className="fadeInUp">
            <div className={styles.badgeRow}>
              <span className="badge">
                <RefreshCw size={16} /> Returns & Exchange
              </span>
            </div>

            <h1 className={styles.h1}>Returns & Exchange</h1>
            <p className={styles.sub}>
              We want you to love your CLORY WEARS piece. If the size doesn’t fit or there is an issue,
              we’ll guide you through exchange based on the policy below.
            </p>

            <div className={styles.ctas}>
              <Link href="/contact" className="btn btnPrimary">
                Contact Support <ArrowRight size={18} />
              </Link>
              <Link href="/size-guide" className="btn btnGhost">
                Size Guide
              </Link>
            </div>
          </div>

          <div className={`${styles.side} fadeInUp`}>
            <div className={`${styles.sideCard} card`}>
              <div className={styles.sideTitle}>Quick summary</div>
              <ul className={styles.tips}>
                <li>Check items immediately upon delivery.</li>
                <li>Keep item clean and unused for exchange eligibility.</li>
                <li>Contact us quickly with your order reference and issue.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`${styles.grid} fadeInUp`}>
            <div className={`${styles.card} card`}>
              <div className={styles.cardTitle}>
                <ShieldCheck size={18} /> Exchange eligibility
              </div>

              <ul className={styles.list}>
                <li>Item must be in clean condition (unused, not damaged).</li>
                <li>Tags/packaging should be intact where applicable.</li>
                <li>Request exchange as soon as possible after delivery.</li>
                <li>Provide your order reference and clear explanation.</li>
              </ul>

              <div className={styles.noteBox}>
                <div className={styles.noteTitle}>Important note</div>
                <div className={styles.noteText}>
                  For hygiene and quality reasons, items that show signs of use may not be eligible for exchange.
                </div>
              </div>
            </div>

            <div className={`${styles.card} card`}>
              <div className={styles.cardTitle}>
                <Truck size={18} /> Delivery checks & issues
              </div>

              <ul className={styles.list}>
                <li>Inspect your package immediately on delivery.</li>
                <li>If there’s a wrong item/size, contact us with details.</li>
                <li>Share photos if there’s damage or delivery issue.</li>
              </ul>

              <div className={styles.noteBox}>
                <div className={styles.noteTitle}>How to get faster support</div>
                <div className={styles.noteText}>
                  Include your order reference (e.g. <b>CLORY-YYYYMMDD-XXXXXX</b>) in your message.
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.bottom} fadeInUp`}>
            <div className={`${styles.bottomCard} card`}>
              <div className={styles.bottomTitle}>Need help right now?</div>
              <div className={styles.bottomText}>
                Use the Contact page to reach us. We’ll respond and guide you with the next steps.
              </div>

              <div className={styles.bottomCtas}>
                <Link href="/contact" className="btn btnPrimary">
                  Contact Support <ArrowRight size={18} />
                </Link>
                <Link href="/shop" className="btn btnGhost">
                  Continue shopping
                </Link>
              </div>

              <div className={styles.smallNote}>
                This policy can be updated as CLORY WEARS grows. Always check the latest version here.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}