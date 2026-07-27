"use client";

import { UserCircle2, ChevronUp } from "lucide-react";

export function SidebarUser() {
  return (
    <div className="border-t border-border p-4">
      <button className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <UserCircle2 className="h-7 w-7 text-primary" />
        </div>

        <div className="flex flex-1 flex-col items-start overflow-hidden">
          <span className="truncate text-sm font-semibold">
            Admin User
          </span>

          <span className="truncate text-xs text-muted-foreground">
            admin@example.com
          </span>
        </div>

        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}