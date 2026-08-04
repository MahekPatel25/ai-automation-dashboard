"use client";

import { useMemo } from "react";
import {
  Activity,
  Clock3,
} from "lucide-react";

import type { DashboardApiData } from "@/types/dashboard";

import { AnalyticsKpiCard } from "./analytics-kpi-card";
import { createAnalyticsMetricItems } from "./analytics-metrics";

interface AnalyticsSummaryProps {
  data?: DashboardApiData | null;
  isLoading?: boolean;
}

function formatUpdatedAt(value?: string) {
  if (!value) {
    return "Waiting for live data";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Live dashboard data";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(parsedDate);
}

export function AnalyticsSummary({
  data,
  isLoading = false,
}: AnalyticsSummaryProps) {
  const metricItems = useMemo(() => {
    return createAnalyticsMetricItems(data);
  }, [data]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/35 text-muted-foreground">
              <Activity className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
                Analytics Overview
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Live AI performance, reply success and
                automation health metrics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
          <Clock3 className="h-4 w-4 text-muted-foreground" />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Last Updated
            </p>

            <p className="mt-0.5 text-sm font-medium text-card-foreground">
              {isLoading
                ? "Loading live data..."
                : formatUpdatedAt(data?.generatedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricItems.map((item) => (
          <AnalyticsKpiCard
            key={item.title}
            item={item}
            isLoading={isLoading}
          />
        ))}
      </div>
    </section>
  );
}