"use client";

import { useMemo } from "react";
import {
  Building2,
  Mail,
  ShieldCheck,
} from "lucide-react";

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
      <div className="space-y-7">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">
                AI Email Operations
              </p>

              <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-card-foreground">
                Email Automation Overview
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Monitor email activity, AI processing, replies,
                drafts, meetings and workflow performance.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <DashboardApiStatus
                isLoading={isLoading}
                error={error}
                generatedAt={data?.generatedAt}
                onRefresh={refresh}
              />

              <LogoutButton />
            </div>
          </div>

          {client && (
            <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2 xl:grid-cols-3">
              <ClientInfoItem
                icon={Building2}
                label="Company"
                value={client.companyName}
              />

              <ClientInfoItem
                icon={Mail}
                label="Logged in as"
                value={client.loginEmail}
              />

              <ClientInfoItem
                icon={ShieldCheck}
                label="Account status"
                value={client.status}
                capitalize
              />
            </div>
          )}
        </section>

        <section>
          <SectionHeading
            title="Email Performance"
            description="Live overview of your current email automation activity."
            updatedAt={data?.generatedAt}
          />

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
          <SectionHeading
            title="Email Analytics"
            description="Weekly activity and AI-based email classification."
          />

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
          <SectionHeading
            title="Email Activity"
            description="Recent emails processed by the AI workflow."
          />

          <EmailTable
            emails={emailItems}
            isLoading={isLoading}
          />
        </section>
      </div>
    </DashboardShell>
  );
}

interface ClientInfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  capitalize?: boolean;
}

function ClientInfoItem({
  icon: Icon,
  label,
  value,
  capitalize = false,
}: ClientInfoItemProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3 transition-colors duration-200 hover:bg-muted/50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p
          className={`mt-0.5 truncate text-sm font-semibold text-foreground ${
            capitalize ? "capitalize" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface SectionHeadingProps {
  title: string;
  description: string;
  updatedAt?: string;
}

function SectionHeading({
  title,
  description,
  updatedAt,
}: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {title}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {updatedAt && (
        <p className="hidden shrink-0 text-xs text-muted-foreground sm:block">
          Updated{" "}
          {new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",
          }).format(new Date(updatedAt))}
        </p>
      )}
    </div>
  );
}