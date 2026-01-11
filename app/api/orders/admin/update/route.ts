import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/app/_lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBearerToken(req: Request): string | null {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!h) return null;
  const [type, token] = h.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

async function requireAdminEmail(token: string): Promise<string> {
  const supabase = supabaseAdmin();

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user?.email) {
    throw new Error("Unauthorized: invalid session token.");
  }

  const email = userData.user.email.toLowerCase();

  const { data: adminRow, error: adminErr } = await supabase
    .from("admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (adminErr) throw new Error(adminErr.message);
  if (!adminRow?.email) throw new Error("Forbidden: not an admin.");

  return email;
}

const BodySchema = z.object({
  orderId: z.string().min(10),
  payment_status: z
    .enum(["pending", "receipt_uploaded", "payment_claimed", "paid", "rejected"])
    .optional(),
  order_status: z
    .enum(["created", "awaiting_payment_review", "processing", "shipped", "delivered", "cancelled"])
    .optional()
});

export async function POST(req: Request) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Missing Authorization Bearer token." },
        { status: 401 }
      );
    }

    await requireAdminEmail(token);

    const body = BodySchema.parse(await req.json());

    if (!body.payment_status && !body.order_status) {
      return NextResponse.json(
        { ok: false, message: "Nothing to update." },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    // Ensure order exists
    const { data: order, error: oErr } = await supabase
      .from("orders")
      .select("id, payment_status, order_status")
      .eq("id", body.orderId)
      .single();

    if (oErr || !order) {
      return NextResponse.json({ ok: false, message: "Order not found." }, { status: 404 });
    }

    // Simple safety checks:
    // - If marking paid, also ensure order_status is not cancelled.
    // - If cancelling, set payment_status to rejected unless already paid (optional).
    const update: Record<string, any> = {};
    if (body.payment_status) update.payment_status = body.payment_status;
    if (body.order_status) update.order_status = body.order_status;

    if (body.order_status === "cancelled" && order.payment_status !== "paid") {
      // Keep consistent meaning: cancelled orders are not "paid"
      update.payment_status = update.payment_status ?? "rejected";
    }

    if (body.payment_status === "paid" && order.order_status === "cancelled") {
      return NextResponse.json(
        { ok: false, message: "Cannot mark a cancelled order as paid." },
        { status: 400 }
      );
    }

    const { error: updErr } = await supabase.from("orders").update(update).eq("id", body.orderId);

    if (updErr) {
      return NextResponse.json(
        { ok: false, message: updErr.message ?? "Update failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const msg =
      e?.name === "ZodError"
        ? "Invalid update payload."
        : e?.message ?? "Server error.";

    const status =
      msg.toLowerCase().includes("forbidden") ? 403 : msg.toLowerCase().includes("unauthorized") ? 401 : 400;

    return NextResponse.json({ ok: false, message: msg }, { status });
  }
}