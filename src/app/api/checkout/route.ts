import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent, updatePaymentIntent, getSettings } from "@/lib/payment/shared";
import { createMPPreference } from "@/lib/payment/mercadopago";
import { createStripeSession } from "@/lib/payment/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://revistamagnum.com.br";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      gateway,
      product_type,
      product_id,
      product_label,
      amount_cents,   // centavos
      payer_name,
      payer_email,
      metadata,       // objeto livre (ex: { slug, plan })
    } = body;

    if (!gateway || !product_type || !product_label || !amount_cents || !payer_email) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
    }

    const settings      = await getSettings();
    const externalRef   = crypto.randomUUID();

    // 1. Salva intent como PENDING
    const intent = await createPaymentIntent({
      gateway,
      gateway_id:         null,
      status:             "PENDING",
      product_type,
      product_id:         product_id ?? null,
      product_label,
      amount:             amount_cents,
      currency:           "BRL",
      payer_name:         payer_name ?? null,
      payer_email,
      metadata:           metadata ?? null,
      external_reference: externalRef,
      checkout_url:       null,
    });

    const successUrl = `${APP_URL}/pagamento/sucesso?ref=${externalRef}`;
    const errorUrl   = `${APP_URL}/pagamento/erro?ref=${externalRef}`;

    let checkoutUrl: string;

    // 2. Chama o gateway escolhido
    if (gateway === "mercadopago") {
      const accessToken = settings["payment.mercadopago.access_token"];
      if (!accessToken) throw new Error("Mercado Pago não configurado.");

      const pref = await createMPPreference({
        accessToken,
        title:             product_label,
        amountBRL:         amount_cents / 100,
        externalReference: externalRef,
        payerEmail:        payer_email,
        payerName:         payer_name,
        backUrls:          { success: successUrl, failure: errorUrl, pending: successUrl },
        notificationUrl:   `${APP_URL}/api/webhooks/mercadopago`,
      });

      checkoutUrl = pref.init_point;

    } else if (gateway === "stripe") {
      const secretKey = settings["payment.stripe.secret_key"];
      if (!secretKey) throw new Error("Stripe não configurado.");

      const session = await createStripeSession({
        secretKey,
        productLabel:  product_label,
        amountCents:   amount_cents,
        currency:      "BRL",
        externalRef,
        customerEmail: payer_email,
        successUrl:    `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl:     errorUrl,
      });

      checkoutUrl = session.url;

    } else {
      return NextResponse.json(
        { error: `Gateway "${gateway}" ainda não suportado.` },
        { status: 400 }
      );
    }

    // 3. Salva a URL de checkout na intent
    await updatePaymentIntent(intent.id, { checkout_url: checkoutUrl });

    return NextResponse.json({ checkout_url: checkoutUrl, intent_id: intent.id });
  } catch (e: unknown) {
    console.error("[checkout]", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
