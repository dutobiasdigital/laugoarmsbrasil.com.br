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

const SECRET = process.env.RECAPTCHA_SECRET_KEY ?? "";

// Minimum score threshold (reCAPTCHA v3 returns 0.0–1.0)
const MIN_SCORE = 0.5;

export async function verifyRecaptcha(
  token: string,
  expectedAction?: string
): Promise<boolean> {
  // Key not configured → graceful pass-through
  if (!SECRET) return true;

  // Empty token with key configured → reject
  if (!token) return false;

  try {
    const res = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(SECRET)}&response=${encodeURIComponent(token)}`,
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
    // Network error verifying → fail open (don't block users for Google outage)
    return true;
  }
}
