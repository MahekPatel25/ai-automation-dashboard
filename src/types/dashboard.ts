export type EmailPriority =
  | "Urgent"
  | "High"
  | "Medium"
  | "Low"
  | "Unknown";

export type EmailStatus =
  | "Draft Created"
  | "Logged Only"
  | "Needs Manual Review"
  | "Meeting Scheduled"
  | "Meeting Slot Busy"
  | "Processed"
  | "Replied"
  | "Pending"
  | "Unknown";

export interface DashboardEmail {
  rowNumber: number | string;
  messageId: string;
  threadId: string;
  date: string;

  sender: string;
  email: string;
  subject: string;

  category: string;
  priority: EmailPriority;

  replyRequired: boolean;
  draftCreated: string;

  confidence: number;
  status: EmailStatus;

  summary: string;
  processedAt: string;
  workflowVersion: string;

  attachmentFile: string;
  attachmentStatus: string;
  attachmentSummary: string;

  calendarCreated: string;
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

export interface DashboardMetrics {
  totalEmails: number;
  emailsToday: number;
  salesLeads: number;
  highPriority: number;
  replyRequired: number;
  draftsCreated: number;
  meetingsCreated: number;
  attachmentsDetected: number;
  averageConfidence: number;
}

export interface DashboardCharts {
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  dailyEmailVolume: Record<string, number>;
  draftDistribution: Record<string, number>;
  meetingDistribution: Record<string, number>;
  attachmentDistribution: Record<string, number>;
}

export interface DashboardMeta {
  sourceRows: number;
  validRowsBeforeDuplicateRemoval: number;
  removedIncompleteRows: number;
  removedDuplicateRows: number;
  returnedEmails: number;
}

export interface DashboardApiData {
  success: true;
  generatedAt: string;
  metrics: DashboardMetrics;
  charts: DashboardCharts;
  meta: DashboardMeta;
  emails: DashboardEmail[];
}

export interface DashboardApiError {
  success: false;
  message: string;
}

export type DashboardApiResponse =
  | DashboardApiData
  | DashboardApiError;