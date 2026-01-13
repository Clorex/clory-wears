"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  CreditCard,
  MapPin,
  ShieldAlert
} from "lucide-react";

import { useAuth } from "../../_providers/AuthProvider";
import { useCart } from "../../_providers/CartProvider";
import { useToast } from "../../_providers/ToastProvider";
import { formatNgn } from "../../_lib/format";
import { listShippingStates, shippingPriceForState } from "../../_data/shippingRates";
import styles from "./Checkout.module.css";
import { supabaseBrowser } from "../../_lib/supabaseBrowser";

type CreateOrderResponse =
  | { ok: true; order: { id: string; reference: string } }
  | { ok: false; message: string };

type UploadReceiptResponse =
  | { ok: true; receiptUrl: string }
  | { ok: false; message: string };

type ConfirmPaymentResponse =
  | { ok: true }
  | { ok: false; message: string };

type Step = "details" | "payment";

type ExistingOrder = {
  id: string;
  reference: string;
  shipping_state: string;
  shipping_ngn: number;
  subtotal_ngn: number;
  grand_total_ngn: number;
  receipt_url: string | null;
  payment_status: "pending" | "receipt_uploaded" | "payment_claimed" | "paid" | "rejected";
  order_status: "created" | "awaiting_payment_review" | "processing" | "shipped" | "delivered" | "cancelled";
  order_items: Array<{
    id: string;
    name: string;
    price_ngn: number;
    quantity: number;
    size: string;
    color: string;
    image: string;
  }>;
};

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("order");

  const { user, loading } = useAuth();
  const { items, subtotalNgn, clearCart } = useCart();
  const { show } = useToast();

  const [step, setStep] = useState<Step>("details");

  // Delivery details (used for new orders)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [stateName, setStateName] = useState("Lagos");
  const [city, setCity] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [note, setNote] = useState("");

  // Existing order (loaded from Supabase when ?order=... is present)
  const [existingOrder, setExistingOrder] = useState<ExistingOrder | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // Order state
  const [creating, setCreating] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  // Receipt upload
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  // Payment confirm
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const states = useMemo(() => listShippingStates(), []);

  // Totals:
  const shippingNgnForNew = useMemo(() => shippingPriceForState(stateName), [stateName]);

  const effectiveSubtotal = existingOrder ? existingOrder.subtotal_ngn : subtotalNgn;
  const effectiveShipping = existingOrder ? existingOrder.shipping_ngn : shippingNgnForNew;
  const effectiveTotal = existingOrder ? existingOrder.grand_total_ngn : subtotalNgn + shippingNgnForNew;

  const cartEmpty = items.length === 0;

  // If we have an order id in the URL, load it and move user directly to payment step
  useEffect(() => {
    if (!orderIdFromUrl) return;
    if (!user?.email) return;

    let cancelled = false;

    async function loadExistingOrder() {
      setLoadingExisting(true);
      try {
        const supabase = supabaseBrowser();

        const { data, error } = await supabase
          .from("orders")
          .select(
            `
            id,
            reference,
            shipping_state,
            shipping_ngn,
            subtotal_ngn,
            grand_total_ngn,
            receipt_url,
            payment_status,
            order_status,
            order_items (
              id, name, price_ngn, quantity, size, color, image
            )
          `
          )
          .eq("id", orderIdFromUrl)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Order not found.");

        if (cancelled) return;

        const o = data as unknown as ExistingOrder;

        setExistingOrder(o);
        setOrderId(o.id);
        setOrderRef(o.reference);
        setStateName(o.shipping_state);
        setReceiptUrl(o.receipt_url ?? null);

        setStep("payment");

        if (o.payment_status === "payment_claimed" || o.payment_status === "paid") {
          setConfirmed(true);
        }
      } catch (e: any) {
        show({
          kind: "error",
          title: "Could not open this checkout",
          message: e?.message ?? "Please try again."
        });
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    }

    loadExistingOrder();

    return () => {
      cancelled = true;
    };
  }, [orderIdFromUrl, user?.email, show]);

  async function createOrder() {
    if (cartEmpty) {
      show({ kind: "info", title: "Your cart is empty", message: "Add items before checkout." });
      return;
    }

    // Checkout requires account for tracking
    if (!user?.email) {
      show({
        kind: "error",
        title: "Login required",
        message: "Please login/register to checkout and track your order."
      });
      return;
    }

    if (!fullName.trim() || !phone.trim() || !stateName.trim() || !city.trim() || !address1.trim()) {
      show({
        kind: "error",
        title: "Missing details",
        message: "Please fill: full name, phone, state, city and address."
      });
      return;
    }

    setCreating(true);
    try {
      const shippingNgn = shippingNgnForNew;
      const grandTotalNgn = subtotalNgn + shippingNgn;

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            email: user.email,
            fullName,
            phone
          },
          shipping: {
            state: stateName,
            city,
            address1,
            address2,
            note
          },
          pricing: {
            subtotalNgn,
            shippingNgn,
            grandTotalNgn
          },
          items: items.map((it) => ({
            productId: it.id,
            name: it.name,
            category: it.category,
            priceNgn: it.priceNgn,
            quantity: it.quantity,
            size: it.size,
            color: it.color,
            image: it.image
          }))
        })
      });

      const data = (await res.json()) as CreateOrderResponse;

      if (!data.ok) {
        show({ kind: "error", title: "Could not create order", message: data.message });
        return;
      }

      setOrderId(data.order.id);
      setOrderRef(data.order.reference);
      setStep("payment");

      show({
        kind: "success",
        title: "Order created",
        message: `Reference: ${data.order.reference}`
      });
    } catch (e: any) {
      show({ kind: "error", title: "Checkout error", message: e?.message ?? "Something went wrong." });
    } finally {
      setCreating(false);
    }
  }

  async function uploadReceipt(file: File) {
    if (!orderId) {
      show({ kind: "error", title: "No order found", message: "Please create an order first." });
      return;
    }

    setReceiptUploading(true);
    try {
      const fd = new FormData();
      fd.append("orderId", orderId);
      fd.append("receipt", file);

      const res = await fetch("/api/orders/upload-receipt", {
        method: "POST",
        body: fd
      });

      const data = (await res.json()) as UploadReceiptResponse;

      if (!data.ok) {
        show({ kind: "error", title: "Upload failed", message: data.message });
        return;
      }

      setReceiptUrl(data.receiptUrl);
      show({ kind: "success", title: "Uploaded", message: "You can now submit payment confirmation." });
    } catch (e: any) {
      show({ kind: "error", title: "Upload error", message: e?.message ?? "Upload failed." });
    } finally {
      setReceiptUploading(false);
    }
  }

  async function confirmPayment() {
    if (!orderId) {
      show({ kind: "error", title: "No order found", message: "Please create an order first." });
      return;
    }
    if (!receiptUrl) {
      show({ kind: "error", title: "Receipt required", message: "Please upload your receipt before confirming." });
      return;
    }

    setConfirming(true);
    try {
      const res = await fetch("/api/orders/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          receiptUrl
        })
      });

      const data = (await res.json()) as ConfirmPaymentResponse;

      if (!data.ok) {
        show({ kind: "error", title: "Could not submit confirmation", message: data.message });
        return;
      }

      setConfirmed(true);

      // If this was a cart-based checkout, clear cart now
      if (!existingOrder) clearCart();

      show({
        kind: "success",
        title: "Confirmation received",
        message: "Your payment confirmation has been submitted successfully."
      });
    } catch (e: any) {
      show({ kind: "error", title: "Confirmation error", message: e?.message ?? "Something went wrong." });
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className="fadeInUp">
            <h1 className={styles.h1}>Checkout</h1>
            <p className={styles.sub}>
              Confirm delivery details, then complete your order through the guided confirmation step.
            </p>
          </div>

          <div className={`${styles.stepper} fadeInUp`} aria-label="Checkout steps">
            <div className={`${styles.step} ${step === "details" ? styles.stepActive : ""}`}>
              <div className={styles.stepNum}>1</div>
              <div className={styles.stepText}>Delivery details</div>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step === "payment" ? styles.stepActive : ""}`}>
              <div className={styles.stepNum}>2</div>
              <div className={styles.stepText}>Confirmation</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className={`${styles.notice} card fadeInUp`}>Loading your session…</div>
          ) : !user ? (
            <div className={`${styles.notice} card fadeInUp`}>
              <div className={styles.noticeTitle}>
                <ShieldAlert size={18} /> Login required
              </div>
              <div className={styles.noticeText}>
                Login to place orders and manage confirmations securely.
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
          ) : loadingExisting ? (
            <div className={`${styles.notice} card fadeInUp`}>Opening your order…</div>
          ) : !existingOrder && cartEmpty ? (
            <div className={`${styles.notice} card fadeInUp`}>
              <div className={styles.noticeTitle}>Your cart is empty</div>
              <div className={styles.noticeText}>Add items to your cart before checkout.</div>
              <Link href="/shop" className="btn btnPrimary">
                Go to Shop <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {/* Left */}
              <div className={`${styles.left} fadeInUp`}>
                {step === "details" ? (
                  <div className={`${styles.panel} card`}>
                    <div className={styles.panelTitle}>
                      <MapPin size={18} /> Delivery details
                    </div>

                    <div className={styles.formGrid}>
                      <div className={styles.field}>
                        <label className="label" htmlFor="fullName">
                          Full name
                        </label>
                        <input
                          id="fullName"
                          className="input"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. John Doe"
                          autoComplete="name"
                        />
                      </div>

                      <div className={styles.field}>
                        <label className="label" htmlFor="email">
                          Email
                        </label>
                        <input id="email" className="input" value={user.email ?? ""} readOnly />
                        <div className="helper">This helps keep your order history linked to your account.</div>
                      </div>

                      <div className={styles.field}>
                        <label className="label" htmlFor="phone">
                          Phone number
                        </label>
                        <input
                          id="phone"
                          className="input"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 080..."
                          autoComplete="tel"
                        />
                      </div>

                      <div className={styles.field}>
                        <label className="label" htmlFor="state">
                          State
                        </label>
                        <select
                          id="state"
                          className="select"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                        >
                          {states.map((s) => (
                            <option key={s} value={s}>
                              {s} — {formatNgn(shippingPriceForState(s))}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.field}>
                        <label className="label" htmlFor="city">
                          City / Town
                        </label>
                        <input
                          id="city"
                          className="input"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Ikeja"
                          autoComplete="address-level2"
                        />
                      </div>

                      <div className={styles.fieldWide}>
                        <label className="label" htmlFor="address1">
                          Address line 1
                        </label>
                        <input
                          id="address1"
                          className="input"
                          value={address1}
                          onChange={(e) => setAddress1(e.target.value)}
                          placeholder="Street address, house number"
                          autoComplete="street-address"
                        />
                      </div>

                      <div className={styles.fieldWide}>
                        <label className="label" htmlFor="address2">
                          Address line 2 (optional)
                        </label>
                        <input
                          id="address2"
                          className="input"
                          value={address2}
                          onChange={(e) => setAddress2(e.target.value)}
                          placeholder="Landmark, gate color, etc."
                        />
                      </div>

                      <div className={styles.fieldWide}>
                        <label className="label" htmlFor="note">
                          Order note (optional)
                        </label>
                        <textarea
                          id="note"
                          className={`textarea ${styles.textarea}`}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Anything we should know about delivery?"
                        />
                      </div>
                    </div>

                    <div className={styles.panelCtas}>
                      <button type="button" className="btn btnPrimary" onClick={createOrder} disabled={creating}>
                        {creating ? "Creating order…" : "Continue"} <ArrowRight size={18} />
                      </button>

                      <Link href="/cart" className="btn btnGhost">
                        Back to cart
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className={`${styles.panel} card`}>
                    <div className={styles.panelTitle}>
                      <CreditCard size={18} /> Confirmation
                    </div>

                    <div className={styles.orderMeta}>
                      <div className={styles.orderLine}>
                        <span className={styles.k}>Order reference</span>
                        <span className={styles.vStrong}>{orderRef ?? "—"}</span>
                      </div>
                      <div className={styles.orderLine}>
                        <span className={styles.k}>Total</span>
                        <span className={styles.vPink}>{formatNgn(effectiveTotal)}</span>
                      </div>
                    </div>

                    {/* Payment details live only here */}
                    <div className={styles.paymentBox}>
                      <div className={styles.paymentTitle}>Payment details</div>
                      <div className={styles.paymentLine}>
                        <span className={styles.k2}>Account Number:</span> 8059086041
                      </div>
                      <div className={styles.paymentLine}>
                        <span className={styles.k2}>Account Name:</span> Itabita Miracle
                      </div>
                      <div className={styles.paymentLine}>
                        <span className={styles.k2}>Bank:</span> OPay
                      </div>

                      <div className={styles.paymentHint}>
                        Use your <b>order reference</b> as narration if possible.
                      </div>
                    </div>

                    <div className={styles.receiptBlock}>
                      <div className={styles.receiptTitle}>
                        <CloudUpload size={18} /> Upload payment receipt
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        className={styles.file}
                        disabled={receiptUploading || confirmed}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadReceipt(f);
                        }}
                      />

                      {receiptUrl ? (
                        <div className={styles.receiptPreview}>
                          <div className={styles.receiptOk}>
                            <CheckCircle2 size={18} /> Receipt uploaded
                          </div>

                          <div className={styles.receiptImgWrap}>
                            <Image
                              src={receiptUrl}
                              alt="Uploaded receipt"
                              fill
                              sizes="(max-width: 900px) 92vw, 520px"
                              className={styles.receiptImg}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className={styles.receiptNote}>Upload a clear image showing the transfer details.</div>
                      )}
                    </div>

                    <div className={styles.panelCtas}>
                      <button
                        type="button"
                        className="btn btnPrimary"
                        onClick={confirmPayment}
                        disabled={confirming || confirmed || !receiptUrl}
                      >
                        {confirmed ? "Submitted" : confirming ? "Submitting…" : "Submit confirmation"}{" "}
                        <ArrowRight size={18} />
                      </button>

                      {!existingOrder ? (
                        <button type="button" className="btn btnGhost" onClick={() => setStep("details")} disabled={confirmed}>
                          Edit delivery details
                        </button>
                      ) : (
                        <Link href="/account" className="btn btnGhost">
                          Back to account
                        </Link>
                      )}
                    </div>

                    <div className={styles.afterNote}>
                      After you submit confirmation, we’ll review and proceed with your order.
                    </div>
                  </div>
                )}
              </div>

              {/* Right summary */}
              <aside className={`${styles.right} fadeInUp`}>
                <div className={`${styles.summary} card`}>
                  <div className={styles.summaryTitle}>Order summary</div>

                  <div className={styles.summaryItems}>
                    {(existingOrder ? existingOrder.order_items : items.map((it) => ({
                      id: `${it.id}-${it.color}-${it.size}`,
                      name: it.name,
                      price_ngn: it.priceNgn,
                      quantity: it.quantity,
                      size: it.size,
                      color: it.color,
                      image: it.image
                    }))).map((it: any) => (
                      <div key={it.id} className={styles.summaryItem}>
                        <div className={styles.sumImg}>
                          <Image src={it.image} alt={it.name} fill sizes="58px" className={styles.img} />
                        </div>
                        <div className={styles.sumInfo}>
                          <div className={styles.sumName}>{it.name}</div>
                          <div className={styles.sumMeta}>
                            {it.color} • {it.size} • x{it.quantity}
                          </div>
                        </div>
                        <div className={styles.sumPrice}>
                          {formatNgn((existingOrder ? it.price_ngn : it.price_ngn) * it.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hr" />

                  <div className={styles.sumLine}>
                    <span className={styles.k}>Subtotal</span>
                    <span className={styles.v}>{formatNgn(effectiveSubtotal)}</span>
                  </div>

                  <div className={styles.sumLine}>
                    <span className={styles.k}>Delivery</span>
                    <span className={styles.v}>{formatNgn(effectiveShipping)}</span>
                  </div>

                  <div className="hr" />

                  <div className={styles.sumLine}>
                    <span className={styles.kStrong}>Total</span>
                    <span className={styles.vPink}>{formatNgn(effectiveTotal)}</span>
                  </div>

                  <div className={styles.sumNote}>
                    Delivery is calculated based on your selected state.
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}