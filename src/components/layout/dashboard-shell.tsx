"use client";

import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({
  children,
}: DashboardShellProps) {
  return (
    <main className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader />

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}