import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  ShieldAlert,
} from "lucide-react";

import type {
  EmailPriority,
  EmailStatus,
} from "./email-data";

interface EmailPriorityBadgeProps {
  priority: EmailPriority;
}

interface EmailStatusBadgeProps {
  status: EmailStatus;
}

interface BadgeStyle {
  text: string;
  background: string;
  border: string;
  dot: string;
}

const PRIORITY_STYLES: Record<
  EmailPriority,
  BadgeStyle
> = {
  Urgent: {
    text: "#C11007",
    background: "rgba(193, 16, 7, 0.07)",
    border: "rgba(193, 16, 7, 0.22)",
    dot: "#C11007",
  },

  High: {
    text: "#B65F25",
    background: "rgba(182, 95, 37, 0.08)",
    border: "rgba(182, 95, 37, 0.22)",
    dot: "#B65F25",
  },

  Medium: {
    text: "#A67416",
    background: "rgba(166, 116, 22, 0.08)",
    border: "rgba(166, 116, 22, 0.22)",
    dot: "#A67416",
  },

  Low: {
    text: "#526173",
    background: "rgba(82, 97, 115, 0.08)",
    border: "rgba(82, 97, 115, 0.2)",
    dot: "#526173",
  },
};

const STATUS_STYLES: Record<
  EmailStatus,
  BadgeStyle
> = {
  "Pending Reply": {
    text: "#69559A",
    background: "rgba(105, 85, 154, 0.08)",
    border: "rgba(105, 85, 154, 0.2)",
    dot: "#69559A",
  },

  Processed: {
    text: "#2F8F46",
    background: "rgba(47, 143, 70, 0.08)",
    border: "rgba(47, 143, 70, 0.2)",
    dot: "#2F8F46",
  },

  Reviewed: {
    text: "#3E63A8",
    background: "rgba(62, 99, 168, 0.08)",
    border: "rgba(62, 99, 168, 0.2)",
    dot: "#3E63A8",
  },

  Spam: {
    text: "#5E626B",
    background: "rgba(94, 98, 107, 0.08)",
    border: "rgba(94, 98, 107, 0.2)",
    dot: "#5E626B",
  },
};

export function EmailPriorityBadge({
  priority,
}: EmailPriorityBadgeProps) {
  const style = PRIORITY_STYLES[priority];

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{
        color: style.text,
        backgroundColor: style.background,
        borderColor: style.border,
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{
          backgroundColor: style.dot,
        }}
      />

      {priority}
    </span>
  );
}

export function EmailStatusBadge({
  status,
}: EmailStatusBadgeProps) {
  const style = STATUS_STYLES[status];

  const StatusIcon =
    status === "Pending Reply"
      ? Clock3
      : status === "Processed"
        ? CheckCircle2
        : status === "Reviewed"
          ? Eye
          : status === "Spam"
            ? ShieldAlert
            : AlertCircle;

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{
        color: style.text,
        backgroundColor: style.background,
        borderColor: style.border,
      }}
    >
      <StatusIcon className="h-3.5 w-3.5 shrink-0" />

      {status}
    </span>
  );
}