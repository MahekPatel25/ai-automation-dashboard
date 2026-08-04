"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  CircleGauge,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquareText,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import {
  EmailPriorityBadge,
  EmailStatusBadge,
} from "@/components/dashboard/email-badges";
import { createEmailItems } from "@/components/dashboard/email-data";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useDashboardData } from "@/hooks/use-dashboard-data";

type AnalysisFilter =
  | "all"
  | "high-priority"
  | "reply-required"
  | "draft-created"
  | "failed";

type AccentName =
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "teal"
  | "purple"
  | "slate"
  | "orange";

interface AccentStyle {
  main: string;
  text: string;
  background: string;
  border: string;
  topLine: string;
}

interface AnalysisCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  accent: AccentName;
  isLoading: boolean;
}

interface PerformanceCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  accent: AccentName;
  isLoading: boolean;
}

const EMAILS_PER_PAGE = 8;

const ACCENTS: Record<AccentName, AccentStyle> = {
  blue: {
    main: "#155DFC",
    text: "#155DFC",
    background: "rgba(21, 93, 252, 0.08)",
    border: "rgba(21, 93, 252, 0.22)",
    topLine: "rgba(21, 93, 252, 0.48)",
  },

  green: {
    main: "#31C950",
    text: "#208F38",
    background: "rgba(49, 201, 80, 0.08)",
    border: "rgba(49, 201, 80, 0.22)",
    topLine: "rgba(49, 201, 80, 0.48)",
  },

  yellow: {
    main: "#FDC745",
    text: "#9B6A00",
    background: "rgba(253, 199, 69, 0.11)",
    border: "rgba(253, 199, 69, 0.30)",
    topLine: "rgba(253, 199, 69, 0.58)",
  },

  red: {
    main: "#EC253F",
    text: "#C11007",
    background: "rgba(236, 37, 63, 0.08)",
    border: "rgba(236, 37, 63, 0.23)",
    topLine: "rgba(236, 37, 63, 0.50)",
  },

  teal: {
    main: "#09B3A6",
    text: "#087D75",
    background: "rgba(9, 179, 166, 0.08)",
    border: "rgba(9, 179, 166, 0.23)",
    topLine: "rgba(9, 179, 166, 0.50)",
  },

  purple: {
    main: "#6D5CE8",
    text: "#5543C7",
    background: "rgba(109, 92, 232, 0.08)",
    border: "rgba(109, 92, 232, 0.23)",
    topLine: "rgba(109, 92, 232, 0.48)",
  },

  slate: {
    main: "#45556C",
    text: "#45556C",
    background: "rgba(69, 85, 108, 0.08)",
    border: "rgba(69, 85, 108, 0.22)",
    topLine: "rgba(69, 85, 108, 0.44)",
  },

  orange: {
    main: "#FF7A59",
    text: "#C9573D",
    background: "rgba(255, 122, 89, 0.09)",
    border: "rgba(255, 122, 89, 0.24)",
    topLine: "rgba(255, 122, 89, 0.50)",
  },
};

const CATEGORY_COLORS = [
  "#31C950",
  "#09B3A6",
  "#FDC745",
  "#155DFC",
  "#EC253F",
  "#18786F",
  "#45556C",
  "#6D5CE8",
  "#FF7A59",
  "#0C0A09",
];

export default function AiAnalysisPage() {
  const {
    data,
    isLoading,
    error,
    refresh,
  } = useDashboardData();

  const [activeFilter, setActiveFilter] =
    useState<AnalysisFilter>("all");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const emails = useMemo(() => {
    return createEmailItems(data?.emails);
  }, [data?.emails]);

  const highPriorityEmails = useMemo(() => {
    return emails.filter((email) => {
      const priority =
        email.priority.toLowerCase();

      return (
        priority.includes("high") ||
        priority.includes("urgent")
      );
    });
  }, [emails]);

  const replyRequiredEmails = useMemo(() => {
    return emails.filter(
      (email) => email.replyRequired
    );
  }, [emails]);

  const draftCreatedEmails = useMemo(() => {
    return emails.filter(
      (email) => email.draftCreated
    );
  }, [emails]);

  const failedEmails = useMemo(() => {
    return emails.filter((email) => {
      const workflowStatus =
        email.workflowStatus.toLowerCase();

      return (
        workflowStatus.includes("failed") ||
        workflowStatus.includes("error")
      );
    });
  }, [emails]);

  const completedEmails = useMemo(() => {
    return emails.filter((email) => {
      const workflowStatus =
        email.workflowStatus.toLowerCase();

      return (
        workflowStatus.includes("sent") ||
        workflowStatus.includes("completed") ||
        workflowStatus.includes("replied")
      );
    });
  }, [emails]);

  const categorySummary = useMemo(() => {
    const categoryMap =
      new Map<string, number>();

    emails.forEach((email) => {
      const category =
        email.category || "Uncategorized";

      categoryMap.set(
        category,
        (categoryMap.get(category) || 0) + 1
      );
    });

    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage:
          emails.length > 0
            ? Math.round(
                (count / emails.length) * 100
              )
            : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [emails]);

  const topCategory =
    categorySummary[0]?.category ||
    "No data";

  const automationSuccessRate =
    emails.length > 0
      ? Math.round(
          (completedEmails.length /
            emails.length) *
            100
        )
      : 0;

  const draftGenerationRate =
    emails.length > 0
      ? Math.round(
          (draftCreatedEmails.length /
            emails.length) *
            100
        )
      : 0;

  const replyDetectionRate =
    emails.length > 0
      ? Math.round(
          (replyRequiredEmails.length /
            emails.length) *
            100
        )
      : 0;

  const activeEmails = useMemo(() => {
    if (activeFilter === "high-priority") {
      return highPriorityEmails;
    }

    if (activeFilter === "reply-required") {
      return replyRequiredEmails;
    }

    if (activeFilter === "draft-created") {
      return draftCreatedEmails;
    }

    if (activeFilter === "failed") {
      return failedEmails;
    }

    return emails;
  }, [
    activeFilter,
    emails,
    highPriorityEmails,
    replyRequiredEmails,
    draftCreatedEmails,
    failedEmails,
  ]);

  const filteredEmails = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return activeEmails;
    }

    return activeEmails.filter((email) => {
      return [
        email.senderName,
        email.senderEmail,
        email.subject,
        email.summary,
        email.category,
        email.priority,
        email.status,
        email.workflowStatus,
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [activeEmails, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredEmails.length /
        EMAILS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedEmails = useMemo(() => {
    const startIndex =
      (safeCurrentPage - 1) *
      EMAILS_PER_PAGE;

    return filteredEmails.slice(
      startIndex,
      startIndex + EMAILS_PER_PAGE
    );
  }, [filteredEmails, safeCurrentPage]);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];

    const startPage = Math.max(
      1,
      safeCurrentPage - 2
    );

    const endPage = Math.min(
      totalPages,
      safeCurrentPage + 2
    );

    for (
      let page = startPage;
      page <= endPage;
      page += 1
    ) {
      pages.push(page);
    }

    return pages;
  }, [safeCurrentPage, totalPages]);

  function changeFilter(
    filter: AnalysisFilter
  ) {
    setActiveFilter(filter);
    setCurrentPage(1);
    setSearchQuery("");
  }

  function goToPreviousPage() {
    setCurrentPage((page) =>
      Math.max(1, page - 1)
    );
  }

  function goToNextPage() {
    setCurrentPage((page) =>
      Math.min(totalPages, page + 1)
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(109,92,232,0.22)] bg-[rgba(109,92,232,0.08)] text-[#5543C7]">
                <BrainCircuit className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#5543C7]">
                  AI Email Intelligence
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                  AI Analysis
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Review AI classifications,
                  reply decisions, generated
                  drafts, priority detection and
                  workflow performance.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void refresh()}
              disabled={isLoading}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isLoading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh Analysis
            </button>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[rgba(193,16,7,0.22)] bg-[rgba(193,16,7,0.07)] px-4 py-3 text-sm text-[#C11007]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

              <p>
                AI analysis data could not be
                loaded. Check the dashboard API
                and n8n workflow connection.
              </p>
            </div>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalysisCard
            title="Emails Analyzed"
            value={emails.length}
            description="Total emails processed by AI"
            icon={BrainCircuit}
            accent="blue"
            isLoading={isLoading}
          />

          <AnalysisCard
            title="High Priority"
            value={highPriorityEmails.length}
            description="Urgent emails detected by AI"
            icon={AlertTriangle}
            accent="red"
            isLoading={isLoading}
          />

          <AnalysisCard
            title="Reply Required"
            value={replyRequiredEmails.length}
            description="Emails requiring a response"
            icon={MessageSquareText}
            accent="teal"
            isLoading={isLoading}
          />

          <AnalysisCard
            title="Drafts Created"
            value={draftCreatedEmails.length}
            description="AI-generated draft replies"
            icon={FileText}
            accent="green"
            isLoading={isLoading}
          />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <PerformanceCard
            title="Automation Success"
            value={automationSuccessRate}
            description="Completed email workflows"
            icon={CheckCircle2}
            accent="green"
            isLoading={isLoading}
          />

          <PerformanceCard
            title="Draft Generation"
            value={draftGenerationRate}
            description="Emails receiving AI drafts"
            icon={Sparkles}
            accent="blue"
            isLoading={isLoading}
          />

          <PerformanceCard
            title="Reply Detection"
            value={replyDetectionRate}
            description="Emails marked for reply"
            icon={CircleGauge}
            accent="teal"
            isLoading={isLoading}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  AI Category Distribution
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Email categories identified by
                  the AI workflow.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(21,93,252,0.22)] bg-[rgba(21,93,252,0.08)] text-[#155DFC]">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {isLoading ? (
                Array.from({
                  length: 6,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="space-y-2"
                  >
                    <div className="h-4 animate-pulse rounded bg-muted" />
                    <div className="h-2 animate-pulse rounded-full bg-muted" />
                  </div>
                ))
              ) : categorySummary.length > 0 ? (
                categorySummary
                  .slice(0, 10)
                  .map((item, index) => {
                    const color =
                      CATEGORY_COLORS[
                        index %
                          CATEGORY_COLORS.length
                      ];

                    return (
                      <div
                        key={item.category}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  color,
                              }}
                            />

                            <p className="truncate text-sm font-medium">
                              {item.category}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {item.count} emails
                            </p>

                            <p className="text-xs font-semibold">
                              {item.percentage}%
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-[width] duration-700 ease-out"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  item.percentage
                                )
                              )}%`,
                              backgroundColor:
                                color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <p className="font-semibold">
                    No category data
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Category insights will appear
                    after emails are analyzed.
                  </p>
                </div>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  AI Insight Summary
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Quick overview of the current
                  analysis results.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(109,92,232,0.22)] bg-[rgba(109,92,232,0.08)] text-[#5543C7]">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <InsightRow
                label="Top Category"
                value={topCategory}
                accent="green"
              />

              <InsightRow
                label="Completed Workflows"
                value={`${completedEmails.length}`}
                accent="teal"
              />

              <InsightRow
                label="Failed Workflows"
                value={`${failedEmails.length}`}
                accent="red"
              />

              <InsightRow
                label="Drafts Generated"
                value={`${draftCreatedEmails.length}`}
                accent="blue"
              />

              <InsightRow
                label="Replies Required"
                value={`${replyRequiredEmails.length}`}
                accent="yellow"
              />

              <InsightRow
                label="High Priority Emails"
                value={`${highPriorityEmails.length}`}
                accent="orange"
              />
            </div>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/70 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Detailed AI Results
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Review AI analysis results.
                  Email details and draft actions
                  remain available in Email Status.
                </p>
              </div>

              <div className="relative w-full xl:max-w-sm">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(
                      event.target.value
                    );
                  }}
                  placeholder="Search analysis..."
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground hover:border-ring/40 focus:border-ring focus:ring-4 focus:ring-ring/10"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <FilterButton
                label="All"
                count={emails.length}
                isActive={
                  activeFilter === "all"
                }
                accent="blue"
                onClick={() =>
                  changeFilter("all")
                }
              />

              <FilterButton
                label="High Priority"
                count={
                  highPriorityEmails.length
                }
                isActive={
                  activeFilter ===
                  "high-priority"
                }
                accent="red"
                onClick={() =>
                  changeFilter(
                    "high-priority"
                  )
                }
              />

              <FilterButton
                label="Reply Required"
                count={
                  replyRequiredEmails.length
                }
                isActive={
                  activeFilter ===
                  "reply-required"
                }
                accent="teal"
                onClick={() =>
                  changeFilter(
                    "reply-required"
                  )
                }
              />

              <FilterButton
                label="Draft Created"
                count={
                  draftCreatedEmails.length
                }
                isActive={
                  activeFilter ===
                  "draft-created"
                }
                accent="green"
                onClick={() =>
                  changeFilter(
                    "draft-created"
                  )
                }
              />

              <FilterButton
                label="Failed"
                count={failedEmails.length}
                isActive={
                  activeFilter === "failed"
                }
                accent="slate"
                onClick={() =>
                  changeFilter("failed")
                }
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="border-b border-border/70 bg-muted/15 text-left">
                  <TableHeading label="Sender" />
                  <TableHeading label="Subject" />
                  <TableHeading label="Category" />
                  <TableHeading label="Priority" />
                  <TableHeading label="Reply" />
                  <TableHeading label="Draft" />
                  <TableHeading label="Status" />
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <TableSkeleton />
                ) : paginatedEmails.length >
                  0 ? (
                  paginatedEmails.map(
                    (email) => (
                      <tr
                        key={email.id}
                        className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <p className="max-w-[190px] truncate text-sm font-semibold">
                            {email.senderName}
                          </p>

                          <p className="mt-1 max-w-[190px] truncate text-xs text-muted-foreground">
                            {email.senderEmail}
                          </p>
                        </td>

                        <td className="max-w-[300px] px-5 py-4">
                          <p className="truncate text-sm font-medium">
                            {email.subject}
                          </p>

                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {email.summary}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex max-w-[140px] truncate rounded-lg border border-border/70 bg-muted/15 px-2.5 py-1 text-xs font-medium">
                            {email.category}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <EmailPriorityBadge
                            priority={
                              email.priority
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <BooleanBadge
                            value={
                              email.replyRequired
                            }
                            trueLabel="Required"
                            falseLabel="Not Required"
                            activeColor="#FDC745"
                            activeText="#9B6A00"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <BooleanBadge
                            value={
                              email.draftCreated
                            }
                            trueLabel="Created"
                            falseLabel="Not Created"
                            activeColor="#31C950"
                            activeText="#208F38"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <EmailStatusBadge
                            status={
                              email.status
                            }
                          />
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >
                      <BrainCircuit className="mx-auto h-10 w-10 text-muted-foreground/50" />

                      <p className="mt-4 font-semibold">
                        No analysis found
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Change the filter or search
                        to view matching results.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredEmails.length >
            EMAILS_PER_PAGE && (
            <div className="flex flex-col gap-3 border-t border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page{" "}
                <span className="font-semibold text-foreground">
                  {safeCurrentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {totalPages}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={
                    safeCurrentPage === 1
                  }
                  className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                {visiblePages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    className={
                      page === safeCurrentPage
                        ? "inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
                        : "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-muted/40"
                    }
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

function AnalysisCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  isLoading,
}: AnalysisCardProps) {
  const colors = ACCENTS[accent];

  return (
    <article className="group relative min-h-[158px] overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${colors.topLine},
            transparent
          )`,
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          {isLoading ? (
            <div className="mt-3 h-8 w-16 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="mt-1.5 text-[30px] font-bold tracking-tight">
              {value.toLocaleString()}
            </p>
          )}
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-[1.04]"
          style={{
            color: colors.text,
            backgroundColor:
              colors.background,
            borderColor: colors.border,
          }}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      <div className="mt-3 border-t border-border/60 pt-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
          style={{
            color: colors.text,
            backgroundColor:
              colors.background,
            borderColor: colors.border,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: colors.main,
            }}
          />

          Live analysis
        </span>
      </div>
    </article>
  );
}

function PerformanceCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  isLoading,
}: PerformanceCardProps) {
  const colors = ACCENTS[accent];

  const safeValue = Math.min(
    100,
    Math.max(0, value)
  );

  return (
    <article className="group relative min-h-[165px] overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${colors.topLine},
            transparent
          )`,
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          {isLoading ? (
            <div className="mt-3 h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="mt-1.5 text-[30px] font-bold tracking-tight">
              {safeValue}%
            </p>
          )}
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-[1.04]"
          style={{
            color: colors.text,
            backgroundColor:
              colors.background,
            borderColor: colors.border,
          }}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${safeValue}%`,
            backgroundColor: colors.main,
          }}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

function FilterButton({
  label,
  count,
  isActive,
  accent,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  accent: AccentName;
  onClick: () => void;
}) {
  const colors = ACCENTS[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
      style={
        isActive
          ? {
              color: colors.text,
              backgroundColor:
                colors.background,
              borderColor: colors.border,
            }
          : {
              color:
                "var(--muted-foreground)",
              backgroundColor:
                "var(--background)",
              borderColor: "var(--border)",
            }
      }
    >
      {label}

      <span
        className="rounded-full px-2 py-0.5 text-xs"
        style={{
          backgroundColor: isActive
            ? `${colors.main}18`
            : "var(--muted)",
        }}
      >
        {count}
      </span>
    </button>
  );
}

function BooleanBadge({
  value,
  trueLabel,
  falseLabel,
  activeColor,
  activeText,
}: {
  value: boolean;
  trueLabel: string;
  falseLabel: string;
  activeColor: string;
  activeText: string;
}) {
  if (value) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
        style={{
          color: activeText,
          backgroundColor:
            `${activeColor}14`,
          borderColor:
            `${activeColor}38`,
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor:
              activeColor,
          }}
        />

        {trueLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-[#45556C]" />

      {falseLabel}
    </span>
  );
}

function InsightRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: AccentName;
}) {
  const colors = ACCENTS[accent];

  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/10 px-4 py-3 transition-colors duration-200 hover:bg-muted/20">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            backgroundColor: colors.main,
          }}
        />

        <p className="truncate text-sm text-muted-foreground">
          {label}
        </p>
      </div>

      <p
        className="max-w-[180px] truncate text-sm font-semibold"
        style={{
          color: colors.text,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function TableHeading({
  label,
}: {
  label: string;
}) {
  return (
    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {label}
    </th>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({
        length: 6,
      }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className="border-b border-border/60"
        >
          {Array.from({
            length: 7,
          }).map((__, columnIndex) => (
            <td
              key={columnIndex}
              className="px-5 py-5"
            >
              <div className="h-5 animate-pulse rounded-md bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}