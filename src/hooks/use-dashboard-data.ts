"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { DashboardApiData } from "@/types/dashboard";

export interface DashboardClient {
  id: string;
  companyName: string;
  loginEmail: string;
  status: "active" | "inactive";
}

interface DashboardRouteSuccessResponse {
  success: true;
  client: DashboardClient;
  data: DashboardApiData;
}

interface DashboardRouteErrorResponse {
  success: false;
  error?: string;
  message?: string;
}

type DashboardRouteResponse =
  | DashboardRouteSuccessResponse
  | DashboardRouteErrorResponse;

interface UseDashboardDataResult {
  data: DashboardApiData | null;
  client: DashboardClient | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataResult {
  const router = useRouter();

  const [data, setData] = useState<DashboardApiData | null>(null);
  const [client, setClient] =
    useState<DashboardClient | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const result =
        (await response.json()) as DashboardRouteResponse;

      /*
       * result.success ko alag check karne se TypeScript
       * clearly samajhta hai ki ye error response hai.
       */
      if (result.success === false) {
        const errorCode =
          result.error ?? "UNKNOWN_ERROR";

        if (
          errorCode === "CLIENT_NOT_REGISTERED" ||
          errorCode === "CLIENT_INACTIVE"
        ) {
          router.replace(
            `/unauthorized?reason=${encodeURIComponent(
              errorCode
            )}`
          );

          return;
        }

        if (
          response.status === 401 ||
          errorCode === "UNAUTHORIZED"
        ) {
          router.replace("/login");
          return;
        }

        throw new Error(
          result.message ??
            "Unable to load dashboard data."
        );
      }

      /*
       * Defensive HTTP check.
       *
       * Normally success:true ke saath response.ok bhi true hoga.
       * Lekin unexpected API response aaye to error throw karenge.
       */
      if (!response.ok) {
        throw new Error(
          "Dashboard API returned an unsuccessful response."
        );
      }

      setData(result.data);
      setClient(result.client);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load dashboard data.";

      setError(message);
      setData(null);
      setClient(null);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  return {
    data,
    client,
    isLoading,
    error,
    refresh: loadDashboardData,
  };
}