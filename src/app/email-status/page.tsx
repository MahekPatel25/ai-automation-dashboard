"use client";

import {
  MailCheck,
  RefreshCw,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function EmailStatusPage() {
  function handleRefresh() {
    window.location.reload();
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground">
                <MailCheck className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-card-foreground md:text-3xl">
                  Email Status
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Track generated drafts, pending replies, sent emails and
                  workflow actions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/20 text-muted-foreground">
            <MailCheck className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Email Status page is being restored
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            The dashboard is available, but the detailed email-status records
            and draft controls need to be restored from the previous complete
            version.
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}