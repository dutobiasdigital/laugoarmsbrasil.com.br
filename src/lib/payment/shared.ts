const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  "Content-Type": "application/json",
  "apikey":        SERVICE,
  "Authorization": `Bearer ${SERVICE}`,
  "Prefer":        "return=representation",
};

/* ── Types ─────────────────────────────────────────────────────── */
export interface PaymentIntent {
  id:                 string;
  gateway:            string;
  gateway_id:         string | null;
  status:             "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REFUNDED";
  product_type:       string;
  product_id:         string | null;
  product_label:      string | null;
  amount:             number; // centavos
  currency:           string;
  payer_name:         string | null;
  payer_email:        string | null;
  metadata:           Record<string, unknown> | null;
  external_reference: string | null;
  checkout_url:       string | null;
  createdAt:          string;
  updatedAt:          string;
}

/* ── DB operations ─────────────────────────────────────────────── */
export async function createPaymentIntent(
  data: Omit<PaymentIntent, "id" | "createdAt" | "updatedAt">
): Promise<PaymentIntent> {
  const res = await fetch(`${BASE}/payment_intents`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(data),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.message ?? "Erro ao criar payment intent");
  return Array.isArray(d) ? d[0] : d;
}

export async function updatePaymentIntent(
  id: string,
  data: Partial<PaymentIntent>
): Promise<void> {
  await fetch(`${BASE}/payment_intents?id=eq.${id}`, {
    method: "PATCH",
    headers: HEADERS,
    body: JSON.stringify({ ...data, updatedAt: new Date().toISOString() }),
  });
}

export async function getPaymentIntentByRef(
  externalReference: string
): Promise<PaymentIntent | null> {
  const res = await fetch(
    `${BASE}/payment_intents?external_reference=eq.${externalReference}&limit=1`,
    { headers: HEADERS, cache: "no-store" }
  );
  const d = await res.json();
  return Array.isArray(d) && d.length > 0 ? d[0] : null;
}

export async function getPaymentIntent(id: string): Promise<PaymentIntent | null> {
  const res = await fetch(
    `${BASE}/payment_intents?id=eq.${id}&limit=1`,
    { headers: HEADERS, cache: "no-store" }
  );
  const d = await res.json();
  return Array.isArray(d) && d.length > 0 ? d[0] : null;
}

/* ── Settings ──────────────────────────────────────────────────── */
export async function getSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(
      `${BASE}/site_settings?select=key,value`,
      { headers: HEADERS, cache: "no-store" }
    );
    const rows: { key: string; value: string }[] = await res.json();
    return Object.fromEntries(rows.map(r => [r.key, r.value ?? ""]));
  } catch { return {}; }
}

export function getActiveGateways(settings: Record<string, string>): string[] {
  const gateways: string[] = [];
  if (settings["payment.mercadopago.enabled"] === "true" && settings["payment.mercadopago.access_token"])
    gateways.push("mercadopago");
  if (settings["payment.stripe.enabled"] === "true" && settings["payment.stripe.secret_key"])
    gateways.push("stripe");
  if (settings["payment.pagseguro.enabled"] === "true" && settings["payment.pagseguro.token"])
    gateways.push("pagseguro");
  if (settings["payment.paypal.enabled"] === "true" && settings["payment.paypal.client_id"])
    gateways.push("paypal");
  return gateways;
}

/* ── Business logic após pagamento aprovado ────────────────────── */
export async function onPaymentApproved(intent: PaymentIntent): Promise<void> {
  if (intent.product_type === "guia_plan") {
    const meta = intent.metadata as { slug?: string; plan?: string } | null;
    if (!meta?.slug || !meta?.plan) return;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await fetch(`${BASE}/guide_listings?slug=eq.${meta.slug}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=minimal" },
      body: JSON.stringify({
        plan:          meta.plan,
        status:        "ACTIVE",
        planExpiresAt: expiresAt.toISOString(),
        updatedAt:     new Date().toISOString(),
      }),
    });
  }
  // Outros product_types podem ser adicionados aqui
}
