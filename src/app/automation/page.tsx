"use client";

import { useEffect, useState } from "react";

import { AutomationOverview } from "@/components/automation/automation-overview";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { DashboardApiData } from "@/types/dashboard";

export default function AutomationPage() {
  const [data, setData] = useState<DashboardApiData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load dashboard");
      }

      const json = await response.json();

if (!response.ok || !json.success) {
  throw new Error(
    json.message ?? "Failed to load dashboard"
  );
}

setData(json.data);
    } catch (error) {
      console.error("Automation dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = window.setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <AutomationOverview
          data={data}
          isLoading={loading}
        />
      </div>
    </DashboardShell>
  );
}