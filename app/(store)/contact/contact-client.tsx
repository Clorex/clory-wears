"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, MessageSquareText, Phone, Send } from "lucide-react";

import { useAuth } from "../../_providers/AuthProvider";
import { useToast } from "../../_providers/ToastProvider";
import styles from "./Contact.module.css";

type ContactResponse = { ok: true } | { ok: false; message: string };

export default function ContactClient() {
  const { user } = useAuth();
  const { show } = useToast();

  const defaultEmail = useMemo(() => user?.email ?? "", [user?.email]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [busy, setBusy] = useState(false);

  async function submit() {
    const payload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    };

    if (!payload.fullName || payload.fullName.length < 2) {
      show({ kind: "error", title: "Name required", message: "Please enter your full name." });
      return;
    }
    if (!payload.email || !payload.email.includes("@")) {
      show({ kind: "error", title: "Valid email required", message: "Please enter a valid email address." });
      return;
    }
    if (!payload.subject || payload.subject.length < 3) {
      show({ kind: "error", title: "Subject required", message: "Please enter a short subject." });
      return;
    }
    if (!payload.message || payload.message.length < 10) {
      show({
        kind: "error",
        title: "Message too short",
        message: "Please provide more details (at least 10 characters)."
      });
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = (await res.json()) as ContactResponse;

      if (!data.ok) {
        show({ kind: "error", title: "Message not sent", message: data.message });
        return;
      }

      show({
        kind: "success",
        title: "Message sent",
        message: "We received your message and will reply as soon as possible."
      });

      setSubject("");
      setMessage("");
    } catch (e: any) {
      show({ kind: "error", title: "Network error", message: e?.message ?? "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className="fadeInUp">
            <div className={styles.badgeRow}>
              <span className="badge">
                <MessageSquareText size={16} /> Contact CLORY WEARS
              </span>
            </div>

            <h1 className={styles.h1}>Contact</h1>
            <p className={styles.sub}>
              Questions about sizes, delivery, payment upload, or your order reference? Send a message and we’ll respond.
            </p>

            <div className={styles.quick}>
              <div className={styles.quickItem}>
                <Mail size={18} />
                <span>
                  Email: <b>itabitamiracle090@gmail.com</b>
                </span>
              </div>
              <div className={styles.quickItem}>
                <Phone size={18} />
                <span>
                  OPay: <b>8059086041</b> (Itabita Miracle)
                </span>
              </div>
            </div>
          </div>

          <div className={`${styles.side} fadeInUp`}>
            <div className={`${styles.sideCard} card`}>
              <div className={styles.sideTitle}>Helpful links</div>
              <Link href="/size-guide" className={styles.sideLink}>
                Size Guide <ArrowRight size={16} />
              </Link>
              <Link href="/returns" className={styles.sideLink}>
                Returns & Exchange <ArrowRight size={16} />
              </Link>
              <Link href="/terms" className={styles.sideLink}>
                Terms <ArrowRight size={16} />
              </Link>
              <div className={styles.sideNote}>
                If you already placed an order, include your <b>order reference</b> in your message for faster support.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`${styles.formCard} card fadeInUp`}>
            <div className={styles.formTitle}>Send a message</div>
            <div className={styles.formSub}>
              Please be specific so we can help quickly (include order reference if you have one).
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className="label" htmlFor="contact-name">
                  Full name
                </label>
                <input
                  id="contact-name"
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  autoComplete="name"
                />
              </div>

              <div className={styles.field}>
                <label className="label" htmlFor="contact-email">
                  Email
                </label>
                <input
                  id="contact-email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                />
              </div>

              <div className={styles.fieldWide}>
                <label className="label" htmlFor="contact-subject">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  className="input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Size help / Delivery question / Order issue"
                />
              </div>

              <div className={styles.fieldWide}>
                <label className="label" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  className={`textarea ${styles.textarea}`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here…"
                />
              </div>
            </div>

            <div className={styles.ctas}>
              <button type="button" className="btn btnPrimary" onClick={submit} disabled={busy}>
                {busy ? "Sending…" : "Send message"} <Send size={18} />
              </button>
              <Link href="/shop" className="btn btnGhost">
                Continue shopping
              </Link>
            </div>

            <div className={styles.note}>
              We do not store your contact message publicly; it is sent directly to our support email.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}