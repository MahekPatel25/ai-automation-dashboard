"use client";

import {
  FormEvent,
  ReactNode,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  Languages,
  Loader2,
  Mail,
  MessageSquareText,
  Pencil,
  RefreshCw,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";

type ComposerForm = {
  recipientName: string;
  recipientEmail: string;
  emailCategory: string;
  instructions: string;
  tone: string;
  length: string;
  language: string;
};

type CategoryDetails = Record<string, string | boolean>;

type GeneratedEmail = {
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  category: string;
  tone: string;
  language: string;
  length: string;
  warnings: string[];
  requiresManualReview: boolean;
  generatedEmailValid: boolean;
  generationStatus: string;
  generatedAt?: string;
};

type ComposerApiResponse = {
  success?: boolean;
  status?: string;
  message?: string;
  generatedEmail?: GeneratedEmail;
  errors?: string[];
  validationErrors?: string[];
  securityReasons?: string[];
  reasons?: string[];
};

type SendEmailApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  sentMessageId?: string;
};

type DynamicFieldType =
  | "text"
  | "textarea"
  | "date"
  | "time"
  | "select";

type DynamicFieldConfig = {
  key: string;
  label: string;
  type: DynamicFieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: string[];
  colSpan?: "full";
};

type CategoryConfig = {
  description: string;
  fields: DynamicFieldConfig[];
  templates: string[];
};

const emailCategories = [
  "Meeting Request",
  "Sales Proposal",
  "Follow-up",
  "Quotation Request",
  "Payment Reminder",
  "Project Update",
  "Customer Support",
  "Apology",
  "Thank You",
  "Job Application",
  "Introduction",
  "General Business Email",
  "Custom",
];

const tones = [
  "Professional",
  "Formal",
  "Friendly",
  "Polite",
  "Persuasive",
  "Concise",
  "Apologetic",
];

const lengths = ["Short", "Medium", "Detailed"];
const languages = ["English", "Hindi", "Gujarati", "Hinglish"];

const categoryConfigs: Record<string, CategoryConfig> = {
  "Meeting Request": {
    description:
      "Add the essential meeting details. Date and meeting mode are required; all other details are optional.",
    templates: [
      "Website project discussion and next steps",
      "Product demo meeting request",
      "Client onboarding meeting",
      "Project kickoff discussion",
      "Weekly progress meeting",
    ],
    fields: [
      {
        key: "meetingDate",
        label: "Meeting date",
        type: "date",
        required: true,
      },
      {
        key: "meetingMode",
        label: "Meeting mode",
        type: "select",
        required: true,
        options: [
          "Google Meet",
          "Microsoft Teams",
          "Zoom",
          "Phone Call",
          "In-person",
          "Other",
        ],
      },
      {
        key: "startTime",
        label: "Start time",
        type: "time",
      },
      {
        key: "endTime",
        label: "End time",
        type: "time",
      },
      {
        key: "timezone",
        label: "Time zone",
        type: "text",
        placeholder: "Asia/Kolkata (IST)",
      },
      {
        key: "meetingLocation",
        label: "Location or meeting link",
        type: "text",
        placeholder: "Google Meet link or office location",
        colSpan: "full",
      },
      {
        key: "agenda",
        label: "Agenda",
        type: "textarea",
        placeholder: "Project scope, timeline and next steps",
        colSpan: "full",
      },
    ],
  },
  "Sales Proposal": {
    description:
      "Describe what you are offering. Product or service is required; commercial and follow-up details are optional.",
    templates: [
      "Website development proposal",
      "AI automation solution proposal",
      "Mobile app development proposal",
      "Business automation proposal",
      "Digital transformation proposal",
    ],
    fields: [
      {
        key: "productOrService",
        label: "Product or service",
        type: "text",
        required: true,
        placeholder: "Website development service",
      },
      {
        key: "clientRequirement",
        label: "Client requirement",
        type: "text",
        placeholder: "Modern responsive business website",
      },
      {
        key: "mainBenefits",
        label: "Main benefits",
        type: "textarea",
        placeholder: "Faster loading, mobile responsive, easy management",
        colSpan: "full",
      },
      {
        key: "proposedPrice",
        label: "Proposed price",
        type: "text",
        placeholder: "Optional — only enter a confirmed amount",
      },
      {
        key: "nextStep",
        label: "Desired next step",
        type: "text",
        placeholder: "Schedule a discovery call",
      },
    ],
  },
  "Follow-up": {
    description:
      "Tell AI why you are following up. Follow-up purpose is required; previous discussion details are optional.",
    templates: [
      "Follow up on website proposal",
      "Ask for project approval",
      "Request feedback on quotation",
      "Check next steps after meeting",
      "Follow up on pending documents",
    ],
    fields: [
      {
        key: "followUpPurpose",
        label: "Follow-up purpose",
        type: "text",
        required: true,
        placeholder: "Follow up on the website proposal",
        colSpan: "full",
      },
      {
        key: "previousDiscussionDate",
        label: "Previous discussion date",
        type: "date",
      },
      {
        key: "previousTopic",
        label: "Previous discussion topic",
        type: "text",
        placeholder: "Website proposal and project scope",
      },
      {
        key: "nextStep",
        label: "Desired next step",
        type: "text",
        placeholder: "Confirm approval or schedule a call",
        colSpan: "full",
      },
    ],
  },
  "Quotation Request": {
    description:
      "Specify what quotation is needed. Product or service is required; scope, budget and deadline are optional.",
    templates: [
      "Request quotation for website development",
      "Request software development estimate",
      "Request quotation for bulk products",
      "Request maintenance service quotation",
      "Request project cost and timeline",
    ],
    fields: [
      {
        key: "productOrService",
        label: "Product or service",
        type: "text",
        required: true,
        placeholder: "E-commerce website development",
      },
      {
        key: "quantityOrScope",
        label: "Quantity or project scope",
        type: "text",
        placeholder: "10-page website with payment gateway",
      },
      {
        key: "requiredTimeline",
        label: "Required timeline",
        type: "text",
        placeholder: "Within 6 weeks",
      },
      {
        key: "budgetRange",
        label: "Budget range",
        type: "text",
        placeholder: "Optional confirmed budget range",
      },
      {
        key: "quotationDeadline",
        label: "Quotation deadline",
        type: "date",
      },
    ],
  },
  "Payment Reminder": {
    description:
      "Invoice number and due date are required. Amount and reminder style are optional.",
    templates: [
      "Gentle payment reminder",
      "Invoice payment follow-up",
      "Overdue payment reminder",
      "Final payment reminder",
      "Request payment status update",
    ],
    fields: [
      {
        key: "invoiceNumber",
        label: "Invoice number",
        type: "text",
        required: true,
        placeholder: "INV-2026-104",
      },
      {
        key: "dueDate",
        label: "Due date",
        type: "date",
        required: true,
      },
      {
        key: "amount",
        label: "Amount",
        type: "text",
        placeholder: "₹25,000",
      },
      {
        key: "paymentStatus",
        label: "Payment status",
        type: "text",
        placeholder: "Pending / Partially paid",
      },
      {
        key: "reminderLevel",
        label: "Reminder level",
        type: "select",
        options: ["Gentle", "Standard", "Final"],
      },
      {
        key: "notes",
        label: "Additional notes",
        type: "textarea",
        placeholder: "Any confirmed payment instructions or context",
        colSpan: "full",
      },
    ],
  },
  "Project Update": {
    description:
      "Project name and current status are required. Progress, pending work and milestone details are optional.",
    templates: [
      "Weekly project progress update",
      "Development milestone update",
      "Share completed and pending work",
      "Client project status update",
      "Project delivery timeline update",
    ],
    fields: [
      {
        key: "projectName",
        label: "Project name",
        type: "text",
        required: true,
        placeholder: "AI Email Assistant Dashboard",
      },
      {
        key: "currentStatus",
        label: "Current status",
        type: "text",
        required: true,
        placeholder: "Development is on schedule",
      },
      {
        key: "completedWork",
        label: "Work completed",
        type: "textarea",
        placeholder: "Dashboard UI, API integration and testing",
        colSpan: "full",
      },
      {
        key: "pendingWork",
        label: "Pending work",
        type: "textarea",
        placeholder: "Final deployment and client review",
        colSpan: "full",
      },
      {
        key: "nextMilestone",
        label: "Next milestone",
        type: "text",
        placeholder: "Production deployment",
      },
      {
        key: "expectedCompletionDate",
        label: "Expected completion date",
        type: "date",
      },
    ],
  },
  "Customer Support": {
    description:
      "Issue summary is required. Ticket, order, priority and requested resolution are optional.",
    templates: [
      "Respond to a technical issue",
      "Acknowledge customer complaint",
      "Request more issue details",
      "Share troubleshooting steps",
      "Confirm issue resolution",
    ],
    fields: [
      {
        key: "issueSummary",
        label: "Issue summary",
        type: "textarea",
        required: true,
        placeholder: "Customer cannot access the dashboard after login",
        colSpan: "full",
      },
      {
        key: "ticketId",
        label: "Ticket ID",
        type: "text",
        placeholder: "TKT-1042",
      },
      {
        key: "orderId",
        label: "Order ID",
        type: "text",
        placeholder: "ORD-2026-18",
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: ["Low", "Medium", "High", "Urgent"],
      },
      {
        key: "requestedResolution",
        label: "Requested resolution",
        type: "text",
        placeholder: "Restore access and confirm by email",
      },
    ],
  },
  Apology: {
    description:
      "Apology reason is required. Impact, resolution and prevention steps are optional.",
    templates: [
      "Apologize for delayed response",
      "Apologize for service interruption",
      "Apologize for incorrect information",
      "Apologize for missed deadline",
      "Apologize for order issue",
    ],
    fields: [
      {
        key: "apologyReason",
        label: "Apology reason",
        type: "textarea",
        required: true,
        placeholder: "Delay in delivering the project update",
        colSpan: "full",
      },
      {
        key: "impact",
        label: "Impact",
        type: "text",
        placeholder: "Client had to wait for confirmation",
      },
      {
        key: "resolutionOffered",
        label: "Resolution offered",
        type: "text",
        placeholder: "Updated timeline and priority support",
      },
      {
        key: "preventionPlan",
        label: "Prevention or next step",
        type: "textarea",
        placeholder: "Internal review process has been updated",
        colSpan: "full",
      },
    ],
  },
  "Thank You": {
    description:
      "Thank-you reason is required. Related event and personal note are optional.",
    templates: [
      "Thank client for choosing our service",
      "Thank recipient for attending meeting",
      "Thank customer for feedback",
      "Thank team for project support",
      "Thank partner for collaboration",
    ],
    fields: [
      {
        key: "thankYouReason",
        label: "Thank-you reason",
        type: "text",
        required: true,
        placeholder: "Thank them for approving the proposal",
        colSpan: "full",
      },
      {
        key: "relatedEvent",
        label: "Related event or action",
        type: "text",
        placeholder: "Project kickoff meeting",
      },
      {
        key: "personalNote",
        label: "Personal note",
        type: "textarea",
        placeholder: "We appreciate their trust and support",
        colSpan: "full",
      },
    ],
  },
  "Job Application": {
    description:
      "Job title and target company are required. Experience, skills and resume details are optional.",
    templates: [
      "Apply for software developer role",
      "Apply for AI/ML internship",
      "Submit application after referral",
      "Apply for full-stack developer position",
      "Send professional job application",
    ],
    fields: [
      {
        key: "jobTitle",
        label: "Job title",
        type: "text",
        required: true,
        placeholder: "AI/ML Intern",
      },
      {
        key: "targetCompany",
        label: "Target company",
        type: "text",
        required: true,
        placeholder: "ABC Technologies",
      },
      {
        key: "experience",
        label: "Experience",
        type: "text",
        placeholder: "1 year of project experience",
      },
      {
        key: "mainSkills",
        label: "Main skills",
        type: "textarea",
        placeholder: "Python, React, n8n, Gemini API",
        colSpan: "full",
      },
      {
        key: "resumeAttached",
        label: "Resume attached",
        type: "select",
        options: ["Yes", "No"],
      },
    ],
  },
  Introduction: {
    description:
      "Introduction purpose is required. Sender role, shared connection and desired next step are optional.",
    templates: [
      "Introduce yourself to a potential client",
      "Introduce company services",
      "Introduce two business contacts",
      "Professional networking introduction",
      "Introduce project team to client",
    ],
    fields: [
      {
        key: "introductionPurpose",
        label: "Introduction purpose",
        type: "text",
        required: true,
        placeholder: "Introduce our automation services",
        colSpan: "full",
      },
      {
        key: "senderRole",
        label: "Sender role",
        type: "text",
        placeholder: "Business Development Manager",
      },
      {
        key: "sharedConnection",
        label: "Shared connection",
        type: "text",
        placeholder: "Referred by Priya Shah",
      },
      {
        key: "nextStep",
        label: "Desired next step",
        type: "text",
        placeholder: "Schedule a short introduction call",
        colSpan: "full",
      },
    ],
  },
  "General Business Email": {
    description:
      "No extra structured fields are required. Use the short instructions to describe the business email.",
    templates: [
      "Share a general business update",
      "Request information from a client",
      "Confirm a business discussion",
      "Send a professional announcement",
      "Ask for confirmation",
    ],
    fields: [],
  },
  Custom: {
    description:
      "No fixed category fields are required. Describe the complete purpose in the short instructions.",
    templates: [
      "Write a custom professional email",
      "Create an email from my instructions",
      "Draft a unique business message",
    ],
    fields: [],
  },
};

const initialForm: ComposerForm = {
  recipientName: "",
  recipientEmail: "",
  emailCategory: "General Business Email",
  instructions: "",
  tone: "Professional",
  length: "Medium",
  language: "English",
};

export default function AiEmailComposerPage() {
  const [form, setForm] = useState<ComposerForm>(initialForm);
  const [categoryDetails, setCategoryDetails] =
    useState<CategoryDetails>({});
  const [generatedEmail, setGeneratedEmail] =
    useState<GeneratedEmail | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditingPreview, setIsEditingPreview] = useState(false);
  const [formError, setFormError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const selectedCategoryConfig =
    categoryConfigs[form.emailCategory] ?? categoryConfigs.Custom;
  const instructionCount = form.instructions.length;

  const requiredCategoryFieldsComplete = useMemo(() => {
    return selectedCategoryConfig.fields
      .filter((field) => field.required)
      .every((field) => {
        const value = categoryDetails[field.key];
        return typeof value === "string" && value.trim().length > 0;
      });
  }, [categoryDetails, selectedCategoryConfig.fields]);

  const canGenerate = useMemo(() => {
    return (
      form.recipientEmail.trim().length > 0 &&
      form.instructions.trim().length >= 10 &&
      requiredCategoryFieldsComplete &&
      !isGenerating &&
      !isSending
    );
  }, [
    form.recipientEmail,
    form.instructions,
    requiredCategoryFieldsComplete,
    isGenerating,
    isSending,
  ]);

  function updateField<K extends keyof ComposerForm>(
    field: K,
    value: ComposerForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
    setSendSuccess("");
  }

  function handleCategoryChange(value: string) {
    setForm((current) => ({ ...current, emailCategory: value }));
    setCategoryDetails({});
    setFormError("");
    setSendSuccess("");
  }

  function updateCategoryDetail(key: string, value: string | boolean) {
    setCategoryDetails((current) => ({
      ...current,
      [key]: value,
    }));
    setFormError("");
    setSendSuccess("");
  }

  function updateGeneratedEmail<K extends keyof GeneratedEmail>(
    field: K,
    value: GeneratedEmail[K]
  ) {
    setGeneratedEmail((current) =>
      current ? { ...current, [field]: value } : current
    );
    setFormError("");
    setSendSuccess("");
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
      value.trim().toLowerCase()
    );
  }

  function validateCategoryDetails(): string | null {
    for (const field of selectedCategoryConfig.fields) {
      if (!field.required) continue;
      const value = categoryDetails[field.key];
      if (typeof value !== "string" || !value.trim()) {
        return `${field.label} is required.`;
      }
    }

    if (form.emailCategory === "Meeting Request") {
      const startTime = String(categoryDetails.startTime ?? "");
      const endTime = String(categoryDetails.endTime ?? "");
      if (startTime && endTime && startTime >= endTime) {
        return "Meeting end time must be later than the start time.";
      }
    }

    return null;
  }

  function getComposerError(data: ComposerApiResponse) {
    return (
      data.message ||
      data.validationErrors?.[0] ||
      data.errors?.[0] ||
      data.securityReasons?.[0] ||
      data.reasons?.[0] ||
      "Email generate nahi ho payi."
    );
  }

  async function generateEmail() {
    const recipientEmail = form.recipientEmail.trim().toLowerCase();
    const instructions = form.instructions.trim();

    if (!recipientEmail) {
      setFormError("Recipient email is required.");
      return;
    }

    if (!isValidEmail(recipientEmail)) {
      setFormError("Please enter a valid recipient email address.");
      return;
    }

    if (instructions.length < 10) {
      setFormError(
        "Please describe the email purpose using at least 10 characters."
      );
      return;
    }

    const categoryError = validateCategoryDetails();
    if (categoryError) {
      setFormError(categoryError);
      return;
    }

    setFormError("");
    setSendSuccess("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai-email-composer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...form,
          recipientEmail,
          instructions,
          categoryDetails,
        }),
      });

      const data = (await response.json()) as ComposerApiResponse;

      if (!response.ok || data.success !== true || !data.generatedEmail) {
        setFormError(getComposerError(data));
        return;
      }

      setGeneratedEmail(data.generatedEmail);
      setIsEditingPreview(false);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("AI Email Composer request failed:", error);
      setFormError("Unable to connect to the AI Email Composer.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await generateEmail();
  }

  async function handleRegenerate() {
    setIsPreviewOpen(false);
    setIsEditingPreview(false);
    await generateEmail();
  }

  async function handleSendEmail() {
    if (!generatedEmail) return;

    const recipientEmail = generatedEmail.recipientEmail.trim().toLowerCase();
    const subject = generatedEmail.subject.trim();
    const body = generatedEmail.body.trim();

    if (!isValidEmail(recipientEmail)) {
      setFormError("Please enter a valid recipient email before sending.");
      return;
    }

    if (!subject) {
      setFormError("Email subject is required before sending.");
      return;
    }

    if (!body) {
      setFormError("Email body is required before sending.");
      return;
    }

    setFormError("");
    setSendSuccess("");
    setIsSending(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          source: "ai-email-composer",
          to: recipientEmail,
          subject,
          body,
          html: convertTextToHtml(body),
        }),
      });

      const data = (await response.json()) as SendEmailApiResponse;

      if (!response.ok || data.success !== true) {
        setFormError(data.message || data.error || "Email send nahi ho payi.");
        return;
      }

      setIsPreviewOpen(false);
      setIsEditingPreview(false);
      setSendSuccess(data.message || "Email successfully send ho gayi.");
    } catch (error) {
      console.error("AI Composer send failed:", error);
      setFormError("Unable to connect to the Send Email service.");
    } finally {
      setIsSending(false);
    }
  }

  function handleReset() {
    setForm(initialForm);
    setCategoryDetails({});
    setGeneratedEmail(null);
    setIsPreviewOpen(false);
    setIsEditingPreview(false);
    setFormError("");
    setSendSuccess("");
  }

  function closePreview() {
    if (isSending) return;
    setIsPreviewOpen(false);
    setIsEditingPreview(false);
  }

  function applyTemplate(template: string) {
    setForm((current) => ({ ...current, instructions: template }));
    setFormError("");
    setSendSuccess("");
  }

  return (
    <>
      <DashboardShell>
        <main className="min-h-full bg-background">
          <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-5 lg:p-6">
            <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm lg:p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight text-card-foreground md:text-3xl">
                      AI Email Composer
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      Create a professional email from a few details, review the
                      AI draft, edit it and send it from the dashboard.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <HeaderStat value="13" label="Email types" />
                  <HeaderStat value="4" label="Languages" />
                  <HeaderStat value="AI" label="Smart writing" />
                </div>
              </div>
            </section>

            <div className="grid gap-6">
              <section className="rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="border-b border-border/70 px-5 py-5 sm:px-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/25 text-muted-foreground">
                      <Mail className="h-4.5 w-4.5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-card-foreground">
                        Create a new email
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Complete the required fields and add only the details
                        that should appear in the final email.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleGenerate}
                  className="space-y-6 px-5 py-5 sm:px-6 sm:py-6"
                >
                  <FormSection
                    icon={<UserRound className="h-5 w-5" />}
                    title="Recipient information"
                    description="Who should receive this email?"
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <FieldGroup
                        label="Recipient name"
                        htmlFor="recipientName"
                        optional
                      >
                        <input
                          id="recipientName"
                          type="text"
                          value={form.recipientName}
                          onChange={(event) =>
                            updateField("recipientName", event.target.value)
                          }
                          placeholder="Rahul Sharma"
                          autoComplete="name"
                          className={inputClassName}
                        />
                      </FieldGroup>

                      <FieldGroup
                        label="Recipient email"
                        htmlFor="recipientEmail"
                      >
                        <input
                          id="recipientEmail"
                          type="email"
                          value={form.recipientEmail}
                          onChange={(event) =>
                            updateField("recipientEmail", event.target.value)
                          }
                          placeholder="rahul@example.com"
                          autoComplete="email"
                          className={inputClassName}
                        />
                      </FieldGroup>
                    </div>
                  </FormSection>

                  <FormSection
                    icon={<MessageSquareText className="h-5 w-5" />}
                    title="Email purpose"
                    description="Choose the category and describe the email in one or two lines."
                  >
                    <div className="space-y-5">
                      <FieldGroup
                        label="Email category"
                        htmlFor="emailCategory"
                      >
                        <select
                          id="emailCategory"
                          value={form.emailCategory}
                          onChange={(event) =>
                            handleCategoryChange(event.target.value)
                          }
                          className={inputClassName}
                        >
                          {emailCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </FieldGroup>

                      <SmartTemplates
                        templates={selectedCategoryConfig.templates}
                        onSelect={applyTemplate}
                      />

                      <FieldGroup
                        label="Short instructions"
                        htmlFor="instructions"
                        hint="Describe the purpose in one or two lines."
                      >
                        <div className="relative">
                          <textarea
                            id="instructions"
                            value={form.instructions}
                            onChange={(event) =>
                              updateField("instructions", event.target.value)
                            }
                            maxLength={1000}
                            rows={6}
                            placeholder="Example: Rahul ko website proposal ka polite follow-up bhejna hai aur project ke next steps poochne hain."
                            className={`${textareaClassName} pb-10`}
                          />
                          <span className="absolute bottom-3 right-3 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                            {instructionCount}/1000
                          </span>
                        </div>
                      </FieldGroup>
                    </div>
                  </FormSection>

                  {selectedCategoryConfig.fields.length > 0 ? (
                    <FormSection
                      icon={<CalendarDays className="h-5 w-5" />}
                      title={`${form.emailCategory} details`}
                      description={selectedCategoryConfig.description}
                    >
                      <div className="grid gap-5 md:grid-cols-2">
                        {selectedCategoryConfig.fields.map((field) => (
                          <DynamicField
                            key={field.key}
                            field={field}
                            value={categoryDetails[field.key]}
                            onChange={(value) =>
                              updateCategoryDetail(field.key, value)
                            }
                          />
                        ))}
                      </div>
                    </FormSection>
                  ) : null}

                  <FormSection
                    icon={<Languages className="h-5 w-5" />}
                    title="Writing preferences"
                    description="Control how AI should write the email."
                  >
                    <div className="grid gap-5 md:grid-cols-3">
                      <FieldGroup label="Tone" htmlFor="tone">
                        <select
                          id="tone"
                          value={form.tone}
                          onChange={(event) =>
                            updateField("tone", event.target.value)
                          }
                          className={inputClassName}
                        >
                          {tones.map((tone) => (
                            <option key={tone} value={tone}>
                              {tone}
                            </option>
                          ))}
                        </select>
                      </FieldGroup>

                      <FieldGroup label="Length" htmlFor="length">
                        <select
                          id="length"
                          value={form.length}
                          onChange={(event) =>
                            updateField("length", event.target.value)
                          }
                          className={inputClassName}
                        >
                          {lengths.map((length) => (
                            <option key={length} value={length}>
                              {length}
                            </option>
                          ))}
                        </select>
                      </FieldGroup>

                      <FieldGroup label="Language" htmlFor="language">
                        <select
                          id="language"
                          value={form.language}
                          onChange={(event) =>
                            updateField("language", event.target.value)
                          }
                          className={inputClassName}
                        >
                          {languages.map((language) => (
                            <option key={language} value={language}>
                              {language}
                            </option>
                          ))}
                        </select>
                      </FieldGroup>
                    </div>
                  </FormSection>

                  {formError ? (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-xl border border-[rgba(193,16,7,0.22)] bg-[rgba(193,16,7,0.07)] px-4 py-3 text-sm font-medium text-[#C11007]"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  ) : null}

                  {sendSuccess ? (
                    <div
                      role="status"
                      className="flex items-start gap-3 rounded-xl border border-[rgba(47,143,70,0.20)] bg-[rgba(47,143,70,0.08)] px-4 py-3 text-sm font-medium text-[#2F8F46]"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{sendSuccess}</span>
                    </div>
                  ) : null}

                  <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isGenerating || isSending}
                      className="h-11 rounded-xl border border-border bg-background px-5 text-sm font-semibold transition-all duration-200 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Clear form
                    </button>

                    <button
                      type="submit"
                      disabled={!canGenerate}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating email...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate Email
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>


            </div>
          </div>
        </main>
      </DashboardShell>

      {isPreviewOpen && generatedEmail ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0A09]/55 p-3 backdrop-blur-sm sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-preview-title"
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_30px_90px_rgba(12,10,9,0.28)]">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="email-preview-title"
                    className="truncate text-lg font-bold"
                  >
                    AI Email Preview
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Review and edit before sending
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSending}
                  onClick={() => setIsEditingPreview((current) => !current)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-input px-4 text-sm font-semibold transition hover:bg-accent disabled:opacity-50"
                >
                  {isEditingPreview ? (
                    <>
                      <Check className="h-4 w-4" /> Done
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4" /> Edit
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={closePreview}
                  disabled={isSending}
                  aria-label="Close preview"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-input transition hover:bg-accent disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <div className="space-y-5">
                <PreviewField label="Recipient name">
                  {isEditingPreview ? (
                    <input
                      type="text"
                      value={generatedEmail.recipientName}
                      onChange={(event) =>
                        updateGeneratedEmail(
                          "recipientName",
                          event.target.value
                        )
                      }
                      className={inputClassName}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {generatedEmail.recipientName || "Not provided"}
                    </p>
                  )}
                </PreviewField>

                <PreviewField label="Recipient email">
                  {isEditingPreview ? (
                    <input
                      type="email"
                      value={generatedEmail.recipientEmail}
                      onChange={(event) =>
                        updateGeneratedEmail(
                          "recipientEmail",
                          event.target.value
                        )
                      }
                      className={inputClassName}
                    />
                  ) : (
                    <p className="break-all text-sm font-medium">
                      {generatedEmail.recipientEmail}
                    </p>
                  )}
                </PreviewField>

                <PreviewField label="Subject">
                  {isEditingPreview ? (
                    <input
                      type="text"
                      value={generatedEmail.subject}
                      onChange={(event) =>
                        updateGeneratedEmail("subject", event.target.value)
                      }
                      className={inputClassName}
                    />
                  ) : (
                    <p className="text-base font-bold">
                      {generatedEmail.subject}
                    </p>
                  )}
                </PreviewField>

                <PreviewField label="Email body">
                  {isEditingPreview ? (
                    <textarea
                      value={generatedEmail.body}
                      onChange={(event) =>
                        updateGeneratedEmail("body", event.target.value)
                      }
                      rows={14}
                      className={`${textareaClassName} min-h-72`}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap rounded-2xl border border-border bg-muted/20 p-5 text-sm leading-7">
                      {generatedEmail.body}
                    </div>
                  )}
                </PreviewField>

                {generatedEmail.warnings.length > 0 ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" /> Generation warnings
                    </div>
                    <ul className="mt-2 space-y-1 text-sm">
                      {generatedEmail.warnings.map((warning) => (
                        <li key={warning}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isGenerating || isSending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 text-sm font-semibold transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={
                  isSending ||
                  isGenerating ||
                  !generatedEmail.recipientEmail.trim() ||
                  !generatedEmail.subject.trim() ||
                  !generatedEmail.body.trim()
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Send Email <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground hover:border-ring/40 focus:border-ring focus:ring-4 focus:ring-ring/10";
const textareaClassName =
  "w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground hover:border-ring/40 focus:border-ring focus:ring-4 focus:ring-ring/10";

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: DynamicFieldConfig;
  value: string | boolean | undefined;
  onChange: (value: string) => void;
}) {
  const fieldValue = typeof value === "string" ? value : "";
  const wrapperClass = field.colSpan === "full" ? "md:col-span-2" : "";

  return (
    <div className={wrapperClass}>
      <FieldGroup
        label={field.label}
        htmlFor={`category-${field.key}`}
        optional={!field.required}
        hint={field.hint}
      >
        {field.type === "textarea" ? (
          <textarea
            id={`category-${field.key}`}
            value={fieldValue}
            onChange={(event) => onChange(event.target.value)}
            rows={4}
            placeholder={field.placeholder}
            required={field.required}
            className={textareaClassName}
          />
        ) : field.type === "select" ? (
          <select
            id={`category-${field.key}`}
            value={fieldValue}
            onChange={(event) => onChange(event.target.value)}
            required={field.required}
            className={inputClassName}
          >
            <option value="">Select an option</option>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`category-${field.key}`}
            type={field.type}
            value={fieldValue}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={inputClassName}
          />
        )}
      </FieldGroup>
    </div>
  );
}

function SmartTemplates({
  templates,
  onSelect,
}: {
  templates: string[];
  onSelect: (template: string) => void;
}) {
  if (templates.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">Suggested prompts</p>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template}
            type="button"
            onClick={() => onSelect(template)}
            className="rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40 hover:text-foreground"
          >
            {template}
          </button>
        ))}
      </div>
    </div>
  );
}

function convertTextToHtml(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => {
      const cleanedLine = line.trim();
      return cleanedLine ? `<p>${escapeHtml(cleanedLine)}</p>` : "<br>";
    })
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function HeaderStat({
  value,
  label,
  className = "",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`min-w-[92px] rounded-xl border border-border bg-muted/15 px-3 py-2.5 text-center ${className}`}
    >
      <p className="text-base font-semibold text-card-foreground">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/20 text-muted-foreground">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-card-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/10 p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function FieldGroup({
  label,
  htmlFor,
  hint,
  optional = false,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold">
          {label}
        </label>
        {optional ? (
          <span className="text-xs text-muted-foreground">Optional</span>
        ) : (
          <span className="text-xs font-semibold text-primary">Required</span>
        )}
      </div>
      {children}
      {hint ? (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function PreviewField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
