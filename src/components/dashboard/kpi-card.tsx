import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";

import type { KpiItem } from "./kpi-data";

interface KpiCardProps {
  item: KpiItem;
  isLoading?: boolean;
}

interface KpiCardColors {
  iconText: string;
  iconBackground: string;
  iconBorder: string;

  indicatorText: string;
  indicatorBackground: string;
  indicatorBorder: string;

  dot: string;
  topLine: string;
}

const KPI_COLORS: Record<
  KpiItem["trendType"],
  KpiCardColors
> = {
  positive: {
    iconText: "#2F8F46",
    iconBackground: "rgba(47, 143, 70, 0.08)",
    iconBorder: "rgba(47, 143, 70, 0.20)",

    indicatorText: "#287A3C",
    indicatorBackground: "rgba(47, 143, 70, 0.07)",
    indicatorBorder: "rgba(47, 143, 70, 0.20)",

    dot: "#3A9F52",
    topLine: "rgba(47, 143, 70, 0.42)",
  },

  negative: {
    iconText: "#C11007",
    iconBackground: "rgba(193, 16, 7, 0.08)",
    iconBorder: "rgba(193, 16, 7, 0.24)",

    indicatorText: "#C11007",
    indicatorBackground: "rgba(193, 16, 7, 0.07)",
    indicatorBorder: "rgba(193, 16, 7, 0.24)",

    dot: "#C11007",
    topLine: "rgba(193, 16, 7, 0.45)",
  },

  neutral: {
    iconText: "#3E63A8",
    iconBackground: "rgba(62, 99, 168, 0.08)",
    iconBorder: "rgba(62, 99, 168, 0.20)",

    indicatorText: "#35558F",
    indicatorBackground: "rgba(62, 99, 168, 0.07)",
    indicatorBorder: "rgba(62, 99, 168, 0.20)",

    dot: "#4A6FB3",
    topLine: "rgba(62, 99, 168, 0.40)",
  },
};

export function KpiCard({
  item,
  isLoading = false,
}: KpiCardProps) {
  if (isLoading) {
    return <KpiCardSkeleton />;
  }

  const colors = KPI_COLORS[item.trendType];

  const TrendIcon =
    item.trendType === "positive"
      ? ArrowUpRight
      : item.trendType === "negative"
        ? ArrowDownRight
        : Minus;

  const Icon = item.icon;

  return (
    <article className="group relative min-h-[158px] overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${colors.topLine},
            transparent
          )`,
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">
            {item.title}
          </p>

          <p className="mt-1.5 truncate text-[30px] font-bold tracking-tight text-card-foreground">
            {item.value}
          </p>
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-[1.04]"
          style={{
            color: colors.iconText,
            backgroundColor: colors.iconBackground,
            borderColor: colors.iconBorder,
          }}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
        {item.description}
      </p>

      <div className="mt-3 border-t border-border/60 pt-3">
        <span
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
          style={{
            color: colors.indicatorText,
            backgroundColor: colors.indicatorBackground,
            borderColor: colors.indicatorBorder,
          }}
        >
          <TrendIcon className="h-3.5 w-3.5 shrink-0" />

          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              backgroundColor: colors.dot,
            }}
          />

          <span className="truncate">
            {item.trend}
          </span>
        </span>
      </div>
    </article>
  );
}

function KpiCardSkeleton() {
  return (
    <article className="min-h-[158px] rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />

          <div className="mt-3 h-8 w-16 animate-pulse rounded-lg bg-muted" />
        </div>

        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-muted" />
      </div>

      <div className="mt-4 h-3.5 w-full animate-pulse rounded-md bg-muted" />

      <div className="mt-2 h-3.5 w-3/4 animate-pulse rounded-md bg-muted" />

      <div className="mt-4 border-t border-border pt-3">
        <div className="h-7 w-32 animate-pulse rounded-full bg-muted" />
      </div>
    </article>
  );
}