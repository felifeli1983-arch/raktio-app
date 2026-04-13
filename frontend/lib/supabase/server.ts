/**
 * Raktio — Supabase server client (SSR-safe)
 * Use this in Server Components, Server Actions, and Route Handlers.
 * createServerClient from @supabase/ssr reads/writes cookies from
 * the Next.js cookie store, keeping the session in sync with the browser.
 *
 * NOTE: cookies() is async in Next.js 15; await it.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore.
            // Middleware handles session refresh.
          }
        },
      },
    }
  );
}
