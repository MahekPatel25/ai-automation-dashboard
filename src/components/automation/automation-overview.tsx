"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  Bot,
  CalendarCheck,
  CalendarX2,
  FileSearch,
  FileText,
  Gauge,
  MailCheck,
  Workflow,
} from "lucide-react";

import type { DashboardApiData } from "@/types/dashboard";

import {
  createAutomationMetrics,
  type AutomationMetric,
} from "./automation-metrics";
import { AutomationStatusCard } from "./automation-status-card";

interface AutomationOverviewProps {
  data?: DashboardApiData | null;
  isLoading?: boolean;
}

type MetricStatus =
  | "success"
  | "warning"
  | "danger"
  | "neutral";

function getMetricIcon(title: string) {
  switch (title) {
    case "Workflow Version":
      return <Workflow className="h-5 w-5" />;

    case "Automation Success":
      return <Gauge className="h-5 w-5" />;

    case "Drafts Created":
      return <FileText className="h-5 w-5" />;

    case "Meeting Scheduled":
      return <CalendarCheck className="h-5 w-5" />;

    case "Meeting Slot Busy":
      return <CalendarX2 className="h-5 w-5" />;

    case "Manual Review":
      return <AlertTriangle className="h-5 w-5" />;

    case "Logged Only":
      return <MailCheck className="h-5 w-5" />;

    case "Attachments":
      return <FileSearch className="h-5 w-5" />;

    default:
      return <Bot className="h-5 w-5" />;
  }
}

function getMetricStatus(
  metric: AutomationMetric
): MetricStatus {
  switch (metric.title) {
    case "Automation Success": {
      const percentage = Number(
        String(metric.value).replace("%", "")
      );

      if (percentage >= 90) {
        return "success";
      }

      if (percentage >= 70) {
        return "warning";
      }

      return "danger";
    }

    case "Meeting Scheduled":
    case "Drafts Created":
    case "Attachments":
      return "success";

    case "Meeting Slot Busy":
      return Number(metric.value) > 0
        ? "warning"
        : "success";

    case "Manual Review":
      return Number(metric.value) > 0
        ? "danger"
        : "success";

    case "Logged Only":
    case "Workflow Version":
    default:
      return "neutral";
  }
}

function getLatestProcessedEmail(
  data?: DashboardApiData | null
) {
  if (!data?.emails?.length) {
    return null;
  }

  return [...data.emails]
    .filter((email) => Boolean(email.processedAt))
    .sort((first, second) => {
      const firstTime = first.processedAt
        ? new Date(first.processedAt).getTime()
        : 0;

      const secondTime = second.processedAt
        ? new Date(second.processedAt).getTime()
        : 0;

      return secondTime - firstTime;
    })[0] ?? null;
}

function formatDateTime(value?: string) {
  if (!value) {
    return "Not available";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(parsedDate);
}

function safelyCreateAutomationMetrics(
  data?: DashboardApiData | null
): AutomationMetric[] {
  if (!data) {
    return [];
  }

  try {
    const metrics = createAutomationMetrics(data);

    return Array.isArray(metrics)
      ? metrics
      : [];
  } catch (error) {
    console.error(
      "Failed to create automation metrics:",
      error
    );

    return [];
  }
}

export function AutomationOverview({
  data,
  isLoading = false,
}: AutomationOverviewProps) {
  const metrics = useMemo(() => {
    return safelyCreateAutomationMetrics(data);
  }, [data]);

  const latestProcessedEmail = useMemo(() => {
    return getLatestProcessedEmail(data);
  }, [data]);

  const totalEmails =
    data?.metrics?.totalEmails ??
    data?.emails?.length ??
    0;

  const manualReview =
    data?.charts?.statusDistribution?.[
      "Needs Manual Review"
    ] ?? 0;

  const successfulEmails = Math.max(
    totalEmails - manualReview,
    0
  );

  const healthPercentage =
    totalEmails === 0
      ? 0
      : Math.round(
          (successfulEmails / totalEmails) * 100
        );

  const workflowVersion =
    latestProcessedEmail?.workflowVersion ??
    data?.emails?.[0]?.workflowVersion ??
    "Unknown";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Automation
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Monitor AI email processing, draft generation,
          calendar automation and workflow health.
        </p>
      </div>

      <AutomationHealthBanner
        isLoading={isLoading}
        healthPercentage={healthPercentage}
        workflowVersion={workflowVersion}
        lastProcessedAt={
          latestProcessedEmail?.processedAt
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <>
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <AutomationCardSkeleton
                  key={index}
                />
              )
            )}
          </>
        ) : metrics.length === 0 ? (
          <div className="col-span-full flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6">
            <div className="max-w-md text-center">
              <Bot className="mx-auto h-10 w-10 text-muted-foreground" />

              <h2 className="mt-4 text-lg font-semibold text-foreground">
                No automation data available
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Run the n8n email workflow and refresh
                this page to load live automation data.
              </p>
            </div>
          </div>
        ) : (
          metrics.map((metric) => (
            <AutomationStatusCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              icon={getMetricIcon(metric.title)}
              status={getMetricStatus(metric)}
            />
          ))
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <WorkflowActivityPanel
          data={data}
          isLoading={isLoading}
        />

        <IntegrationHealthPanel
          data={data}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}

interface AutomationHealthBannerProps {
  isLoading: boolean;
  healthPercentage: number;
  workflowVersion: string;
  lastProcessedAt?: string;
}

function AutomationHealthBanner({
  isLoading,
  healthPercentage,
  workflowVersion,
  lastProcessedAt,
}: AutomationHealthBannerProps) {
  if (isLoading) {
    return (
      <div className="h-44 animate-pulse rounded-2xl border border-border/70 bg-muted/30" />
    );
  }

  const isHealthy = healthPercentage >= 90;

  const isWarning =
    healthPercentage >= 70 &&
    healthPercentage < 90;

  const statusLabel = isHealthy
    ? "Healthy"
    : isWarning
      ? "Needs Attention"
      : "Critical";

  const progressClass = isHealthy
    ? "bg-emerald-400"
    : isWarning
      ? "bg-amber-400"
      : "bg-rose-400";

  const statusClass = isHealthy
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
    : isWarning
      ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
      : "border-rose-500/20 bg-rose-500/10 text-rose-300";

  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/30">
              <Workflow className="h-6 w-6 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Workflow Health
              </p>

              <h2 className="mt-1 text-xl font-bold text-foreground">
                AI Email Assistant
              </h2>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                Processing success rate
              </span>

              <span className="text-sm font-bold text-foreground">
                {healthPercentage}%
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressClass}`}
                style={{
                  width: `${Math.min(
                    Math.max(
                      healthPercentage,
                      0
                    ),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[350px]">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Version
            </p>

            <p className="mt-2 text-lg font-bold text-foreground">
              {workflowVersion}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Last Processed
            </p>

            <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
              {formatDateTime(lastProcessedAt)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

interface WorkflowActivityPanelProps {
  data?: DashboardApiData | null;
  isLoading: boolean;
}

function WorkflowActivityPanel({
  data,
  isLoading,
}: WorkflowActivityPanelProps) {
  const recentEmails = useMemo(() => {
    if (!data?.emails?.length) {
      return [];
    }

    return [...data.emails]
      .sort((first, second) => {
        const firstTime = first.processedAt
          ? new Date(first.processedAt).getTime()
          : 0;

        const secondTime = second.processedAt
          ? new Date(second.processedAt).getTime()
          : 0;

        return secondTime - firstTime;
      })
      .slice(0, 6);
  }, [data]);

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Recent Workflow Activity
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Latest emails processed by the automation.
        </p>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-muted/40"
                />
              )
            )}
          </div>
        ) : recentEmails.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/10">
            <p className="text-sm text-muted-foreground">
              No recent workflow activity.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEmails.map((email, index) => (
              <div
                key={
                  email.messageId ||
                  `${email.rowNumber ?? "row"}-${index}`
                }
                className="flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-muted/10 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {email.subject || "No subject"}
                  </p>

                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {email.sender || "Unknown sender"} ·{" "}
                    {email.category || "Uncategorized"}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDateTime(
                      email.processedAt
                    )}
                  </p>
                </div>

                <ActivityStatusBadge
                  status={
                    email.status || "Unknown"
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function ActivityStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus = String(
    status || ""
  ).toLowerCase();

  let className =
    "border-slate-500/20 bg-slate-500/10 text-slate-300";

  if (
    normalizedStatus.includes("scheduled") ||
    normalizedStatus.includes("created")
  ) {
    className =
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  } else if (
    normalizedStatus.includes("busy")
  ) {
    className =
      "border-amber-500/20 bg-amber-500/10 text-amber-300";
  } else if (
    normalizedStatus.includes("manual")
  ) {
    className =
      "border-rose-500/20 bg-rose-500/10 text-rose-300";
  }

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {status || "Unknown"}
    </span>
  );
}

interface IntegrationHealthPanelProps {
  data?: DashboardApiData | null;
  isLoading: boolean;
}

function IntegrationHealthPanel({
  data,
  isLoading,
}: IntegrationHealthPanelProps) {
  const hasEmailData = Boolean(
    data?.emails?.length
  );

  const hasDraftData =
    (data?.metrics?.draftsCreated ?? 0) > 0;

  const hasCalendarData = Boolean(
    data?.emails?.some(
      (email) =>
        Boolean(email.calendarStatus) ||
        Boolean(email.calendarDecision)
    )
  );

  const hasAttachmentData = Boolean(
    data?.emails?.some(
      (email) =>
        Boolean(email.attachmentStatus)
    )
  );

  const averageConfidence =
    data?.metrics?.averageConfidence ?? 0;

  const integrations = [
    {
      name: "Gmail",
      description:
        "Email retrieval and processing",
      healthy: hasEmailData,
    },
    {
      name: "Gemini AI",
      description:
        "Classification, priority and summaries",
      healthy: averageConfidence > 0,
    },
    {
      name: "Google Sheets",
      description:
        "Workflow logging and dashboard source",
      healthy: hasEmailData,
    },
    {
      name: "Google Calendar",
      description:
        "Meeting scheduling automation",
      healthy: hasCalendarData,
    },
    {
      name: "Draft Generator",
      description:
        "AI reply draft creation",
      healthy: hasDraftData,
    },
    {
      name: "Attachment Processor",
      description:
        "File detection and analysis",
      healthy: hasAttachmentData,
    },
  ];

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Integration Signals
        </h2>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Status inferred from the latest workflow
          output.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <>
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-[70px] animate-pulse rounded-xl bg-muted/40"
                />
              )
            )}
          </>
        ) : (
          integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/10 p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {integration.name}
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {integration.description}
                </p>
              </div>

              <div
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  integration.healthy
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-500/20 bg-slate-500/10 text-slate-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    integration.healthy
                      ? "bg-emerald-400"
                      : "bg-slate-400"
                  }`}
                />

                {integration.healthy
                  ? "Detected"
                  : "No Signal"}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        These are activity signals, not direct
        credential connection tests. Actual connection
        health will be added with the secure n8n
        automation API.
      </p>
    </article>
  );
}

function AutomationCardSkeleton() {
  return (
    <div className="h-[170px] animate-pulse rounded-2xl border border-border/70 bg-muted/30" />
  );
}