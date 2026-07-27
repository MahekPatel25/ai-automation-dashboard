import type { DashboardEmail } from "@/types/dashboard";

export type EmailPriority =
  | "Urgent"
  | "High"
  | "Medium"
  | "Low";

export type EmailStatus =
  | "Pending Reply"
  | "Processed"
  | "Reviewed"
  | "Spam";

export interface EmailItem {
  id: string;
  rowNumber: number;

  messageId: string;
  threadId: string;

  senderName: string;
  senderEmail: string;
  subject: string;

  category: string;
  priority: EmailPriority;
  status: EmailStatus;
  workflowStatus: string;

  receivedAt: string;
  receivedAtFull: string;
  receivedAtIso: string;

  summary: string;
  confidence: number;

  replyRequired: boolean;
  draftCreated: boolean;

  processedAt: string;
  workflowVersion: string;

  attachmentFile: string;
  attachmentStatus: string;
  attachmentSummary: string;
  hasAttachment: boolean;

  calendarCreated: boolean;
  calendarStatus: string;
  calendarDecision: string;
  calendarReason: string;

  meetingDate: string;
  meetingStartTime: string;
  meetingEndTime: string;
  meetingTimezone: string;

  googleMeetLink: string;
  calendarEventId: string;
  calendarEventLink: string;
  calendarAttendee: string;
  calendarLoggedAt: string;

  clientEmail: string;

  draftId: string;
  draftTo: string;
  draftSubject: string;
  draftBody: string;
  draftHtml: string;

  originalTo: string;
  originalBody: string;
  originalHtml: string;
}

export const emailItems: EmailItem[] = [];

function normalizeText(
  value: string | null | undefined,
  fallback = ""
): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalizedValue = value.trim();

  if (normalizedValue.toUpperCase().includes("#ERROR!")) {
    return fallback;
  }

  return normalizedValue.length > 0 ? normalizedValue : fallback;
}

function normalizeBoolean(
  value: boolean | string | null | undefined
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();

  return (
    normalizedValue === "yes" ||
    normalizedValue === "true" ||
    normalizedValue === "created" ||
    normalizedValue === "success"
  );
}

function normalizePriority(
  priority: string | null | undefined
): EmailPriority {
  const normalizedPriority = normalizeText(priority).toLowerCase();

  switch (normalizedPriority) {
    case "urgent":
      return "Urgent";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return "Medium";
  }
}

function normalizeStatus(
  workflowStatus: string | null | undefined,
  replyRequired: boolean
): EmailStatus {
  const normalizedStatus = normalizeText(workflowStatus).toLowerCase();

  if (normalizedStatus.includes("spam")) {
    return "Spam";
  }

  if (
    normalizedStatus.includes("manual review") ||
    normalizedStatus.includes("reviewed") ||
    normalizedStatus.includes("logged only")
  ) {
    return "Reviewed";
  }

  if (
    normalizedStatus.includes("draft created") ||
    normalizedStatus.includes("meeting scheduled") ||
    normalizedStatus.includes("processed")
  ) {
    return "Processed";
  }

  if (
    normalizedStatus.includes("slot busy") ||
    normalizedStatus.includes("pending") ||
    replyRequired
  ) {
    return "Pending Reply";
  }

  return "Reviewed";
}

function formatReceivedTime(
  dateValue: string | null | undefined
): string {
  const normalizedDate = normalizeText(dateValue);

  if (!normalizedDate) {
    return "Unknown";
  }

  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) {
    return normalizedDate;
  }

  const now = new Date();
  const receivedDateKey = [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ].join("-");
  const todayDateKey = [
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ].join("-");

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const yesterdayDateKey = [
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate(),
  ].join("-");

  if (receivedDateKey === todayDateKey) {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }

  if (receivedDateKey === yesterdayDateKey) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(date);
}

function formatFullDate(
  dateValue: string | null | undefined
): string {
  const normalizedDate = normalizeText(dateValue);

  if (!normalizedDate) {
    return "Unknown";
  }

  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) {
    return normalizedDate;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function createEmailId(
  email: DashboardEmail,
  index: number
): string {
  const messageId = normalizeText(email.messageId);

  if (messageId) {
    return messageId;
  }

  if (typeof email.rowNumber === "number") {
    return `email-row-${email.rowNumber}`;
  }

  return `email-${index + 1}`;
}

export function mapDashboardEmail(
  email: DashboardEmail,
  index: number
): EmailItem {
  const replyRequired = normalizeBoolean(email.replyRequired);
  const draftCreated = normalizeBoolean(email.draftCreated);
  const attachmentFile = normalizeText(email.attachmentFile);
  const attachmentStatus = normalizeText(
    email.attachmentStatus,
    "NO_ATTACHMENT"
  );
  const calendarCreated = normalizeBoolean(email.calendarCreated);
  const workflowStatus = normalizeText(email.status, "Unknown");

  return {
    id: createEmailId(email, index),
    rowNumber: typeof email.rowNumber === "number" ? email.rowNumber : 0,
    messageId: normalizeText(email.messageId),
    threadId: normalizeText(email.threadId),
    senderName: normalizeText(email.sender, "Unknown Sender"),
    senderEmail: normalizeText(email.email, "Email unavailable"),
    subject: normalizeText(email.subject, "No subject"),
    category: normalizeText(email.category, "Uncategorized"),
    priority: normalizePriority(email.priority),
    status: normalizeStatus(workflowStatus, replyRequired),
    workflowStatus,
    receivedAt: formatReceivedTime(email.date),
    receivedAtFull: formatFullDate(email.date),
    receivedAtIso: normalizeText(email.date),
    summary: normalizeText(
      email.summary,
      "No AI summary is available for this email."
    ),
    confidence:
      typeof email.confidence === "number"
        ? email.confidence
        : Number(email.confidence) || 0,
    replyRequired,
    draftCreated,
    processedAt: normalizeText(email.processedAt),
    workflowVersion: normalizeText(email.workflowVersion),
    attachmentFile,
    attachmentStatus,
    attachmentSummary: normalizeText(email.attachmentSummary),
    hasAttachment:
      attachmentFile.length > 0 ||
      attachmentStatus.toUpperCase() === "SUCCESS",
    calendarCreated,
    calendarStatus: normalizeText(email.calendarStatus),
    calendarDecision: normalizeText(email.calendarDecision),
    calendarReason: normalizeText(email.calendarReason),
    meetingDate: normalizeText(email.meetingDate),
    meetingStartTime: normalizeText(email.meetingStartTime),
    meetingEndTime: normalizeText(email.meetingEndTime),
    meetingTimezone: normalizeText(email.meetingTimezone),
    googleMeetLink: normalizeText(email.googleMeetLink),
    calendarEventId: normalizeText(email.calendarEventId),
    calendarEventLink: normalizeText(email.calendarEventLink),
    calendarAttendee: normalizeText(email.calendarAttendee),
    calendarLoggedAt: normalizeText(email.calendarLoggedAt),
    clientEmail: normalizeText(email.clientEmail),
    draftId: normalizeText(email.draftId),
    draftTo: normalizeText(email.draftTo),
    draftSubject: normalizeText(email.draftSubject),
    draftBody: normalizeText(email.draftBody),
    draftHtml: normalizeText(email.draftHtml),
    originalTo: normalizeText(email.originalTo),
    originalBody: normalizeText(email.originalBody),
    originalHtml: normalizeText(email.originalHtml),
  };
}

export function createEmailItems(
  emails?: DashboardEmail[]
): EmailItem[] {
  if (!Array.isArray(emails)) {
    return [];
  }

  return emails
    .map((email, index) => mapDashboardEmail(email, index))
    .sort((emailA, emailB) => {
      const dateA = new Date(emailA.receivedAtIso).getTime();
      const dateB = new Date(emailB.receivedAtIso).getTime();
      const validDateA = Number.isNaN(dateA) ? 0 : dateA;
      const validDateB = Number.isNaN(dateB) ? 0 : dateB;

      return validDateB - validDateA;
    });
}
