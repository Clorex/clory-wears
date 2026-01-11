"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";

import { useCart } from "../../_providers/CartProvider";
import { formatNgn } from "../../_lib/format";
import styles from "./Cart.module.css";
import { useToast } from "../../_providers/ToastProvider";

export default function CartClient() {
  const { items, subtotalNgn, totalItems, setQuantity, removeItem, clearCart } = useCart();
  const { show } = useToast();

  const hasItems = items.length > 0;

  const summary = useMemo(() => {
    return {
      subtotal: subtotalNgn,
      count: totalItems
    };
  }, [subtotalNgn, totalItems]);

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className="fadeInUp">
            <h1 className={styles.h1}>Your Cart</h1>
            <p className={styles.sub}>
              Review your items, adjust quantity, then checkout to get payment instructions and upload
              your receipt.
            </p>
          </div>

          <div className={`${styles.summaryTop} fadeInUp`}>
            <div className={styles.summaryLine}>
              <span className={styles.k}>Items</span>
              <span className={styles.v}>{summary.count}</span>
            </div>
            <div className={styles.summaryLine}>
              <span className={styles.k}>Subtotal</span>
              <span className={styles.vPink}>{formatNgn(summary.subtotal)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {!hasItems ? (
            <div className={`${styles.empty} card fadeInUp`}>
              <div className={styles.emptyTitle}>Your cart is empty</div>
              <div className={styles.emptyText}>
                Browse products and add your favorites — sizes and colors can be selected on each product page.
              </div>
              <Link href="/shop" className="btn btnPrimary">
                Go to Shop <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              <div className={`${styles.list} card fadeInUp`}>
                <div className={styles.listHead}>
                  <div className={styles.listTitle}>Cart items</div>
                  <button
                    type="button"
                    className="btn btnDanger"
                    onClick={() => {
                      clearCart();
                      show({ kind: "info", title: "Cart cleared" });
                    }}
                  >
                    Clear cart
                  </button>
                </div>

                <div className={styles.items}>
                  {items.map((it) => (
                    <div key={`${it.id}-${it.color}-${it.size}`} className={styles.item}>
                      <div className={styles.itemImg}>
                        <Image
                          src={it.image}
                          alt={it.name}
                          fill
                          sizes="88px"
                          className={styles.img}
                        />
                      </div>

                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{it.name}</div>
                        <div className={styles.itemMeta}>
                          <span className={styles.metaChip}>Color: {it.color}</span>
                          <span className={styles.metaChip}>Size: {it.size}</span>
                        </div>

                        <div className={styles.itemPrice}>{formatNgn(it.priceNgn)}</div>

                        <div className={styles.itemControls}>
                          <div className={styles.qtyControls}>
                            <button
                              type="button"
                              className={`btn btnGhost ${styles.qtyBtn}`}
                              onClick={() =>
                                setQuantity({ id: it.id, size: it.size, color: it.color }, it.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus size={18} />
                            </button>

                            <div className={styles.qtyBox}>{it.quantity}</div>

                            <button
                              type="button"
                              className={`btn btnGhost ${styles.qtyBtn}`}
                              onClick={() =>
                                setQuantity({ id: it.id, size: it.size, color: it.color }, it.quantity + 1)
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus size={18} />
                            </button>
                          </div>

                          <button
                            type="button"
                            className={`btn btnDanger ${styles.removeBtn}`}
                            onClick={() => {
                              removeItem({ id: it.id, size: it.size, color: it.color });
                              show({ kind: "info", title: "Removed from cart", message: it.name });
                            }}
                          >
                            <Trash2 size={18} />
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className={styles.itemTotal}>
                        <div className={styles.itemTotalLabel}>Total</div>
                        <div className={styles.itemTotalValue}>{formatNgn(it.priceNgn * it.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className={`${styles.side} fadeInUp`}>
                <div className={`${styles.sideCard} card`}>
                  <div className={styles.sideTitle}>Order summary</div>

                  <div className={styles.sideLine}>
                    <span className={styles.k}>Subtotal</span>
                    <span className={styles.v}>{formatNgn(subtotalNgn)}</span>
                  </div>

                  <div className={styles.sideLine}>
                    <span className={styles.k}>Shipping</span>
                    <span className={styles.v}>Calculated at checkout</span>
                  </div>

                  <div className="hr" />

                  <div className={styles.sideLine}>
                    <span className={styles.kStrong}>Estimated total</span>
                    <span className={styles.vPink}>{formatNgn(subtotalNgn)}</span>
                  </div>

                  <div className={styles.sideNote}>
                    Final total will include state-based shipping fee at checkout.
                  </div>

                  <Link href="/checkout" className="btn btnPrimary" aria-label="Proceed to checkout">
                    Proceed to checkout <ArrowRight size={18} />
                  </Link>

                  <div className={styles.payNote}>
                    Payment is via <b>OPay transfer</b>. You’ll upload your receipt after checkout.
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