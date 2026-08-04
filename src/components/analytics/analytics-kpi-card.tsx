"use client";

import {
  AlertTriangle,
  Bot,
  CalendarCheck2,
  FileCheck2,
  Mail,
  MessageSquareReply,
  Paperclip,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import type { AnalyticsMetricItem } from "./analytics-metrics";

interface AnalyticsKpiCardProps {
  item: AnalyticsMetricItem;
  isLoading?: boolean;
}

const iconMap: Record<
  AnalyticsMetricItem["iconName"],
  LucideIcon
> = {
  mail: Mail,
  brain: Bot,
  message: MessageSquareReply,
  file: FileCheck2,
  workflow: Workflow,
  paperclip: Paperclip,
  calendar: CalendarCheck2,
  alert: AlertTriangle,
};

interface StatusColors {
  iconText: string;
  iconBackground: string;
  iconBorder: string;

  indicatorText: string;
  indicatorBackground: string;
  indicatorBorder: string;

  progress: string;
  dot: string;
  topLine: string;
}

const STATUS_COLORS: Record<
  AnalyticsMetricItem["status"],
  StatusColors
> = {
  positive: {
    iconText: "#2F8F46",
    iconBackground: "rgba(47, 143, 70, 0.08)",
    iconBorder: "rgba(47, 143, 70, 0.20)",

    indicatorText: "#287A3C",
    indicatorBackground: "rgba(47, 143, 70, 0.07)",
    indicatorBorder: "rgba(47, 143, 70, 0.20)",

    progress: "#3A9F52",
    dot: "#3A9F52",
    topLine: "rgba(47, 143, 70, 0.42)",
  },

  warning: {
    iconText: "#B77812",
    iconBackground: "rgba(183, 120, 18, 0.08)",
    iconBorder: "rgba(183, 120, 18, 0.21)",

    indicatorText: "#9B650E",
    indicatorBackground: "rgba(183, 120, 18, 0.07)",
    indicatorBorder: "rgba(183, 120, 18, 0.20)",

    progress: "#C58A20",
    dot: "#C58A20",
    topLine: "rgba(183, 120, 18, 0.42)",
  },

  danger: {
    iconText: "#C11007",
    iconBackground: "rgba(193, 16, 7, 0.08)",
    iconBorder: "rgba(193, 16, 7, 0.24)",

    indicatorText: "#C11007",
    indicatorBackground: "rgba(193, 16, 7, 0.07)",
    indicatorBorder: "rgba(193, 16, 7, 0.24)",

    progress: "#C11007",
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

    progress: "#4A6FB3",
    dot: "#4A6FB3",
    topLine: "rgba(62, 99, 168, 0.40)",
  },
};

export function AnalyticsKpiCard({
  item,
  isLoading = false,
}: AnalyticsKpiCardProps) {
  const Icon = iconMap[item.iconName];
  const colors = STATUS_COLORS[item.status];

  const isPercentage = item.value.includes("%");

  const progressValue = Math.min(
    100,
    Math.max(0, item.rawValue)
  );

  if (isLoading) {
    return <AnalyticsKpiCardSkeleton />;
  }

  return (
    <article className="group relative min-h-[220px] overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md">
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

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {item.title}
          </p>

          <p className="mt-2 truncate text-3xl font-bold tracking-tight text-card-foreground">
            {item.value}
          </p>
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-[1.04]"
          style={{
            color: colors.iconText,
            backgroundColor: colors.iconBackground,
            borderColor: colors.iconBorder,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 min-h-10 text-sm leading-5 text-muted-foreground">
        {item.description}
      </p>

      {isPercentage && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              Performance
            </span>

            <span
              className="text-xs font-semibold"
              style={{
                color: colors.indicatorText,
              }}
            >
              {progressValue.toFixed(
                progressValue % 1 === 0 ? 0 : 1
              )}
              %
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${progressValue}%`,
                backgroundColor: colors.progress,
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-border/60 pt-4">
        <span
          className="inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold"
          style={{
            color: colors.indicatorText,
            backgroundColor: colors.indicatorBackground,
            borderColor: colors.indicatorBorder,
          }}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{
              backgroundColor: colors.dot,
            }}
          />

          <span className="truncate">
            {item.trendLabel ?? "Live analytics metric"}
          </span>
        </span>
      </div>
    </article>
  );
}

function AnalyticsKpiCardSkeleton() {
  return (
    <article className="min-h-[220px] rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />

          <div className="mt-3 h-9 w-24 animate-pulse rounded-lg bg-muted" />
        </div>

        <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-muted" />
      </div>

      <div className="mt-5 h-4 w-full animate-pulse rounded-md bg-muted" />

      <div className="mt-2 h-4 w-3/4 animate-pulse rounded-md bg-muted" />

      <div className="mt-5 h-2 w-full animate-pulse rounded-full bg-muted" />

      <div className="mt-5 border-t border-border pt-4">
        <div className="h-7 w-40 animate-pulse rounded-full bg-muted" />
      </div>
    </article>
  );
}