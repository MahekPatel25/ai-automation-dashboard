import type { DashboardApiData } from "@/types/dashboard";

export interface AutomationMetric {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: string;
}

export function createAutomationMetrics(
  data?: DashboardApiData | null
): AutomationMetric[] {
  if (!data) {
    return [];
  }

  // Safe fallbacks
  const charts = data.charts ?? {};

  const statusDistribution =
    charts.statusDistribution ?? {};

  const metrics = data.metrics ?? {};

  const emails = data.emails ?? [];

  const totalEmails =
    metrics.totalEmails ?? emails.length ?? 0;

  const draftsCreated =
    metrics.draftsCreated ?? 0;

  const attachmentsDetected =
    metrics.attachmentsDetected ?? 0;

  const meetingScheduled =
    statusDistribution["Meeting Scheduled"] ?? 0;

  const slotBusy =
    statusDistribution["Meeting Slot Busy"] ?? 0;

  const manualReview =
    statusDistribution["Needs Manual Review"] ?? 0;

  const loggedOnly =
    statusDistribution["Logged Only"] ?? 0;

  const successRate =
    totalEmails === 0
      ? 0
      : Math.round(
          ((totalEmails - manualReview) /
            totalEmails) *
            100
        );

  return [
    {
      title: "Workflow Version",
      value:
        emails[0]?.workflowVersion ??
        "Unknown",
      subtitle:
        "Current deployed workflow",
    },

    {
      title: "Automation Success",
      value: `${successRate}%`,
      subtitle:
        "Successfully processed emails",
    },

    {
      title: "Drafts Created",
      value: draftsCreated,
      subtitle:
        "AI generated replies",
    },

    {
      title: "Meeting Scheduled",
      value: meetingScheduled,
      subtitle:
        "Calendar events created",
    },

    {
      title: "Meeting Slot Busy",
      value: slotBusy,
      subtitle:
        "Calendar conflicts",
    },

    {
      title: "Manual Review",
      value: manualReview,
      subtitle:
        "Needs human review",
    },

    {
      title: "Logged Only",
      value: loggedOnly,
      subtitle:
        "No further action",
    },

    {
      title: "Attachments",
      value: attachmentsDetected,
      subtitle:
        "Successfully processed",
    },
  ];
}