import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Ruler, Shirt, SplitSquareVertical } from "lucide-react";
import styles from "./SizeGuide.module.css";

export const metadata: Metadata = {
  title: "Size Guide",
  description:
    "CLORY WEARS Size Guide — trousers waist sizing and shirt sizing tips to help you pick the perfect fit."
};

export default function SizeGuidePage() {
  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className="fadeInUp">
            <div className={styles.badgeRow}>
              <span className="badge">
                <Ruler size={16} /> CLORY WEARS Size Guide
              </span>
            </div>

            <h1 className={styles.h1}>Size Guide</h1>
            <p className={styles.sub}>
              Use this guide to choose the best size. If you’re between sizes, we generally recommend sizing up for comfort.
              For help, visit <Link href="/contact">Contact</Link>.
            </p>

            <div className={styles.ctas}>
              <Link href="/shop" className="btn btnPrimary">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className="btn btnGhost">
                Ask for help
              </Link>
            </div>
          </div>

          <div className={`${styles.side} fadeInUp`}>
            <div className={`${styles.sideCard} card`}>
              <div className={styles.sideTitle}>Quick tips</div>
              <ul className={styles.tips}>
                <li>Measure with a soft tape; don’t pull too tight.</li>
                <li>For trousers, measure waist where you wear your trousers.</li>
                <li>For shirts, focus on chest + shoulder comfort.</li>
                <li>If unsure, message us with your height/weight and desired fit.</li>
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
                <SplitSquareVertical size={18} /> Trousers sizing (Waist)
              </div>
              <p className={styles.p}>
                Our trousers use waist sizing like <b>28–42</b>. If you already know your waist size, select it directly
                on the product page.
              </p>

              <div className={styles.tableWrap}>
                <table className={styles.table} aria-label="Trousers waist size guide">
                  <thead>
                    <tr>
                      <th>Waist (inches)</th>
                      <th>Fit note</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>28–30</td><td>Small waist / slim build</td></tr>
                    <tr><td>32–34</td><td>Medium / standard fit range</td></tr>
                    <tr><td>36–38</td><td>Relaxed fit range</td></tr>
                    <tr><td>40–42</td><td>Comfort fit / bigger build</td></tr>
                  </tbody>
                </table>
              </div>

              <div className={styles.noteBox}>
                <div className={styles.noteTitle}>How to measure</div>
                <div className={styles.noteText}>
                  Wrap the tape around your waist (where you wear trousers). Keep it level and snug—not tight.
                </div>
              </div>
            </div>

            <div className={`${styles.card} card`}>
              <div className={styles.cardTitle}>
                <Shirt size={18} /> Shirt sizing (S–XXL)
              </div>
              <p className={styles.p}>
                Our shirts come in <b>S, M, L, XL, XXL</b>. Choose based on chest comfort and your preferred look
                (fitted vs relaxed).
              </p>

              <div className={styles.tableWrap}>
                <table className={styles.table} aria-label="Shirt size guide">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Fit note</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>S</td><td>Fitted look for smaller frame</td></tr>
                    <tr><td>M</td><td>Standard fit for average build</td></tr>
                    <tr><td>L</td><td>Roomier chest/shoulder comfort</td></tr>
                    <tr><td>XL</td><td>Relaxed fit</td></tr>
                    <tr><td>XXL</td><td>Extra comfort</td></tr>
                  </tbody>
                </table>
              </div>

              <div className={styles.noteBox}>
                <div className={styles.noteTitle}>How to measure</div>
                <div className={styles.noteText}>
                  Measure your chest at the fullest part, and check shoulder comfort. If you want a relaxed look, size up.
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.bottom} fadeInUp`}>
            <div className={`${styles.bottomCard} card`}>
              <div className={styles.bottomTitle}>Still unsure?</div>
              <div className={styles.bottomText}>
                Send us your <b>height</b>, <b>weight</b>, and the product you want, and we’ll guide you to the best size.
              </div>
              <Link href="/contact" className="btn btnPrimary">
                Contact support <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}