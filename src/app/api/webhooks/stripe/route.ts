import { NextRequest, NextResponse } from "next/server";
import { getPaymentIntentByRef, updatePaymentIntent, onPaymentApproved, getSettings } from "@/lib/payment/shared";
import { verifyStripeWebhook } from "@/lib/payment/stripe";

export async function POST(req: NextRequest) {
  try {
    const rawBody  = await req.text();
    const sigHeader = req.headers.get("stripe-signature") ?? "";

    const settings = await getSettings();
    const secret   = settings["payment.stripe.webhook_secret"];

    // Verifica assinatura (pula se secret não configurado em dev)
    if (secret && !verifyStripeWebhook(rawBody, sigHeader, secret)) {
      return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Só processa checkout.session.completed
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ ok: true });
    }

    const session     = event.data?.object;
    const externalRef = session?.metadata?.external_reference as string | undefined;
    const sessionId   = session?.id as string | undefined;

    if (!externalRef) {
      console.warn("[webhook/stripe] external_reference ausente na session");
      return NextResponse.json({ ok: true });
    }

    const intent = await getPaymentIntentByRef(externalRef);
    if (!intent) {
      console.warn("[webhook/stripe] intent não encontrada para ref:", externalRef);
      return NextResponse.json({ ok: true });
    }

    await updatePaymentIntent(intent.id, {
      gateway_id: sessionId ?? null,
      status:     "APPROVED",
    });

    await onPaymentApproved({ ...intent, status: "APPROVED" });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[webhook/stripe]", e);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
