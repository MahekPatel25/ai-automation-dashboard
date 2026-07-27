"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { EmailTrendDataItem } from "./chart-data";

interface EmailTrendChartProps {
  data: EmailTrendDataItem[];
  isLoading?: boolean;
}

export function EmailTrendChart({
  data,
  isLoading = false,
}: EmailTrendChartProps) {
  const totalEmails = data.reduce(
    (total, item) => total + item.emails,
    0
  );

  if (isLoading) {
    return <EmailTrendChartSkeleton />;
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Weekly Email Trend
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Real email volume from your n8n workflow
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-right">
          <p className="text-xs text-muted-foreground">
            Last 7 days
          </p>

          <p className="mt-1 text-lg font-semibold">
            {totalEmails.toLocaleString()}
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-border bg-muted/10">
          <div className="text-center">
            <p className="text-sm font-medium">
              No email trend data available
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              New processed emails will appear here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-border"
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "currentColor",
                    fontSize: 12,
                  }}
                  className="text-muted-foreground"
                  dy={10}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "currentColor",
                    fontSize: 12,
                  }}
                  className="text-muted-foreground"
                />

                <Tooltip
                  cursor={{
                    stroke: "currentColor",
                    strokeDasharray: "4 4",
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                  }}
                  formatter={(value) => [
                    Number(value).toLocaleString(),
                    "Emails",
                  ]}
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload as
                      | EmailTrendDataItem
                      | undefined;

                    if (!item?.date) {
                      return "";
                    }

                    return new Intl.DateTimeFormat("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(
                      new Date(`${item.date}T00:00:00`)
                    );
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="emails"
                  name="Emails"
                  stroke="currentColor"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "currentColor",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                  className="text-primary"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Emails processed
          </div>
        </>
      )}
    </section>
  );
}

function EmailTrendChartSkeleton() {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />

          <div className="mt-3 h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="h-14 w-24 animate-pulse rounded-xl bg-muted" />
      </div>

      <div className="flex h-80 items-end gap-3 rounded-xl border border-border/60 bg-muted/10 p-5">
        {[32, 55, 38, 70, 45, 82, 60].map(
          (height, index) => (
            <div
              key={`${height}-${index}`}
              className="flex flex-1 items-end"
            >
              <div
                className="w-full animate-pulse rounded-t-md bg-muted"
                style={{
                  height: `${height}%`,
                }}
              />
            </div>
          )
        )}
      </div>
    </section>
  );
}