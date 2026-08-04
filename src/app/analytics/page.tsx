"use client";

import { BarChart3 } from "lucide-react";

import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { AnalyticsSummary } from "@/components/analytics/analytics-summary";
import { DashboardApiStatus } from "@/components/dashboard/dashboard-api-status";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export default function AnalyticsPage() {
  const {
    data,
    isLoading,
    error,
    refresh,
  } = useDashboardData();

  return (
    <DashboardShell>
      <div className="space-y-7">
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground">
                <BarChart3 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-card-foreground md:text-3xl">
                  Email Analytics
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Monitor AI accuracy, reply performance,
                  draft creation, automation success,
                  meetings, attachments and priority activity.
                </p>
              </div>
            </div>

            <DashboardApiStatus
              isLoading={isLoading}
              error={error}
              generatedAt={data?.generatedAt}
              onRefresh={refresh}
            />
          </div>

          {error && (
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-sm text-destructive">
                Analytics data could not be loaded. Fallback
                data may be displayed until the dashboard API
                connection is restored.
              </p>
            </div>
          )}
        </section>

        <AnalyticsSummary
          data={data}
          isLoading={isLoading}
        />

        <AnalyticsCharts
          data={data}
          isLoading={isLoading}
        />
      </div>
    </DashboardShell>
  );
}