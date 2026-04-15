import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentIntentByRef,
  updatePaymentIntent,
  onPaymentApproved,
  getSettings,
} from "@/lib/payment/shared";

/**
 * PagSeguro webhook handler
 *
 * PagSeguro envia uma notificação POST com `notificationCode` e `notificationType`.
 * Devemos consultar a API do PagSeguro com esse código para obter o status e
 * o `reference` (que é nosso external_reference).
 *
 * Ref: https://dev.pagseguro.uol.com.br/reference/notification-object
 */

function mapPSStatus(code: number): "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REFUNDED" {
  // PagSeguro status codes:
  // 1 = Aguardando pagamento   → PENDING
  // 2 = Em análise             → PENDING
  // 3 = Paga                   → APPROVED
  // 4 = Disponível             → APPROVED
  // 5 = Em disputa             → PENDING
  // 6 = Devolvida              → REFUNDED
  // 7 = Cancelada              → CANCELLED
  // 8 = Debitado               → REFUNDED
  // 9 = Retenção temporária    → PENDING
  switch (code) {
    case 3: case 4:   return "APPROVED";
    case 6: case 8:   return "REFUNDED";
    case 7:           return "CANCELLED";
    default:          return "PENDING";
  }
}

async function getTransactionByCode(
  code: string, email: string, token: string
): Promise<{ reference: string; status: number } | null> {
  try {
    const url = `https://ws.pagseguro.uol.com.br/v3/transactions/notifications/${code}?email=${encodeURIComponent(email)}&token=${token}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const xml = await res.text();
    // Parse simples via regex (evita dependência de xml parser)
    const refMatch    = xml.match(/<reference>(.*?)<\/reference>/);
    const statusMatch = xml.match(/<status>(\d+)<\/status>/);
    if (!refMatch || !statusMatch) return null;
    return { reference: refMatch[1], status: parseInt(statusMatch[1]) };
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    // PagSeguro pode enviar form-urlencoded
    let notificationCode: string | null = null;

    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text   = await req.text();
      const params = new URLSearchParams(text);
      notificationCode = params.get("notificationCode");
    } else {
      const body   = await req.json();
      notificationCode = body?.notificationCode ?? body?.code ?? null;
    }

    if (!notificationCode) {
      return NextResponse.json({ ok: false, error: "notificationCode ausente" }, { status: 400 });
    }

    const settings = await getSettings();
    const email    = settings["payment.pagseguro.email"];
    const token    = settings["payment.pagseguro.token"];

    if (!email || !token) {
      return NextResponse.json({ ok: false, error: "PagSeguro não configurado" }, { status: 500 });
    }

    // Consulta detalhes da transação na API do PagSeguro
    const transaction = await getTransactionByCode(notificationCode, email, token);
    if (!transaction) {
      console.warn("[webhook/pagseguro] falha ao buscar transação:", notificationCode);
      return NextResponse.json({ ok: true }); // 200 para não reenviar
    }

    const externalRef    = transaction.reference;
    const internalStatus = mapPSStatus(transaction.status);

    const intent = await getPaymentIntentByRef(externalRef);
    if (!intent) {
      console.warn("[webhook/pagseguro] intent não encontrada:", externalRef);
      return NextResponse.json({ ok: true });
    }

    await updatePaymentIntent(intent.id, {
      gateway_id: notificationCode,
      status:     internalStatus,
    });

    if (internalStatus === "APPROVED") {
      await onPaymentApproved({ ...intent, status: "APPROVED" });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[webhook/pagseguro]", e);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
