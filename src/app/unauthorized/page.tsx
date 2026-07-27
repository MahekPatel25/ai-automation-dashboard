"use client";

import { ShieldAlert } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-xl rounded-3xl border border-border bg-card p-7 shadow-lg sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-destructive">
            Access restricted
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Dashboard access unavailable
          </h1>

          <p className="mt-4 text-muted-foreground">
            Your Google account is either not registered as a client or
            your dashboard access is currently inactive.
          </p>
        </div>

        <div className="mt-7 rounded-2xl border border-border bg-muted/40 p-5">
          <h2 className="font-semibold">What should you do?</h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Contact the dashboard administrator and provide the Google
            email address you used to sign in. The administrator can add
            your account or reactivate your client access.
          </p>
        </div>

        <div className="mt-7 flex justify-center">
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}