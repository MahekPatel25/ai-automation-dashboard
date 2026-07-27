import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { KpiItem } from "./kpi-data";

interface KpiCardProps {
  item: KpiItem;
  isLoading?: boolean;
}

export function KpiCard({
  item,
  isLoading = false,
}: KpiCardProps) {
  const TrendIcon =
    item.trendType === "positive"
      ? ArrowUpRight
      : item.trendType === "negative"
        ? ArrowDownRight
        : Minus;

  if (isLoading) {
    return <KpiCardSkeleton />;
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {item.title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight">
            {item.value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
          <item.icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="truncate text-xs text-muted-foreground">
          {item.description}
        </p>

        <div
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
            item.trendType === "positive" &&
              "bg-emerald-500/10 text-emerald-500",
            item.trendType === "negative" &&
              "bg-red-500/10 text-red-500",
            item.trendType === "neutral" &&
              "bg-muted text-muted-foreground"
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />

          <span>{item.trend}</span>
        </div>
      </div>
    </article>
  );
}

function KpiCardSkeleton() {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />

          <div className="mt-4 h-9 w-20 animate-pulse rounded-lg bg-muted" />
        </div>

        <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-muted" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="h-3 w-32 animate-pulse rounded-md bg-muted" />

        <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
      </div>
    </article>
  );
}