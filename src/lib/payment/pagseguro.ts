/**
 * PagSeguro v4 API — Checkout redirect
 * Ref: https://dev.pagseguro.uol.com.br/reference/create-order
 */

interface PSOrderItem {
  name:        string;
  unit_amount: number; // centavos
  quantity:    number;
}

interface CreatePSOrderParams {
  token:           string;
  email:           string;
  title:           string;
  amountCents:     number;
  externalRef:     string;
  payerEmail:      string;
  payerName?:      string;
  successUrl:      string;
  notificationUrl: string;
}

interface PSOrderResponse {
  id:    string;
  links: Array<{ rel: string; href: string; media?: string; type?: string }>;
}

export async function createPSOrder(params: CreatePSOrderParams): Promise<{ paymentUrl: string; orderId: string }> {
  const [firstName, ...rest] = (params.payerName ?? params.payerEmail).split(" ");
  const lastName = rest.join(" ") || firstName;

  const body = {
    reference_id: params.externalRef,
    customer: {
      name:  `${firstName} ${lastName}`,
      email: params.payerEmail,
    },
    items: [{
      reference_id: params.externalRef,
      name:         params.title.slice(0, 100),
      quantity:     1,
      unit_amount:  params.amountCents,
    } as PSOrderItem],
    notification_urls: [params.notificationUrl],
    redirect_url:      params.successUrl,
    payment_methods:   [
      { type: "CREDIT_CARD" },
      { type: "DEBIT_CARD"  },
      { type: "BOLETO"      },
      { type: "PIX"         },
    ],
  };

  const res = await fetch("https://api.pagseguro.com/orders", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${params.token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`PagSeguro API error: ${JSON.stringify(err)}`);
  }

  const data: PSOrderResponse = await res.json();
  const payLink = data.links?.find(l => l.rel === "PAY" || l.rel === "pay");

  if (!payLink?.href) {
    throw new Error("PagSeguro: URL de pagamento não retornada na resposta.");
  }

  return { paymentUrl: payLink.href, orderId: data.id };
}
