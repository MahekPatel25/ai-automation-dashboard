import type {
  DashboardApiData,
  DashboardEmail,
  DashboardMetrics,
} from "@/types/dashboard";

export interface AnalyticsMetricItem {
  title: string;
  value: string;
  rawValue: number;
  description: string;
  trendLabel?: string;
  status: "positive" | "warning" | "danger" | "neutral";
  iconName:
    | "mail"
    | "brain"
    | "message"
    | "file"
    | "workflow"
    | "paperclip"
    | "calendar"
    | "alert";
}

interface AnalyticsCalculationResult {
  totalEmails: number;
  averageConfidence: number;
  aiAccuracy: number;
  replySuccessRate: number;
  draftSuccessRate: number;
  automationSuccessRate: number;
  attachmentDetectionRate: number;
  meetingsCreated: number;
  highPriorityEmails: number;
  repliedEmails: number;
  draftsCreated: number;
  failedEmails: number;
  attachmentEmails: number;
}

function normalizeText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    return [
      "true",
      "yes",
      "1",
      "created",
      "success",
      "successful",
    ].includes(normalizedValue);
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return false;
}

function safeNumber(value: unknown): number {
  const convertedValue = Number(value);

  if (!Number.isFinite(convertedValue)) {
    return 0;
  }

  return convertedValue;
}

function percentage(
  numerator: number,
  denominator: number
): number {
  if (denominator <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, (numerator / denominator) * 100)
  );
}

function roundMetric(value: number): number {
  return Math.round(value * 10) / 10;
}

function isReplySuccessful(email: DashboardEmail): boolean {
  const status = normalizeText(email.status);

  return (
    status.includes("replied") ||
    status.includes("sent") ||
    status.includes("processed")
  );
}

function isDraftCreated(email: DashboardEmail): boolean {
  const draftCreated = normalizeText(email.draftCreated);
  const status = normalizeText(email.status);

  return (
    normalizeBoolean(email.draftCreated) ||
    draftCreated.includes("draft") ||
    draftCreated.includes("created") ||
    status.includes("draft created")
  );
}

function isAutomationFailed(email: DashboardEmail): boolean {
  const status = normalizeText(email.status);
  const calendarStatus = normalizeText(email.calendarStatus);
  const attachmentStatus = normalizeText(email.attachmentStatus);

  return (
    status.includes("failed") ||
    status.includes("error") ||
    calendarStatus.includes("failed") ||
    calendarStatus.includes("error") ||
    attachmentStatus.includes("failed") ||
    attachmentStatus.includes("error")
  );
}

function hasAttachment(email: DashboardEmail): boolean {
  const attachmentFile = normalizeText(email.attachmentFile);
  const attachmentStatus = normalizeText(email.attachmentStatus);

  return Boolean(
    attachmentFile ||
      attachmentStatus.includes("detected") ||
      attachmentStatus.includes("processed") ||
      attachmentStatus.includes("success")
  );
}

function hasMeeting(email: DashboardEmail): boolean {
  const calendarCreated = normalizeText(email.calendarCreated);
  const calendarStatus = normalizeText(email.calendarStatus);
  const status = normalizeText(email.status);

  return Boolean(
    normalizeBoolean(email.calendarCreated) ||
      email.calendarEventId ||
      email.googleMeetLink ||
      calendarCreated.includes("created") ||
      calendarStatus.includes("created") ||
      calendarStatus.includes("scheduled") ||
      status.includes("meeting scheduled")
  );
}

function isHighPriority(email: DashboardEmail): boolean {
  const priority = normalizeText(email.priority);

  return (
    priority === "high" ||
    priority === "urgent"
  );
}

function calculateAverageConfidence(
  emails: DashboardEmail[],
  metrics?: DashboardMetrics
): number {
  if (
    metrics &&
    safeNumber(metrics.averageConfidence) > 0
  ) {
    return roundMetric(
      safeNumber(metrics.averageConfidence)
    );
  }

  const validConfidenceValues = emails
    .map((email) => safeNumber(email.confidence))
    .filter((confidence) => confidence > 0);

  if (validConfidenceValues.length === 0) {
    return 0;
  }

  const totalConfidence =
    validConfidenceValues.reduce(
      (total, confidence) => total + confidence,
      0
    );

  return roundMetric(
    totalConfidence / validConfidenceValues.length
  );
}

export function calculateAnalyticsMetrics(
  data?: DashboardApiData | null
): AnalyticsCalculationResult {
  const emails = data?.emails ?? [];
  const metrics = data?.metrics;

  const totalEmails =
    safeNumber(metrics?.totalEmails) || emails.length;

  const repliedEmails = emails.filter(
    isReplySuccessful
  ).length;

  const replyRequiredEmails = emails.filter(
    (email) => email.replyRequired
  ).length;

  const draftsCreatedFromEmails = emails.filter(
    isDraftCreated
  ).length;

  const draftsCreated =
    safeNumber(metrics?.draftsCreated) ||
    draftsCreatedFromEmails;

  const failedEmails = emails.filter(
    isAutomationFailed
  ).length;

  const attachmentEmails = emails.filter(
    hasAttachment
  ).length;

  const meetingsFromEmails = emails.filter(
    hasMeeting
  ).length;

  const meetingsCreated =
    safeNumber(metrics?.meetingsCreated) ||
    meetingsFromEmails;

  const highPriorityFromEmails = emails.filter(
    isHighPriority
  ).length;

  const highPriorityEmails =
    safeNumber(metrics?.highPriority) ||
    highPriorityFromEmails;

  const averageConfidence =
    calculateAverageConfidence(emails, metrics);

  const confidenceOnHundredScale =
    averageConfidence <= 1
      ? averageConfidence * 100
      : averageConfidence;

  const aiAccuracy = roundMetric(
    Math.min(
      100,
      Math.max(0, confidenceOnHundredScale)
    )
  );

  const replySuccessRate = roundMetric(
    percentage(
      repliedEmails,
      replyRequiredEmails || totalEmails
    )
  );

  const draftSuccessRate = roundMetric(
    percentage(
      draftsCreated,
      replyRequiredEmails || totalEmails
    )
  );

  const automationSuccessRate = roundMetric(
    percentage(
      Math.max(0, totalEmails - failedEmails),
      totalEmails
    )
  );

  const attachmentDetectionRate = roundMetric(
    percentage(attachmentEmails, totalEmails)
  );

  return {
    totalEmails,
    averageConfidence: aiAccuracy,
    aiAccuracy,
    replySuccessRate,
    draftSuccessRate,
    automationSuccessRate,
    attachmentDetectionRate,
    meetingsCreated,
    highPriorityEmails,
    repliedEmails,
    draftsCreated,
    failedEmails,
    attachmentEmails,
  };
}

function getRateStatus(
  value: number
): AnalyticsMetricItem["status"] {
  if (value >= 85) {
    return "positive";
  }

  if (value >= 60) {
    return "warning";
  }

  return "danger";
}

export function createAnalyticsMetricItems(
  data?: DashboardApiData | null
): AnalyticsMetricItem[] {
  const metrics = calculateAnalyticsMetrics(data);

  return [
    {
      title: "AI Accuracy",
      value: `${metrics.aiAccuracy}%`,
      rawValue: metrics.aiAccuracy,
      description:
        "Average AI confidence across processed emails",
      trendLabel:
        metrics.aiAccuracy >= 85
          ? "Excellent AI performance"
          : metrics.aiAccuracy >= 60
            ? "AI review recommended"
            : "Needs model improvement",
      status: getRateStatus(metrics.aiAccuracy),
      iconName: "brain",
    },
    {
      title: "Reply Success",
      value: `${metrics.replySuccessRate}%`,
      rawValue: metrics.replySuccessRate,
      description:
        "Successfully replied emails compared with reply demand",
      trendLabel: `${metrics.repliedEmails} emails replied`,
      status: getRateStatus(
        metrics.replySuccessRate
      ),
      iconName: "message",
    },
    {
      title: "Draft Success",
      value: `${metrics.draftSuccessRate}%`,
      rawValue: metrics.draftSuccessRate,
      description:
        "Drafts created for emails requiring a response",
      trendLabel: `${metrics.draftsCreated} drafts created`,
      status: getRateStatus(
        metrics.draftSuccessRate
      ),
      iconName: "file",
    },
    {
      title: "Automation Success",
      value: `${metrics.automationSuccessRate}%`,
      rawValue: metrics.automationSuccessRate,
      description:
        "Emails completed without workflow failure",
      trendLabel:
        metrics.failedEmails === 0
          ? "No workflow failures"
          : `${metrics.failedEmails} workflow failures`,
      status: getRateStatus(
        metrics.automationSuccessRate
      ),
      iconName: "workflow",
    },
    {
      title: "Attachment Detection",
      value: `${metrics.attachmentDetectionRate}%`,
      rawValue: metrics.attachmentDetectionRate,
      description:
        "Processed emails containing detected attachments",
      trendLabel: `${metrics.attachmentEmails} attachments detected`,
      status: "neutral",
      iconName: "paperclip",
    },
    {
      title: "Meetings Created",
      value: String(metrics.meetingsCreated),
      rawValue: metrics.meetingsCreated,
      description:
        "Calendar meetings generated by the workflow",
      trendLabel:
        metrics.meetingsCreated > 0
          ? "Calendar automation active"
          : "No meetings generated yet",
      status:
        metrics.meetingsCreated > 0
          ? "positive"
          : "neutral",
      iconName: "calendar",
    },
    {
      title: "High Priority",
      value: String(metrics.highPriorityEmails),
      rawValue: metrics.highPriorityEmails,
      description:
        "Urgent and high-priority emails detected",
      trendLabel:
        metrics.highPriorityEmails > 0
          ? "Requires quick attention"
          : "No urgent emails",
      status:
        metrics.highPriorityEmails > 0
          ? "warning"
          : "positive",
      iconName: "alert",
    },
    {
      title: "Total Emails",
      value: String(metrics.totalEmails),
      rawValue: metrics.totalEmails,
      description:
        "Total emails included in analytics",
      trendLabel: "Live dashboard records",
      status: "neutral",
      iconName: "mail",
    },
  ];
}