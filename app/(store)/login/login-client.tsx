"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, UserPlus, LogIn, ArrowRight } from "lucide-react";

import { useAuth } from "../../_providers/AuthProvider";
import { useToast } from "../../_providers/ToastProvider";
import styles from "./Login.module.css";

type Mode = "login" | "register";

function isStrongEnoughPassword(pw: string) {
  // Simple baseline: 8+ chars
  return pw.trim().length >= 8;
}

export default function LoginClient() {
  const router = useRouter();
  const { signIn, signUp, user, loading } = useAuth();
  const { show } = useToast();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);

  async function submit() {
    const e = email.trim().toLowerCase();
    const p = password;

    if (!e || !e.includes("@")) {
      show({ kind: "error", title: "Invalid email", message: "Please enter a valid email address." });
      return;
    }
    if (!isStrongEnoughPassword(p)) {
      show({
        kind: "error",
        title: "Weak password",
        message: "Use at least 8 characters for your password."
      });
      return;
    }

    setBusy(true);
    try {
      if (mode === "register") {
        const r = await signUp(e, p);
        if (!r.ok) {
          show({ kind: "error", title: "Register failed", message: r.message });
          return;
        }

        // Often supabase may require email confirmation.
        // We'll keep UX simple: attempt sign-in right after.
        const s = await signIn(e, p);
        if (!s.ok) {
          show({
            kind: "info",
            title: "Account created",
            message:
              "Please check your email if confirmation is required, then login again."
          });
          return;
        }

        show({ kind: "success", title: "Welcome to CLORY WEARS", message: "Your account has been created." });
        router.push("/account");
        return;
      }

      const r = await signIn(e, p);
      if (!r.ok) {
        show({ kind: "error", title: "Login failed", message: r.message });
        return;
      }

      show({ kind: "success", title: "Logged in", message: "Welcome back." });
      router.push("/account");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className="container">
          <div className={`${styles.card} card fadeInUp`}>Loading…</div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className={styles.wrap}>
        <div className="container">
          <div className={`${styles.card} card fadeInUp`}>
            <div className={styles.title}>You are already logged in</div>
            <div className={styles.sub}>
              Continue to your account to view orders, upload receipts, and manage checkout.
            </div>

            <div className={styles.ctas}>
              <Link href="/account" className="btn btnPrimary">
                Go to My Account <ArrowRight size={18} />
              </Link>
              <Link href="/shop" className="btn btnGhost">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className="fadeInUp">
            <h1 className={styles.h1}>
              {mode === "login" ? "Login" : "Create an account"}
            </h1>
            <p className={styles.sub}>
              Accounts make checkout personalized: you can track your orders, upload receipts, and confirm payments
              easily from your page.
            </p>
          </div>

          <div className={`${styles.switcher} fadeInUp`}>
            <button
              type="button"
              className={`${styles.switchBtn} ${mode === "login" ? styles.switchActive : ""}`}
              onClick={() => setMode("login")}
            >
              <LogIn size={18} /> Login
            </button>
            <button
              type="button"
              className={`${styles.switchBtn} ${mode === "register" ? styles.switchActive : ""}`}
              onClick={() => setMode("register")}
            >
              <UserPlus size={18} /> Register
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`${styles.formCard} card fadeInUp`}>
            <div className={styles.formTitle}>
              {mode === "login" ? "Welcome back" : "Welcome to CLORY WEARS"}
            </div>
            <div className={styles.formSub}>
              {mode === "login"
                ? "Login with your email and password."
                : "Create your account with email and password (minimum 8 characters)."}
            </div>

            <div className={styles.form}>
              <div className={styles.field}>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <div className={styles.iconInput}>
                  <Mail size={18} className={styles.icon} aria-hidden="true" />
                  <input
                    id="email"
                    className={`input ${styles.input}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <div className={styles.iconInput}>
                  <Lock size={18} className={styles.icon} aria-hidden="true" />
                  <input
                    id="password"
                    className={`input ${styles.input}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                </div>
                <div className="helper">
                  Tip: use a password you will remember (8+ characters).
                </div>
              </div>

              <button
                type="button"
                className="btn btnPrimary"
                onClick={submit}
                disabled={busy}
              >
                {busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
                <ArrowRight size={18} />
              </button>

              <div className={styles.smallNote}>
                By continuing, you agree to our <Link href="/terms">Terms</Link>.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}