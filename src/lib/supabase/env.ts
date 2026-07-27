function cleanEnvValue(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\uFEFF/g, "");
}

export function getSupabaseEnv() {
  const url = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = cleanEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing from the root .env.local file."
    );
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL value: ${JSON.stringify(url)}`
    );
  }

  if (!publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing from the root .env.local file."
    );
  }

  return {
    url,
    publishableKey,
  };
}