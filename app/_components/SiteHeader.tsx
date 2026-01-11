"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, User2, LogOut, Shield } from "lucide-react";
import { useAuth } from "../_providers/AuthProvider";
import { useCart } from "../_providers/CartProvider";
import styles from "./SiteHeader.module.css";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/trousers", label: "Trousers" },
  { href: "/shirts", label: "Shirts" },
  { href: "/contact", label: "Contact" }
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, signOut, loading } = useAuth();
  const { totalItems } = useCart();

  const navItems: NavItem[] = isAdmin ? [...NAV, { href: "/admin", label: "Admin" }] : NAV;

  const currentValue = (() => {
    const found = navItems.find((n) => pathname === n.href);
    if (found) return found.href;

    // if on a nested route like /product/slug, default to /shop
    if (pathname?.startsWith("/product")) return "/shop";
    if (pathname?.startsWith("/account")) return "/account";
    if (pathname?.startsWith("/checkout")) return "/checkout";
    if (pathname?.startsWith("/cart")) return "/cart";

    return "";
  })();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="CLORY WEARS home">
          <span className={styles.brandMark} />
          <span className={styles.brandText}>
            <span className={styles.brandName}>CLORY</span>{" "}
            <span className={styles.brandWears}>WEARS</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={`desktopOnly ${styles.nav}`} aria-label="Primary">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/shop" && pathname?.startsWith("/product"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile dropdown nav (requested) */}
        <div className={`mobileOnly ${styles.mobileNav}`}>
          <label className={styles.mobileLabel} htmlFor="mobile-nav-select">
            Navigate
          </label>
          <select
            id="mobile-nav-select"
            className={`select ${styles.mobileSelect}`}
            value={currentValue}
            onChange={(e) => {
              const href = e.target.value;
              if (href) router.push(href);
            }}
          >
            <option value="" disabled>
              Choose a page…
            </option>
            {navItems.map((n) => (
              <option key={n.href} value={n.href}>
                {n.label}
              </option>
            ))}
            <option value="/cart">Cart</option>
            {user ? <option value="/account">My Account</option> : <option value="/login">Login</option>}
          </select>
        </div>

        <div className={styles.actions}>
          <Link href="/cart" className={styles.iconBtn} aria-label="Open cart">
            <ShoppingBag size={18} />
            <span className={styles.cartCount} aria-label={`Cart items: ${totalItems}`}>
              {totalItems}
            </span>
          </Link>

          {loading ? (
            <div className={styles.pill}>Loading…</div>
          ) : user ? (
            <>
              <Link href="/account" className={styles.pill} aria-label="My account">
                <User2 size={16} />
                <span className={styles.pillText}>Account</span>
              </Link>

              {isAdmin ? (
                <Link href="/admin" className={styles.pill} aria-label="Admin dashboard">
                  <Shield size={16} />
                  <span className={styles.pillText}>Admin</span>
                </Link>
              ) : null}

              <button
                type="button"
                className={`${styles.pill} ${styles.pillButton}`}
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
                aria-label="Sign out"
              >
                <LogOut size={16} />
                <span className={styles.pillText}>Sign out</span>
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.pill} aria-label="Login">
              <User2 size={16} />
              <span className={styles.pillText}>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}