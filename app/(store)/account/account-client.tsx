"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCopy,
  CloudUpload,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../_providers/AuthProvider";
import { useToast } from "../../_providers/ToastProvider";
import { supabaseBrowser } from "../../_lib/supabaseBrowser";
import { formatDateTime, formatNgn } from "../../_lib/format";
import styles from "./Account.module.css";

type DbOrderItem = {
  id: string;
  name: string;
  category: string;
  price_ngn: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
};

type DbOrder = {
  id: string;
  reference: string;

  customer_email: string;
  customer_full_name: string;
  customer_phone: string;

  shipping_state: string;
  shipping_city: string;
  shipping_address1: string;
  shipping_address2: string | null;
  shipping_note: string | null;

  subtotal_ngn: number;
  shipping_ngn: number;
  grand_total_ngn: number;

  receipt_url: string | null;

  payment_status: "pending" | "receipt_uploaded" | "payment_claimed" | "paid" | "rejected";
  order_status:
    | "created"
    | "awaiting_payment_review"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

  created_at: string;
  updated_at: string;

  order_items?: DbOrderItem[];
};

function statusLabel(payment: DbOrder["payment_status"], order: DbOrder["order_status"]) {
  if (payment === "paid") return { text: "Paid", tone: "good" as const };
  if (payment === "payment_claimed") return { text: "Payment claimed (reviewing)", tone: "warn" as const };
  if (payment === "receipt_uploaded") return { text: "Receipt uploaded", tone: "info" as const };
  if (payment === "rejected") return { text: "Payment rejected", tone: "bad" as const };

  if (order === "processing") return { text: "Processing", tone: "info" as const };
  if (order === "shipped") return { text: "Shipped", tone: "info" as const };
  if (order === "delivered") return { text: "Delivered", tone: "good" as const };
  if (order === "cancelled") return { text: "Cancelled", tone: "bad" as const };

  return { text: "Pending payment", tone: "warn" as const };
}

export default function AccountClient() {
  const { user, loading, isAdmin } = useAuth();
  const { show } = useToast();

  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  // per-order receipt states (upload preview after API returns public url)
  const [receiptByOrder, setReceiptByOrder] = useState<Record<string, string | null>>({});
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);

  const hasOrders = orders.length > 0;

  const mergedOrders = useMemo(() => {
    return orders.map((o) => ({
      ...o,
      receipt_url: receiptByOrder[o.id] ?? o.receipt_url
    }));
  }, [orders, receiptByOrder]);

  async function loadOrders() {
    setBusy(true);
    setError(null);
    try {
      const supabase = supabaseBrowser();

      const { data, error: qErr } = await supabase
        .from("orders")
        .select(
          `
          id, reference,
          customer_email, customer_full_name, customer_phone,
          shipping_state, shipping_city, shipping_address1, shipping_address2, shipping_note,
          subtotal_ngn, shipping_ngn, grand_total_ngn,
          receipt_url, payment_status, order_status,
          created_at, updated_at,
          order_items (
            id, name, category, price_ngn, quantity, size, color, image
          )
        `
        )
        .order("created_at", { ascending: false });

      if (qErr) throw qErr;

      setOrders((data as DbOrder[]) ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Could not load orders.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!user?.email) return;
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      show({ kind: "success", title: "Copied", message: text });
    } catch {
      show({ kind: "error", title: "Copy failed", message: "Please copy manually." });
    }
  }

  async function uploadReceipt(orderId: string, file: File) {
    setUploadingOrderId(orderId);
    try {
      const fd = new FormData();
      fd.append("orderId", orderId);
      fd.append("receipt", file);

      const res = await fetch("/api/orders/upload-receipt", {
        method: "POST",
        body: fd
      });

      const data = (await res.json()) as
        | { ok: true; receiptUrl: string }
        | { ok: false; message: string };

      if (!data.ok) {
        show({ kind: "error", title: "Receipt upload failed", message: data.message });
        return;
      }

      setReceiptByOrder((prev) => ({ ...prev, [orderId]: data.receiptUrl }));
      show({ kind: "success", title: "Receipt uploaded", message: "You can now confirm payment." });
    } catch (e: any) {
      show({ kind: "error", title: "Upload error", message: e?.message ?? "Upload failed." });
    } finally {
      setUploadingOrderId(null);
    }
  }

  async function confirmPayment(orderId: string, receiptUrl: string) {
    setConfirmingOrderId(orderId);
    try {
      const res = await fetch("/api/orders/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, receiptUrl })
      });

      const data = (await res.json()) as
        | { ok: true }
        | { ok: false; message: string };

      if (!data.ok) {
        show({ kind: "error", title: "Could not confirm payment", message: data.message });
        return;
      }

      show({
        kind: "success",
        title: "Confirmation sent",
        message: "We have been notified by email and will review your receipt."
      });

      // refresh statuses from DB
      await loadOrders();
    } catch (e: any) {
      show({ kind: "error", title: "Confirmation error", message: e?.message ?? "Something went wrong." });
    } finally {
      setConfirmingOrderId(null);
    }
  }

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className="container">
          <div className={`${styles.notice} card fadeInUp`}>Loading your account…</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.wrap}>
        <div className="container">
          <div className={`${styles.notice} card fadeInUp`}>
            <div className={styles.noticeTitle}>
              <ShieldAlert size={18} /> Login required
            </div>
            <div className={styles.noticeText}>
              Login to view your orders, upload receipts, and confirm payments.
            </div>
            <div className={styles.noticeCtas}>
              <Link href="/login" className="btn btnPrimary">
                Login / Register <ArrowRight size={18} />
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
            <div className={styles.badgeRow}>
              <span className="badge">
                <ShieldCheck size={16} /> Signed in as {user.email}
              </span>
              {isAdmin ? (
                <span className="badge" style={{ marginLeft: 10 }}>
                  Admin access enabled
                </span>
              ) : null}
            </div>

            <h1 className={styles.h1}>My Account</h1>
            <p className={styles.sub}>
              View your orders, upload receipts, and confirm payment. Once you confirm payment, we receive an email
              notification and will review your receipt.
            </p>

            {isAdmin ? (
              <div className={styles.adminRow}>
                <Link href="/admin" className="btn btnGhost">
                  Go to Admin Dashboard <ArrowRight size={18} />
                </Link>
              </div>
            ) : null}
          </div>

          <div className={`${styles.panelTop} fadeInUp`}>
            <div className={styles.panelTitle}>Quick actions</div>

            <button
              type="button"
              className="btn btnGhost"
              onClick={loadOrders}
              disabled={busy}
            >
              <RefreshCcw size={18} /> {busy ? "Refreshing…" : "Refresh orders"}
            </button>

            <Link href="/shop" className="btn btnPrimary">
              Continue shopping <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error ? (
            <div className={`${styles.notice} card fadeInUp`}>
              <div className={styles.noticeTitle}>Could not load orders</div>
              <div className={styles.noticeText}>{error}</div>
              <button type="button" className="btn btnPrimary" onClick={loadOrders}>
                Try again <ArrowRight size={18} />
              </button>
            </div>
          ) : !hasOrders ? (
            <div className={`${styles.notice} card fadeInUp`}>
              <div className={styles.noticeTitle}>No orders yet</div>
              <div className={styles.noticeText}>
                When you place an order, it will appear here. You can upload your receipt and confirm payment from this page.
              </div>
              <Link href="/shop" className="btn btnPrimary">
                Start shopping <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className={styles.list}>
              {mergedOrders.map((o) => {
                const st = statusLabel(o.payment_status, o.order_status);
                const toneClass =
                  st.tone === "good"
                    ? styles.toneGood
                    : st.tone === "bad"
                    ? styles.toneBad
                    : st.tone === "warn"
                    ? styles.toneWarn
                    : styles.toneInfo;

                const receipt = o.receipt_url;

                const items = o.order_items ?? [];
                const cover = items[0]?.image ?? "/images/placeholder.jpg";

                return (
                  <div key={o.id} className={`${styles.orderCard} card fadeInUp`}>
                    <div className={styles.orderHead}>
                      <div className={styles.orderLeft}>
                        <div className={styles.cover}>
                          <Image src={cover} alt={o.reference} fill sizes="72px" className={styles.img} />
                        </div>

                        <div className={styles.orderMeta}>
                          <div className={styles.orderRefRow}>
                            <div className={styles.orderRef}>{o.reference}</div>
                            <button
                              type="button"
                              className={styles.copyBtn}
                              onClick={() => copy(o.reference)}
                              aria-label="Copy order reference"
                            >
                              <ClipboardCopy size={16} />
                            </button>
                          </div>

                          <div className={styles.orderSmall}>
                            Placed: <b>{formatDateTime(o.created_at)}</b>
                          </div>

                          <div className={`${styles.statusPill} ${toneClass}`}>
                            <BadgeCheck size={16} /> {st.text}
                          </div>
                        </div>
                      </div>

                      <div className={styles.orderRight}>
                        <div className={styles.moneyLine}>
                          <span className={styles.k}>Total</span>
                          <span className={styles.vPink}>{formatNgn(o.grand_total_ngn)}</span>
                        </div>
                        <div className={styles.moneyLine}>
                          <span className={styles.k}>Shipping</span>
                          <span className={styles.v}>{formatNgn(o.shipping_ngn)}</span>
                        </div>
                        <div className={styles.moneyLine}>
                          <span className={styles.k}>State</span>
                          <span className={styles.v}>{o.shipping_state}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orderBody}>
                      <div className={styles.block}>
                        <div className={styles.blockTitle}>Delivery</div>
                        <div className={styles.blockText}>
                          {o.shipping_address1}
                          {o.shipping_address2 ? `, ${o.shipping_address2}` : ""}
                          <br />
                          {o.shipping_city}, {o.shipping_state}
                          {o.shipping_note ? (
                            <>
                              <br />
                              <span className={styles.note}>Note: {o.shipping_note}</span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className={styles.block}>
                        <div className={styles.blockTitle}>Items</div>
                        <div className={styles.items}>
                          {items.map((it) => (
                            <div key={it.id} className={styles.itemRow}>
                              <span className={styles.itemName}>{it.name}</span>
                              <span className={styles.itemMeta}>
                                {it.color} • {it.size} • x{it.quantity}
                              </span>
                              <span className={styles.itemPrice}>
                                {formatNgn(it.price_ngn * it.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={styles.block}>
                        <div className={styles.blockTitle}>Receipt</div>

                        {receipt ? (
                          <div className={styles.receiptRow}>
                            <a className={styles.receiptLink} href={receipt} target="_blank" rel="noreferrer">
                              View uploaded receipt
                            </a>
                            <button type="button" className="btn btnGhost" onClick={() => copy(receipt)}>
                              Copy receipt link
                            </button>
                          </div>
                        ) : (
                          <div className={styles.blockText}>
                            No receipt uploaded yet. Upload it below after paying.
                          </div>
                        )}

                        <div className={styles.actions}>
                          <label className={`btn btnGhost ${styles.fileBtn}`}>
                            <CloudUpload size={18} />
                            {uploadingOrderId === o.id ? "Uploading…" : "Upload receipt"}
                            <input
                              type="file"
                              accept="image/*"
                              className={styles.file}
                              disabled={uploadingOrderId === o.id}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadReceipt(o.id, f);
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            className="btn btnPrimary"
                            disabled={!receipt || confirmingOrderId === o.id || o.payment_status === "payment_claimed" || o.payment_status === "paid"}
                            onClick={() => {
                              if (!receipt) return;
                              confirmPayment(o.id, receipt);
                            }}
                          >
                            {o.payment_status === "paid"
                              ? "Already paid"
                              : o.payment_status === "payment_claimed"
                              ? "Already confirmed"
                              : confirmingOrderId === o.id
                              ? "Sending confirmation…"
                              : "I have made payment"}
                            <ArrowRight size={18} />
                          </button>
                        </div>

                        <div className={styles.helpText}>
                          After you confirm payment, we will be notified by email and will review your receipt.
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}