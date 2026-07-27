"use client";

import { useMemo } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { EmailCategoryChart } from "@/components/charts/email-category-chart";
import {
  createCategoryData,
  createEmailTrendData,
} from "@/components/charts/chart-data";
import { EmailTrendChart } from "@/components/charts/email-trend-chart";
import { DashboardApiStatus } from "@/components/dashboard/dashboard-api-status";
import { createEmailItems } from "@/components/dashboard/email-data";
import { EmailTable } from "@/components/dashboard/email-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { createKpiItems } from "@/components/dashboard/kpi-data";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export default function HomePage() {
  const {
    data,
    client,
    isLoading,
    error,
    refresh,
  } = useDashboardData();

  const kpiItems = useMemo(() => {
    return createKpiItems(data?.metrics);
  }, [data?.metrics]);

  const emailTrendData = useMemo(() => {
    return createEmailTrendData(data?.charts);
  }, [data?.charts]);

  const emailCategoryData = useMemo(() => {
    return createCategoryData(data?.charts);
  }, [data?.charts]);

  const emailItems = useMemo(() => {
    return createEmailItems(data?.emails);
  }, [data?.emails]);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-primary">
                AI Email Operations
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                AI Email Assistant Dashboard
              </h2>

              <p className="mt-3 text-muted-foreground">
                Track email volume, AI processing, urgent messages,
                pending replies, drafts, meetings, attachments, and
                automation health from one place.
              </p>

              {client && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      Company
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {client.companyName}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      Logged in as
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {client.loginEmail}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      Account status
                    </p>

                    <p className="mt-1 text-sm font-semibold capitalize">
                      {client.status}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <DashboardApiStatus
                isLoading={isLoading}
                error={error}
                generatedAt={data?.generatedAt}
                onRefresh={refresh}
              />

              <LogoutButton />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">
                Email Performance
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Live overview of your current email automation activity
              </p>
            </div>

            {data?.generatedAt && (
              <p className="hidden text-xs text-muted-foreground sm:block">
                Updated{" "}
                {new Intl.DateTimeFormat("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(data.generatedAt))}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {kpiItems.map((item) => (
              <KpiCard
                key={item.title}
                item={item}
                isLoading={isLoading}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Email Analytics
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Live weekly activity and AI-based email classification
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
            <EmailTrendChart
              data={emailTrendData}
              isLoading={isLoading}
            />

            <EmailCategoryChart
              data={emailCategoryData}
              isLoading={isLoading}
            />
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Email Activity
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Recent emails processed by the AI workflow
            </p>
          </div>

          <EmailTable
            emails={emailItems}
            isLoading={isLoading}
          />
        </section>
      </div>
    </DashboardShell>
  );
}