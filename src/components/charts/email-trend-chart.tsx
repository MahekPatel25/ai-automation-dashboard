"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
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

/*
 * Official dashboard chart palette
 *
 * #31C950 - Green
 * #155DFC - Blue
 * #FDC745 - Yellow
 * #EC253F - Red
 * #0C0A09 - Dark neutral
 * #18786F - Teal
 * #45556C - Slate
 */

const CHART_COLORS = {
  blue: "#155DFC",
  blueLight: "#3B7BFF",
  green: "#31C950",
  yellow: "#FDC745",
  red: "#EC253F",
  dark: "#0C0A09",
  teal: "#18786F",
  slate: "#45556C",
  grid: "rgba(69, 85, 108, 0.20)",
  cursor: "rgba(21, 93, 252, 0.32)",
};

export function EmailTrendChart({
  data,
  isLoading = false,
}: EmailTrendChartProps) {
  const totalEmails = data.reduce(
    (total, item) => total + item.emails,
    0
  );

  const highestVolume = data.reduce(
    (highest, item) =>
      Math.max(highest, item.emails),
    0
  );

  const averageVolume =
    data.length === 0
      ? 0
      : Math.round(totalEmails / data.length);

  if (isLoading) {
    return <EmailTrendChartSkeleton />;
  }

  return (
    <section className="group overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#155DFC]/30 hover:shadow-[0_16px_36px_rgba(12,10,9,0.12)]">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  CHART_COLORS.blue,
              }}
            />

            <h3 className="text-lg font-semibold text-card-foreground">
              Weekly Email Trend
            </h3>
          </div>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Email volume processed by your n8n workflow.
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-2">
          <SummaryItem
            label="Total"
            value={totalEmails.toLocaleString()}
            color={CHART_COLORS.blue}
          />

          <SummaryItem
            label="Peak"
            value={highestVolume.toLocaleString()}
            color={CHART_COLORS.green}
          />

          <SummaryItem
            label="Average"
            value={averageVolume.toLocaleString()}
            color={CHART_COLORS.yellow}
          />
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyTrendState />
      ) : (
        <>
          <div className="h-80 w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={data}
                margin={{
                  top: 18,
                  right: 16,
                  left: -18,
                  bottom: 4,
                }}
              >
                <defs>
                  <linearGradient
                    id="emailTrendAreaGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={
                        CHART_COLORS.blue
                      }
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="48%"
                      stopColor={
                        CHART_COLORS.blueLight
                      }
                      stopOpacity={0.16}
                    />

                    <stop
                      offset="100%"
                      stopColor={
                        CHART_COLORS.blue
                      }
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <filter
                    id="emailTrendShadow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="4"
                      stdDeviation="5"
                      floodColor={
                        CHART_COLORS.blue
                      }
                      floodOpacity="0.2"
                    />
                  </filter>
                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke={CHART_COLORS.grid}
                  strokeDasharray="5 7"
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={12}
                  dy={12}
                  tick={{
                    fill: CHART_COLORS.slate,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={{
                    fill: CHART_COLORS.slate,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                />

                <Tooltip
                  cursor={{
                    stroke:
                      CHART_COLORS.cursor,
                    strokeWidth: 1.5,
                    strokeDasharray:
                      "5 5",
                  }}
                  content={<TrendTooltip />}
                />

                <Area
                  type="natural"
                  dataKey="emails"
                  name="Emails"
                  stroke={CHART_COLORS.blue}
                  strokeWidth={4}
                  fill="url(#emailTrendAreaGradient)"
                  filter="url(#emailTrendShadow)"
                  animationBegin={80}
                  animationDuration={950}
                  animationEasing="ease-out"
                  dot={{
                    r: 4.5,
                    fill: CHART_COLORS.blue,
                    stroke: "var(--card)",
                    strokeWidth: 2.5,
                  }}
                  activeDot={{
                    r: 7,
                    fill: CHART_COLORS.green,
                    stroke: "var(--card)",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex flex-wrap items-center gap-5">
              <ChartLegend
                color={CHART_COLORS.blue}
                label="Emails processed"
              />

              <ChartLegend
                color={CHART_COLORS.green}
                label="Selected point"
              />
            </div>

            <p className="text-xs font-medium text-muted-foreground">
              Last 7 days
            </p>
          </div>
        </>
      )}
    </section>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
  color: string;
}

function SummaryItem({
  label,
  value,
  color,
}: SummaryItemProps) {
  return (
    <div className="min-w-[76px] rounded-xl border border-border bg-muted/25 px-3 py-2">
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            backgroundColor: color,
          }}
        />

        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
      </div>

      <p className="mt-1 text-base font-semibold text-card-foreground">
        {value}
      </p>
    </div>
  );
}

interface ChartLegendProps {
  color: string;
  label: string;
}

function ChartLegend({
  color,
  label,
}: ChartLegendProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />

      <span>{label}</span>
    </div>
  );
}

interface TooltipPayloadItem {
  value?: number | string;
  payload?: EmailTrendDataItem;
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function TrendTooltip({
  active,
  payload,
}: TrendTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const currentItem =
    payload[0]?.payload;

  if (!currentItem) {
    return null;
  }

  const formattedDate =
    currentItem.date
      ? new Intl.DateTimeFormat(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        ).format(
          new Date(
            `${currentItem.date}T00:00:00`
          )
        )
      : currentItem.label;

  const emailCount = Number(
    payload[0]?.value ??
      currentItem.emails
  );

  return (
    <div className="min-w-[170px] overflow-hidden rounded-xl border border-[#45556C]/25 bg-popover/95 shadow-[0_16px_36px_rgba(12,10,9,0.22)] backdrop-blur-xl">
      <div className="border-b border-border bg-muted/30 px-4 py-2.5">
        <p className="text-xs font-semibold text-popover-foreground">
          {formattedDate}
        </p>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  CHART_COLORS.blue,
              }}
            />

            <span className="text-sm text-muted-foreground">
              Emails
            </span>
          </div>

          <span className="text-sm font-semibold text-popover-foreground">
            {emailCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyTrendState() {
  return (
    <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-[#45556C]/35 bg-muted/15">
      <div className="text-center">
        <span
          className="mx-auto block h-3 w-3 rounded-full"
          style={{
            backgroundColor:
              CHART_COLORS.blue,
          }}
        />

        <p className="mt-3 text-sm font-medium text-card-foreground">
          No email trend data available
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          New processed emails will appear here.
        </p>
      </div>
    </div>
  );
}

function EmailTrendChartSkeleton() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />

          <div className="mt-3 h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-14 w-20 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>

      <div className="relative h-80 overflow-hidden rounded-xl border border-border bg-muted/15">
        <div className="absolute inset-x-5 bottom-8 top-8 flex items-end gap-3">
          {[
            38, 58, 43, 72, 49, 86,
            64,
          ].map(
            (height, index) => (
              <div
                key={`${height}-${index}`}
                className="flex flex-1 items-end"
              >
                <div
                  className="w-full animate-pulse rounded-t-lg bg-muted"
                  style={{
                    height: `${height}%`,
                  }}
                />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}