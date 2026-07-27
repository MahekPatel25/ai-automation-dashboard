import type { DashboardCharts } from "@/types/dashboard";

export interface EmailTrendDataItem {
  date: string;
  label: string;
  emails: number;
}

export interface EmailCategoryDataItem {
  name: string;
  value: number;
  percentage: number;
}

export const fallbackEmailTrendData: EmailTrendDataItem[] = [
  {
    date: "2026-07-16",
    label: "Thu",
    emails: 0,
  },
  {
    date: "2026-07-17",
    label: "Fri",
    emails: 15,
  },
  {
    date: "2026-07-18",
    label: "Sat",
    emails: 0,
  },
  {
    date: "2026-07-19",
    label: "Sun",
    emails: 0,
  },
  {
    date: "2026-07-20",
    label: "Mon",
    emails: 2,
  },
  {
    date: "2026-07-21",
    label: "Tue",
    emails: 0,
  },
  {
    date: "2026-07-22",
    label: "Wed",
    emails: 3,
  },
];

export const fallbackCategoryData: EmailCategoryDataItem[] = [
  {
    name: "Meeting",
    value: 9,
    percentage: 45,
  },
  {
    name: "Sales Lead",
    value: 5,
    percentage: 25,
  },
  {
    name: "General",
    value: 3,
    percentage: 15,
  },
  {
    name: "Customer Support",
    value: 2,
    percentage: 10,
  },
  {
    name: "Payment",
    value: 1,
    percentage: 5,
  },
];

function formatChartDate(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);
}

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createLastSevenDateKeys(
  dailyEmailVolume: Record<string, number>
): string[] {
  const availableDates = Object.keys(dailyEmailVolume)
    .filter((dateValue) => {
      const date = new Date(`${dateValue}T00:00:00`);

      return !Number.isNaN(date.getTime());
    })
    .sort((dateA, dateB) => {
      return (
        new Date(`${dateA}T00:00:00`).getTime() -
        new Date(`${dateB}T00:00:00`).getTime()
      );
    });

  const latestAvailableDate =
    availableDates.length > 0
      ? new Date(
          `${availableDates[availableDates.length - 1]}T00:00:00`
        )
      : new Date();

  const dateKeys: string[] = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(latestAvailableDate);

    date.setDate(latestAvailableDate.getDate() - index);

    dateKeys.push(toLocalDateKey(date));
  }

  return dateKeys;
}

export function createEmailTrendData(
  charts?: DashboardCharts
): EmailTrendDataItem[] {
  if (!charts?.dailyEmailVolume) {
  return [];
}

  const dateKeys = createLastSevenDateKeys(
    charts.dailyEmailVolume
  );

  return dateKeys.map((dateKey) => ({
    date: dateKey,
    label: formatChartDate(dateKey),
    emails: Number(
      charts.dailyEmailVolume[dateKey] ?? 0
    ),
  }));
}

export function createCategoryData(
  charts?: DashboardCharts
): EmailCategoryDataItem[] {
  if (!charts?.categoryDistribution) {
  return [];
}

  const categoryEntries = Object.entries(
    charts.categoryDistribution
  )
    .map(([name, value]) => ({
      name,
      value: Number(value) || 0,
    }))
    .filter((item) => item.value > 0)
    .sort((itemA, itemB) => {
      return itemB.value - itemA.value;
    });

  if (categoryEntries.length === 0) {
    return [];
  }

  const totalEmails = categoryEntries.reduce(
    (total, item) => total + item.value,
    0
  );

  return categoryEntries.map((item) => ({
    name: item.name,
    value: item.value,
    percentage:
      totalEmails > 0
        ? Math.round((item.value / totalEmails) * 100)
        : 0,
  }));
}