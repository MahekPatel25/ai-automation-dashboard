"use client";

import { useMemo, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardApiData } from "@/types/dashboard";

interface AnalyticsChartsProps {
  data?: DashboardApiData | null;
  isLoading?: boolean;
}

interface ChartRecord {
  name: string;
  value: number;
}

interface TrendRecord {
  date: string;
  emails: number;
}

const CHART_COLORS = [
  "#7C8FB3",
  "#6F9E9A",
  "#86A789",
  "#B89A6A",
  "#A97C7C",
  "#8D84A8",
  "#6F879C",
];

const LINE_COLOR = "#7C8FB3";
const AXIS_TEXT_COLOR = "#AEB7C4";
const GRID_COLOR = "#2A3038";
const PIE_BORDER_COLOR = "#171717";

function recordToChartData(
  record?: Record<string, number>
): ChartRecord[] {
  if (!record) {
    return [];
  }

  return Object.entries(record)
    .map(([name, value]) => ({
      name,
      value: Number(value) || 0,
    }))
    .sort((first, second) => second.value - first.value);
}

function recordToTrendData(
  record?: Record<string, number>
): TrendRecord[] {
  if (!record) {
    return [];
  }

  return Object.entries(record)
    .map(([date, emails]) => ({
      date,
      emails: Number(emails) || 0,
    }))
    .sort((first, second) => {
      return (
        new Date(first.date).getTime() -
        new Date(second.date).getTime()
      );
    });
}

function formatChartDate(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(parsedDate);
}

export function AnalyticsCharts({
  data,
  isLoading = false,
}: AnalyticsChartsProps) {
  const emailVolumeData = useMemo(() => {
    return recordToTrendData(
      data?.charts.dailyEmailVolume
    );
  }, [data?.charts.dailyEmailVolume]);

  const categoryData = useMemo(() => {
    return recordToChartData(
      data?.charts.categoryDistribution
    );
  }, [data?.charts.categoryDistribution]);

  const priorityData = useMemo(() => {
    return recordToChartData(
      data?.charts.priorityDistribution
    );
  }, [data?.charts.priorityDistribution]);

  const statusData = useMemo(() => {
    return recordToChartData(
      data?.charts.statusDistribution
    );
  }, [data?.charts.statusDistribution]);

  const draftData = useMemo(() => {
    return recordToChartData(
      data?.charts.draftDistribution
    );
  }, [data?.charts.draftDistribution]);

  const meetingData = useMemo(() => {
    return recordToChartData(
      data?.charts.meetingDistribution
    );
  }, [data?.charts.meetingDistribution]);

  const attachmentData = useMemo(() => {
    return recordToChartData(
      data?.charts.attachmentDistribution
    );
  }, [data?.charts.attachmentDistribution]);

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Advanced Analytics
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Email volume, AI classification and automation
          distribution charts
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsChartCard
          title="Email Volume"
          description="Daily number of emails processed"
          isLoading={isLoading}
          isEmpty={emailVolumeData.length === 0}
          className="xl:col-span-2"
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={emailVolumeData}
              margin={{
                top: 15,
                right: 25,
                left: -5,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke={GRID_COLOR}
                strokeOpacity={0.55}
              />

              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                axisLine={{
                  stroke: GRID_COLOR,
                }}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: AXIS_TEXT_COLOR,
                  fontWeight: 500,
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: AXIS_TEXT_COLOR,
                  fontWeight: 500,
                }}
              />

              <Tooltip
                cursor={{
                  stroke: LINE_COLOR,
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                  opacity: 0.65,
                }}
                content={
                  <AnalyticsTooltip
                    labelFormatter={formatChartDate}
                  />
                }
              />

              <Line
                type="monotone"
                dataKey="emails"
                name="Emails"
                stroke={LINE_COLOR}
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#171717",
                  stroke: LINE_COLOR,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: LINE_COLOR,
                  stroke: "#E5E7EB",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Category Distribution"
          description="AI-classified email categories"
          isLoading={isLoading}
          isEmpty={categoryData.length === 0}
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{
                top: 5,
                right: 25,
                left: 25,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                horizontal={false}
                stroke={GRID_COLOR}
                strokeOpacity={0.55}
              />

              <XAxis
                type="number"
                allowDecimals={false}
                axisLine={{
                  stroke: GRID_COLOR,
                }}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: AXIS_TEXT_COLOR,
                  fontWeight: 500,
                }}
              />

              <YAxis
                type="category"
                dataKey="name"
                width={115}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: AXIS_TEXT_COLOR,
                  fontWeight: 500,
                }}
              />

              <Tooltip
                cursor={false}
                content={<AnalyticsTooltip />}
              />

              <Bar
                dataKey="value"
                name="Emails"
                radius={[0, 8, 8, 0]}
                activeBar={false}
              >
                {categoryData.map((item, index) => (
                  <Cell
                    key={`${item.name}-${index}`}
                    fill={
                      CHART_COLORS[
                        index % CHART_COLORS.length
                      ]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Priority Distribution"
          description="Urgent, high, medium and low priority emails"
          isLoading={isLoading}
          isEmpty={priorityData.length === 0}
        >
          <DonutChart data={priorityData} />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Email Status"
          description="Workflow result distribution"
          isLoading={isLoading}
          isEmpty={statusData.length === 0}
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={statusData}
              margin={{
                top: 15,
                right: 15,
                left: -5,
                bottom: 40,
              }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke={GRID_COLOR}
                strokeOpacity={0.55}
              />

              <XAxis
                dataKey="name"
                axisLine={{
                  stroke: GRID_COLOR,
                }}
                tickLine={false}
                angle={-20}
                textAnchor="end"
                height={85}
                interval={0}
                tick={{
                  fontSize: 11,
                  fill: AXIS_TEXT_COLOR,
                  fontWeight: 500,
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: AXIS_TEXT_COLOR,
                  fontWeight: 500,
                }}
              />

              <Tooltip
                cursor={false}
                content={<AnalyticsTooltip />}
              />

              <Bar
                dataKey="value"
                name="Emails"
                radius={[8, 8, 0, 0]}
                activeBar={false}
              >
                {statusData.map((item, index) => (
                  <Cell
                    key={`${item.name}-${index}`}
                    fill={
                      CHART_COLORS[
                        index % CHART_COLORS.length
                      ]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Draft Distribution"
          description="Generated and non-generated draft activity"
          isLoading={isLoading}
          isEmpty={draftData.length === 0}
        >
          <DonutChart data={draftData} />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Meeting Distribution"
          description="Calendar automation performance"
          isLoading={isLoading}
          isEmpty={meetingData.length === 0}
        >
          <DonutChart data={meetingData} />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Attachment Distribution"
          description="Attachment detection and processing activity"
          isLoading={isLoading}
          isEmpty={attachmentData.length === 0}
          className="xl:col-span-2"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={attachmentData}
              margin={{
                top: 15,
                right: 25,
                left: -5,
                bottom: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke={GRID_COLOR}
                strokeOpacity={0.55}
              />

              <XAxis
                dataKey="name"
                axisLine={{
                  stroke: GRID_COLOR,
                }}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: AXIS_TEXT_COLOR,
                  fontWeight: 500,
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: AXIS_TEXT_COLOR,
                  fontWeight: 500,
                }}
              />

              <Tooltip
                cursor={false}
                content={<AnalyticsTooltip />}
              />

              <Bar
                dataKey="value"
                name="Emails"
                radius={[8, 8, 0, 0]}
                activeBar={false}
              >
                {attachmentData.map((item, index) => (
                  <Cell
                    key={`${item.name}-${index}`}
                    fill={
                      CHART_COLORS[
                        index % CHART_COLORS.length
                      ]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>
      </div>
    </section>
  );
}

interface AnalyticsChartCardProps {
  title: string;
  description: string;
  isLoading: boolean;
  isEmpty: boolean;
  children: ReactNode;
  className?: string;
}

function AnalyticsChartCard({
  title,
  description,
  isLoading,
  isEmpty,
  children,
  className = "",
}: AnalyticsChartCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm ${className}`}
    >
      <div className="mb-5">
        <h3 className="text-base font-semibold text-foreground">
          {title}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {isLoading ? (
        <ChartLoadingSkeleton />
      ) : isEmpty ? (
        <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/10">
          <div className="text-center">
            <p className="font-semibold text-foreground">
              No chart data available
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Run the n8n dashboard workflow to generate
              analytics data.
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </article>
  );
}

function DonutChart({
  data,
}: {
  data: ChartRecord[];
}) {
  const total = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_190px]">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={108}
            paddingAngle={3}
            stroke={PIE_BORDER_COLOR}
            strokeWidth={3}
            activeShape={false}
          >
            {data.map((item, index) => (
              <Cell
                key={`${item.name}-${index}`}
                fill={
                  CHART_COLORS[
                    index % CHART_COLORS.length
                  ]
                }
              />
            ))}
          </Pie>

          <Tooltip
            cursor={false}
            content={<AnalyticsTooltip />}
          />
        </PieChart>
      </ResponsiveContainer>

      <div>
        <div className="mb-5 rounded-xl border border-border/70 bg-muted/20 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Total
          </p>

          <p className="mt-1 text-3xl font-bold text-foreground">
            {total}
          </p>
        </div>

        <div className="space-y-3">
          {data.slice(0, 7).map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      CHART_COLORS[
                        index % CHART_COLORS.length
                      ],
                  }}
                />

                <span className="truncate text-sm font-medium text-muted-foreground">
                  {item.name}
                </span>
              </div>

              <span className="text-sm font-bold text-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartLoadingSkeleton() {
  return (
    <div className="flex h-[300px] items-end gap-3 rounded-xl bg-muted/10 p-6">
      {[45, 70, 55, 90, 65, 80, 50, 75].map(
        (height, index) => (
          <div
            key={index}
            className="flex-1 animate-pulse rounded-t-md bg-muted"
            style={{
              height: `${height}%`,
            }}
          />
        )
      )}
    </div>
  );
}

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: {
    name?: string;
  };
}

interface AnalyticsTooltipProps {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
  labelFormatter?: (label: string) => string;
}

function AnalyticsTooltip({
  active,
  label,
  payload,
  labelFormatter,
}: AnalyticsTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const formattedLabel =
    label && labelFormatter
      ? labelFormatter(label)
      : label;

  return (
    <div className="min-w-40 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-slate-100 shadow-2xl backdrop-blur-md">
      {formattedLabel && (
        <p className="mb-2 border-b border-slate-800 pb-2 text-xs font-semibold text-slate-300">
          {formattedLabel}
        </p>
      )}

      <div className="space-y-2">
        {payload.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex items-center justify-between gap-5 text-sm"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    item.color ??
                    CHART_COLORS[
                      index % CHART_COLORS.length
                    ],
                }}
              />

              <span className="truncate text-slate-300">
                {item.payload?.name ??
                  item.name ??
                  "Value"}
              </span>
            </div>

            <span className="font-bold text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}