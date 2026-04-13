/**
 * Raktio — Supabase browser client
 * Use this in Client Components ('use client').
 * createBrowserClient from @supabase/ssr handles cookie-based session
 * persistence automatically in the browser.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
