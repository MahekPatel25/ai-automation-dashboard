"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";

export function SidebarLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 border-b border-border px-6 py-5 transition-colors hover:bg-accent/50"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <MailCheck className="h-6 w-6" />
      </div>

      <div className="flex flex-col">
        <span className="text-base font-bold tracking-tight">
          AI Email Assistant
        </span>

        <span className="text-xs text-muted-foreground">
          Automation Dashboard
        </span>
      </div>
    </Link>
  );
}