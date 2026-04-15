/**
 * PayPal Checkout Orders API v2
 * Ref: https://developer.paypal.com/api/orders/v2/
 */

interface CreatePayPalOrderParams {
  clientId:     string;
  clientSecret: string;
  title:        string;
  amountCents:  number;
  currency:     string;
  externalRef:  string;
  returnUrl:    string;
  cancelUrl:    string;
}

interface PayPalOrderResponse {
  id:     string;
  status: string;
  links:  Array<{ rel: string; href: string; method: string }>;
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("PayPal: falha ao obter access token");
  const data = await res.json();
  if (!data.access_token) throw new Error("PayPal: access_token não retornado");
  return data.access_token;
}

export async function createPayPalOrder(
  params: CreatePayPalOrderParams
): Promise<{ approvalUrl: string; orderId: string }> {
  const accessToken = await getAccessToken(params.clientId, params.clientSecret);

  // Converte centavos → valor decimal string (ex: 7900 → "79.00")
  const amountValue = (params.amountCents / 100).toFixed(2);

  const body = {
    intent: "CAPTURE",
    purchase_units: [{
      reference_id: params.externalRef,
      custom_id:    params.externalRef, // usado no webhook para correlação
      description:  params.title.slice(0, 127),
      amount: {
        currency_code: params.currency,
        value:         amountValue,
      },
    }],
    application_context: {
      brand_name:          "Revista Magnum",
      landing_page:        "NO_PREFERENCE",
      user_action:         "PAY_NOW",
      return_url:          params.returnUrl,
      cancel_url:          params.cancelUrl,
    },
  };

  const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`PayPal API error: ${JSON.stringify(err)}`);
  }

  const data: PayPalOrderResponse = await res.json();
  const approveLink = data.links?.find(l => l.rel === "approve" || l.rel === "payer-action");

  if (!approveLink?.href) {
    throw new Error("PayPal: URL de aprovação não retornada na resposta.");
  }

  return { approvalUrl: approveLink.href, orderId: data.id };
}
