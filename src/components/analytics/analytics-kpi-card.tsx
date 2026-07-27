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

function getStatusClasses(
  status: AnalyticsMetricItem["status"]
): {
  icon: string;
  indicator: string;
  progress: string;
} {
  if (status === "positive") {
    return {
      icon:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      indicator:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      progress: "bg-emerald-500",
    };
  }

  if (status === "warning") {
    return {
      icon:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      indicator:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      progress: "bg-amber-500",
    };
  }

  if (status === "danger") {
    return {
      icon:
        "bg-red-500/10 text-red-600 dark:text-red-400",
      indicator:
        "bg-red-500/10 text-red-700 dark:text-red-400",
      progress: "bg-red-500",
    };
  }

  return {
    icon: "bg-primary/10 text-primary",
    indicator:
      "bg-muted text-muted-foreground",
    progress: "bg-primary",
  };
}

export function AnalyticsKpiCard({
  item,
  isLoading = false,
}: AnalyticsKpiCardProps) {
  const Icon = iconMap[item.iconName];
  const statusClasses = getStatusClasses(
    item.status
  );

  const isPercentage =
    item.value.includes("%");

  const progressValue = Math.min(
    100,
    Math.max(0, item.rawValue)
  );

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {item.title}
          </p>

          {isLoading ? (
            <div className="mt-3 h-9 w-24 animate-pulse rounded-lg bg-muted" />
          ) : (
            <p className="mt-2 truncate text-3xl font-bold tracking-tight">
              {item.value}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${statusClasses.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 min-h-10 text-sm leading-5 text-muted-foreground">
        {item.description}
      </p>

      {isPercentage && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${statusClasses.progress}`}
              style={{
                width: isLoading
                  ? "0%"
                  : `${progressValue}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
        {isLoading ? (
          <div className="h-6 w-36 animate-pulse rounded-full bg-muted" />
        ) : (
          <span
            className={`inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses.indicator}`}
          >
            {item.trendLabel ??
              "Live analytics metric"}
          </span>
        )}
      </div>
    </article>
  );
}