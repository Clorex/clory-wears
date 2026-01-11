import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div
          className="card fadeInUp"
          style={{
            padding: 18,
            display: "grid",
            gap: 12,
            maxWidth: 820
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(233, 30, 99, 0.22)",
                background: "rgba(233, 30, 99, 0.08)",
                color: "#C2185B"
              }}
              aria-hidden="true"
            >
              <SearchX size={18} />
            </span>

            <span className="badge">CLORY WEARS</span>
          </div>

          <h1 style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.4rem)", fontWeight: 950, margin: 0 }}>
            Page not found
          </h1>

          <p style={{ margin: 0, color: "rgba(27, 27, 27, 0.74)", fontWeight: 650 }}>
            The page you’re looking for doesn’t exist (or it has been moved). You can return to the shop
            and continue browsing CLORY WEARS.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
            <Link href="/shop" className="btn btnPrimary">
              Go to Shop <ArrowRight size={18} />
            </Link>
            <Link href="/" className="btn btnGhost">
              Back to Home
            </Link>
          </div>

          <div style={{ color: "rgba(27, 27, 27, 0.62)", fontWeight: 650, fontSize: 14 }}>
            If you were trying to find a product, try using the <b>Shop</b> page search and filters.
          </div>
        </div>
      </div>
    </section>
  );
}