"use client";

import {
  useEffect,
  useMemo,
  useState,
  type LucideIcon,
} from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Inbox,
  Mail,
  RefreshCw,
  Reply,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  EmailPriorityBadge,
  EmailStatusBadge,
} from "@/components/dashboard/email-badges";
import { createEmailItems } from "@/components/dashboard/email-data";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useDashboardData } from "@/hooks/use-dashboard-data";

const EMAILS_PER_PAGE = 10;

type SortOption =
  | "newest"
  | "oldest"
  | "priority-high"
  | "priority-low";

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  isLoading: boolean;
  accent: "neutral" | "warning" | "danger" | "success";
}

interface WorkflowStyle {
  text: string;
  background: string;
  border: string;
  dot: string;
}

const SUMMARY_STYLES = {
  neutral: {
    color: "#45556C",
    background: "rgba(69, 85, 108, 0.08)",
    border: "rgba(69, 85, 108, 0.20)",
  },

  warning: {
    color: "#A67416",
    background: "rgba(166, 116, 22, 0.08)",
    border: "rgba(166, 116, 22, 0.20)",
  },

  danger: {
    color: "#C11007",
    background: "rgba(193, 16, 7, 0.07)",
    border: "rgba(193, 16, 7, 0.20)",
  },

  success: {
    color: "#2F8F46",
    background: "rgba(47, 143, 70, 0.08)",
    border: "rgba(47, 143, 70, 0.20)",
  },
} as const;

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
    ).sort((first, second) =>
      first.localeCompare(second)
    );
  }, [emails]);

  const priorities = useMemo(() => {
    return Array.from(
      new Set(
        emails
          .map((email) => email.priority)
          .filter(Boolean)
      )
    ).sort(
      (first, second) =>
        getPriorityRank(second) -
        getPriorityRank(first)
    );
  }, [emails]);

  const statuses = useMemo(() => {
    return Array.from(
      new Set(
        emails
          .map((email) => email.status)
          .filter(Boolean)
      )
    ).sort((first, second) =>
      first.localeCompare(second)
    );
  }, [emails]);

  const filteredEmails = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    const matchingEmails = emails.filter(
      (email) => {
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
            String(value)
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
      }
    );

    return [...matchingEmails].sort(
      (firstEmail, secondEmail) => {
        if (sortOption === "priority-high") {
          return (
            getPriorityRank(
              secondEmail.priority
            ) -
            getPriorityRank(
              firstEmail.priority
            )
          );
        }

        if (sortOption === "priority-low") {
          return (
            getPriorityRank(
              firstEmail.priority
            ) -
            getPriorityRank(
              secondEmail.priority
            )
          );
        }

        const firstTimestamp =
          getEmailTimestamp(
            firstEmail.receivedAtIso
          );

        const secondTimestamp =
          getEmailTimestamp(
            secondEmail.receivedAtIso
          );

        if (sortOption === "oldest") {
          return (
            firstTimestamp -
            secondTimestamp
          );
        }

        return (
          secondTimestamp -
          firstTimestamp
        );
      }
    );
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
  }, [
    searchQuery,
    categoryFilter,
    priorityFilter,
    statusFilter,
    sortOption,
  ]);

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
  }, [
    filteredEmails,
    safeCurrentPage,
  ]);

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
  }, [
    safeCurrentPage,
    totalPages,
  ]);

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

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    categoryFilter !== "all" ||
    priorityFilter !== "all" ||
    statusFilter !== "all" ||
    sortOption !== "newest";

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
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground">
                <Inbox className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-card-foreground md:text-3xl">
                  Emails
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Search, filter and review every
                  email processed by your AI email
                  workflow.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void refresh()}
              disabled={isLoading}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-start gap-3 rounded-xl border border-[rgba(193,16,7,0.20)] bg-[rgba(193,16,7,0.06)] px-4 py-3 text-sm text-[#C11007]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                <p>
                  Email data could not be loaded.
                  Check the dashboard API and n8n
                  workflow connection.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Emails"
            value={emails.length}
            description="All processed email records"
            icon={Mail}
            isLoading={isLoading}
            accent="neutral"
          />

          <SummaryCard
            title="High Priority"
            value={highPriorityCount}
            description="Urgent and high-priority emails"
            icon={AlertTriangle}
            isLoading={isLoading}
            accent="warning"
          />

          <SummaryCard
            title="Reply Required"
            value={replyRequiredCount}
            description="Emails waiting for a response"
            icon={Reply}
            isLoading={isLoading}
            accent="danger"
          />

          <SummaryCard
            title="Drafts Created"
            value={draftCreatedCount}
            description="AI-generated email drafts"
            icon={FileCheck2}
            isLoading={isLoading}
            accent="success"
          />
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/25 text-muted-foreground">
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-card-foreground">
                Search and Filters
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Find emails by sender, subject,
                category, priority or status.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.35fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(155px,1fr)]">
            <div className="relative md:col-span-2 xl:col-span-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search emails..."
                aria-label="Search emails"
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground hover:border-ring/40 focus:border-ring focus:ring-4 focus:ring-ring/10"
              />
            </div>

            <FilterSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              label="Categories"
              options={categories}
            />

            <FilterSelect
              value={priorityFilter}
              onChange={setPriorityFilter}
              label="Priorities"
              options={priorities}
            />

            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              label="Statuses"
              options={statuses}
            />

            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(
                  event.target
                    .value as SortOption
                )
              }
              aria-label="Sort emails"
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all duration-200 hover:border-ring/40 focus:border-ring focus:ring-4 focus:ring-ring/10"
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

          <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {filteredEmails.length}
              </span>{" "}
              matching emails
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted/40"
              >
                <X className="h-4 w-4" />
                Reset filters
              </button>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border/70 px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">
                All Emails
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Review processed email records and
                workflow results.
              </p>
            </div>

            <p className="shrink-0 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {startEmailNumber}
              </span>
              {" – "}
              <span className="font-semibold text-foreground">
                {endEmailNumber}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {filteredEmails.length}
              </span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse">
              <thead>
                <tr className="border-b border-border/70 bg-muted/15 text-left">
                  <TableHeading label="Sender" />
                  <TableHeading label="Subject" />
                  <TableHeading label="Category" />
                  <TableHeading label="Priority" />
                  <TableHeading label="Status" />
                  <TableHeading label="Workflow" />
                  <TableHeading label="Received" />
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <TableSkeleton />
                ) : paginatedEmails.length >
                  0 ? (
                  paginatedEmails.map(
                    (email) => {
                      const initials =
                        getInitials(
                          email.senderName
                        );

                      return (
                        <tr
                          key={email.id}
                          className="group border-b border-border/55 transition-all duration-150 last:border-b-0 hover:bg-muted/20"
                        >
                          <td className="px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-xs font-semibold text-muted-foreground transition-transform duration-200 group-hover:scale-105">
                                {initials}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[190px] truncate text-sm font-semibold text-foreground">
                                  {
                                    email.senderName
                                  }
                                </p>

                                <p className="mt-0.5 max-w-[190px] truncate text-xs text-muted-foreground">
                                  {
                                    email.senderEmail
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="max-w-[340px] px-5 py-4">
                            <p className="truncate text-sm font-medium text-foreground">
                              {email.subject}
                            </p>

                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {email.summary}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex max-w-[130px] truncate rounded-lg border border-border/70 bg-muted/15 px-2.5 py-1 text-xs font-medium text-muted-foreground">
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
                            {email.receivedAt}
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-20 text-center"
                    >
                      <div className="mx-auto max-w-sm">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/20 text-muted-foreground">
                          <Mail className="h-5 w-5" />
                        </div>

                        <p className="mt-4 font-semibold text-foreground">
                          {emails.length === 0
                            ? "No emails available"
                            : "No matching emails found"}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {emails.length === 0
                            ? "Emails will appear after the n8n dashboard workflow returns data."
                            : "Try changing the search text or selected filters."}
                        </p>

                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={resetFilters}
                            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-muted/40"
                          >
                            Reset filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredEmails.length >
            EMAILS_PER_PAGE && (
            <div className="flex flex-col gap-4 border-t border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
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

                {visiblePages[0] > 1 && (
                  <>
                    <PageButton
                      page={1}
                      currentPage={
                        safeCurrentPage
                      }
                      onClick={
                        setCurrentPage
                      }
                    />

                    {visiblePages[0] > 2 && (
                      <span className="px-1 text-sm text-muted-foreground">
                        …
                      </span>
                    )}
                  </>
                )}

                {visiblePages.map((page) => (
                  <PageButton
                    key={page}
                    page={page}
                    currentPage={
                      safeCurrentPage
                    }
                    onClick={setCurrentPage}
                  />
                ))}

                {visiblePages[
                  visiblePages.length - 1
                ] < totalPages && (
                  <>
                    {visiblePages[
                      visiblePages.length - 1
                    ] <
                      totalPages - 1 && (
                      <span className="px-1 text-sm text-muted-foreground">
                        …
                      </span>
                    )}

                    <PageButton
                      page={totalPages}
                      currentPage={
                        safeCurrentPage
                      }
                      onClick={
                        setCurrentPage
                      }
                    />
                  </>
                )}

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

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
  accent,
}: SummaryCardProps) {
  const style = SUMMARY_STYLES[accent];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          {isLoading ? (
            <div className="mt-3 h-9 w-16 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="mt-2 text-3xl font-semibold tracking-tight text-card-foreground">
              {value.toLocaleString()}
            </p>
          )}
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105"
          style={{
            color: style.color,
            backgroundColor: style.background,
            borderColor: style.border,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

interface FilterSelectProps {
  value: string;
  label: string;
  options: string[];
  onChange: (value: string) => void;
}

function FilterSelect({
  value,
  label,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      aria-label={`Filter by ${label}`}
      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all duration-200 hover:border-ring/40 focus:border-ring focus:ring-4 focus:ring-ring/10"
    >
      <option value="all">
        All {label}
      </option>

      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  );
}

function TableHeading({
  label,
}: {
  label: string;
}) {
  return (
    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {label}
    </th>
  );
}

function WorkflowStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus =
    status.trim().toLowerCase();

  let style: WorkflowStyle;

  if (
    normalizedStatus.includes("failed") ||
    normalizedStatus.includes("error")
  ) {
    style = {
      text: "#C11007",
      background:
        "rgba(193, 16, 7, 0.07)",
      border:
        "rgba(193, 16, 7, 0.20)",
      dot: "#C11007",
    };
  } else if (
    normalizedStatus.includes("sent") ||
    normalizedStatus.includes("complete") ||
    normalizedStatus.includes("replied")
  ) {
    style = {
      text: "#2F8F46",
      background:
        "rgba(47, 143, 70, 0.08)",
      border:
        "rgba(47, 143, 70, 0.20)",
      dot: "#2F8F46",
    };
  } else if (
    normalizedStatus.includes("draft")
  ) {
    style = {
      text: "#3E63A8",
      background:
        "rgba(62, 99, 168, 0.08)",
      border:
        "rgba(62, 99, 168, 0.20)",
      dot: "#3E63A8",
    };
  } else if (
    normalizedStatus.includes("blocked") ||
    normalizedStatus.includes("manual") ||
    normalizedStatus.includes("sensitive")
  ) {
    style = {
      text: "#A67416",
      background:
        "rgba(166, 116, 22, 0.08)",
      border:
        "rgba(166, 116, 22, 0.20)",
      dot: "#A67416",
    };
  } else {
    style = {
      text: "#526173",
      background:
        "rgba(82, 97, 115, 0.08)",
      border:
        "rgba(82, 97, 115, 0.20)",
      dot: "#526173",
    };
  }

  return (
    <span
      className="inline-flex max-w-[165px] items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{
        color: style.text,
        backgroundColor:
          style.background,
        borderColor: style.border,
      }}
      title={status || "Pending"}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{
          backgroundColor: style.dot,
        }}
      />

      <span className="truncate">
        {status || "Pending"}
      </span>
    </span>
  );
}

interface PageButtonProps {
  page: number;
  currentPage: number;
  onClick: (page: number) => void;
}

function PageButton({
  page,
  currentPage,
  onClick,
}: PageButtonProps) {
  const isActive =
    page === currentPage;

  return (
    <button
      type="button"
      onClick={() => onClick(page)}
      aria-label={`Go to page ${page}`}
      aria-current={
        isActive ? "page" : undefined
      }
      className={
        isActive
          ? "inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
          : "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-muted/40"
      }
    >
      {page}
    </button>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({
        length: 10,
      }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className="border-b border-border/55 last:border-b-0"
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

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
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
  receivedAtIso: string
) {
  const timestamp = new Date(
    receivedAtIso
  ).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}