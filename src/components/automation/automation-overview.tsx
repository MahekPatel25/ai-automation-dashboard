"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  Bot,
  CalendarCheck,
  CalendarX2,
  CheckCircle2,
  CircleAlert,
  FileSearch,
  FileText,
  Gauge,
  MailCheck,
  RefreshCw,
  ShieldCheck,
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

type HealthStatus =
  | "healthy"
  | "warning"
  | "critical";

interface StatusVisual {
  main: string;
  background: string;
  border: string;
  label: string;
}

const HEALTH_VISUALS: Record<
  HealthStatus,
  StatusVisual
> = {
  healthy: {
    main: "#2F8F46",
    background: "rgba(47, 143, 70, 0.08)",
    border: "rgba(47, 143, 70, 0.20)",
    label: "Healthy",
  },

  warning: {
    main: "#A67416",
    background: "rgba(166, 116, 22, 0.08)",
    border: "rgba(166, 116, 22, 0.20)",
    label: "Needs Attention",
  },

  critical: {
    main: "#C11007",
    background: "rgba(193, 16, 7, 0.07)",
    border: "rgba(193, 16, 7, 0.21)",
    label: "Critical",
  },
};

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

  return (
    [...data.emails]
      .filter((email) =>
        Boolean(email.processedAt)
      )
      .sort((first, second) => {
        const firstTime = first.processedAt
          ? new Date(
              first.processedAt
            ).getTime()
          : 0;

        const secondTime = second.processedAt
          ? new Date(
              second.processedAt
            ).getTime()
          : 0;

        return secondTime - firstTime;
      })[0] ?? null
  );
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
    const metrics =
      createAutomationMetrics(data);

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

function getHealthStatus(
  percentage: number
): HealthStatus {
  if (percentage >= 90) {
    return "healthy";
  }

  if (percentage >= 70) {
    return "warning";
  }

  return "critical";
}

export function AutomationOverview({
  data,
  isLoading = false,
}: AutomationOverviewProps) {
  const metrics = useMemo(() => {
    return safelyCreateAutomationMetrics(
      data
    );
  }, [data]);

  const latestProcessedEmail =
    useMemo(() => {
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
          (successfulEmails /
            totalEmails) *
            100
        );

  const workflowVersion =
    latestProcessedEmail?.workflowVersion ??
    data?.emails?.[0]?.workflowVersion ??
    "Unknown";

  return (
    <section className="space-y-6">
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm lg:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground">
            <Workflow className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-card-foreground md:text-3xl">
              Automation
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Monitor AI email processing,
              draft generation, calendar
              automation and workflow health.
            </p>
          </div>
        </div>
      </section>

      <AutomationHealthBanner
        isLoading={isLoading}
        healthPercentage={healthPercentage}
        workflowVersion={workflowVersion}
        lastProcessedAt={
          latestProcessedEmail?.processedAt
        }
        totalEmails={totalEmails}
        manualReview={manualReview}
      />

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Automation Metrics
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Live workflow output and automation
            performance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            <>
              {Array.from({
                length: 8,
              }).map((_, index) => (
                <AutomationCardSkeleton
                  key={index}
                />
              ))}
            </>
          ) : metrics.length === 0 ? (
            <div className="col-span-full flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6">
              <div className="max-w-md text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/25 text-muted-foreground">
                  <Bot className="h-5 w-5" />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  No automation data available
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Run the n8n email workflow
                  and refresh this page to load
                  live automation data.
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
                icon={getMetricIcon(
                  metric.title
                )}
                status={getMetricStatus(
                  metric
                )}
              />
            ))
          )}
        </div>
      </section>

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
  totalEmails: number;
  manualReview: number;
}

function AutomationHealthBanner({
  isLoading,
  healthPercentage,
  workflowVersion,
  lastProcessedAt,
  totalEmails,
  manualReview,
}: AutomationHealthBannerProps) {
  if (isLoading) {
    return (
      <div className="h-52 animate-pulse rounded-2xl border border-border/70 bg-muted/30" />
    );
  }

  const healthStatus =
    getHealthStatus(healthPercentage);

  const visual =
    HEALTH_VISUALS[healthStatus];

  const successfulEmails = Math.max(
    totalEmails - manualReview,
    0
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div
        className="h-1 w-full"
        style={{
          backgroundColor: visual.main,
          opacity: 0.65,
        }}
      />

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl border"
              style={{
                color: visual.main,
                backgroundColor:
                  visual.background,
                borderColor: visual.border,
              }}
            >
              <Workflow className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Workflow Health
              </p>

              <h2 className="mt-1 text-xl font-semibold text-foreground">
                AI Email Assistant
              </h2>
            </div>

            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
              style={{
                color: visual.main,
                backgroundColor:
                  visual.background,
                borderColor: visual.border,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor:
                    visual.main,
                }}
              />

              {visual.label}
            </span>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                Processing success rate
              </span>

              <span
                className="text-sm font-semibold"
                style={{
                  color: visual.main,
                }}
              >
                {healthPercentage}%
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${Math.min(
                    Math.max(
                      healthPercentage,
                      0
                    ),
                    100
                  )}%`,
                  backgroundColor:
                    visual.main,
                }}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniHealthMetric
              label="Processed"
              value={totalEmails}
              icon={MailCheck}
            />

            <MiniHealthMetric
              label="Successful"
              value={successfulEmails}
              icon={CheckCircle2}
            />

            <MiniHealthMetric
              label="Manual Review"
              value={manualReview}
              icon={CircleAlert}
              danger={manualReview > 0}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />

              <p className="text-xs font-semibold uppercase tracking-[0.08em]">
                Workflow Version
              </p>
            </div>

            <p className="mt-2 truncate text-lg font-semibold text-foreground">
              {workflowVersion}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4" />

              <p className="text-xs font-semibold uppercase tracking-[0.08em]">
                Last Processed
              </p>
            </div>

            <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
              {formatDateTime(
                lastProcessedAt
              )}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function MiniHealthMetric({
  label,
  value,
  icon: Icon,
  danger = false,
}: {
  label: string;
  value: number;
  icon: typeof MailCheck;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/10 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>

          <p
            className="mt-1 text-xl font-semibold"
            style={{
              color: danger
                ? "#C11007"
                : "var(--foreground)",
            }}
          >
            {value.toLocaleString()}
          </p>
        </div>

        <Icon
          className="h-4 w-4"
          style={{
            color: danger
              ? "#C11007"
              : "var(--muted-foreground)",
          }}
        />
      </div>
    </div>
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
        const firstTime =
          first.processedAt
            ? new Date(
                first.processedAt
              ).getTime()
            : 0;

        const secondTime =
          second.processedAt
            ? new Date(
                second.processedAt
              ).getTime()
            : 0;

        return secondTime - firstTime;
      })
      .slice(0, 6);
  }, [data]);

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/25 text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Recent Workflow Activity
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Latest emails processed by the
            automation.
          </p>
        </div>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[78px] animate-pulse rounded-xl bg-muted/30"
              />
            ))}
          </div>
        ) : recentEmails.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/10">
            <div className="text-center">
              <MailCheck className="mx-auto h-6 w-6 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium text-muted-foreground">
                No recent workflow activity
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEmails.map(
              (email, index) => (
                <div
                  key={
                    email.messageId ||
                    `${email.rowNumber ?? "row"}-${index}`
                  }
                  className="group flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-muted/10 p-4 transition-all duration-200 hover:bg-muted/20"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/25 text-xs font-semibold text-muted-foreground">
                      {getInitials(
                        email.sender ||
                          "Unknown Sender"
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {email.subject ||
                          "No subject"}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {email.sender ||
                          "Unknown sender"}{" "}
                        ·{" "}
                        {email.category ||
                          "Uncategorized"}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDateTime(
                          email.processedAt
                        )}
                      </p>
                    </div>
                  </div>

                  <ActivityStatusBadge
                    status={
                      email.status ||
                      "Unknown"
                    }
                  />
                </div>
              )
            )}
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

  let style = {
    text: "#526173",
    background:
      "rgba(82, 97, 115, 0.08)",
    border:
      "rgba(82, 97, 115, 0.20)",
    dot: "#526173",
  };

  if (
    normalizedStatus.includes(
      "scheduled"
    ) ||
    normalizedStatus.includes(
      "created"
    ) ||
    normalizedStatus.includes(
      "sent"
    )
  ) {
    style = {
      text: "#2F8F46",
      background:
        "rgba(47, 143, 70, 0.08)",
      border:
        "rgba(47, 143, 70, 0.20)",
      dot: "#2F8F46",
    };
  } else if (
    normalizedStatus.includes("busy") ||
    normalizedStatus.includes(
      "pending"
    )
  ) {
    style = {
      text: "#A67416",
      background:
        "rgba(166, 116, 22, 0.08)",
      border:
        "rgba(166, 116, 22, 0.20)",
      dot: "#A67416",
    };
  } else if (
    normalizedStatus.includes(
      "manual"
    ) ||
    normalizedStatus.includes(
      "failed"
    ) ||
    normalizedStatus.includes(
      "error"
    ) ||
    normalizedStatus.includes(
      "blocked"
    )
  ) {
    style = {
      text: "#C11007",
      background:
        "rgba(193, 16, 7, 0.07)",
      border:
        "rgba(193, 16, 7, 0.21)",
      dot: "#C11007",
    };
  }

  return (
    <span
      className="inline-flex max-w-[150px] shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
      style={{
        color: style.text,
        backgroundColor:
          style.background,
        borderColor: style.border,
      }}
      title={status || "Unknown"}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{
          backgroundColor: style.dot,
        }}
      />

      <span className="truncate">
        {status || "Unknown"}
      </span>
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
    (data?.metrics?.draftsCreated ??
      0) > 0;

  const hasCalendarData = Boolean(
    data?.emails?.some(
      (email) =>
        Boolean(
          email.calendarStatus
        ) ||
        Boolean(
          email.calendarDecision
        )
    )
  );

  const hasAttachmentData = Boolean(
    data?.emails?.some((email) =>
      Boolean(email.attachmentStatus)
    )
  );

  const averageConfidence =
    data?.metrics?.averageConfidence ??
    0;

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
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/25 text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Integration Signals
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Status inferred from latest
            workflow output.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <>
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[72px] animate-pulse rounded-xl bg-muted/30"
              />
            ))}
          </>
        ) : (
          integrations.map(
            (integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/10 p-4 transition-colors duration-200 hover:bg-muted/20"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {integration.name}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {
                      integration.description
                    }
                  </p>
                </div>

                <IntegrationBadge
                  healthy={
                    integration.healthy
                  }
                />
              </div>
            )
          )
        )}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/10 px-4 py-3">
        <p className="text-xs leading-5 text-muted-foreground">
          These signals are inferred from
          workflow output. They are not direct
          credential connection tests.
        </p>
      </div>
    </article>
  );
}

function IntegrationBadge({
  healthy,
}: {
  healthy: boolean;
}) {
  const style = healthy
    ? {
        text: "#2F8F46",
        background:
          "rgba(47, 143, 70, 0.08)",
        border:
          "rgba(47, 143, 70, 0.20)",
        dot: "#2F8F46",
      }
    : {
        text: "#526173",
        background:
          "rgba(82, 97, 115, 0.08)",
        border:
          "rgba(82, 97, 115, 0.20)",
        dot: "#526173",
      };

  return (
    <div
      className="flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
      style={{
        color: style.text,
        backgroundColor:
          style.background,
        borderColor: style.border,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: style.dot,
        }}
      />

      {healthy ? "Detected" : "No Signal"}
    </div>
  );
}

function AutomationCardSkeleton() {
  return (
    <div className="h-[190px] animate-pulse rounded-2xl border border-border/70 bg-muted/30" />
  );
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}