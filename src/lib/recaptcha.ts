/**
 * reCAPTCHA v3 — server-side verification utility.
 *
 * Graceful degradation: if RECAPTCHA_SECRET_KEY is not configured,
 * all tokens are considered valid (returns true). This allows the site
 * to function normally before reCAPTCHA keys are provisioned.
 *
 * Usage:
 *   const ok = await verifyRecaptcha(token, "login");
 *   if (!ok) return { error: "Verificação falhou." };
 */

const MIN_SCORE = 0.5;

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Reads the reCAPTCHA secret key from env var first,
 * then falls back to site_settings (saved via admin panel).
 */
async function getSecretKey(): Promise<string> {
  if (process.env.RECAPTCHA_SECRET_KEY) return process.env.RECAPTCHA_SECRET_KEY;
  if (!SERVICE) return "";
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?key=eq.integrations.recaptcha_secret_key&select=value&limit=1`,
      {
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
        next: { revalidate: 300 }, // cache 5 min
      }
    );
    const rows: { value: string | null }[] = await res.json();
    return rows?.[0]?.value?.trim() ?? "";
  } catch { return ""; }
}

export async function verifyRecaptcha(
  token: string,
  expectedAction?: string
): Promise<boolean> {
  const secret = await getSecretKey();

  // Key not configured → graceful pass-through
  if (!secret) return true;

  // Empty token with key configured → reject
  if (!token) return false;

  try {
    const res = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
      }
    );

    const data = (await res.json()) as {
      success: boolean;
      score?: number;
      action?: string;
      "error-codes"?: string[];
    };

    if (!data.success) return false;
    if ((data.score ?? 1) < MIN_SCORE) return false;
    if (expectedAction && data.action && data.action !== expectedAction) return false;

    return true;
  } catch {
    return true; // fail open — don't block users for Google outages
  }
}
