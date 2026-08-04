"use client";

import {
  CalendarDays,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

interface HeaderDateTime {
  greeting: string;
  dayName: string;
  fullDate: string;
  time: string;
}

function getHeaderDateTime(): HeaderDateTime {
  const now = new Date();
  const hour = now.getHours();

  let greeting = "Good Night";

  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
  }

  return {
    greeting,

    dayName: new Intl.DateTimeFormat(
      "en-IN",
      {
        weekday: "long",
      }
    ).format(now),

    fullDate: new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(now),

    time: new Intl.DateTimeFormat(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    ).format(now),
  };
}

export function AppHeader() {
  const [dateTime, setDateTime] =
    useState<HeaderDateTime | null>(null);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      setDateTime(getHeaderDateTime());
    };

    updateDateTime();

    const intervalId =
      window.setInterval(
        updateDateTime,
        60 * 1000
      );

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  function handleRefresh() {
    setIsRefreshing(true);

    window.setTimeout(() => {
      window.location.reload();
    }, 350);
  }

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-background/95 backdrop-blur-lg">
      <div className="flex min-h-[92px] flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {dateTime?.greeting ??
                "AI Email Assistant"}
            </h1>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(49,201,80,0.22)] bg-[rgba(49,201,80,0.08)] px-2.5 py-1 text-xs font-semibold text-[#208F38]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#31C950]" />

              AI workspace active
            </span>
          </div>

          <p className="mt-1.5 truncate text-sm text-muted-foreground">
            Here&apos;s what your AI assistant
            handled today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[205px] items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-2.5 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(21,93,252,0.20)] bg-[rgba(21,93,252,0.08)] text-[#155DFC]">
              <CalendarDays className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-muted-foreground">
                {dateTime?.dayName ??
                  "Today"}
              </p>

              <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                {dateTime?.fullDate ??
                  "Loading date"}
              </p>
            </div>
          </div>

          <div className="flex min-w-[180px] items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-2.5 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(9,179,166,0.22)] bg-[rgba(9,179,166,0.08)] text-[#087D75]">
              <Sparkles className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Local time
              </p>

              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {dateTime?.time ??
                  "--:--"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex h-[58px] items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}