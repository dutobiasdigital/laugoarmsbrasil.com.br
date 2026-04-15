import crypto from "crypto";

export interface StripeSession {
  id:  string;
  url: string;
}

export async function createStripeSession(params: {
  secretKey:     string;
  productLabel:  string;
  amountCents:   number;
  currency:      string;
  externalRef:   string;
  customerEmail: string;
  successUrl:    string;
  cancelUrl:     string;
}): Promise<StripeSession> {
  const body = new URLSearchParams({
    mode:                                              "payment",
    "line_items[0][price_data][currency]":             params.currency.toLowerCase(),
    "line_items[0][price_data][product_data][name]":   params.productLabel,
    "line_items[0][price_data][unit_amount]":          params.amountCents.toString(),
    "line_items[0][quantity]":                         "1",
    "metadata[external_reference]":                    params.externalRef,
    success_url:                                       params.successUrl,
    cancel_url:                                        params.cancelUrl,
  });

  if (params.customerEmail) body.append("customer_email", params.customerEmail);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method:  "POST",
    headers: {
      "Authorization":  `Bearer ${params.secretKey}`,
      "Content-Type":   "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.error?.message ?? "Stripe: erro ao criar sessão");
  }
  return res.json();
}

/** Verifica assinatura do webhook Stripe */
export function verifyStripeWebhook(
  rawBody:       string,
  signature:     string,
  webhookSecret: string,
): boolean {
  try {
    const parts = Object.fromEntries(
      signature.split(",").map(p => p.split("=") as [string, string])
    );
    const t   = parts["t"];
    const sig = parts["v1"];
    if (!t || !sig) return false;

    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(`${t}.${rawBody}`, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(sig,      "hex"),
    );
  } catch { return false; }
}

/** Busca uma checkout session no Stripe */
export async function getStripeSession(secretKey: string, sessionId: string) {
  const res = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
    { headers: { "Authorization": `Bearer ${secretKey}` } }
  );
  if (!res.ok) throw new Error("Stripe: sessão não encontrada");
  return res.json();
}
