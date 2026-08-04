"use client";

import Link from "next/link";
import {
  Bot,
  MailCheck,
  Sparkles,
} from "lucide-react";

export function SidebarLogo() {
  return (
    <div className="border-b border-sidebar-border/80 px-5 py-5">
      <Link
        href="/"
        className="group block rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/60 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sidebar-ring/40 hover:bg-sidebar-accent hover:shadow-[0_12px_30px_rgba(20,24,38,0.12)]"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sidebar-primary/25 bg-sidebar-primary text-sidebar-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-[1.04]">
            <MailCheck className="h-6 w-6" />

            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-primary">
              <Sparkles className="h-3 w-3" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
                AI Email Assistant
              </span>

              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/12 text-sidebar-primary">
                <Bot className="h-3 w-3" />
              </span>
            </div>

            <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
              Automation Platform
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl border border-sidebar-border/70 bg-sidebar/45 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-20" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
            </span>

            <span className="text-[11px] font-semibold text-sidebar-foreground/80">
              Automation Active
            </span>
          </div>

          <span className="rounded-full border border-sidebar-border bg-sidebar px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            Live
          </span>
        </div>
      </Link>
    </div>
  );
}