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

function formatUpdatedTime(value?: string) {
  if (!value) {
    return "Live data is available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Live data is available";
  }

  return `Updated ${new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date)}`;
}

export function DashboardApiStatus({
  isLoading,
  error,
  generatedAt,
  onRefresh,
}: DashboardApiStatusProps) {
  if (isLoading) {
    return (
      <section className="flex min-w-[280px] items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-card-foreground">
            Connecting to n8n
          </p>

          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Loading dashboard data...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-w-[280px] items-center gap-3 rounded-2xl border border-[var(--warning)]/35 bg-card px-4 py-3 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 text-[var(--warning)]">
          <AlertCircle className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-card-foreground">
            Connection unavailable
          </p>

          <p
            className="mt-0.5 truncate text-xs text-muted-foreground"
            title={error}
          >
            Fallback data is currently displayed
          </p>
        </div>

        <button
          type="button"
          onClick={() => void onRefresh()}
          aria-label="Retry dashboard connection"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-ring/50 hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </section>
    );
  }

  return (
    <section className="flex min-w-[280px] items-center gap-3 rounded-2xl border border-[var(--success)]/30 bg-card px-4 py-3 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--success)]/25 bg-[var(--success)]/10 text-[var(--success)]">
        <CheckCircle2 className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-card-foreground">
            Connected to n8n
          </p>

          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--success)]" />
        </div>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {formatUpdatedTime(generatedAt)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void onRefresh()}
        aria-label="Refresh dashboard data"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-ring/50 hover:text-foreground"
      >
        <RefreshCw className="h-4 w-4 transition-transform duration-300 hover:rotate-90" />
      </button>
    </section>
  );
}