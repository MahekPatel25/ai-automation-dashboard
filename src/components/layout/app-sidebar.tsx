"use client";

import { SidebarLogo } from "./sidebar-logo";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";

export function AppSidebar() {
  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <SidebarLogo />

      <div className="shrink-0 px-6 pb-2 pt-3">
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-sidebar-border" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Workspace
          </span>

          <span className="h-px flex-1 bg-sidebar-border" />
        </div>
      </div>

      <SidebarNav />

      <SidebarUser />
    </aside>
  );
}