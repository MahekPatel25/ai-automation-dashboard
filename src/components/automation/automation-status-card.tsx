import type { ReactNode } from "react";

interface AutomationStatusCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: ReactNode;
  status?: "success" | "warning" | "danger" | "neutral";
}

interface StatusStyle {
  main: string;
  softBackground: string;
  softBorder: string;
  badgeBackground: string;
  badgeBorder: string;
  badgeLabel: string;
}

const STATUS_STYLES: Record<
  NonNullable<AutomationStatusCardProps["status"]>,
  StatusStyle
> = {
  success: {
    main: "#2F8F46",
    softBackground: "rgba(47, 143, 70, 0.08)",
    softBorder: "rgba(47, 143, 70, 0.20)",
    badgeBackground: "rgba(47, 143, 70, 0.07)",
    badgeBorder: "rgba(47, 143, 70, 0.20)",
    badgeLabel: "Healthy",
  },

  warning: {
    main: "#A67416",
    softBackground: "rgba(166, 116, 22, 0.08)",
    softBorder: "rgba(166, 116, 22, 0.20)",
    badgeBackground: "rgba(166, 116, 22, 0.07)",
    badgeBorder: "rgba(166, 116, 22, 0.20)",
    badgeLabel: "Attention",
  },

  danger: {
    main: "#C11007",
    softBackground: "rgba(193, 16, 7, 0.07)",
    softBorder: "rgba(193, 16, 7, 0.21)",
    badgeBackground: "rgba(193, 16, 7, 0.06)",
    badgeBorder: "rgba(193, 16, 7, 0.21)",
    badgeLabel: "Critical",
  },

  neutral: {
    main: "#526173",
    softBackground: "rgba(82, 97, 115, 0.08)",
    softBorder: "rgba(82, 97, 115, 0.20)",
    badgeBackground: "rgba(82, 97, 115, 0.07)",
    badgeBorder: "rgba(82, 97, 115, 0.20)",
    badgeLabel: "Live",
  },
};

export function AutomationStatusCard({
  title,
  value,
  subtitle,
  icon,
  status = "neutral",
}: AutomationStatusCardProps) {
  const style = STATUS_STYLES[status];

  return (
    <article className="group relative min-h-[178px] overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md">
      <div
        aria-hidden="true"
        className="absolute inset-y-5 left-0 w-[3px] rounded-r-full opacity-70 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          backgroundColor: style.main,
        }}
      />

      <div className="flex items-start justify-between gap-4 pl-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor: style.main,
              }}
            />

            <p className="truncate text-sm font-medium text-muted-foreground">
              {title}
            </p>
          </div>

          <p className="mt-3 truncate text-3xl font-semibold tracking-[-0.03em] text-card-foreground">
            {value}
          </p>
        </div>

        {icon && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105"
            style={{
              color: style.main,
              backgroundColor: style.softBackground,
              borderColor: style.softBorder,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <p className="mt-4 min-h-10 pl-1 text-sm leading-5 text-muted-foreground">
        {subtitle}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4 pl-1">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
          style={{
            color: style.main,
            backgroundColor: style.badgeBackground,
            borderColor: style.badgeBorder,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: style.main,
            }}
          />

          {style.badgeLabel}
        </span>

        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Automation
        </span>
      </div>
    </article>
  );
}