import type { ReactNode } from "react";

interface AutomationStatusCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: ReactNode;
  status?: "success" | "warning" | "danger" | "neutral";
}

const STATUS_STYLES = {
  success: {
    badge:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  warning: {
    badge:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
  },
  danger: {
    badge:
      "border-rose-500/20 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-400",
  },
  neutral: {
    badge:
      "border-slate-500/20 bg-slate-500/10 text-slate-300",
    dot: "bg-slate-400",
  },
};

export function AutomationStatusCard({
  title,
  value,
  subtitle,
  icon,
  status = "neutral",
}: AutomationStatusCardProps) {
  const styles = STATUS_STYLES[status];

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-3 truncate text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>

        {icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/30 text-muted-foreground">
            {icon}
          </div>
        ) : (
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${styles.badge}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${styles.dot}`}
            />
            Live
          </div>
        )}
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {subtitle}
      </p>
    </article>
  );
}