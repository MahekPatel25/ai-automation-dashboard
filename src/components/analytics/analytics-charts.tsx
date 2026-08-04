"use client";

import { useMemo, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: ChartRecord | TrendRecord;
}

interface AnalyticsTooltipProps {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
  labelFormatter?: (label: string) => string;
}

const ANALYTICS_COLORS = [
  "#155DFC",
  "#09B3A6",
  "#31C950",
  "#FDC745",
  "#EC253F",
  "#18786F",
  "#45556C",
  "#7A5DFA",
  "#FF7A59",
  "#0C0A09",
];

const COLOR = {
  green: "#31C950",
  blue: "#155DFC",
  yellow: "#FDC745",
  red: "#EC253F",
  black: "#0C0A09",
  teal: "#18786F",
  slate: "#45556C",
  purple: "#7A5DFA",
  coral: "#FF7A59",
  cyan: "#09B3A6",

  grid: "rgba(69, 85, 108, 0.20)",
  cursor: "rgba(21, 93, 252, 0.30)",
};

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
    .sort(
      (first, second) =>
        new Date(first.date).getTime() -
        new Date(second.date).getTime()
    );
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

function normalizeName(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getSemanticColor(
  name: string,
  chartType:
    | "priority"
    | "draft"
    | "meeting"
    | "general",
  index: number
): string {
  const normalizedName = normalizeName(name);

  if (chartType === "priority") {
    if (normalizedName === "urgent") {
      return COLOR.red;
    }

    if (normalizedName === "high") {
      return COLOR.blue;
    }

    if (normalizedName === "medium") {
      return COLOR.cyan;
    }

    if (normalizedName === "low") {
      return COLOR.green;
    }
  }

  if (chartType === "draft") {
    if (
      normalizedName.includes("not created") ||
      normalizedName.includes("not generated")
    ) {
      return COLOR.teal;
    }

    if (
      normalizedName.includes("created") ||
      normalizedName.includes("generated")
    ) {
      return COLOR.blue;
    }
  }

  if (chartType === "meeting") {
    if (
      normalizedName.includes("not created") ||
      normalizedName.includes("not scheduled")
    ) {
      return COLOR.blue;
    }

    if (
      normalizedName.includes("created") ||
      normalizedName.includes("scheduled")
    ) {
      return COLOR.cyan;
    }
  }

  return ANALYTICS_COLORS[
    index % ANALYTICS_COLORS.length
  ];
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
        <h2 className="text-lg font-semibold text-foreground">
          Advanced Analytics
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Email volume, AI classification and automation
          distribution charts.
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
          <EmailVolumeChart data={emailVolumeData} />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Category Distribution"
          description="AI-classified email categories"
          isLoading={isLoading}
          isEmpty={categoryData.length === 0}
        >
          <HorizontalBarChart data={categoryData} />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Priority Distribution"
          description="Urgent, high, medium and low priority emails"
          isLoading={isLoading}
          isEmpty={priorityData.length === 0}
        >
          <DonutChart
            data={priorityData}
            chartType="priority"
          />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Email Status"
          description="Workflow result distribution"
          isLoading={isLoading}
          isEmpty={statusData.length === 0}
        >
          <VerticalBarChart data={statusData} />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Draft Distribution"
          description="Generated and non-generated draft activity"
          isLoading={isLoading}
          isEmpty={draftData.length === 0}
        >
          <DonutChart
            data={draftData}
            chartType="draft"
          />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Meeting Distribution"
          description="Calendar automation performance"
          isLoading={isLoading}
          isEmpty={meetingData.length === 0}
        >
          <DonutChart
            data={meetingData}
            chartType="meeting"
          />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Attachment Distribution"
          description="Attachment detection and processing activity"
          isLoading={isLoading}
          isEmpty={attachmentData.length === 0}
          className="xl:col-span-2"
        >
          <VerticalBarChart data={attachmentData} />
        </AnalyticsChartCard>
      </div>
    </section>
  );
}

function EmailVolumeChart({
  data,
}: {
  data: TrendRecord[];
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart
        data={data}
        margin={{
          top: 18,
          right: 22,
          left: -8,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient
            id="analyticsEmailVolumeGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={COLOR.blue}
              stopOpacity={0.38}
            />

            <stop
              offset="52%"
              stopColor={COLOR.blue}
              stopOpacity={0.14}
            />

            <stop
              offset="100%"
              stopColor={COLOR.blue}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="5 7"
          vertical={false}
          stroke={COLOR.grid}
        />

        <XAxis
          dataKey="date"
          tickFormatter={formatChartDate}
          axisLine={false}
          tickLine={false}
          dy={10}
          tick={{
            fontSize: 12,
            fill: COLOR.slate,
            fontWeight: 500,
          }}
        />

        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 12,
            fill: COLOR.slate,
            fontWeight: 500,
          }}
        />

        <Tooltip
          cursor={{
            stroke: COLOR.cursor,
            strokeWidth: 1.5,
            strokeDasharray: "5 5",
          }}
          content={
            <AnalyticsTooltip
              labelFormatter={formatChartDate}
            />
          }
        />

        <Area
          type="natural"
          dataKey="emails"
          name="Emails"
          stroke={COLOR.blue}
          strokeWidth={4}
          fill="url(#analyticsEmailVolumeGradient)"
          animationDuration={900}
          animationEasing="ease-out"
          dot={{
            r: 4,
            fill: COLOR.blue,
            stroke: "var(--card)",
            strokeWidth: 2,
          }}
          activeDot={{
            r: 7,
            fill: COLOR.green,
            stroke: "var(--card)",
            strokeWidth: 3,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function HorizontalBarChart({
  data,
}: {
  data: ChartRecord[];
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 5,
          right: 28,
          left: 26,
          bottom: 5,
        }}
      >
        <CartesianGrid
          strokeDasharray="5 7"
          horizontal={false}
          stroke={COLOR.grid}
        />

        <XAxis
          type="number"
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 12,
            fill: COLOR.slate,
            fontWeight: 500,
          }}
        />

        <YAxis
          type="category"
          dataKey="name"
          width={118}
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 12,
            fill: COLOR.slate,
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
          radius={[0, 9, 9, 0]}
          maxBarSize={34}
          animationDuration={750}
        >
          {data.map((item, index) => (
            <Cell
              key={`${item.name}-${index}`}
              fill={
                ANALYTICS_COLORS[
                  index % ANALYTICS_COLORS.length
                ]
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function VerticalBarChart({
  data,
}: {
  data: ChartRecord[];
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{
          top: 15,
          right: 18,
          left: -5,
          bottom: 45,
        }}
      >
        <CartesianGrid
          strokeDasharray="5 7"
          vertical={false}
          stroke={COLOR.grid}
        />

        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          angle={-18}
          textAnchor="end"
          height={78}
          interval={0}
          tick={{
            fontSize: 11,
            fill: COLOR.slate,
            fontWeight: 500,
          }}
        />

        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 12,
            fill: COLOR.slate,
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
          radius={[9, 9, 0, 0]}
          maxBarSize={54}
          animationDuration={750}
        >
          {data.map((item, index) => (
            <Cell
              key={`${item.name}-${index}`}
              fill={
                ANALYTICS_COLORS[
                  index % ANALYTICS_COLORS.length
                ]
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
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
      className={`overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#155DFC]/25 hover:shadow-[0_14px_32px_rgba(12,10,9,0.10)] ${className}`}
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
        <EmptyChartState />
      ) : (
        children
      )}
    </article>
  );
}

function DonutChart({
  data,
  chartType,
}: {
  data: ChartRecord[];
  chartType:
    | "priority"
    | "draft"
    | "meeting"
    | "general";
}) {
  const total = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const chartData = data.map(
    (item, index) => ({
      ...item,
      color: getSemanticColor(
        item.name,
        chartType,
        index
      ),
      percentage:
        total === 0
          ? 0
          : (item.value / total) * 100,
    })
  );

  return (
    <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_210px]">
      <div className="relative mx-auto h-[300px] w-full max-w-[320px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart
            margin={{
              top: 24,
              right: 24,
              bottom: 24,
              left: 24,
            }}
          >
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              cornerRadius={0}
              stroke="none"
              strokeWidth={0}
              isAnimationActive
              animationBegin={80}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((item, index) => (
                <Cell
                  key={`${item.name}-${index}`}
                  fill={item.color}
                  stroke="none"
                  strokeWidth={0}
                />
              ))}
            </Pie>

            <Tooltip
              cursor={false}
              content={<AnalyticsTooltip />}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {total.toLocaleString()}
            </p>

            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Total
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {chartData
          .slice(0, 10)
          .map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/15 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      item.color,
                  }}
                />

                <span className="truncate text-sm font-medium text-muted-foreground">
                  {item.name}
                </span>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-foreground">
                  {item.value.toLocaleString()}
                </p>

                <p className="text-[11px] text-muted-foreground">
                  {item.percentage.toFixed(
                    1
                  )}
                  %
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function EmptyChartState() {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-[#45556C]/30 bg-muted/10">
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
    <div className="min-w-40 overflow-hidden rounded-xl border border-[#45556C]/30 bg-popover/95 shadow-[0_16px_36px_rgba(12,10,9,0.22)] backdrop-blur-xl">
      {formattedLabel && (
        <p className="border-b border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-popover-foreground">
          {formattedLabel}
        </p>
      )}

      <div className="space-y-2 p-3">
        {payload.map((item, index) => {
          const payloadRecord =
            item.payload as
              | ChartRecord
              | TrendRecord
              | undefined;

          const itemName =
            payloadRecord &&
            "name" in payloadRecord
              ? String(payloadRecord.name)
              : item.name ?? "Value";

          return (
            <div
              key={`${itemName}-${index}`}
              className="flex items-center justify-between gap-5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      item.color ??
                      ANALYTICS_COLORS[
                        index %
                          ANALYTICS_COLORS.length
                      ],
                  }}
                />

                <span className="truncate text-sm text-muted-foreground">
                  {itemName}
                </span>
              </div>

              <span className="text-sm font-bold text-popover-foreground">
                {Number(
                  item.value ?? 0
                ).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}