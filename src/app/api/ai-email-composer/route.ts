import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CategoryDetails = Record<
  string,
  string | boolean
>;

type ComposerRequest = {
  recipientName?: unknown;
  recipientEmail?: unknown;
  emailCategory?: unknown;
  instructions?: unknown;
  tone?: unknown;
  length?: unknown;
  language?: unknown;
  categoryDetails?: unknown;
};

type ClientRecord = {
  id: string;
  company_name: string;
  login_email: string;
  generate_email_webhook_url: string | null;
  status: "active" | "inactive";
};

type N8nComposerResponse = {
  success?: boolean;
  status?: string;
  message?: string;

  generatedEmail?: {
    recipientName?: string;
    recipientEmail?: string;
    subject?: string;
    body?: string;
    category?: string;
    tone?: string;
    language?: string;
    length?: string;
    warnings?: string[];
    requiresManualReview?: boolean;
    generatedEmailValid?: boolean;
    generationStatus?: string;
    generatedAt?: string;
  };

  company?: {
    companyName?: string;
    companyEmail?: string;
    replyTeam?: string;
    signature?: string;
  };

  autoSendEnabled?: boolean;
  composerVersion?: string;
  respondedAt?: string;

  errors?: string[];
  validationErrors?: string[];
  securityReasons?: string[];
  reasons?: string[];
};

function cleanString(
  value: unknown
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\s+/g, " ")
    .trim();
}

function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value)
  );
}

function cleanCategoryDetails(
  value: unknown
): CategoryDetails {
  if (!isPlainObject(value)) {
    return {};
  }

  const cleaned: CategoryDetails = {};

  for (const [key, itemValue] of Object.entries(value)) {
    if (typeof itemValue === "boolean") {
      cleaned[key] = itemValue;
      continue;
    }

    const normalizedValue =
      cleanString(itemValue);

    if (normalizedValue) {
      cleaned[key] = normalizedValue;
    }
  }

  return cleaned;
}

function isValidEmail(
  value: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
    value.trim().toLowerCase()
  );
}

function isValidHttpUrl(
  value: string
): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

export async function POST(
  request: Request
) {
  try {
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
          status: "UNAUTHORIZED",
          message:
            "Please log in to use the AI Email Composer.",
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
        "id, company_name, login_email, generate_email_webhook_url, status"
      )
      .eq(
        "login_email",
        loginEmail
      )
      .maybeSingle<ClientRecord>();

    if (clientError) {
      console.error(
        "Composer client lookup failed:",
        clientError
      );

      return NextResponse.json(
        {
          success: false,
          status:
            "CLIENT_LOOKUP_FAILED",
          message:
            "Client configuration could not be loaded.",
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
          status:
            "CLIENT_NOT_REGISTERED",
          message:
            "Your email is not registered. Please contact the administrator.",
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
          status:
            "CLIENT_INACTIVE",
          message:
            "Your account is inactive. Please contact the administrator.",
        },
        {
          status: 403,
        }
      );
    }

    const storedWebhookUrl =
      client
        .generate_email_webhook_url
        ?.trim() ?? "";

    if (!storedWebhookUrl) {
      return NextResponse.json(
        {
          success: false,
          status:
            "COMPOSER_WEBHOOK_NOT_CONFIGURED",
          message:
            "AI Email Composer webhook is not configured for this client.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !isValidHttpUrl(
        storedWebhookUrl
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          status:
            "INVALID_COMPOSER_WEBHOOK_URL",
          message:
            "The configured AI Email Composer webhook URL is invalid.",
        },
        {
          status: 500,
        }
      );
    }

    let body: ComposerRequest;

    try {
      body =
        (await request.json()) as ComposerRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_JSON",
          message:
            "The request body must contain valid JSON.",
        },
        {
          status: 400,
        }
      );
    }

    const recipientName =
      cleanString(
        body.recipientName
      );

    const recipientEmail =
      cleanString(
        body.recipientEmail
      ).toLowerCase();

    const emailCategory =
      cleanString(
        body.emailCategory
      ) ||
      "General Business Email";

    const instructions =
      cleanString(
        body.instructions
      );

    const tone =
      cleanString(body.tone) ||
      "Professional";

    const length =
      cleanString(body.length) ||
      "Medium";

    const language =
      cleanString(
        body.language
      ) ||
      "English";

    const categoryDetails =
      cleanCategoryDetails(
        body.categoryDetails
      );

    if (!recipientEmail) {
      return NextResponse.json(
        {
          success: false,
          status:
            "VALIDATION_ERROR",
          message:
            "Recipient email is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidEmail(
        recipientEmail
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          status:
            "VALIDATION_ERROR",
          message:
            "Please enter a valid recipient email address.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      instructions.length < 10
    ) {
      return NextResponse.json(
        {
          success: false,
          status:
            "VALIDATION_ERROR",
          message:
            "Instructions must contain at least 10 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const controller =
      new AbortController();

    const timeoutId =
      setTimeout(() => {
        controller.abort();
      }, 60000);

    let webhookResponse: Response;

    try {
      webhookResponse =
        await fetch(
          storedWebhookUrl,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify({
                recipientName,
                recipientEmail,
                emailCategory,
                instructions,
                tone,
                length,
                language,
                categoryDetails,

                clientId:
                  client.id,

                clientEmail:
                  client.login_email,

                companyName:
                  client.company_name,

                companyEmail:
                  client.login_email,
              }),

            cache:
              "no-store",

            signal:
              controller.signal,
          }
        );
    } catch (error) {
      if (
        error instanceof Error &&
        error.name ===
          "AbortError"
      ) {
        return NextResponse.json(
          {
            success: false,
            status:
              "AI_REQUEST_TIMEOUT",
            message:
              "Email generation took too long. Please try again.",
          },
          {
            status: 504,
          }
        );
      }

      console.error(
        "Unable to connect to n8n AI Email Composer:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          status:
            "N8N_CONNECTION_ERROR",
          message:
            "Unable to connect to the AI Email Composer service.",
        },
        {
          status: 502,
        }
      );
    } finally {
      clearTimeout(
        timeoutId
      );
    }

    let data:
      N8nComposerResponse;

    try {
      data =
        (await webhookResponse.json()) as N8nComposerResponse;
    } catch {
      return NextResponse.json(
        {
          success: false,
          status:
            "INVALID_N8N_RESPONSE",
          message:
            "The AI Email Composer returned an invalid response.",
        },
        {
          status: 502,
        }
      );
    }

    if (
      !webhookResponse.ok ||
      data.success !== true
    ) {
      const message =
        data.message ||
        data.validationErrors?.[0] ||
        data.errors?.[0] ||
        data.securityReasons?.[0] ||
        data.reasons?.[0] ||
        "Unable to generate the email.";

      return NextResponse.json(
        {
          ...data,
          success: false,
          message,
        },
        {
          status:
            webhookResponse.status >=
                400 &&
            webhookResponse.status <=
                599
              ? webhookResponse.status
              : 500,
        }
      );
    }

    if (
      !data
        .generatedEmail
        ?.subject ||
      !data
        .generatedEmail
        ?.body
    ) {
      return NextResponse.json(
        {
          success: false,
          status:
            "INCOMPLETE_GENERATED_EMAIL",
          message:
            "The AI response did not contain a complete subject and body.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json(
      {
        ...data,

        client: {
          id:
            client.id,

          companyName:
            client.company_name,

          loginEmail:
            client.login_email,

          status:
            client.status,
        },
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
    console.error(
      "AI Email Composer API route failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        status:
          "INTERNAL_SERVER_ERROR",
        message:
          "An unexpected error occurred while generating the email.",
      },
      {
        status: 500,
      }
    );
  }
}