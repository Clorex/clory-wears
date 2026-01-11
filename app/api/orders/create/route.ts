import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/app/_lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["trousers", "shirts"]),
  priceNgn: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
  size: z.string().min(1),
  color: z.string().min(1),
  image: z.string().min(1)
});

const BodySchema = z.object({
  customer: z.object({
    email: z.string().email(),
    fullName: z.string().min(2),
    phone: z.string().min(6)
  }),
  shipping: z.object({
    state: z.string().min(2),
    city: z.string().min(2),
    address1: z.string().min(4),
    address2: z.string().optional().nullable(),
    note: z.string().optional().nullable()
  }),
  pricing: z.object({
    subtotalNgn: z.number().int().nonnegative(),
    shippingNgn: z.number().int().nonnegative(),
    grandTotalNgn: z.number().int().positive()
  }),
  items: z.array(ItemSchema).min(1)
});

function makeReference() {
  // Example: CLORY-20260111-7F2A9C
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `CLORY-${y}${m}${day}-${rand}`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = BodySchema.parse(json);

    // Server-side total validation (basic)
    const computedSubtotal = body.items.reduce(
      (sum, it) => sum + it.priceNgn * it.quantity,
      0
    );
    const computedGrand = computedSubtotal + body.pricing.shippingNgn;

    if (computedSubtotal !== body.pricing.subtotalNgn) {
      return NextResponse.json(
        { ok: false, message: "Subtotal mismatch. Please refresh and try again." },
        { status: 400 }
      );
    }

    if (computedGrand !== body.pricing.grandTotalNgn) {
      return NextResponse.json(
        { ok: false, message: "Total mismatch. Please refresh and try again." },
        { status: 400 }
      );
    }

    const reference = makeReference();

    const supabase = supabaseAdmin();

    // 1) Create order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        reference,
        customer_email: body.customer.email.toLowerCase(),
        customer_full_name: body.customer.fullName,
        customer_phone: body.customer.phone,

        shipping_state: body.shipping.state,
        shipping_city: body.shipping.city,
        shipping_address1: body.shipping.address1,
        shipping_address2: body.shipping.address2 ?? null,
        shipping_note: body.shipping.note ?? null,

        subtotal_ngn: body.pricing.subtotalNgn,
        shipping_ngn: body.pricing.shippingNgn,
        grand_total_ngn: body.pricing.grandTotalNgn,

        payment_status: "pending",
        order_status: "created",
        receipt_url: null
      })
      .select("id, reference")
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { ok: false, message: orderErr?.message ?? "Failed to create order." },
        { status: 500 }
      );
    }

    // 2) Insert items
    const itemsToInsert = body.items.map((it) => ({
      order_id: order.id,
      product_id: it.productId,
      name: it.name,
      category: it.category,
      price_ngn: it.priceNgn,
      quantity: it.quantity,
      size: it.size,
      color: it.color,
      image: it.image
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(itemsToInsert);

    if (itemsErr) {
      // If items insert fails, mark order as errored (optional) or delete it
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { ok: false, message: itemsErr.message ?? "Failed to add order items." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, order: { id: order.id, reference: order.reference } },
      { status: 200 }
    );
  } catch (e: any) {
    const msg =
      e?.name === "ZodError"
        ? "Invalid checkout data. Please check your inputs."
        : e?.message ?? "Server error.";
    return NextResponse.json({ ok: false, message: msg }, { status: 400 });
  }
}