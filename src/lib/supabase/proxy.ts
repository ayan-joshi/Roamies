import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/privacy", "/terms"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/auth/");
}

function isDemo(pathname: string) {
  return pathname === "/demo" || pathname.startsWith("/demo/");
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname: path } = request.nextUrl;

  // Demo mode uses sample data only, so it never touches Supabase.
  if (isDemo(path)) return response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    // Not configured yet (no .env.local): keep public pages working, send the rest to the demo.
    if (isPublic(path)) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/demo/feed";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Do not put code between createServerClient and getClaims: this call
  // refreshes an expired session and verifies the JWT signature.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    if (path === "/login") url.searchParams.set("next", pathname + search);
    const redirect = NextResponse.redirect(url);
    // Carry refreshed auth cookies over to the redirect.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!signedIn && !isPublic(pathname)) return redirectTo("/login");
  if (signedIn && (pathname === "/" || pathname === "/login")) return redirectTo("/feed");

  return response;
}
