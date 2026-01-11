"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, CloudUpload, CreditCard, MapPin, ShieldAlert } from "lucide-react";

import { useAuth } from "../../_providers/AuthProvider";
import { useCart } from "../../_providers/CartProvider";
import { useToast } from "../../_providers/ToastProvider";
import { formatNgn } from "../../_lib/format";
import { listShippingStates, shippingPriceForState } from "../../_data/shippingRates";
import styles from "./Checkout.module.css";

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

export default function CheckoutClient() {
  const { user, loading } = useAuth();
  const { items, subtotalNgn, clearCart } = useCart();
  const { show } = useToast();

  const [step, setStep] = useState<Step>("details");

  // Delivery details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [stateName, setStateName] = useState("Lagos");
  const [city, setCity] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [note, setNote] = useState("");

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

  const shippingNgn = useMemo(() => shippingPriceForState(stateName), [stateName]);
  const grandTotalNgn = useMemo(() => subtotalNgn + shippingNgn, [subtotalNgn, shippingNgn]);

  const states = useMemo(() => listShippingStates(), []);

  const cartEmpty = items.length === 0;

  async function createOrder() {
    if (cartEmpty) {
      show({ kind: "info", title: "Your cart is empty", message: "Add items before checkout." });
      return;
    }

    // This store is personalized: checkout requires account so user can upload receipts & track orders.
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
        message: `Order ref: ${data.order.reference}. Proceed to payment instructions.`
      });
    } catch (e: any) {
      show({ kind: "error", title: "Checkout error", message: e?.message ?? "Something went wrong." });
    } finally {
      setCreating(false);
    }
  }

  async function uploadReceipt(file: File) {
    if (!orderId) {
      show({ kind: "error", title: "Create an order first", message: "Please submit delivery details." });
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
        show({ kind: "error", title: "Receipt upload failed", message: data.message });
        return;
      }

      setReceiptUrl(data.receiptUrl);
      show({ kind: "success", title: "Receipt uploaded", message: "You can now confirm payment." });
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
        show({ kind: "error", title: "Could not confirm payment", message: data.message });
        return;
      }

      setConfirmed(true);
      clearCart();

      show({
        kind: "success",
        title: "Payment confirmation sent",
        message: "We have received your confirmation and will review your receipt."
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
              Delivery is state-based. Payment is via OPay transfer. Upload your receipt and click{" "}
              <b>I have made payment</b> to notify us by email.
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
              <div className={styles.stepText}>Payment & receipt</div>
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
                <ShieldAlert size={18} /> Login required to checkout
              </div>
              <div className={styles.noticeText}>
                This store uses personalized accounts so you can track orders and upload receipts easily.
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
          ) : cartEmpty ? (
            <div className={`${styles.notice} card fadeInUp`}>
              <div className={styles.noticeTitle}>Your cart is empty</div>
              <div className={styles.noticeText}>
                Add items to your cart before checkout.
              </div>
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
                          Email (from your account)
                        </label>
                        <input
                          id="email"
                          className="input"
                          value={user.email ?? ""}
                          readOnly
                        />
                        <div className="helper">This is where order updates will be linked.</div>
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
                      <button
                        type="button"
                        className="btn btnPrimary"
                        onClick={createOrder}
                        disabled={creating}
                      >
                        {creating ? "Creating order…" : "Continue to payment"}
                        <ArrowRight size={18} />
                      </button>

                      <Link href="/cart" className="btn btnGhost">
                        Back to cart
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className={`${styles.panel} card`}>
                    <div className={styles.panelTitle}>
                      <CreditCard size={18} /> Payment instructions
                    </div>

                    <div className={styles.orderMeta}>
                      <div className={styles.orderLine}>
                        <span className={styles.k}>Order reference</span>
                        <span className={styles.vStrong}>{orderRef ?? "—"}</span>
                      </div>
                      <div className={styles.orderLine}>
                        <span className={styles.k}>Amount to pay</span>
                        <span className={styles.vPink}>{formatNgn(grandTotalNgn)}</span>
                      </div>
                    </div>

                    <div className={styles.paymentBox}>
                      <div className={styles.paymentTitle}>Pay to this OPay account</div>
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
                        Use your <b>Order reference</b> as narration if possible.
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
                        <div className={styles.receiptNote}>
                          Upload a clear image showing the transfer details.
                        </div>
                      )}
                    </div>

                    <div className={styles.panelCtas}>
                      <button
                        type="button"
                        className="btn btnPrimary"
                        onClick={confirmPayment}
                        disabled={confirming || confirmed || !receiptUrl}
                      >
                        {confirmed ? "Payment confirmed" : confirming ? "Sending confirmation…" : "I have made payment"}
                        <ArrowRight size={18} />
                      </button>

                      <button
                        type="button"
                        className="btn btnGhost"
                        onClick={() => setStep("details")}
                        disabled={confirmed}
                      >
                        Edit delivery details
                      </button>
                    </div>

                    <div className={styles.afterNote}>
                      When you click <b>I have made payment</b>, we will receive an email notification at{" "}
                      <b>itabitamiracle090@gmail.com</b> to review your receipt.
                    </div>
                  </div>
                )}
              </div>

              {/* Right summary */}
              <aside className={`${styles.right} fadeInUp`}>
                <div className={`${styles.summary} card`}>
                  <div className={styles.summaryTitle}>Order summary</div>

                  <div className={styles.summaryItems}>
                    {items.map((it) => (
                      <div key={`${it.id}-${it.color}-${it.size}`} className={styles.summaryItem}>
                        <div className={styles.sumImg}>
                          <Image src={it.image} alt={it.name} fill sizes="58px" className={styles.img} />
                        </div>
                        <div className={styles.sumInfo}>
                          <div className={styles.sumName}>{it.name}</div>
                          <div className={styles.sumMeta}>
                            {it.color} • {it.size} • x{it.quantity}
                          </div>
                        </div>
                        <div className={styles.sumPrice}>{formatNgn(it.priceNgn * it.quantity)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="hr" />

                  <div className={styles.sumLine}>
                    <span className={styles.k}>Subtotal</span>
                    <span className={styles.v}>{formatNgn(subtotalNgn)}</span>
                  </div>

                  <div className={styles.sumLine}>
                    <span className={styles.k}>Shipping ({stateName})</span>
                    <span className={styles.v}>{formatNgn(shippingNgn)}</span>
                  </div>

                  <div className="hr" />

                  <div className={styles.sumLine}>
                    <span className={styles.kStrong}>Total</span>
                    <span className={styles.vPink}>{formatNgn(grandTotalNgn)}</span>
                  </div>

                  <div className={styles.sumNote}>
                    Shipping is based on your selected state. If you change state, the shipping fee changes too.
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