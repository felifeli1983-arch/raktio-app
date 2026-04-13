/**
 * Raktio — Next.js Middleware
 * Handles session refresh + route protection for all three route groups:
 *
 *   (auth)   → /login, /signup          — public; redirect to /overview if already signed in
 *   (app)    → /overview, /sim/*, …     — protected; redirect to /login if not signed in
 *   (admin)  → /admin/*                 — protected + platform_admin; backend enforces role
 *
 * IMPORTANT: always call supabase.auth.getUser() to refresh the session cookie.
 * Do NOT use getSession() here — it does not validate the JWT and can be spoofed.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Start with a pass-through response so we can mutate cookies on it.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Propagate updated cookies to both the outgoing request and response.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Validate JWT + refresh session — do NOT remove this line.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Route classification ──────────────────────────────────────────────
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  const isAdminRoute = pathname.startsWith("/admin");

  // Public routes that never need a session
  const isPublicRoute = pathname === "/" || isAuthRoute;

  // ── Auth-page redirect (already signed in) ────────────────────────────
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/overview";
    return NextResponse.redirect(url);
  }

  // ── Protected-route redirect (not signed in) ──────────────────────────
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Preserve original destination so we can redirect back after login
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ── Admin routes ──────────────────────────────────────────────────────
  // Client-side check is best-effort only; the backend guards enforce the
  // actual platform_admin role via DB lookup on workspace_memberships.
  // No redirect here — backend will return 403 for non-admins.
  void isAdminRoute;

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run middleware on all routes EXCEPT:
     *   - _next/static  (static assets)
     *   - _next/image   (image optimisation)
     *   - favicon.ico
     *   - Any static file with a common extension
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
