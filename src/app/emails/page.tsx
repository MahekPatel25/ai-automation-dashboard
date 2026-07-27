"use client";

import { useMemo, useState } from "react";
import {
  Inbox,
  Mail,
  RefreshCw,
  Search,
  SlidersHorizontal,
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

const EMAILS_PER_PAGE = 10;

type SortOption =
  | "newest"
  | "oldest"
  | "priority-high"
  | "priority-low";

export default function EmailsPage() {
  const {
    data,
    isLoading,
    error,
    refresh,
  } = useDashboardData();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [sortOption, setSortOption] =
    useState<SortOption>("newest");

  const [currentPage, setCurrentPage] =
    useState(1);

  const emails = useMemo(() => {
    return createEmailItems(data?.emails);
  }, [data?.emails]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        emails
          .map((email) => email.category)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [emails]);

  const priorities = useMemo(() => {
    return Array.from(
      new Set(
        emails
          .map((email) => email.priority)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [emails]);

  const statuses = useMemo(() => {
    return Array.from(
      new Set(
        emails
          .map((email) => email.status)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [emails]);

  const filteredEmails = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    const result = emails.filter((email) => {
      const matchesSearch =
        !normalizedSearch ||
        [
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

      const matchesCategory =
        categoryFilter === "all" ||
        email.category === categoryFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        email.priority === priorityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        email.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPriority &&
        matchesStatus
      );
    });

    return [...result].sort((a, b) => {
      if (sortOption === "priority-high") {
        return (
          getPriorityRank(b.priority) -
          getPriorityRank(a.priority)
        );
      }

      if (sortOption === "priority-low") {
        return (
          getPriorityRank(a.priority) -
          getPriorityRank(b.priority)
        );
      }

      const dateA = getEmailTimestamp(
        a.receivedAt
      );

      const dateB = getEmailTimestamp(
        b.receivedAt
      );

      if (sortOption === "oldest") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });
  }, [
    emails,
    searchQuery,
    categoryFilter,
    priorityFilter,
    statusFilter,
    sortOption,
  ]);

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

  const startEmailNumber =
    filteredEmails.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          EMAILS_PER_PAGE +
        1;

  const endEmailNumber = Math.min(
    safeCurrentPage * EMAILS_PER_PAGE,
    filteredEmails.length
  );

  const highPriorityCount = useMemo(() => {
    return emails.filter((email) => {
      const priority =
        email.priority.toLowerCase();

      return (
        priority.includes("high") ||
        priority.includes("urgent")
      );
    }).length;
  }, [emails]);

  const replyRequiredCount = useMemo(() => {
    return emails.filter(
      (email) => email.replyRequired
    ).length;
  }, [emails]);

  const draftCreatedCount = useMemo(() => {
    return emails.filter(
      (email) => email.draftCreated
    ).length;
  }, [emails]);

  function resetFilters() {
    setSearchQuery("");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
    setSortOption("newest");
    setCurrentPage(1);
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
                Email Inbox Intelligence
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Emails
              </h1>

              <p className="mt-3 max-w-3xl text-muted-foreground">
                Search, filter and review all
                emails processed by the AI Email
                Assistant.
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

              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Email data could not be loaded.
              Please check the dashboard API and
              n8n workflow connection.
            </div>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Emails"
            value={emails.length}
            description="All processed emails"
            icon={Mail}
            isLoading={isLoading}
          />

          <SummaryCard
            title="High Priority"
            value={highPriorityCount}
            description="Urgent or high-priority emails"
            icon={Inbox}
            isLoading={isLoading}
          />

          <SummaryCard
            title="Reply Required"
            value={replyRequiredCount}
            description="Emails requiring a response"
            icon={Mail}
            isLoading={isLoading}
          />

          <SummaryCard
            title="Drafts Created"
            value={draftCreatedCount}
            description="AI-generated email drafts"
            icon={Inbox}
            isLoading={isLoading}
          />
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />

            <div>
              <h2 className="text-lg font-semibold">
                Search and Filters
              </h2>

              <p className="text-sm text-muted-foreground">
                Find emails by sender, subject,
                category, priority or status.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative md:col-span-2 xl:col-span-1">
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
                placeholder="Search emails..."
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => {
                setPriorityFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            >
              <option value="all">
                All Priorities
              </option>

              {priorities.map((priority) => (
                <option
                  key={priority}
                  value={priority}
                >
                  {priority}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            >
              <option value="all">
                All Statuses
              </option>

              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>

            <select
              value={sortOption}
              onChange={(event) => {
                setSortOption(
                  event.target.value as SortOption
                );
                setCurrentPage(1);
              }}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            >
              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

              <option value="priority-high">
                Highest Priority
              </option>

              <option value="priority-low">
                Lowest Priority
              </option>
            </select>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredEmails.length}
              </span>{" "}
              matching emails
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition hover:bg-accent"
            >
              Reset Filters
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/70 p-5">
            <div>
              <h2 className="text-lg font-semibold">
                All Emails
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Review all processed email records.
                Email details and draft actions are
                available only in Email Status.
              </p>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {startEmailNumber}
              </span>
              {" - "}
              <span className="font-semibold text-foreground">
                {endEmailNumber}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {filteredEmails.length}
              </span>{" "}
              emails
            </p>
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
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Workflow
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Received
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({
                    length: 7,
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

                        <td className="max-w-[320px] px-5 py-4">
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
                          <EmailStatusBadge
                            status={
                              email.status
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <WorkflowStatusBadge
                            status={
                              email.workflowStatus
                            }
                          />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                          {
                            email.receivedAt
                          }
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
                      <Mail className="mx-auto h-10 w-10 text-muted-foreground/50" />

                      <p className="mt-4 font-semibold">
                        No emails found
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Change the search or filters
                        to view matching emails.
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

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: typeof Mail;
  isLoading: boolean;
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
}: SummaryCardProps) {
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

function WorkflowStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus =
    status.toLowerCase();

  if (
    normalizedStatus.includes("failed") ||
    normalizedStatus.includes("error")
  ) {
    return (
      <span className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
        {status || "Failed"}
      </span>
    );
  }

  if (
    normalizedStatus.includes("sent") ||
    normalizedStatus.includes("complete") ||
    normalizedStatus.includes("replied")
  ) {
    return (
      <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        {status || "Completed"}
      </span>
    );
  }

  if (
    normalizedStatus.includes("draft")
  ) {
    return (
      <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
        {status || "Draft"}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
      {status || "Pending"}
    </span>
  );
}

function getPriorityRank(
  priority: string
) {
  const normalizedPriority =
    priority.toLowerCase();

  if (
    normalizedPriority.includes("urgent")
  ) {
    return 4;
  }

  if (
    normalizedPriority.includes("high")
  ) {
    return 3;
  }

  if (
    normalizedPriority.includes("medium")
  ) {
    return 2;
  }

  if (
    normalizedPriority.includes("low")
  ) {
    return 1;
  }

  return 0;
}

function getEmailTimestamp(
  receivedAt: string
) {
  const timestamp = new Date(
    receivedAt
  ).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}