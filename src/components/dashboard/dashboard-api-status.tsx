"use client";

import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

interface DashboardApiStatusProps {
  isLoading: boolean;
  error: string | null;
  generatedAt?: string;
  onRefresh: () => Promise<void>;
}

export function DashboardApiStatus({
  isLoading,
  error,
  generatedAt,
  onRefresh,
}: DashboardApiStatusProps) {
  if (isLoading) {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>

        <div>
          <p className="text-sm font-semibold">
            Connecting to n8n
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Loading live dashboard data...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <AlertCircle className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold">
              n8n dashboard connection unavailable
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {error} Fallback dashboard data is currently
              displayed.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void onRefresh()}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold">
            Connected to n8n
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Live Google Sheets data loaded successfully
            {generatedAt
              ? ` · Updated ${new Date(
                  generatedAt
                ).toLocaleString()}`
              : ""}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void onRefresh()}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition hover:bg-accent"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </button>
    </section>
  );
}