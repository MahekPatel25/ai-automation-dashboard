import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "@/lib/supabase/env";

const PUBLIC_PATHS = [
  "/login",
  "/auth/callback",
  "/unauthorized",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },

      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  const publicPath = isPublicPath(pathname);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = Boolean(user?.id);

  // Login nahi hai aur private page open kiya
  if (!isLoggedIn && !publicPath) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set(
      "next",
      `${pathname}${request.nextUrl.search}`
    );

    const redirectResponse = NextResponse.redirect(loginUrl);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  // Login already hai aur login page open kiya
  if (isLoggedIn && pathname === "/login") {
    const dashboardUrl = request.nextUrl.clone();

    dashboardUrl.pathname = "/";
    dashboardUrl.search = "";

    const redirectResponse = NextResponse.redirect(dashboardUrl);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  return supabaseResponse;
}