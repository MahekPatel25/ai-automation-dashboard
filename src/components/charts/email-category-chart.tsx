"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { EmailCategoryDataItem } from "./chart-data";

const chartColors = [
  "#155DFC", // Blue
  "#09B3A6", // Teal
  "#31C950", // Green
  "#FDC745", // Yellow
  "#EC253F", // Red
  "#18786F", // Dark Teal
  "#45556C", // Slate
  "#0C0A09", // Black
  "#6D5CE8", // Purple
  "#FF7A59", // Orange
  "#5B99E5", // Sky Blue
  "#A1DBF7", // Light Blue
];

interface EmailCategoryChartProps {
  data: EmailCategoryDataItem[];
  isLoading?: boolean;
}

export function EmailCategoryChart({
  data,
  isLoading = false,
}: EmailCategoryChartProps) {
  const totalEmails = data.reduce(
    (total, item) => total + item.value,
    0
  );

  if (isLoading) {
    return <EmailCategoryChartSkeleton />;
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Email Categories
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Live category distribution classified by AI
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-right">
          <p className="text-xs text-muted-foreground">
            Total emails
          </p>

          <p className="mt-1 text-lg font-semibold">
            {totalEmails.toLocaleString()}
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/10">
          <div className="text-center">
            <p className="text-sm font-medium">
              No category data available
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Classified emails will appear here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                  }}
                  formatter={(value, _, item) => {
                    const payload = item.payload as EmailCategoryDataItem;

                    return [
                      `${Number(value).toLocaleString()} emails (${payload.percentage}%)`,
                      payload.name,
                    ];
                  }}
                />

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={4}
                  stroke="transparent"
                >
                  {data.map((item, index) => (
                    <Cell
                      key={`${item.name}-${index}`}
                      fill={
                        chartColors[
                          index % chartColors.length
                        ]
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {totalEmails.toLocaleString()}
                </p>

                <p className="text-xs text-muted-foreground">
                  Emails
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        chartColors[
                          index % chartColors.length
                        ],
                    }}
                  />

                  <span className="truncate text-sm text-muted-foreground">
                    {item.name}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {item.value}
                  </span>

                  <span className="text-sm font-semibold">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function EmailCategoryChartSkeleton() {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />

          <div className="mt-3 h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="h-14 w-24 animate-pulse rounded-xl bg-muted" />
      </div>

      <div className="flex h-64 items-center justify-center">
        <div className="relative h-44 w-44 animate-pulse rounded-full bg-muted">
          <div className="absolute inset-10 rounded-full bg-card" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-10 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    </section>
  );
}