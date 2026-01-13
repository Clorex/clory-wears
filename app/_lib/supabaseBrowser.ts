import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey);
}

export function supabaseBrowser(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // This is the most common production issue: env vars not set on Vercel
    // (Your local .env.local does NOT get uploaded to Vercel.)
    throw new Error(
      [
        "Supabase is not configured.",
        "",
        "Missing environment variables:",
        "- NEXT_PUBLIC_SUPABASE_URL",
        "- NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "",
        "Fix:",
        "1) Vercel Dashboard → Your Project → Settings → Environment Variables",
        "2) Add the variables above (copy from your local .env.local)",
        "3) Redeploy the project",
        "",
        "Local note:",
        "Your .env.local only works on your computer; Vercel requires its own env vars."
      ].join("\n")
    );
  }

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return browserClient;
}