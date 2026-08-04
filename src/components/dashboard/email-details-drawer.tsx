"use client";

import {
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  LoaderCircle,
  Mail,
  Paperclip,
  Pencil,
  Reply,
  Save,
  Send,
  Tag,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import {
  EmailPriorityBadge,
  EmailStatusBadge,
} from "./email-badges";
import type { EmailItem } from "./email-data";

type ModalTab =
  | "preview"
  | "original"
  | "analysis";

export interface SendDraftPayload {
  emailId: string;
  rowNumber: number;

  messageId: string;
  threadId: string;

  clientEmail: string;
  draftId: string;

  to: string;
  subject: string;
  body: string;
  html: string;
}

interface EmailDetailsDrawerProps {
  email: EmailItem | null;
  isOpen: boolean;
  onClose: () => void;

  onSendDraft?: (
    payload: SendDraftPayload
  ) => Promise<void> | void;
}

export function EmailDetailsDrawer({
  email,
  isOpen,
  onClose,
  onSendDraft,
}: EmailDetailsDrawerProps) {
  const [activeTab, setActiveTab] =
    useState<ModalTab>("preview");

  const [isEditing, setIsEditing] =
    useState(false);

  const [draftTo, setDraftTo] =
    useState("");

  const [draftSubject, setDraftSubject] =
    useState("");

  const [draftBody, setDraftBody] =
    useState("");

  const [isSending, setIsSending] =
    useState(false);

  const [sendError, setSendError] =
    useState("");

  useEffect(() => {
    if (!email) {
      return;
    }

    setActiveTab("preview");
    setIsEditing(false);

    setDraftTo(
      cleanDraftValue(email.draftTo) ||
        cleanDraftValue(email.senderEmail)
    );

    setDraftSubject(
      cleanDraftValue(email.draftSubject)
    );

    setDraftBody(
      cleanDraftValue(email.draftBody)
    );

    setIsSending(false);
    setSendError("");
  }, [email]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  const previewHtml = useMemo(() => {
    if (!email) {
      return "";
    }

    const savedHtml = cleanDraftValue(
      email.draftHtml
    );

    if (!isEditing && savedHtml) {
      return createPreviewDocument(
        savedHtml,
        true
      );
    }

    return createPreviewDocument(
      draftBody,
      false
    );
  }, [
    email,
    draftBody,
    isEditing,
  ]);

  if (!email) {
    return null;
  }

  const confidenceText =
    email.confidence > 0
      ? `${formatConfidence(
          email.confidence
        )}%`
      : "Not available";

  const hasDraft =
    Boolean(cleanDraftValue(email.draftId)) ||
    Boolean(draftTo) ||
    Boolean(draftSubject) ||
    Boolean(draftBody);

  const canSend =
    hasDraft &&
    email.rowNumber > 0 &&
    Boolean(draftTo.trim()) &&
    Boolean(draftSubject.trim()) &&
    Boolean(draftBody.trim()) &&
    !isSending;

  function handleEditToggle() {
    setSendError("");
    setIsEditing((current) => !current);
  }

  async function handleSendDraft() {
    if (!canSend) {
      return;
    }

    if (!onSendDraft) {
      setSendError(
        "Direct send API modal ke saath connect nahi hai."
      );

      return;
    }

    if (email.rowNumber <= 0) {
      setSendError(
        "Google Sheet row number available nahi hai. Dashboard data refresh karo."
      );

      return;
    }

    setIsSending(true);
    setSendError("");

    try {
      await onSendDraft({
        emailId: email.id,
        rowNumber: email.rowNumber,

        messageId: email.messageId,
        threadId: email.threadId,

        clientEmail: email.clientEmail,
        draftId: email.draftId,

        to: draftTo.trim(),
        subject: draftSubject.trim(),
        body: draftBody,

        html:
          cleanDraftValue(
            email.draftHtml
          ) ||
          createBasicEmailHtml(
            draftBody
          ),
      });

      setIsEditing(false);
      onClose();
    } catch (error) {
      setSendError(
        error instanceof Error
          ? error.message
          : "Draft send nahi ho paya. Please dobara try karo."
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close email modal"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-[#0C0A09]/55 backdrop-blur-sm transition-opacity duration-200",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-labelledby="email-modal-title"
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-2 transition-all duration-200 sm:p-5",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        <div
          className={cn(
            "relative flex h-[calc(100dvh-16px)] max-h-[920px] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_30px_90px_rgba(12,10,9,0.28)] transition-all duration-200",
            isOpen
              ? "translate-y-0 scale-100"
              : "translate-y-3 scale-[0.98]"
          )}
        >
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground">
                <Mail className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Email Details
                  </p>

                  {email.draftCreated && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(47,143,70,0.20)] bg-[rgba(47,143,70,0.08)] px-2.5 py-1 text-xs font-semibold text-[#2F8F46]">
                      <CheckCircle2 className="h-3.5 w-3.5" />

                      Draft ready
                    </span>
                  )}
                </div>

                <h2
                  id="email-modal-title"
                  className="mt-1.5 line-clamp-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
                >
                  {email.subject}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span>
                    From{" "}
                    <strong className="font-semibold text-foreground">
                      {email.senderName}
                    </strong>
                  </span>

                  <span className="hidden sm:inline">
                    •
                  </span>

                  <span>
                    {email.receivedAtFull}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close email details"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all duration-200 hover:bg-muted/40 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-border bg-muted/10 px-4 py-3 sm:px-6">
            <TabButton
              label="Preview"
              icon={Eye}
              active={activeTab === "preview"}
              onClick={() =>
                setActiveTab("preview")
              }
            />

            <TabButton
              label="Original Email"
              icon={Mail}
              active={activeTab === "original"}
              onClick={() =>
                setActiveTab("original")
              }
            />

            <TabButton
              label="AI Analysis"
              icon={Bot}
              active={activeTab === "analysis"}
              onClick={() =>
                setActiveTab("analysis")
              }
            />
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto bg-muted/5">
            {activeTab === "preview" && (
              <PreviewTab
                email={email}
                draftTo={draftTo}
                draftSubject={draftSubject}
                draftBody={draftBody}
                previewHtml={previewHtml}
                isEditing={isEditing}
                setDraftTo={setDraftTo}
                setDraftSubject={
                  setDraftSubject
                }
                setDraftBody={
                  setDraftBody
                }
              />
            )}

            {activeTab === "original" && (
              <OriginalEmailTab
                email={email}
              />
            )}

            {activeTab === "analysis" && (
              <AIAnalysisTab
                email={email}
                confidenceText={
                  confidenceText
                }
              />
            )}
          </main>

          <footer className="shrink-0 border-t border-border bg-background/95 px-5 py-4 backdrop-blur sm:px-6">
            {sendError && (
              <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-[rgba(193,16,7,0.22)] bg-[rgba(193,16,7,0.07)] px-4 py-3 text-sm text-[#C11007]">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />

                <p>{sendError}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-xs text-muted-foreground">
                <p>
                  Google Sheet Row:{" "}
                  <span className="font-mono font-medium text-foreground">
                    {email.rowNumber > 0
                      ? email.rowNumber
                      : "Not available"}
                  </span>
                </p>

                {email.draftId && (
                  <p className="mt-1 max-w-md truncate">
                    Draft ID:{" "}
                    <span className="font-mono">
                      {email.draftId}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                {activeTab === "preview" && (
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    disabled={isSending}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4" />
                        Save Preview
                      </>
                    ) : (
                      <>
                        <Pencil className="h-4 w-4" />
                        Edit Draft
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSendDraft}
                  disabled={!canSend}
                  title={
                    email.rowNumber <= 0
                      ? "Google Sheet row number missing hai"
                      : !hasDraft
                        ? "Draft data available nahi hai"
                        : !draftTo.trim()
                          ? "Recipient email missing hai"
                          : !draftSubject.trim()
                            ? "Subject missing hai"
                            : !draftBody.trim()
                              ? "Draft body missing hai"
                              : "Send email directly"
                  }
                  className="inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                >
                  {isSending ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

interface PreviewTabProps {
  email: EmailItem;
  draftTo: string;
  draftSubject: string;
  draftBody: string;
  previewHtml: string;
  isEditing: boolean;
  setDraftTo: (value: string) => void;
  setDraftSubject: (value: string) => void;
  setDraftBody: (value: string) => void;
}

function PreviewTab({
  email,
  draftTo,
  draftSubject,
  draftBody,
  previewHtml,
  isEditing,
  setDraftTo,
  setDraftSubject,
  setDraftBody,
}: PreviewTabProps) {
  const hasDraft =
    Boolean(draftTo) ||
    Boolean(draftSubject) ||
    Boolean(draftBody) ||
    Boolean(email.draftHtml);

  return (
    <div className="p-4 sm:p-6">
      {!hasDraft ? (
        <EmptyState
          icon={FileText}
          title="Draft available nahi hai"
          description="Is email ke Google Sheet row me Draft To, Draft Subject aur Draft Body blank hain."
        />
      ) : (
        <div className="mx-auto max-w-4xl">
          {isEditing ? (
            <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <FormField
                label="To"
                htmlFor="draft-to"
              >
                <input
                  id="draft-to"
                  type="email"
                  value={draftTo}
                  onChange={(event) =>
                    setDraftTo(
                      event.target.value
                    )
                  }
                  placeholder="recipient@example.com"
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground hover:border-ring/40 focus:border-ring focus:ring-4 focus:ring-ring/10"
                />
              </FormField>

              <FormField
                label="Subject"
                htmlFor="draft-subject"
              >
                <input
                  id="draft-subject"
                  type="text"
                  value={draftSubject}
                  onChange={(event) =>
                    setDraftSubject(
                      event.target.value
                    )
                  }
                  placeholder="Email subject"
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground hover:border-ring/40 focus:border-ring focus:ring-4 focus:ring-ring/10"
                />
              </FormField>

              <FormField
                label="Message"
                htmlFor="draft-body"
              >
                <textarea
                  id="draft-body"
                  value={draftBody}
                  onChange={(event) =>
                    setDraftBody(
                      event.target.value
                    )
                  }
                  placeholder="Write email reply..."
                  rows={14}
                  className="mt-2 min-h-80 w-full resize-y rounded-xl border border-border bg-background px-4 py-4 text-sm leading-7 text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground hover:border-ring/40 focus:border-ring focus:ring-4 focus:ring-ring/10"
                />
              </FormField>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/15 px-5 py-4">
                <div className="grid gap-3 text-sm sm:grid-cols-[80px_1fr]">
                  <p className="font-medium text-muted-foreground">
                    To
                  </p>

                  <p className="break-all font-medium text-foreground">
                    {draftTo ||
                      "Recipient unavailable"}
                  </p>

                  <p className="font-medium text-muted-foreground">
                    Subject
                  </p>

                  <p className="font-semibold text-foreground">
                    {draftSubject ||
                      "No subject"}
                  </p>
                </div>
              </div>

              <iframe
                title="Draft email preview"
                srcDoc={previewHtml}
                sandbox=""
                scrolling="no"
                onLoad={(event) => {
                  const frame =
                    event.currentTarget;

                  const frameDocument =
                    frame.contentDocument;

                  if (!frameDocument) {
                    return;
                  }

                  const contentHeight =
                    Math.max(
                      frameDocument
                        .documentElement
                        .scrollHeight,
                      frameDocument.body
                        .scrollHeight
                    );

                  const availableHeight =
                    Math.max(
                      300,
                      window.innerHeight -
                        355
                    );

                  const finalHeight =
                    Math.min(
                      Math.max(
                        contentHeight + 12,
                        320
                      ),
                      availableHeight
                    );

                  frame.style.height =
                    `${finalHeight}px`;
                }}
                className="h-[420px] w-full border-0 bg-white"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OriginalEmailTab({
  email,
}: {
  email: EmailItem;
}) {
  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground">
              <User className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                From
              </p>

              <p className="mt-1 font-semibold text-foreground">
                {email.senderName}
              </p>

              <p className="mt-1 break-all text-sm text-muted-foreground">
                {email.senderEmail}
              </p>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Received
              </p>

              <p className="mt-1 text-sm font-medium text-foreground">
                {email.receivedAtFull}
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Subject
            </p>

            <p className="mt-2 text-lg font-semibold text-foreground">
              {email.subject}
            </p>
          </div>
        </section>

        <ContentSection
          icon={Mail}
          title="Original email content"
        >
          {email.originalBody ||
          email.originalHtml ? (
            <div className="whitespace-pre-wrap rounded-xl border border-border bg-muted/10 p-5 text-sm leading-7 text-foreground">
              {email.originalBody ||
                email.originalHtml}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/10 px-5 py-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Original email body dashboard
                data me available nahi hai.
              </p>
            </div>
          )}
        </ContentSection>

        <ContentSection
          icon={Bot}
          title="Available AI Summary"
        >
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {email.summary}
          </p>
        </ContentSection>

        {email.hasAttachment && (
          <ContentSection
            icon={Paperclip}
            title="Attachment"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow
                label="File"
                value={
                  email.attachmentFile ||
                  "Not available"
                }
              />

              <DetailRow
                label="Status"
                value={
                  email.attachmentStatus ||
                  "Not available"
                }
              />
            </div>

            {email.attachmentSummary && (
              <div className="mt-5 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Attachment Summary
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                  {email.attachmentSummary}
                </p>
              </div>
            )}
          </ContentSection>
        )}
      </div>
    </div>
  );
}

function AIAnalysisTab({
  email,
  confidenceText,
}: {
  email: EmailItem;
  confidenceText: string;
}) {
  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <section>
          <SectionLabel>
            Classification
          </SectionLabel>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              icon={Tag}
              label="Category"
              value={email.category}
            />

            <InfoCard
              icon={Mail}
              label="Priority"
              value={
                <EmailPriorityBadge
                  priority={
                    email.priority
                  }
                />
              }
            />

            <InfoCard
              icon={Clock3}
              label="Status"
              value={
                <EmailStatusBadge
                  status={email.status}
                />
              }
            />

            <InfoCard
              icon={CheckCircle2}
              label="Confidence"
              value={confidenceText}
            />

            <InfoCard
              icon={Reply}
              label="Reply Required"
              value={
                email.replyRequired
                  ? "Yes"
                  : "No"
              }
            />

            <InfoCard
              icon={FileText}
              label="Draft Created"
              value={
                email.draftCreated
                  ? "Yes"
                  : "No"
              }
            />
          </div>
        </section>

        <ContentSection
          icon={Bot}
          title="AI-generated summary"
        >
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {email.summary}
          </p>
        </ContentSection>

        <section>
          <SectionLabel>
            Automation Results
          </SectionLabel>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <BooleanCard
              label="Reply Required"
              value={email.replyRequired}
            />

            <BooleanCard
              label="Draft Created"
              value={email.draftCreated}
            />

            <BooleanCard
              label="Attachment"
              value={email.hasAttachment}
            />

            <BooleanCard
              label="Calendar Created"
              value={
                email.calendarCreated
              }
            />
          </div>
        </section>

        {(email.calendarCreated ||
          email.meetingDate ||
          email.googleMeetLink) && (
          <ContentSection
            icon={CalendarClock}
            title="Calendar Analysis"
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow
                label="Calendar Status"
                value={
                  email.calendarStatus ||
                  "Not available"
                }
              />

              <DetailRow
                label="Decision"
                value={
                  email.calendarDecision ||
                  "Not available"
                }
              />

              <DetailRow
                label="Meeting Date"
                value={
                  email.meetingDate ||
                  "Not available"
                }
              />

              <DetailRow
                label="Start Time"
                value={
                  email.meetingStartTime ||
                  "Not available"
                }
              />

              <DetailRow
                label="End Time"
                value={
                  email.meetingEndTime ||
                  "Not available"
                }
              />

              <DetailRow
                label="Timezone"
                value={
                  email.meetingTimezone ||
                  "Not available"
                }
              />
            </div>

            {email.calendarReason && (
              <div className="mt-5 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Calendar Reason
                </p>

                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {email.calendarReason}
                </p>
              </div>
            )}
          </ContentSection>
        )}

        <section className="rounded-2xl border border-dashed border-border bg-muted/10 p-5 sm:p-6">
          <h3 className="font-semibold text-foreground">
            Workflow Metadata
          </h3>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow
              label="Google Sheet Row"
              value={
                email.rowNumber > 0
                  ? String(
                      email.rowNumber
                    )
                  : "Not available"
              }
            />

            <DetailRow
              label="Workflow Status"
              value={
                email.workflowStatus ||
                "Not available"
              }
            />

            <DetailRow
              label="Message ID"
              value={
                email.messageId ||
                "Not available"
              }
            />

            <DetailRow
              label="Thread ID"
              value={
                email.threadId ||
                "Not available"
              }
            />

            <DetailRow
              label="Client Email"
              value={
                email.clientEmail ||
                "Not available"
              }
            />

            <DetailRow
              label="Processed At"
              value={
                email.processedAt ||
                "Not available"
              }
            />

            <DetailRow
              label="Workflow Version"
              value={
                email.workflowVersion ||
                "Not available"
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function TabButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-200",
        active
          ? "border-border bg-card text-foreground shadow-sm"
          : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function ContentSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4.5 w-4.5 text-muted-foreground" />

        <h3 className="font-semibold text-foreground">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

function SectionLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </h3>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />

        <p className="text-xs font-semibold uppercase tracking-[0.08em]">
          {label}
        </p>
      </div>

      <div className="mt-3 break-words text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function BooleanCard({
  label,
  value,
}: {
  label: string;
  value: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>

      <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: value
              ? "#2F8F46"
              : "#526173",
          }}
        />

        {value ? "Yes" : "No"}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/25 text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 font-semibold text-foreground">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function cleanDraftValue(
  value: string | null | undefined
): string {
  if (typeof value !== "string") {
    return "";
  }

  const cleanedValue = value.trim();

  if (
    cleanedValue
      .toUpperCase()
      .includes("#ERROR!")
  ) {
    return "";
  }

  return cleanedValue;
}

function createBasicEmailHtml(
  content: string
): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#0C0A09;">${escapeHtml(
    content
  ).replace(/\n/g, "<br />")}</div>`;
}

function createPreviewDocument(
  content: string,
  isHtml: boolean
): string {
  const safeContent = isHtml
    ? content
    : escapeHtml(content).replace(
        /\n/g,
        "<br />"
      );

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <style>
      * {
        box-sizing: border-box;
      }

      html,
      body {
        min-height: 100%;
        overflow: hidden;
      }

      body {
        margin: 0;
        padding: clamp(20px, 2.5vw, 32px);
        background: #ffffff;
        color: #0C0A09;
        font-family:
          Arial,
          Helvetica,
          sans-serif;
        font-size: clamp(14px, 0.9vw, 15px);
        line-height: 1.7;
        overflow-wrap: anywhere;
      }

      p,
      div,
      span,
      td,
      th,
      li,
      strong,
      b,
      em,
      i,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: inherit;
      }

      a {
        color: #155DFC;
      }

      blockquote {
        border-left: 3px solid #d7dce3;
        margin-left: 0;
        padding-left: 16px;
        color: #45556C;
      }

      hr {
        border: 0;
        border-top: 1px solid #e5e7eb;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      table {
        max-width: 100%;
      }
    </style>
  </head>

  <body>
    ${safeContent || "<p>Draft body is empty.</p>"}
  </body>
</html>
  `;
}

function escapeHtml(
  value: string
): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatConfidence(
  value: number
): number {
  if (value <= 1) {
    return Math.round(value * 100);
  }

  return Math.round(value);
}