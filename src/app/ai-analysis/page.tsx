"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  CircleGauge,
  FileText,
  MessageSquareText,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  EmailPriorityBadge,
  EmailStatusBadge,
} from "@/components/dashboard/email-badges";
import {
  createEmailItems,
} from "@/components/dashboard/email-data";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useDashboardData } from "@/hooks/use-dashboard-data";

type AnalysisFilter =
  | "all"
  | "high-priority"
  | "reply-required"
  | "draft-created"
  | "failed";

const EMAILS_PER_PAGE = 8;

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
        value
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [activeEmails, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredEmails.length / EMAILS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedEmails = useMemo(() => {
    const startIndex =
      (safeCurrentPage - 1) *
      EMAILS_PER_PAGE;

    return filteredEmails.slice(
      startIndex,
      startIndex + EMAILS_PER_PAGE
    );
  }, [filteredEmails, safeCurrentPage]);

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
        <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">
                AI Email Intelligence
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                AI Analysis
              </h1>

              <p className="mt-3 max-w-3xl text-muted-foreground">
                Review AI classifications, reply
                decisions, draft creation, priority
                detection and workflow performance
                across all processed emails.
              </p>
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              AI analysis data could not be
              loaded. Please check the dashboard
              API and n8n workflow connection.
            </div>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalysisCard
            title="Emails Analyzed"
            value={emails.length}
            description="Total emails processed by AI"
            icon={BrainCircuit}
            isLoading={isLoading}
          />

          <AnalysisCard
            title="High Priority"
            value={highPriorityEmails.length}
            description="Urgent emails detected by AI"
            icon={AlertTriangle}
            isLoading={isLoading}
          />

          <AnalysisCard
            title="Reply Required"
            value={replyRequiredEmails.length}
            description="Emails requiring a response"
            icon={MessageSquareText}
            isLoading={isLoading}
          />

          <AnalysisCard
            title="Drafts Created"
            value={draftCreatedEmails.length}
            description="AI-generated draft replies"
            icon={FileText}
            isLoading={isLoading}
          />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <PerformanceCard
            title="Automation Success"
            value={automationSuccessRate}
            description="Completed email workflows"
            icon={CheckCircle2}
            isLoading={isLoading}
          />

          <PerformanceCard
            title="Draft Generation"
            value={draftGenerationRate}
            description="Emails receiving AI drafts"
            icon={Sparkles}
            isLoading={isLoading}
          />

          <PerformanceCard
            title="Reply Detection"
            value={replyDetectionRate}
            description="Emails marked for reply"
            icon={CircleGauge}
            isLoading={isLoading}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
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

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {isLoading ? (
                Array.from({
                  length: 5,
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
                  .slice(0, 6)
                  .map((item) => (
                    <div
                      key={item.category}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">
                          {item.category}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {item.count} emails
                        </p>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
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
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
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

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <InsightRow
                label="Top Category"
                value={topCategory}
              />

              <InsightRow
                label="Completed Workflows"
                value={`${completedEmails.length}`}
              />

              <InsightRow
                label="Failed Workflows"
                value={`${failedEmails.length}`}
              />

              <InsightRow
                label="Drafts Generated"
                value={`${draftCreatedEmails.length}`}
              />

              <InsightRow
                label="Replies Required"
                value={`${replyRequiredEmails.length}`}
              />

              <InsightRow
                label="High Priority Emails"
                value={`${highPriorityEmails.length}`}
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/70 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Detailed AI Results
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Review AI analysis results here.
                  Email details and draft actions are
                  available only in Email Status.
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
                    setCurrentPage(1);
                  }}
                  placeholder="Search analysis..."
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
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
                onClick={() =>
                  changeFilter("failed")
                }
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="border-b border-border/70 bg-muted/20 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sender
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Subject
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Priority
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Reply
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Draft
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({
                    length: 6,
                  }).map((_, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-border/60"
                    >
                      {Array.from({
                        length: 7,
                      }).map(
                        (
                          __,
                          columnIndex
                        ) => (
                          <td
                            key={columnIndex}
                            className="px-5 py-5"
                          >
                            <div className="h-5 animate-pulse rounded-md bg-muted" />
                          </td>
                        )
                      )}
                    </tr>
                  ))
                ) : paginatedEmails.length >
                  0 ? (
                  paginatedEmails.map(
                    (email) => (
                      <tr
                        key={email.id}
                        className="cursor-default border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <p className="max-w-[190px] truncate text-sm font-semibold">
                            {
                              email.senderName
                            }
                          </p>

                          <p className="mt-1 max-w-[190px] truncate text-xs text-muted-foreground">
                            {
                              email.senderEmail
                            }
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
                          <span className="inline-flex rounded-lg border border-border/70 bg-muted/20 px-2.5 py-1 text-xs font-medium">
                            {
                              email.category
                            }
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
                          />
                        </td>

                        <td className="px-5 py-4">
                          <BooleanBadge
                            value={
                              email.draftCreated
                            }
                            trueLabel="Created"
                            falseLabel="Not Created"
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
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({
                  length: totalPages,
                }).map((_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          page
                        )
                      }
                      className={
                        page ===
                        safeCurrentPage
                          ? "inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
                          : "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-accent"
                      }
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

interface AnalysisCardProps {
  title: string;
  value: number;
  description: string;
  icon: typeof BrainCircuit;
  isLoading: boolean;
}

function AnalysisCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
}: AnalysisCardProps) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          {isLoading ? (
            <div className="mt-3 h-9 w-16 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {value}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

interface PerformanceCardProps {
  title: string;
  value: number;
  description: string;
  icon: typeof CircleGauge;
  isLoading: boolean;
}

function PerformanceCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
}: PerformanceCardProps) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          {isLoading ? (
            <div className="mt-3 h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {value}%
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{
            width: `${Math.min(
              100,
              Math.max(0, value)
            )}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

interface FilterButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function FilterButton({
  label,
  count,
  isActive,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        isActive
          ? "inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm"
          : "inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
      }
    >
      {label}

      <span
        className={
          isActive
            ? "rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs"
            : "rounded-full bg-muted px-2 py-0.5 text-xs"
        }
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
}: {
  value: boolean;
  trueLabel: string;
  falseLabel: string;
}) {
  if (value) {
    return (
      <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        {trueLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      {falseLabel}
    </span>
  );
}

function InsightRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="max-w-[180px] truncate text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}