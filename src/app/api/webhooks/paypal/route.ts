import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentIntentByRef,
  updatePaymentIntent,
  onPaymentApproved,
  getSettings,
} from "@/lib/payment/shared";

/**
 * PayPal webhook handler
 *
 * PayPal envia eventos JSON com `event_type`.
 * O campo `resource.custom_id` ou `resource.invoice_id` contém nosso external_reference.
 *
 * Ref: https://developer.paypal.com/api/rest/webhooks/
 */

async function getPayPalAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
  try {
    const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });
    const data = await res.json();
    return data.access_token ?? null;
  } catch { return null; }
}

async function verifyPayPalWebhook(
  rawBody: string,
  headers: Record<string, string>,
  accessToken: string,
  webhookId: string
): Promise<boolean> {
  try {
    const res = await fetch("https://api-m.paypal.com/v1/notifications/verify-webhook-signature", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth_algo:         headers["paypal-auth-algo"],
        cert_url:          headers["paypal-cert-url"],
        transmission_id:   headers["paypal-transmission-id"],
        transmission_sig:  headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id:        webhookId,
        webhook_event:     JSON.parse(rawBody),
      }),
    });
    const data = await res.json();
    return data.verification_status === "SUCCESS";
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event   = JSON.parse(rawBody);

    // Só processa pagamentos completados
    const completedTypes = [
      "PAYMENT.CAPTURE.COMPLETED",
      "CHECKOUT.ORDER.APPROVED",
      "PAYMENT.SALE.COMPLETED",
    ];
    if (!completedTypes.includes(event.event_type)) {
      return NextResponse.json({ ok: true });
    }

    const settings     = await getSettings();
    const clientId     = settings["payment.paypal.client_id"];
    const clientSecret = settings["payment.paypal.client_secret"];

    if (!clientId || !clientSecret) {
      return NextResponse.json({ ok: false, error: "PayPal não configurado" }, { status: 500 });
    }

    // Extrai external_reference do recurso (custom_id é onde guardamos)
    const resource    = event.resource ?? {};
    const externalRef =
      resource.custom_id
      ?? resource.invoice_id
      ?? resource.custom
      ?? null;

    if (!externalRef) {
      console.warn("[webhook/paypal] external_reference ausente no evento:", event.event_type);
      return NextResponse.json({ ok: true });
    }

    // Localiza intent
    const intent = await getPaymentIntentByRef(externalRef);
    if (!intent) {
      console.warn("[webhook/paypal] intent não encontrada:", externalRef);
      return NextResponse.json({ ok: true });
    }

    const captureId = resource.id ?? null;

    await updatePaymentIntent(intent.id, {
      gateway_id: captureId,
      status:     "APPROVED",
    });

    await onPaymentApproved({ ...intent, status: "APPROVED" });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[webhook/paypal]", e);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
