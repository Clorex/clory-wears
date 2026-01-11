import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { supabaseAdmin } from "@/app/_lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  orderId: z.string().min(10),
  receiptUrl: z.string().url()
});

function naira(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
    currencyDisplay: "narrowSymbol"
  }).format(Number.isFinite(n) ? n : 0);
}

function adminNotifyEmail() {
  return (process.env.ADMIN_NOTIFY_EMAIL || "itabitamiracle090@gmail.com").trim();
}

function fromEmail() {
  // You must use a verified sender/domain in Resend.
  // "onboarding@resend.dev" works for quick testing in many setups.
  return (process.env.RESEND_FROM || "CLORY WEARS <onboarding@resend.dev>").trim();
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = BodySchema.parse(json);

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json(
        { ok: false, message: "Missing RESEND_API_KEY in environment." },
        { status: 500 }
      );
    }

    const supabase = supabaseAdmin();

    // Fetch order details
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(
        `
        id,
        reference,
        customer_email,
        customer_full_name,
        customer_phone,
        shipping_state,
        shipping_city,
        shipping_address1,
        shipping_address2,
        shipping_note,
        subtotal_ngn,
        shipping_ngn,
        grand_total_ngn,
        receipt_url,
        payment_status,
        order_status,
        created_at
      `
      )
      .eq("id", body.orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ ok: false, message: "Order not found." }, { status: 404 });
    }

    // Fetch order items
    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("name, category, price_ngn, quantity, size, color")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    if (itemsErr) {
      return NextResponse.json(
        { ok: false, message: itemsErr.message ?? "Could not fetch order items." },
        { status: 500 }
      );
    }

    // Update order to "payment claimed" (customer says they've paid)
    const nextReceiptUrl = order.receipt_url || body.receiptUrl;

    const { error: updErr } = await supabase
      .from("orders")
      .update({
        receipt_url: nextReceiptUrl,
        payment_status: "payment_claimed",
        order_status: "awaiting_payment_review"
      })
      .eq("id", order.id);

    if (updErr) {
      return NextResponse.json(
        { ok: false, message: updErr.message ?? "Failed to update order status." },
        { status: 500 }
      );
    }

    // Send you an email notification
    const resend = new Resend(resendKey);

    const to = adminNotifyEmail();
    const subject = `CLORY WEARS: Payment claimed — ${order.reference}`;

    const itemLines =
      items?.map((it) => {
        const label = `${it.name} (${it.category})`;
        const meta = `Color: ${it.color}, Size: ${it.size}, Qty: ${it.quantity}`;
        const price = `${naira(Number(it.price_ngn) * Number(it.quantity))}`;
        return `• ${label}\n  - ${meta}\n  - Line total: ${price}`;
      }) ?? [];

    const text = [
      `A customer has clicked "I have made payment".`,
      ``,
      `Order Reference: ${order.reference}`,
      `Order ID: ${order.id}`,
      `Customer: ${order.customer_full_name} (${order.customer_email})`,
      `Phone: ${order.customer_phone}`,
      ``,
      `Delivery Address:`,
      `${order.shipping_address1}${order.shipping_address2 ? `, ${order.shipping_address2}` : ""}`,
      `${order.shipping_city}, ${order.shipping_state}`,
      `${order.shipping_note ? `Note: ${order.shipping_note}` : ""}`,
      ``,
      `Pricing:`,
      `Subtotal: ${naira(Number(order.subtotal_ngn))}`,
      `Shipping: ${naira(Number(order.shipping_ngn))}`,
      `Total: ${naira(Number(order.grand_total_ngn))}`,
      ``,
      `Receipt: ${nextReceiptUrl}`,
      ``,
      `Items:`,
      ...itemLines
    ]
      .filter(Boolean)
      .join("\n");

    const htmlItems =
      items?.map((it) => {
        const lineTotal = Number(it.price_ngn) * Number(it.quantity);
        return `
          <tr>
            <td style="padding:10px 0; border-bottom:1px solid rgba(194,24,91,0.12);">
              <div style="font-weight:900; color:#111;">${it.name}</div>
              <div style="color:rgba(0,0,0,0.65); font-weight:700; font-size:13px;">
                ${it.category} • Color: ${it.color} • Size: ${it.size} • Qty: ${it.quantity}
              </div>
            </td>
            <td style="padding:10px 0; border-bottom:1px solid rgba(194,24,91,0.12); text-align:right; font-weight:900; color:#C2185B;">
              ${naira(lineTotal)}
            </td>
          </tr>
        `;
      }) ?? [];

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.5;">
        <div style="padding:14px; border:1px solid rgba(194,24,91,0.18); border-radius:16px; background:rgba(233,30,99,0.06);">
          <div style="font-weight:950; color:#C2185B; font-size:18px;">
            Payment claimed — ${order.reference}
          </div>
          <div style="color:rgba(0,0,0,0.7); font-weight:700; margin-top:6px;">
            A customer has clicked <b>I have made payment</b>. Please review the receipt.
          </div>
        </div>

        <div style="margin-top:14px; padding:14px; border:1px solid rgba(194,24,91,0.12); border-radius:16px; background:#fff;">
          <div style="font-weight:950; margin-bottom:8px;">Customer</div>
          <div><b>${order.customer_full_name}</b> — ${order.customer_email}</div>
          <div>Phone: ${order.customer_phone}</div>
        </div>

        <div style="margin-top:14px; padding:14px; border:1px solid rgba(194,24,91,0.12); border-radius:16px; background:#fff;">
          <div style="font-weight:950; margin-bottom:8px;">Delivery</div>
          <div>${order.shipping_address1}${order.shipping_address2 ? `, ${order.shipping_address2}` : ""}</div>
          <div>${order.shipping_city}, ${order.shipping_state}</div>
          ${order.shipping_note ? `<div style="margin-top:6px; color:rgba(0,0,0,0.7);">Note: ${order.shipping_note}</div>` : ""}
        </div>

        <div style="margin-top:14px; padding:14px; border:1px solid rgba(194,24,91,0.12); border-radius:16px; background:#fff;">
          <div style="font-weight:950; margin-bottom:8px;">Receipt</div>
          <div style="margin-bottom:8px;">
            <a href="${nextReceiptUrl}" target="_blank" rel="noreferrer" style="color:#C2185B; font-weight:900;">
              View uploaded receipt
            </a>
          </div>
          <div style="color:rgba(0,0,0,0.65); font-weight:700; font-size:13px;">
            If the link does not open, copy and paste: ${nextReceiptUrl}
          </div>
        </div>

        <div style="margin-top:14px; padding:14px; border:1px solid rgba(194,24,91,0.12); border-radius:16px; background:#fff;">
          <div style="font-weight:950; margin-bottom:8px;">Items</div>
          <table style="width:100%; border-collapse:collapse;">
            <tbody>
              ${htmlItems.join("")}
            </tbody>
          </table>

          <div style="margin-top:12px; display:flex; justify-content:space-between; gap:10px; font-weight:900;">
            <span style="color:rgba(0,0,0,0.7);">Subtotal</span>
            <span>${naira(Number(order.subtotal_ngn))}</span>
          </div>
          <div style="margin-top:6px; display:flex; justify-content:space-between; gap:10px; font-weight:900;">
            <span style="color:rgba(0,0,0,0.7);">Shipping</span>
            <span>${naira(Number(order.shipping_ngn))}</span>
          </div>
          <div style="margin-top:10px; display:flex; justify-content:space-between; gap:10px; font-weight:950; color:#C2185B; font-size:16px;">
            <span>Total</span>
            <span>${naira(Number(order.grand_total_ngn))}</span>
          </div>
        </div>

        <div style="margin-top:14px; color:rgba(0,0,0,0.65); font-weight:700; font-size:12px;">
          CLORY WEARS automated notification • Order ID: ${order.id}
        </div>
      </div>
    `;

    const { error: mailErr } = await resend.emails.send({
      from: fromEmail(),
      to,
      subject,
      text,
      html
    });

    if (mailErr) {
      return NextResponse.json(
        { ok: false, message: mailErr.message ?? "Email send failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const msg =
      e?.name === "ZodError"
        ? "Invalid data for payment confirmation."
        : e?.message ?? "Server error.";
    return NextResponse.json({ ok: false, message: msg }, { status: 400 });
  }
}