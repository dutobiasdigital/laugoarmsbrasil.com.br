import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
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

  // Refresh session tokens
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  /* ── /minha-conta — requer login ────────────────────────────── */
  if (path.startsWith("/minha-conta") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  /* ── /admin — requer login + role ADMIN ─────────────────────── */
  if (path.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    // Verifica role via REST (service role para bypass RLS)
    const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
    const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    try {
      const res = await fetch(
        `https://${PROJECT}.supabase.co/rest/v1/users?authId=eq.${user.id}&select=role&limit=1`,
        { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } }
      );
      const rows = await res.json();
      if (!Array.isArray(rows) || rows[0]?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/minha-conta", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/minha-conta", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
