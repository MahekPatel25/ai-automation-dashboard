"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  EmailPriorityBadge,
  EmailStatusBadge,
} from "./email-badges";

import type {
  EmailItem,
  EmailPriority,
  EmailStatus,
} from "./email-data";

type CategoryFilter = "All" | string;

type PriorityFilter =
  | "All"
  | EmailPriority;

type StatusFilter =
  | "All"
  | EmailStatus;

interface EmailTableProps {
  emails: EmailItem[];
  isLoading?: boolean;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

interface PageButtonProps {
  page: number;
  currentPage: number;
  onClick: (page: number) => void;
}

const EMAILS_PER_PAGE = 10;

export function EmailTable({
  emails,
  isLoading = false,
}: EmailTableProps) {
  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] =
    useState<CategoryFilter>("All");

  const [
    priorityFilter,
    setPriorityFilter,
  ] =
    useState<PriorityFilter>("All");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");

  const [currentPage, setCurrentPage] =
    useState(1);

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
    const availablePriorities = new Set(
      emails.map((email) => email.priority)
    );

    const priorityOrder: EmailPriority[] = [
      "Urgent",
      "High",
      "Medium",
      "Low",
    ];

    return priorityOrder.filter(
      (priority) =>
        availablePriorities.has(priority)
    );
  }, [emails]);

  const statuses = useMemo(() => {
    const availableStatuses = new Set(
      emails.map((email) => email.status)
    );

    const statusOrder: EmailStatus[] = [
      "Pending Reply",
      "Processed",
      "Reviewed",
      "Spam",
    ];

    return statusOrder.filter((status) =>
      availableStatuses.has(status)
    );
  }, [emails]);

  const filteredEmails = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return emails.filter((email) => {
      const searchableValues = [
        email.senderName,
        email.senderEmail,
        email.subject,
        email.summary,
        email.category,
        email.priority,
        email.status,
        email.workflowStatus,
        email.attachmentFile,
        email.meetingDate,
      ];

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableValues.some((value) =>
          String(value)
            .toLowerCase()
            .includes(normalizedSearch)
        );

      const matchesCategory =
        categoryFilter === "All" ||
        email.category === categoryFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        email.priority === priorityFilter;

      const matchesStatus =
        statusFilter === "All" ||
        email.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPriority &&
        matchesStatus
      );
    });
  }, [
    emails,
    searchQuery,
    categoryFilter,
    priorityFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredEmails.length /
        EMAILS_PER_PAGE
    )
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    categoryFilter,
    priorityFilter,
    statusFilter,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedEmails = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      EMAILS_PER_PAGE;

    return filteredEmails.slice(
      startIndex,
      startIndex + EMAILS_PER_PAGE
    );
  }, [filteredEmails, currentPage]);

  const startEmailNumber =
    filteredEmails.length === 0
      ? 0
      : (currentPage - 1) *
          EMAILS_PER_PAGE +
        1;

  const endEmailNumber = Math.min(
    currentPage * EMAILS_PER_PAGE,
    filteredEmails.length
  );

  const visiblePageNumbers =
    useMemo(() => {
      const pages: number[] = [];

      const startPage = Math.max(
        1,
        currentPage - 2
      );

      const endPage = Math.min(
        totalPages,
        currentPage + 2
      );

      for (
        let page = startPage;
        page <= endPage;
        page += 1
      ) {
        pages.push(page);
      }

      return pages;
    }, [currentPage, totalPages]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    categoryFilter !== "All" ||
    priorityFilter !== "All" ||
    statusFilter !== "All";

  function clearFilters() {
    setSearchQuery("");
    setCategoryFilter("All");
    setPriorityFilter("All");
    setStatusFilter("All");
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

  if (isLoading) {
    return <EmailTableSkeleton />;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="border-b border-border/70 px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/25 text-muted-foreground">
              <Mail className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-card-foreground">
                Recent Emails
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Latest messages processed by your
                AI email workflow.
              </p>
            </div>
          </div>

          <div className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/15 px-4 text-sm font-medium text-muted-foreground">
            {emails.length.toLocaleString()}{" "}
            total emails
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_170px_170px_180px_auto]">
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
              placeholder="Search sender, subject or summary..."
              aria-label="Search emails"
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground hover:border-ring/40 focus:border-ring focus:ring-4 focus:ring-ring/10"
            />
          </div>

          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories}
          />

          <FilterSelect
            label="Priority"
            value={priorityFilter}
            onChange={(value) =>
              setPriorityFilter(
                value as PriorityFilter
              )
            }
            options={priorities}
          />

          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={(value) =>
              setStatusFilter(
                value as StatusFilter
              )
            }
            options={statuses}
          />

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted/40"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          ) : (
            <div className="hidden h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 text-sm text-muted-foreground xl:flex">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
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
            </span>{" "}
            emails
          </p>

          {filteredEmails.length >
            EMAILS_PER_PAGE && (
            <p className="text-xs text-muted-foreground">
              Page {currentPage} of{" "}
              {totalPages}
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1020px] border-collapse">
          <thead>
            <tr className="border-b border-border/70 bg-muted/15 text-left">
              <TableHeading label="Sender" />
              <TableHeading label="Subject" />
              <TableHeading label="Category" />
              <TableHeading label="Priority" />
              <TableHeading label="Status" />
              <TableHeading label="Received" />
            </tr>
          </thead>

          <tbody>
            {paginatedEmails.length > 0 ? (
              paginatedEmails.map((email) => {
                const initials =
                  getInitials(
                    email.senderName
                  );

                return (
                  <tr
                    key={email.id}
                    className="group border-b border-border/55 transition-colors duration-150 last:border-b-0 hover:bg-muted/20"
                  >
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-xs font-semibold text-muted-foreground transition-transform duration-200 group-hover:scale-105">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[185px] truncate text-sm font-semibold text-foreground">
                            {email.senderName}
                          </p>

                          <p className="mt-0.5 max-w-[185px] truncate text-xs text-muted-foreground">
                            {email.senderEmail}
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
                        status={email.status}
                      />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                      {email.receivedAt}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
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
                        ? "Emails will appear after the n8n workflow returns dashboard data."
                        : "Try changing your search text or selected filters."}
                    </p>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-muted/40"
                      >
                        Clear filters
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
              {currentPage}
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
              disabled={currentPage === 1}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {visiblePageNumbers[0] > 1 && (
              <>
                <PageButton
                  page={1}
                  currentPage={currentPage}
                  onClick={setCurrentPage}
                />

                {visiblePageNumbers[0] >
                  2 && (
                  <span className="px-1 text-sm text-muted-foreground">
                    …
                  </span>
                )}
              </>
            )}

            {visiblePageNumbers.map(
              (page) => (
                <PageButton
                  key={page}
                  page={page}
                  currentPage={
                    currentPage
                  }
                  onClick={
                    setCurrentPage
                  }
                />
              )
            )}

            {visiblePageNumbers[
              visiblePageNumbers.length - 1
            ] < totalPages && (
              <>
                {visiblePageNumbers[
                  visiblePageNumbers.length - 1
                ] <
                  totalPages - 1 && (
                  <span className="px-1 text-sm text-muted-foreground">
                    …
                  </span>
                )}

                <PageButton
                  page={totalPages}
                  currentPage={currentPage}
                  onClick={setCurrentPage}
                />
              </>
            )}

            <button
              type="button"
              onClick={goToNextPage}
              disabled={
                currentPage === totalPages
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
  );
}

function FilterSelect({
  label,
  value,
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
      <option value="All">
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

function EmailTableSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="border-b border-border/70 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />

            <div className="mt-3 h-4 w-72 animate-pulse rounded-md bg-muted" />
          </div>

          <div className="h-10 w-28 animate-pulse rounded-xl bg-muted" />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="h-11 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>

      <div>
        {Array.from({
          length: 10,
        }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-6 gap-4 border-b border-border/60 px-5 py-5 last:border-b-0"
          >
            {Array.from({
              length: 6,
            }).map(
              (__, columnIndex) => (
                <div
                  key={columnIndex}
                  className="h-5 animate-pulse rounded-md bg-muted"
                />
              )
            )}
          </div>
        ))}
      </div>
    </section>
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