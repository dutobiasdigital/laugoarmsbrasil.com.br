import { NextRequest, NextResponse } from "next/server";
import { getPaymentIntentByRef, updatePaymentIntent, onPaymentApproved, getSettings } from "@/lib/payment/shared";
import { getMPPayment, mapMPStatus } from "@/lib/payment/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MP envia diferentes tipos de notificações
    const type     = body?.type;
    const topic    = body?.topic;
    const paymentId =
      body?.data?.id          // webhook v2 (tipo "payment")
      ?? body?.id              // webhook legado
      ?? null;

    // Ignora notificações que não são de pagamento
    if (type !== "payment" && topic !== "payment") {
      return NextResponse.json({ ok: true });
    }

    if (!paymentId) {
      return NextResponse.json({ ok: false, error: "payment id ausente" }, { status: 400 });
    }

    const settings    = await getSettings();
    const accessToken = settings["payment.mercadopago.access_token"];
    if (!accessToken) return NextResponse.json({ ok: false, error: "MP não configurado" }, { status: 500 });

    // Busca detalhes do pagamento na MP API
    const mpPayment      = await getMPPayment(accessToken, String(paymentId));
    const externalRef    = mpPayment.external_reference as string;
    const mpStatus       = mpPayment.status as string;
    const internalStatus = mapMPStatus(mpStatus);

    if (!externalRef) return NextResponse.json({ ok: false, error: "external_reference ausente" }, { status: 400 });

    // Localiza o intent no nosso banco
    const intent = await getPaymentIntentByRef(externalRef);
    if (!intent) {
      console.warn("[webhook/mp] intent não encontrada para ref:", externalRef);
      return NextResponse.json({ ok: true }); // 200 para não reenviar
    }

    // Atualiza o status
    await updatePaymentIntent(intent.id, {
      gateway_id: String(paymentId),
      status:     internalStatus,
    });

    // Dispara lógica de negócio se aprovado
    if (internalStatus === "APPROVED") {
      await onPaymentApproved({ ...intent, status: "APPROVED" });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[webhook/mercadopago]", e);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
