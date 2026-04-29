export interface MPPreference {
  id:                   string;
  init_point:           string;
  sandbox_init_point:   string;
}

export async function createMPPreference(params: {
  accessToken:       string;
  title:             string;
  amountBRL:         number;  // valor em reais (não centavos)
  externalReference: string;
  payerEmail?:       string;
  payerName?:        string;
  backUrls:          { success: string; failure: string; pending: string };
  notificationUrl:   string;
}): Promise<MPPreference> {
  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify({
      items: [{
        title:       params.title,
        quantity:    1,
        unit_price:  params.amountBRL,
        currency_id: "BRL",
      }],
      payer: {
        email: params.payerEmail ?? "",
        name:  params.payerName  ?? "",
      },
      external_reference:    params.externalReference,
      back_urls:             params.backUrls,
      auto_return:           "approved",
      notification_url:      params.notificationUrl,
      statement_descriptor:  "Laúgo Arms Brasil",
    }),
  });

  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.message ?? "Mercado Pago: erro ao criar preferência");
  }
  return res.json();
}

export async function getMPPayment(accessToken: string, paymentId: string) {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { "Authorization": `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error("Mercado Pago: pagamento não encontrado");
  return res.json();
}

/** Mapeia o status do MP para o nosso status interno */
export function mapMPStatus(mpStatus: string): "APPROVED" | "PENDING" | "REJECTED" | "CANCELLED" {
  switch (mpStatus) {
    case "approved":            return "APPROVED";
    case "in_process":
    case "pending":
    case "authorized":          return "PENDING";
    case "rejected":            return "REJECTED";
    case "cancelled":
    case "refunded":
    case "charged_back":        return "CANCELLED";
    default:                    return "PENDING";
  }
}
