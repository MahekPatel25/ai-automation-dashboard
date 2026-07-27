import { cn } from "@/lib/utils";
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

export function EmailPriorityBadge({
  priority,
}: EmailPriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        priority === "Urgent" &&
          "bg-red-500/10 text-red-500",
        priority === "High" &&
          "bg-orange-500/10 text-orange-500",
        priority === "Medium" &&
          "bg-amber-500/10 text-amber-500",
        priority === "Low" &&
          "bg-muted text-muted-foreground"
      )}
    >
      {priority}
    </span>
  );
}

export function EmailStatusBadge({
  status,
}: EmailStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "Pending Reply" &&
          "bg-violet-500/10 text-violet-500",
        status === "Processed" &&
          "bg-emerald-500/10 text-emerald-500",
        status === "Reviewed" &&
          "bg-blue-500/10 text-blue-500",
        status === "Spam" &&
          "bg-zinc-500/10 text-zinc-400"
      )}
    >
      {status}
    </span>
  );
}