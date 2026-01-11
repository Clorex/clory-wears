"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ClipboardCopy,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Search,
  ExternalLink
} from "lucide-react";

import { useAuth } from "../../_providers/AuthProvider";
import { useToast } from "../../_providers/ToastProvider";
import { supabaseBrowser } from "../../_lib/supabaseBrowser";
import { formatDateTime, formatNgn } from "../../_lib/format";
import styles from "./Admin.module.css";

type PaymentStatus = "pending" | "receipt_uploaded" | "payment_claimed" | "paid" | "rejected";
type OrderStatus =
  | "created"
  | "awaiting_payment_review"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type AdminOrderItem = {
  id: string;
  name: string;
  category: string;
  price_ngn: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
};

type AdminOrder = {
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

  payment_status: PaymentStatus;
  order_status: OrderStatus;

  created_at: string;
  updated_at: string;

  order_items: AdminOrderItem[];
};

type ListResponse =
  | { ok: true; orders: AdminOrder[] }
  | { ok: false; message: string };

type UpdateResponse =
  | { ok: true }
  | { ok: false; message: string };

function statusPill(payment: PaymentStatus, order: OrderStatus) {
  if (payment === "paid") return { text: "Paid", tone: "good" as const };
  if (payment === "rejected") return { text: "Rejected", tone: "bad" as const };
  if (payment === "payment_claimed") return { text: "Payment claimed (review)", tone: "warn" as const };
  if (payment === "receipt_uploaded") return { text: "Receipt uploaded", tone: "info" as const };

  if (order === "processing") return { text: "Processing", tone: "info" as const };
  if (order === "shipped") return { text: "Shipped", tone: "info" as const };
  if (order === "delivered") return { text: "Delivered", tone: "good" as const };
  if (order === "cancelled") return { text: "Cancelled", tone: "bad" as const };

  return { text: "Pending payment", tone: "warn" as const };
}

async function getAccessToken(): Promise<string | null> {
  const supabase = supabaseBrowser();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function AdminClient() {
  const { user, loading, isAdmin } = useAuth();
  const { show } = useToast();

  const [busy, setBusy] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [q, setQ] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");
  const [orderFilter, setOrderFilter] = useState<"all" | OrderStatus>("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    let list = orders;

    if (paymentFilter !== "all") list = list.filter((o) => o.payment_status === paymentFilter);
    if (orderFilter !== "all") list = list.filter((o) => o.order_status === orderFilter);

    if (query) {
      list = list.filter((o) => {
        const hay = [
          o.reference,
          o.customer_email,
          o.customer_full_name,
          o.customer_phone,
          o.shipping_state,
          o.shipping_city,
          o.order_status,
          o.payment_status,
          (o.order_items ?? []).map((i) => `${i.name} ${i.color} ${i.size}`).join(" ")
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      });
    }

    return list;
  }, [orders, q, paymentFilter, orderFilter]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      show({ kind: "success", title: "Copied", message: text });
    } catch {
      show({ kind: "error", title: "Copy failed", message: "Please copy manually." });
    }
  }

  async function loadOrders() {
    setBusy(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        setError("No session token found. Please login again.");
        return;
      }

      const res = await fetch("/api/admin/orders/list", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = (await res.json()) as ListResponse;

      if (!data.ok) {
        setError(data.message);
        return;
      }

      setOrders(data.orders ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load admin orders.");
    } finally {
      setBusy(false);
    }
  }

  async function updateOrder(opts: {
    orderId: string;
    payment_status?: PaymentStatus;
    order_status?: OrderStatus;
  }) {
    setUpdatingId(opts.orderId);
    try {
      const token = await getAccessToken();
      if (!token) {
        show({ kind: "error", title: "Session missing", message: "Please login again." });
        return;
      }

      const res = await fetch("/api/admin/orders/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(opts)
      });

      const data = (await res.json()) as UpdateResponse;
      if (!data.ok) {
        show({ kind: "error", title: "Update failed", message: data.message });
        return;
      }

      show({ kind: "success", title: "Order updated", message: "Changes saved successfully." });
      await loadOrders();
    } catch (e: any) {
      show({ kind: "error", title: "Update error", message: e?.message ?? "Something went wrong." });
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    if (!user?.email || !isAdmin) return;
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, isAdmin]);

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className="container">
          <div className={`${styles.notice} card fadeInUp`}>Loading…</div>
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
              <ShieldAlert size={18} /> Admin login required
            </div>
            <div className={styles.noticeText}>Please login with your admin email to access the dashboard.</div>
            <div className={styles.noticeCtas}>
              <Link href="/login" className="btn btnPrimary">
                Login <ArrowRight size={18} />
              </Link>
              <Link href="/" className="btn btnGhost">
                Go home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.wrap}>
        <div className="container">
          <div className={`${styles.notice} card fadeInUp`}>
            <div className={styles.noticeTitle}>
              <ShieldX size={18} /> Access denied
            </div>
            <div className={styles.noticeText}>
              This account (<b>{user.email}</b>) is not authorized to view the admin dashboard.
            </div>
            <div className={styles.noticeCtas}>
              <Link href="/account" className="btn btnPrimary">
                Go to My Account <ArrowRight size={18} />
              </Link>
              <Link href="/" className="btn btnGhost">
                Go home
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
                <ShieldCheck size={16} /> Admin: {user.email}
              </span>
            </div>

            <h1 className={styles.h1}>Admin Dashboard</h1>
            <p className={styles.sub}>
              Review receipts, confirm payments, and update order progress. Customers are notified when they submit
              “I have made payment” and you can review the receipt link here.
            </p>
          </div>

          <div className={`${styles.topPanel} fadeInUp`}>
            <div className={styles.topTitle}>Tools</div>

            <button type="button" className="btn btnGhost" onClick={loadOrders} disabled={busy}>
              <RefreshCcw size={18} /> {busy ? "Refreshing…" : "Refresh orders"}
            </button>

            <Link href="/account" className="btn btnPrimary">
              Go to account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`${styles.filters} card fadeInUp`}>
            <div className={styles.filtersHead}>
              <div className={styles.filtersTitle}>Filter & Search</div>
              <div className={styles.filtersCount}>
                Showing <b>{filtered.length}</b> of <b>{orders.length}</b> orders
              </div>
            </div>

            <div className={styles.filtersGrid}>
              <div className={styles.field}>
                <label className="label" htmlFor="admin-q">
                  Search
                </label>
                <div className={styles.searchWrap}>
                  <Search size={18} className={styles.searchIcon} aria-hidden="true" />
                  <input
                    id="admin-q"
                    className={`input ${styles.searchInput}`}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search reference, email, phone, state, item name..."
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className="label" htmlFor="admin-pay">
                  Payment status
                </label>
                <select
                  id="admin-pay"
                  className="select"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as any)}
                >
                  <option value="all">All</option>
                  <option value="pending">pending</option>
                  <option value="receipt_uploaded">receipt_uploaded</option>
                  <option value="payment_claimed">payment_claimed</option>
                  <option value="paid">paid</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className="label" htmlFor="admin-order">
                  Order status
                </label>
                <select
                  id="admin-order"
                  className="select"
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value as any)}
                >
                  <option value="all">All</option>
                  <option value="created">created</option>
                  <option value="awaiting_payment_review">awaiting_payment_review</option>
                  <option value="processing">processing</option>
                  <option value="shipped">shipped</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            </div>

            <div className={styles.filtersFoot}>
              <button
                type="button"
                className="btn btnGhost"
                onClick={() => {
                  setQ("");
                  setPaymentFilter("all");
                  setOrderFilter("all");
                }}
              >
                Reset filters
              </button>
              <div className={styles.smallNote}>
                Tip: search a reference like <b>CLORY-YYYYMMDD-XXXXXX</b>.
              </div>
            </div>
          </div>

          {error ? (
            <div className={`${styles.notice} card fadeInUp`} style={{ marginTop: 14 }}>
              <div className={styles.noticeTitle}>Could not load admin orders</div>
              <div className={styles.noticeText}>{error}</div>
              <button type="button" className="btn btnPrimary" onClick={loadOrders}>
                Try again <ArrowRight size={18} />
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className={`${styles.notice} card fadeInUp`} style={{ marginTop: 14 }}>
              <div className={styles.noticeTitle}>No matching orders</div>
              <div className={styles.noticeText}>Try adjusting filters or search terms.</div>
            </div>
          ) : (
            <div className={styles.list}>
              {filtered.map((o) => {
                const st = statusPill(o.payment_status, o.order_status);
                const toneClass =
                  st.tone === "good"
                    ? styles.toneGood
                    : st.tone === "bad"
                    ? styles.toneBad
                    : st.tone === "warn"
                    ? styles.toneWarn
                    : styles.toneInfo;

                const items = o.order_items ?? [];
                const cover = items[0]?.image ?? "/images/placeholder.jpg";

                const isUpdating = updatingId === o.id;

                return (
                  <div key={o.id} className={`${styles.orderCard} card fadeInUp`}>
                    <div className={styles.head}>
                      <div className={styles.left}>
                        <div className={styles.cover}>
                          <Image src={cover} alt={o.reference} fill sizes="72px" className={styles.img} />
                        </div>

                        <div className={styles.meta}>
                          <div className={styles.refRow}>
                            <div className={styles.ref}>{o.reference}</div>
                            <button type="button" className={styles.iconBtn} onClick={() => copy(o.reference)}>
                              <ClipboardCopy size={16} />
                            </button>
                          </div>

                          <div className={styles.small}>
                            Customer: <b>{o.customer_full_name}</b> — {o.customer_email} — {o.customer_phone}
                          </div>

                          <div className={styles.small}>
                            Placed: <b>{formatDateTime(o.created_at)}</b> • Updated:{" "}
                            <b>{formatDateTime(o.updated_at)}</b>
                          </div>

                          <div className={`${styles.status} ${toneClass}`}>
                            <BadgeCheck size={16} /> {st.text}
                          </div>
                        </div>
                      </div>

                      <div className={styles.right}>
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

                    <div className={styles.body}>
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
                        <div className={styles.blockTitle}>Receipt</div>
                        {o.receipt_url ? (
                          <div className={styles.receiptRow}>
                            <a className={styles.receiptLink} href={o.receipt_url} target="_blank" rel="noreferrer">
                              View receipt <ExternalLink size={16} />
                            </a>
                            <button type="button" className="btn btnGhost" onClick={() => copy(o.receipt_url!)}>
                              Copy link
                            </button>
                          </div>
                        ) : (
                          <div className={styles.blockText}>No receipt uploaded yet.</div>
                        )}

                        <div className={styles.actions}>
                          <button
                            type="button"
                            className="btn btnPrimary"
                            disabled={isUpdating}
                            onClick={() =>
                              updateOrder({
                                orderId: o.id,
                                payment_status: "paid",
                                order_status: "processing"
                              })
                            }
                          >
                            <CheckCircle2 size={18} /> Mark paid
                          </button>

                          <button
                            type="button"
                            className="btn btnDanger"
                            disabled={isUpdating}
                            onClick={() =>
                              updateOrder({
                                orderId: o.id,
                                payment_status: "rejected",
                                order_status: "awaiting_payment_review"
                              })
                            }
                          >
                            <Ban size={18} /> Reject payment
                          </button>

                          <button
                            type="button"
                            className="btn btnGhost"
                            disabled={isUpdating}
                            onClick={() =>
                              updateOrder({
                                orderId: o.id,
                                order_status: "shipped"
                              })
                            }
                          >
                            Mark shipped
                          </button>

                          <button
                            type="button"
                            className="btn btnGhost"
                            disabled={isUpdating}
                            onClick={() =>
                              updateOrder({
                                orderId: o.id,
                                order_status: "delivered"
                              })
                            }
                          >
                            Mark delivered
                          </button>
                        </div>

                        <div className={styles.helpText}>
                          Marking <b>Paid</b> helps you track confirmed transfers. You can still adjust order status as
                          it moves from processing → shipped → delivered.
                        </div>
                      </div>

                      <div className={styles.blockWide}>
                        <div className={styles.blockTitle}>Items</div>
                        <div className={styles.items}>
                          {items.map((it) => (
                            <div key={it.id} className={styles.itemRow}>
                              <span className={styles.itemName}>{it.name}</span>
                              <span className={styles.itemMeta}>
                                {it.category} • {it.color} • {it.size} • x{it.quantity}
                              </span>
                              <span className={styles.itemPrice}>{formatNgn(it.price_ngn * it.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {isUpdating ? <div className={styles.updating}>Saving changes…</div> : null}
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