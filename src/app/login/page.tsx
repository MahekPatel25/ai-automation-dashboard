"use client";

import { useState } from "react";
import { Loader2, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleGoogleLogin() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Google login start nahi ho saka.";

      setErrorMessage(message);
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-140px] top-[-140px] h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[-120px] h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden border-r border-white/10 p-12 lg:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-400/30">
                  <Sparkles className="h-5 w-5 text-violet-300" />
                </div>

                <div>
                  <p className="text-sm text-slate-400">AI Automation Hub</p>
                  <h1 className="font-semibold">Email Assistant</h1>
                </div>
              </div>

              <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
                Manage your AI-powered email workflow securely.
              </h2>

              <p className="mt-5 max-w-md leading-7 text-slate-400">
                Sign in using your registered Google account to access your
                private dashboard, email analytics and automation controls.
              </p>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Secure Google authentication
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400" />
                Client-specific email data
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-[560px] items-center p-6 sm:p-10 lg:p-12">
          <div className="w-full">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-400/30">
                <Sparkles className="h-5 w-5 text-violet-300" />
              </div>

              <p className="text-sm text-slate-400">AI Automation Hub</p>
            </div>

            <p className="text-sm font-medium text-violet-300">
              Secure client access
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Welcome back
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              Continue using the Google account registered for your AI Email
              Assistant.
            </p>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white px-5 font-medium text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>

            {errorMessage ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                <p className="text-sm leading-6 text-slate-400">
                  Only authorized client accounts will be able to access the
                  dashboard after the client verification system is connected.
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-xs leading-5 text-slate-500">
              Your Google password is never shared with this dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.509h3.232c1.891-1.741 2.981-4.305 2.981-7.35Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.895 6.619-2.423l-3.232-2.509c-.895.6-2.041.955-3.387.955-2.605 0-4.809-1.759-5.6-4.123H3.059v2.591A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.9A6.015 6.015 0 0 1 6.086 12c0-.659.114-1.3.314-1.9V7.509H3.059A10 10 0 0 0 2 12c0 1.614.386 3.141 1.059 4.491L6.4 13.9Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C16.959 2.991 14.7 2 12 2a10 10 0 0 0-8.941 5.509L6.4 10.1c.791-2.364 2.995-4.123 5.6-4.123Z"
      />
    </svg>
  );
}