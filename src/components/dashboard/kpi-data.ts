import {
  AlertTriangle,
  Bot,
  CalendarCheck,
  Clock3,
  Mail,
  Paperclip,
  ShieldCheck,
  UserRoundSearch,
  type LucideIcon,
} from "lucide-react";

import type { DashboardMetrics } from "@/types/dashboard";

export type KpiTrendType =
  | "positive"
  | "negative"
  | "neutral";

export interface KpiItem {
  id: string;
  title: string;
  value: string;
  description: string;
  trend: string;
  trendType: KpiTrendType;
  icon: LucideIcon;
}

/*
 * Dashboard data unavailable ya client ke paas zero records hone par
 * fake/demo numbers dikhane ke badle zero values dikhengi.
 */
const EMPTY_METRICS: DashboardMetrics = {
  totalEmails: 0,
  emailsToday: 0,
  salesLeads: 0,
  highPriority: 0,
  replyRequired: 0,
  draftsCreated: 0,
  meetingsCreated: 0,
  attachmentsDetected: 0,
  averageConfidence: 0,
};

export function createKpiItems(
  metrics?: DashboardMetrics | null
): KpiItem[] {
  const safeMetrics = metrics ?? EMPTY_METRICS;

  return [
    {
      id: "totalEmails",
      title: "Total Emails",
      value: safeMetrics.totalEmails.toLocaleString(),
      description: "Valid emails processed by the workflow",
      trend:
        safeMetrics.totalEmails > 0
          ? "Live total"
          : "No activity yet",
      trendType: "neutral",
      icon: Mail,
    },
    {
      id: "emailsToday",
      title: "Emails Today",
      value: safeMetrics.emailsToday.toLocaleString(),
      description: "Emails processed today",
      trend:
        safeMetrics.emailsToday > 0
          ? "Active today"
          : "No emails today",
      trendType:
        safeMetrics.emailsToday > 0
          ? "positive"
          : "neutral",
      icon: Clock3,
    },
    {
      id: "salesLeads",
      title: "Sales Leads",
      value: safeMetrics.salesLeads.toLocaleString(),
      description: "Potential sales opportunities detected",
      trend:
        safeMetrics.salesLeads > 0
          ? "AI detected"
          : "None detected",
      trendType:
        safeMetrics.salesLeads > 0
          ? "positive"
          : "neutral",
      icon: UserRoundSearch,
    },
    {
      id: "highPriority",
      title: "High Priority",
      value: safeMetrics.highPriority.toLocaleString(),
      description: "High and urgent emails detected",
      trend:
        safeMetrics.highPriority > 0
          ? "Needs attention"
          : "All clear",
      trendType:
        safeMetrics.highPriority > 0
          ? "negative"
          : "positive",
      icon: AlertTriangle,
    },
    {
      id: "replyRequired",
      title: "Reply Required",
      value: safeMetrics.replyRequired.toLocaleString(),
      description: "Emails requiring a response",
      trend:
        safeMetrics.replyRequired > 0
          ? "Action required"
          : "All handled",
      trendType:
        safeMetrics.replyRequired > 0
          ? "negative"
          : "positive",
      icon: Bot,
    },
    {
      id: "draftsCreated",
      title: "Drafts Created",
      value: safeMetrics.draftsCreated.toLocaleString(),
      description: "AI-generated Gmail drafts",
      trend:
        safeMetrics.draftsCreated > 0
          ? "Automated"
          : "No drafts yet",
      trendType:
        safeMetrics.draftsCreated > 0
          ? "positive"
          : "neutral",
      icon: ShieldCheck,
    },
    {
      id: "meetingsCreated",
      title: "Meetings Created",
      value: safeMetrics.meetingsCreated.toLocaleString(),
      description: "Calendar meetings created automatically",
      trend:
        safeMetrics.meetingsCreated > 0
          ? "Scheduled"
          : "None scheduled",
      trendType:
        safeMetrics.meetingsCreated > 0
          ? "positive"
          : "neutral",
      icon: CalendarCheck,
    },
    {
      id: "attachmentsDetected",
      title: "Attachments",
      value:
        safeMetrics.attachmentsDetected.toLocaleString(),
      description: "Emails containing attachments",
      trend:
        safeMetrics.attachmentsDetected > 0
          ? "Analyzed"
          : "None detected",
      trendType: "neutral",
      icon: Paperclip,
    },
  ];
}