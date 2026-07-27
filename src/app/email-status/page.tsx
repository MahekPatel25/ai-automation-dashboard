"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileEdit,
  MailCheck,
  MailQuestion,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";

import {
  EmailPriorityBadge,
  EmailStatusBadge,
} from "@/components/dashboard/email-badges";
import {
  createEmailItems,
  type EmailItem,
} from "@/components/dashboard/email-data";
import {
  EmailDetailsDrawer,
  type SendDraftPayload,
} from "@/components/dashboard/email-details-drawer";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SuccessPopup } from "@/components/ui/success-popup";
import { useDashboardData } from "@/hooks/use-dashboard-data";

type StatusTab =
  | "drafts"
  | "pending"
  | "sent"
  | "failed";

interface SendEmailApiResponse {
  success?: boolean;
  message?: string;
  sentMessageId?: string;
}

const EMAILS_PER_PAGE = 10;

export default function EmailStatusPage() {
  const {
    data,
    isLoading,
    error,
    refresh,
  } = useDashboardData();

  const [activeTab, setActiveTab] =
    useState<StatusTab>("drafts");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedEmail, setSelectedEmail] =
    useState<EmailItem | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] =
    useState(false);

  const [
    showSuccessPopup,
    setShowSuccessPopup,
  ] = useState(false);

  const emails = useMemo(() => {
    return createEmailItems(data?.emails);
  }, [data?.emails]);

  const draftEmails = useMemo(() => {
    return emails.filter((email) => {
      const workflowStatus =
        email.workflowStatus.toLowerCase();

      return (
        email.draftCreated ||
        workflowStatus.includes("draft")
      );
    });
  }, [emails]);

  const pendingEmails = useMemo(() => {
    return emails.filter((email) => {
      const workflowStatus =
        email.workflowStatus.toLowerCase();

      const emailStatus =
        email.status.toLowerCase();

      return (
        email.replyRequired ||
        emailStatus.includes("pending") ||
        workflowStatus.includes("pending") ||
        workflowStatus.includes("awaiting")
      );
    });
  }, [emails]);

  const sentEmails = useMemo(() => {
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

  const awaitingApprovalEmails =
    useMemo(() => {
      return emails.filter((email) => {
        const workflowStatus =
          email.workflowStatus.toLowerCase();

        return (
          workflowStatus.includes("approval") ||
          workflowStatus.includes("review")
        );
      });
    }, [emails]);

  const today = useMemo(() => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }, []);

  const draftsToday = useMemo(() => {
    return draftEmails.filter((email) =>
      email.receivedAt.includes(today)
    ).length;
  }, [draftEmails, today]);

  const sentToday = useMemo(() => {
    return sentEmails.filter((email) =>
      email.receivedAt.includes(today)
    ).length;
  }, [sentEmails, today]);

  const activeEmails = useMemo(() => {
    if (activeTab === "drafts") {
      return draftEmails;
    }

    if (activeTab === "pending") {
      return pendingEmails;
    }

    if (activeTab === "sent") {
      return sentEmails;
    }

    return failedEmails;
  }, [
    activeTab,
    draftEmails,
    pendingEmails,
    sentEmails,
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

  const isDraftsTab =
    activeTab === "drafts";

  function changeTab(tab: StatusTab) {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
    setSelectedEmail(null);
    setIsDrawerOpen(false);
  }

  function openEmail(email: EmailItem) {
    if (!isDraftsTab) {
      return;
    }

    setSelectedEmail(email);
    setIsDrawerOpen(true);
  }

  function closeEmailDrawer() {
    setIsDrawerOpen(false);
  }

  function closeSuccessPopup() {
    setShowSuccessPopup(false);
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

  async function handleSendDraft(
    payload: SendDraftPayload
  ): Promise<void> {
    let response: Response;

    try {
      response = await fetch(
        "/api/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
    } catch {
      throw new Error(
        "Send Email API se connection nahi ho paya. Next.js server aur n8n check karo."
      );
    }

    let result: SendEmailApiResponse;

    try {
      result =
        (await response.json()) as SendEmailApiResponse;
    } catch {
      throw new Error(
        "Send Email API ne valid response nahi diya."
      );
    }

    if (
      !response.ok ||
      result.success !== true
    ) {
      throw new Error(
        result.message ||
          "Email send nahi ho paya."
      );
    }

    setShowSuccessPopup(true);

    void refresh();
  }

  const statusCards = [
    {
      title: "Total Drafts",
      value: draftEmails.length,
      description:
        "Emails with a generated draft",
      icon: FileEdit,
    },
    {
      title: "Pending Replies",
      value: pendingEmails.length,
      description:
        "Emails still requiring a reply",
      icon: Clock3,
    },
    {
      title: "Sent Emails",
      value: sentEmails.length,
      description:
        "Replies successfully sent",
      icon: MailCheck,
    },
    {
      title: "Failed Emails",
      value: failedEmails.length,
      description:
        "Emails with workflow errors",
      icon: AlertCircle,
    },
    {
      title: "Reply Required",
      value: emails.filter(
        (email) => email.replyRequired
      ).length,
      description:
        "Emails marked by AI for reply",
      icon: MailQuestion,
    },
    {
      title: "Awaiting Approval",
      value: awaitingApprovalEmails.length,
      description:
        "Drafts waiting for client review",
      icon: CheckCircle2,
    },
    {
      title: "Drafts Today",
      value: draftsToday,
      description:
        "Drafts generated today",
      icon: FileEdit,
    },
    {
      title: "Sent Today",
      value: sentToday,
      description:
        "Replies sent today",
      icon: Send,
    },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">
                Email Workflow Management
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Email Status
              </h1>

              <p className="mt-3 max-w-3xl text-muted-foreground">
                Track generated drafts, pending
                replies, sent emails and failed
                automation actions from one place.
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
              Dashboard API could not be
              loaded. Please check the API
              connection and try again.
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Status Overview
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Live summary of reply and draft
              activity
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statusCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>

                      {isLoading ? (
                        <div className="mt-3 h-9 w-16 animate-pulse rounded-md bg-muted" />
                      ) : (
                        <p className="mt-2 text-3xl font-bold tracking-tight">
                          {card.value}
                        </p>
                      )}
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/70 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Email Workflow Records
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {isDraftsTab
                    ? "Click a draft email to view, edit and send its generated reply."
                    : "Review email records for the selected workflow status."}
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
                  placeholder="Search emails..."
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <StatusTabButton
                label="Drafts"
                count={draftEmails.length}
                isActive={
                  activeTab === "drafts"
                }
                onClick={() =>
                  changeTab("drafts")
                }
              />

              <StatusTabButton
                label="Pending"
                count={pendingEmails.length}
                isActive={
                  activeTab === "pending"
                }
                onClick={() =>
                  changeTab("pending")
                }
              />

              <StatusTabButton
                label="Sent"
                count={sentEmails.length}
                isActive={
                  activeTab === "sent"
                }
                onClick={() =>
                  changeTab("sent")
                }
              />

              <StatusTabButton
                label="Failed"
                count={failedEmails.length}
                isActive={
                  activeTab === "failed"
                }
                onClick={() =>
                  changeTab("failed")
                }
              />
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
            <table className="w-full min-w-[1050px] border-collapse">
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
                    Email Status
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
                    length: 6,
                  }).map((_, index) => (
                    <tr
                      key={index}
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
                        onClick={
                          isDraftsTab
                            ? () =>
                                openEmail(
                                  email
                                )
                            : undefined
                        }
                        aria-disabled={
                          !isDraftsTab
                        }
                        className={
                          isDraftsTab
                            ? "cursor-pointer border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/30"
                            : "cursor-default border-b border-border/60 last:border-b-0"
                        }
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
                      <p className="font-semibold">
                        No emails found
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        There are currently no
                        emails available in this
                        status.
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={
                    goToPreviousPage
                  }
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
                  const page =
                    index + 1;

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

      <EmailDetailsDrawer
        email={selectedEmail}
        isOpen={
          isDraftsTab &&
          isDrawerOpen
        }
        onClose={
          closeEmailDrawer
        }
        onSendDraft={
          handleSendDraft
        }
      />

      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={closeSuccessPopup}
        title="Email Sent"
        description="Your message has been delivered successfully."
        duration={4500}
      />
    </DashboardShell>
  );
}

interface StatusTabButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function StatusTabButton({
  label,
  count,
  isActive,
  onClick,
}: StatusTabButtonProps) {
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
        {status}
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
        {status}
      </span>
    );
  }

  if (
    normalizedStatus.includes("draft")
  ) {
    return (
      <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
      {status || "Pending"}
    </span>
  );
}