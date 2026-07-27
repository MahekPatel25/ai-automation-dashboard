"use client";

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
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-primary">
                AI Email Intelligence
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Email Analytics
              </h1>

              <p className="mt-3 text-muted-foreground">
                Monitor AI accuracy, reply performance,
                draft creation, automation success,
                meetings, attachments, and high-priority
                email activity from one place.
              </p>
            </div>

            <DashboardApiStatus
              isLoading={isLoading}
              error={error}
              generatedAt={data?.generatedAt}
              onRefresh={refresh}
            />
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Analytics data could not be loaded.
              Please check the dashboard API and n8n
              workflow connection.
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