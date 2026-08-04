"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileEdit,
  Mail,
  MailCheck,
  MailQuestion,
  RefreshCw,
  Search,
  Send,
  type LucideIcon,
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

type CardAccent =
  | "blue"
  | "amber"
  | "green"
  | "red"
  | "slate";

interface SendEmailApiResponse {
  success?: boolean;
  message?: string;
  sentMessageId?: string;
}

interface StatusCardItem {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  accent: CardAccent;
}

interface WorkflowStyle {
  text: string;
  background: string;
  border: string;
  dot: string;
}

const EMAILS_PER_PAGE = 10;

const CARD_STYLES: Record<
  CardAccent,
  {
    color: string;
    background: string;
    border: string;
  }
> = {
  blue: {
    color: "#3E63A8",
    background: "rgba(62, 99, 168, 0.08)",
    border: "rgba(62, 99, 168, 0.20)",
  },

  amber: {
    color: "#A67416",
    background: "rgba(166, 116, 22, 0.08)",
    border: "rgba(166, 116, 22, 0.20)",
  },

  green: {
    color: "#2F8F46",
    background: "rgba(47, 143, 70, 0.08)",
    border: "rgba(47, 143, 70, 0.20)",
  },

  red: {
    color: "#C11007",
    background: "rgba(193, 16, 7, 0.07)",
    border: "rgba(193, 16, 7, 0.21)",
  },

  slate: {
    color: "#526173",
    background: "rgba(82, 97, 115, 0.08)",
    border: "rgba(82, 97, 115, 0.20)",
  },
};

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

  const replyRequiredCount = useMemo(() => {
    return emails.filter(
      (email) => email.replyRequired
    ).length;
  }, [emails]);

  const todayKey = useMemo(() => {
    const now = new Date();

    return [
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ].join("-");
  }, []);

  const draftsToday = useMemo(() => {
    return draftEmails.filter((email) => {
      return (
        getDateKey(email.receivedAtIso) ===
        todayKey
      );
    }).length;
  }, [draftEmails, todayKey]);

  const sentToday = useMemo(() => {
    return sentEmails.filter((email) => {
      return (
        getDateKey(email.receivedAtIso) ===
        todayKey
      );
    }).length;
  }, [sentEmails, todayKey]);

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
  }, [searchQuery, activeTab]);

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
  }, [safeCurrentPage, totalPages]);

  const isDraftsTab =
    activeTab === "drafts";

  const statusCards: StatusCardItem[] = [
    {
      title: "Total Drafts",
      value: draftEmails.length,
      description:
        "Emails with generated AI drafts",
      icon: FileEdit,
      accent: "blue",
    },
    {
      title: "Pending Replies",
      value: pendingEmails.length,
      description:
        "Emails still waiting for a reply",
      icon: Clock3,
      accent: "amber",
    },
    {
      title: "Sent Emails",
      value: sentEmails.length,
      description:
        "Replies successfully delivered",
      icon: MailCheck,
      accent: "green",
    },
    {
      title: "Failed Emails",
      value: failedEmails.length,
      description:
        "Emails with workflow errors",
      icon: AlertCircle,
      accent: "red",
    },
    {
      title: "Reply Required",
      value: replyRequiredCount,
      description:
        "Emails marked by AI for response",
      icon: MailQuestion,
      accent: "amber",
    },
    {
      title: "Awaiting Approval",
      value: awaitingApprovalEmails.length,
      description:
        "Drafts waiting for manual review",
      icon: CheckCircle2,
      accent: "slate",
    },
    {
      title: "Drafts Today",
      value: draftsToday,
      description:
        "New drafts generated today",
      icon: FileEdit,
      accent: "blue",
    },
    {
      title: "Sent Today",
      value: sentToday,
      description:
        "Replies delivered today",
      icon: Send,
      accent: "green",
    },
  ];

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

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground">
                <MailCheck className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-card-foreground md:text-3xl">
                  Email Status
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Track generated drafts, pending
                  replies, sent emails and failed
                  workflow actions.
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
                  Dashboard API could not be loaded.
                  Check the API and n8n workflow
                  connection.
                </p>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Status Overview
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Live summary of email reply and draft
              activity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statusCards.map((card) => (
              <StatusCard
                key={card.title}
                item={card}
                isLoading={isLoading}
              />
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/70 px-5 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Email Workflow Records
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {isDraftsTab
                    ? "Open a draft to review, edit and send its generated reply."
                    : "Review records for the selected workflow status."}
                </p>
              </div>

              <div className="relative w-full xl:max-w-sm">
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
                  aria-label="Search workflow emails"
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground hover:border-ring/40 focus:border-ring focus:ring-4 focus:ring-ring/10"
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
                accent="blue"
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
                accent="amber"
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
                accent="green"
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
                accent="red"
                onClick={() =>
                  changeTab("failed")
                }
              />
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

              {isDraftsTab && (
                <p className="text-xs text-muted-foreground">
                  Click any row to open its draft
                </p>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse">
              <thead>
                <tr className="border-b border-border/70 bg-muted/15 text-left">
                  <TableHeading label="Sender" />
                  <TableHeading label="Subject" />
                  <TableHeading label="Category" />
                  <TableHeading label="Priority" />
                  <TableHeading label="Email Status" />
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
                    (email) => (
                      <tr
                        key={email.id}
                        onClick={
                          isDraftsTab
                            ? () =>
                                openEmail(email)
                            : undefined
                        }
                        className={
                          isDraftsTab
                            ? "group cursor-pointer border-b border-border/55 transition-colors duration-150 last:border-b-0 hover:bg-muted/20"
                            : "group cursor-default border-b border-border/55 last:border-b-0"
                        }
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-xs font-semibold text-muted-foreground transition-transform duration-200 group-hover:scale-105">
                              {getInitials(
                                email.senderName
                              )}
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

                        <td className="max-w-[320px] px-5 py-4">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {email.subject}
                              </p>

                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {email.summary}
                              </p>
                            </div>

                            {isDraftsTab && (
                              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            )}
                          </div>
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
                    )
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
                          No emails found
                        </p>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          There are currently no
                          matching emails available
                          in this status.
                        </p>
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
                      onClick={setCurrentPage}
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
                      onClick={setCurrentPage}
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

      <EmailDetailsDrawer
        email={selectedEmail}
        isOpen={
          isDraftsTab &&
          isDrawerOpen
        }
        onClose={closeEmailDrawer}
        onSendDraft={handleSendDraft}
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

function StatusCard({
  item,
  isLoading,
}: {
  item: StatusCardItem;
  isLoading: boolean;
}) {
  const Icon = item.icon;
  const style =
    CARD_STYLES[item.accent];

  return (
    <article className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {item.title}
          </p>

          {isLoading ? (
            <div className="mt-3 h-9 w-16 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="mt-2 text-3xl font-semibold tracking-tight text-card-foreground">
              {item.value.toLocaleString()}
            </p>
          )}
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105"
          style={{
            color: style.color,
            backgroundColor:
              style.background,
            borderColor: style.border,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        {item.description}
      </p>
    </article>
  );
}

function StatusTabButton({
  label,
  count,
  isActive,
  accent,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  accent: CardAccent;
  onClick: () => void;
}) {
  const style = CARD_STYLES[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
      style={
        isActive
          ? {
              color: style.color,
              backgroundColor:
                style.background,
              borderColor: style.border,
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
            ? `${style.color}14`
            : "var(--muted)",
        }}
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
        "rgba(193, 16, 7, 0.21)",
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
    normalizedStatus.includes("sensitive") ||
    normalizedStatus.includes("manual") ||
    normalizedStatus.includes("approval") ||
    normalizedStatus.includes("review")
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
      className="inline-flex max-w-[175px] items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
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
}: {
  page: number;
  currentPage: number;
  onClick: (page: number) => void;
}) {
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
        length: 8,
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

function getDateKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ].join("-");
}