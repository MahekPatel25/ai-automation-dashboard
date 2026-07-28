import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClientRecord = {
  id: string;
  company_name: string;
  login_email: string;
  n8n_webhook_url: string;
  status: "active" | "inactive";
};

function isValidHttpUrl(value: string): boolean {
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

export async function GET() {
  try {
    const supabase = await createClient();

    // Logged-in Supabase user verify karo
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message:
            "Please log in to access dashboard data.",
        },
        {
          status: 401,
        }
      );
    }

    const loginEmail = user.email
      .trim()
      .toLowerCase();

    // Logged-in email ka client record load karo
    const {
      data: client,
      error: clientError,
    } = await supabase
      .from("clients")
      .select(
        "id, company_name, login_email, n8n_webhook_url, status"
      )
      .eq("login_email", loginEmail)
      .maybeSingle<ClientRecord>();

    if (clientError) {
      console.error(
        "Client lookup failed:",
        clientError
      );

      return NextResponse.json(
        {
          success: false,
          error: "CLIENT_LOOKUP_FAILED",
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
          error: "CLIENT_NOT_REGISTERED",
          message:
            "Your email is not registered. Please contact the administrator.",
        },
        {
          status: 403,
        }
      );
    }

    if (client.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: "CLIENT_INACTIVE",
          message:
            "Your dashboard access is currently inactive. Please contact the administrator.",
        },
        {
          status: 403,
        }
      );
    }

    const storedWebhookUrl =
      client.n8n_webhook_url.trim();

    if (!isValidHttpUrl(storedWebhookUrl)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_WEBHOOK_URL",
          message:
            "The client's n8n webhook URL is invalid.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Important:
     * Client record sirf correct webhook select karta hai.
     *
     * Webhook URL ke andar login email, client ID ya
     * company name add nahi kiya ja raha.
     *
     * Isliye multiple active clients same webhook URL
     * use karke same dashboard data dekh sakte hain.
     */
    const webhookResponse = await fetch(
      storedWebhookUrl,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!webhookResponse.ok) {
      const responseText =
        await webhookResponse.text();

      console.error("n8n webhook error:", {
        status: webhookResponse.status,
        responseText,
      });

      return NextResponse.json(
        {
          success: false,
          error: "N8N_WEBHOOK_FAILED",
          message: `n8n returned status ${webhookResponse.status}.`,
        },
        {
          status: 502,
        }
      );
    }

    const contentType =
      webhookResponse.headers.get(
        "content-type"
      ) ?? "";

    let dashboardData: unknown;

    if (
      contentType.includes("application/json")
    ) {
      dashboardData =
        await webhookResponse.json();
    } else {
      const responseText =
        await webhookResponse.text();

      try {
        dashboardData =
          JSON.parse(responseText);
      } catch {
        dashboardData = {
          rawResponse: responseText,
        };
      }
    }

    return NextResponse.json(
      {
        success: true,

        client: {
          id: client.id,
          companyName: client.company_name,
          loginEmail: client.login_email,
          status: client.status,
        },

        data: dashboardData,
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
      "Dashboard data API error:",
      error
    );

    const timeoutError =
      error instanceof Error &&
      (error.name === "TimeoutError" ||
        error.name === "AbortError");

    return NextResponse.json(
      {
        success: false,
        error: timeoutError
          ? "N8N_TIMEOUT"
          : "INTERNAL_SERVER_ERROR",
        message: timeoutError
          ? "n8n did not respond within 15 seconds."
          : "Dashboard data could not be loaded.",
      },
      {
        status: timeoutError ? 504 : 500,
      }
    );
  }
}