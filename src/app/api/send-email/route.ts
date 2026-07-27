import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface SendEmailRequestBody {
  emailId?: string;
  rowNumber?: number | string;

  messageId?: string;
  threadId?: string;

  clientEmail?: string;
  draftId?: string;

  to?: string;
  subject?: string;
  body?: string;
  html?: string;
}

interface ClientRecord {
  id: string;
  company_name: string;
  login_email: string;
  send_email_webhook_url: string | null;
  status: "active" | "inactive";
}

interface N8nSendEmailResponse {
  success?: boolean;
  message?: string;
  status?: string;
  sentMessageId?: string;
  error?: string;
  [key: string]: unknown;
}

export async function POST(
  request: NextRequest
) {
  try {
    const requestBody =
      (await request.json()) as SendEmailRequestBody;

    const emailId = cleanText(
      requestBody.emailId
    );

    const rowNumber = normalizeRowNumber(
      requestBody.rowNumber
    );

    const messageId = cleanText(
      requestBody.messageId
    );

    const threadId = cleanText(
      requestBody.threadId
    );

    const requestClientEmail = cleanText(
      requestBody.clientEmail
    );

    const draftId = cleanText(
      requestBody.draftId
    );

    const to = cleanText(
      requestBody.to
    );

    const subject = cleanText(
      requestBody.subject
    );

    const body = cleanText(
      requestBody.body
    );

    const html = cleanText(
      requestBody.html
    );

    if (rowNumber <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "ROW_NUMBER_MISSING",
          message:
            "Google Sheet row number missing ya invalid hai.",
        },
        {
          status: 400,
        }
      );
    }

    if (!to) {
      return NextResponse.json(
        {
          success: false,
          error: "RECIPIENT_MISSING",
          message:
            "Recipient email address missing hai.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidEmail(to)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_RECIPIENT",
          message:
            "Recipient email address valid nahi hai.",
        },
        {
          status: 400,
        }
      );
    }

    if (!subject) {
      return NextResponse.json(
        {
          success: false,
          error: "SUBJECT_MISSING",
          message:
            "Email subject missing hai.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body && !html) {
      return NextResponse.json(
        {
          success: false,
          error: "BODY_MISSING",
          message:
            "Email body missing hai.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (
      userError ||
      !user?.email
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message:
            "Email send karne ke liye login karo.",
        },
        {
          status: 401,
        }
      );
    }

    const loginEmail =
      user.email
        .trim()
        .toLowerCase();

    const {
      data: client,
      error: clientError,
    } = await supabase
      .from("clients")
      .select(
        `
          id,
          company_name,
          login_email,
          send_email_webhook_url,
          status
        `
      )
      .eq(
        "login_email",
        loginEmail
      )
      .maybeSingle<ClientRecord>();

    if (clientError) {
      console.error(
        "Send email client lookup failed:",
        clientError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "CLIENT_LOOKUP_FAILED",
          message:
            "Client send-email configuration load nahi ho payi.",
        },
        {
          status: 500,
        }
      );
    }

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error:
            "CLIENT_NOT_REGISTERED",
          message:
            "Logged-in email clients table me registered nahi hai.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      client.status !== "active"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "CLIENT_INACTIVE",
          message:
            "Client account inactive hai.",
        },
        {
          status: 403,
        }
      );
    }

    const n8nWebhookUrl =
      cleanText(
        client.send_email_webhook_url
      );

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "SEND_WEBHOOK_NOT_CONFIGURED",
          message:
            "Client ka Send Email webhook URL Supabase me configure nahi hai.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !isValidWebhookUrl(
        n8nWebhookUrl
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "INVALID_SEND_WEBHOOK_URL",
          message:
            "Client ka Send Email webhook URL valid nahi hai.",
        },
        {
          status: 500,
        }
      );
    }

    const payload = {
      action: "send_email",
      source:
        "ai-email-assistant-dashboard",

      clientId: client.id,
      companyName:
        client.company_name,

      clientEmail:
        client.login_email
          .trim()
          .toLowerCase(),

      requestClientEmail,

      emailId,
      rowNumber,

      messageId,
      threadId,
      draftId,

      to,
      subject,
      body,
      html,

      requestedAt:
        new Date().toISOString(),
    };

    const webhookResponse =
      await fetch(
        n8nWebhookUrl,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",

            "X-Client-Id":
              client.id,

            "X-Client-Email":
              client.login_email
                .trim()
                .toLowerCase(),
          },

          body:
            JSON.stringify(payload),

          cache: "no-store",

          signal:
            AbortSignal.timeout(
              30000
            ),
        }
      );

    const responseText =
      await webhookResponse.text();

    const webhookData =
      parseJsonResponse<N8nSendEmailResponse>(
        responseText
      );

    if (!webhookResponse.ok) {
      const errorMessage =
        webhookData?.message ||
        webhookData?.error ||
        responseText ||
        `n8n returned status ${webhookResponse.status}.`;

      console.error(
        "Send Email n8n webhook failed:",
        {
          status:
            webhookResponse.status,

          rowNumber,

          clientId:
            client.id,

          response:
            responseText,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "N8N_SEND_EMAIL_FAILED",
          message:
            errorMessage,
          n8nStatus:
            webhookResponse.status,
        },
        {
          status:
            webhookResponse.status >=
              400 &&
            webhookResponse.status <
              600
              ? webhookResponse.status
              : 502,
        }
      );
    }

    if (
      webhookData?.success ===
      false
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "N8N_WORKFLOW_FAILED",
          message:
            webhookData.message ||
            webhookData.error ||
            "n8n workflow email send nahi kar paya.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,

        message:
          webhookData?.message ||
          "Email successfully send ho gaya.",

        sentMessageId:
          webhookData?.sentMessageId ||
          "",

        rowNumber,

        data:
          webhookData || {},
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    const timeoutError =
      error instanceof Error &&
      (
        error.name ===
          "TimeoutError" ||
        error.name ===
          "AbortError"
      );

    if (timeoutError) {
      return NextResponse.json(
        {
          success: false,
          error: "N8N_TIMEOUT",
          message:
            "n8n workflow ne 30 seconds me response nahi diya.",
        },
        {
          status: 504,
        }
      );
    }

    console.error(
      "Send email API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Email send karte waqt unexpected error aaya.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message:
        "Send Email API is running.",
      architecture:
        "Supabase client-specific n8n send webhook",
    },
    {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    }
  );
}

function cleanText(
  value:
    | string
    | null
    | undefined
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  const cleanedValue =
    value.trim();

  if (
    cleanedValue
      .toUpperCase()
      .includes("#ERROR!")
  ) {
    return "";
  }

  return cleanedValue;
}

function normalizeRowNumber(
  value:
    | number
    | string
    | null
    | undefined
): number {
  const rowNumber =
    typeof value === "number"
      ? value
      : Number(value);

  if (
    !Number.isInteger(
      rowNumber
    ) ||
    rowNumber <= 0
  ) {
    return 0;
  }

  return rowNumber;
}

function isValidEmail(
  value: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function isValidWebhookUrl(
  value: string
): boolean {
  try {
    const url =
      new URL(value);

    return (
      url.protocol ===
        "http:" ||
      url.protocol ===
        "https:"
    );
  } catch {
    return false;
  }
}

function parseJsonResponse<T>(
  value: string
): T | null {
  if (!value.trim()) {
    return null;
  }

  try {
    return JSON.parse(
      value
    ) as T;
  } catch {
    return null;
  }
}