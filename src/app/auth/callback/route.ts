import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_oauth_code", requestUrl.origin)
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Supabase OAuth callback error:", error.message);

    return NextResponse.redirect(
      new URL("/login?error=oauth_callback_failed", requestUrl.origin)
    );
  }

  const safeNextPath = next.startsWith("/") ? next : "/";

  return NextResponse.redirect(
    new URL(safeNextPath, requestUrl.origin)
  );
}