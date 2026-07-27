"use client";

import { SidebarLogo } from "./sidebar-logo";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";

export function AppSidebar() {
  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-border bg-background lg:flex lg:flex-col">
      <SidebarLogo />

      <SidebarNav />

      <SidebarUser />
    </aside>
  );
}