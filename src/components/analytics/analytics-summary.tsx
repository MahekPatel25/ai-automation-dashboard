"use client";

import { useMemo } from "react";

import type { DashboardApiData } from "@/types/dashboard";

import { AnalyticsKpiCard } from "./analytics-kpi-card";
import { createAnalyticsMetricItems } from "./analytics-metrics";

interface AnalyticsSummaryProps {
  data?: DashboardApiData | null;
  isLoading?: boolean;
}

export function AnalyticsSummary({
  data,
  isLoading = false,
}: AnalyticsSummaryProps) {
  const metricItems = useMemo(() => {
    return createAnalyticsMetricItems(data);
  }, [data]);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Analytics Overview
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Live AI performance, reply success and
            automation health metrics
          </p>
        </div>

        {data?.generatedAt && !isLoading && (
          <p className="text-xs text-muted-foreground">
            Updated{" "}
            {new Intl.DateTimeFormat("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(
              new Date(data.generatedAt)
            )}
          </p>
        )}
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