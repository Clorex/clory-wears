import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/app/_lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 6 * 1024 * 1024; // 6MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const FormSchema = z.object({
  orderId: z.string().min(10)
});

function safeExtFromFile(file: File) {
  const name = file.name?.toLowerCase() ?? "";
  const ext = name.includes(".") ? name.split(".").pop() : "";
  if (ext === "jpg") return "jpeg";
  if (ext === "jpeg") return "jpeg";
  if (ext === "png") return "png";
  if (ext === "webp") return "webp";
  return null;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const orderId = String(form.get("orderId") ?? "");
    const parsed = FormSchema.safeParse({ orderId });
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Missing or invalid orderId." },
        { status: 400 }
      );
    }

    const receipt = form.get("receipt");
    if (!receipt || !(receipt instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "Receipt file is required." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME.has(receipt.type)) {
      return NextResponse.json(
        { ok: false, message: "Unsupported file type. Use JPG, PNG, or WEBP." },
        { status: 400 }
      );
    }

    if (receipt.size <= 0 || receipt.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, message: "File too large. Max size is 6MB." },
        { status: 400 }
      );
    }

    const ext = safeExtFromFile(receipt);
    if (!ext) {
      return NextResponse.json(
        { ok: false, message: "Invalid file extension. Use .jpg, .png, or .webp" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    // Ensure order exists
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, reference")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { ok: false, message: "Order not found." },
        { status: 404 }
      );
    }

    // Upload to Storage: receipts bucket
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const rand = crypto.randomUUID().slice(0, 8);
    const path = `${orderId}/${stamp}-${rand}.${ext}`;

    const bytes = Buffer.from(await receipt.arrayBuffer());

    const { error: upErr } = await supabase.storage
      .from("receipts")
      .upload(path, bytes, {
        contentType: receipt.type,
        upsert: false
      });

    if (upErr) {
      return NextResponse.json(
        { ok: false, message: upErr.message ?? "Failed to upload receipt." },
        { status: 500 }
      );
    }

    // Public URL (requires the bucket to be public OR appropriate policy)
    const { data: pub } = supabase.storage.from("receipts").getPublicUrl(path);
    const receiptUrl = pub.publicUrl;

    // Attach to order
    const { error: updErr } = await supabase
      .from("orders")
      .update({
        receipt_url: receiptUrl,
        payment_status: "receipt_uploaded"
      })
      .eq("id", orderId);

    if (updErr) {
      return NextResponse.json(
        { ok: false, message: updErr.message ?? "Failed to attach receipt to order." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, receiptUrl }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message ?? "Server error." },
      { status: 500 }
    );
  }
}