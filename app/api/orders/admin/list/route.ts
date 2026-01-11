import { NextResponse } from "next/server";
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

export async function GET(req: Request) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Missing Authorization Bearer token." },
        { status: 401 }
      );
    }

    await requireAdminEmail(token);

    const supabase = supabaseAdmin();

    const { data, error } = await supabase
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
          id, name, category, price_ngn, quantity, size, color, image, created_at
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message ?? "Failed to fetch orders." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, orders: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message ?? "Server error.";
    const status =
      msg.toLowerCase().includes("forbidden") ? 403 : msg.toLowerCase().includes("unauthorized") ? 401 : 500;

    return NextResponse.json({ ok: false, message: msg }, { status });
  }
}