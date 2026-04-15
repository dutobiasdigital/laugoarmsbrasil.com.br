import nodemailer from "nodemailer";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  "Content-Type": "application/json",
  "apikey":        SERVICE,
  "Authorization": `Bearer ${SERVICE}`,
};

/* ── Carrega config SMTP do banco ─────────────────────────────── */
async function getSmtpConfig(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${BASE}/site_settings?select=key,value&key=like.smtp.%25`, {
      headers: HEADERS, cache: "no-store",
    });
    const rows: { key: string; value: string }[] = await res.json();
    return Object.fromEntries(rows.map(r => [r.key, r.value ?? ""]));
  } catch { return {}; }
}

/* ── Cria transporter nodemailer ──────────────────────────────── */
export async function createTransporter() {
  const cfg = await getSmtpConfig();
  if (!cfg["smtp.host"] || !cfg["smtp.user"] || !cfg["smtp.password"]) {
    throw new Error("SMTP não configurado. Configure em Admin → Configurações → E-mail.");
  }
  return nodemailer.createTransport({
    host:   cfg["smtp.host"],
    port:   parseInt(cfg["smtp.port"] || "587"),
    secure: cfg["smtp.secure"] === "ssl",
    auth:   { user: cfg["smtp.user"], pass: cfg["smtp.password"] },
    tls:    { rejectUnauthorized: false },
  });
}

/* ── Template base ────────────────────────────────────────────── */
function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#070a12;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#070a12;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0e1520;border:1px solid #141d2c;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#ff1f1f;padding:20px 32px;">
              <p style="margin:0;font-family:'Arial Black',Arial,sans-serif;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:2px;">
                REVISTA MAGNUM
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #141d2c;">
              <p style="margin:0;font-size:11px;color:#253750;text-align:center;">
                © Revista Magnum · <a href="https://revistamagnum.com.br" style="color:#526888;text-decoration:none;">revistamagnum.com.br</a>
                <br>Dúvidas? <a href="mailto:publicidade@revistamagnum.com.br" style="color:#526888;">publicidade@revistamagnum.com.br</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ── Envia e-mail genérico ────────────────────────────────────── */
export async function sendEmail({
  to, subject, html, text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const cfg = await getSmtpConfig();
  const transporter = await createTransporter();
  await transporter.sendMail({
    from:    `"${cfg["smtp.from_name"] || "Revista Magnum"}" <${cfg["smtp.from_email"] || cfg["smtp.user"]}>`,
    replyTo: cfg["smtp.reply_to"] || cfg["smtp.from_email"] || cfg["smtp.user"],
    to,
    subject,
    html,
    text: text ?? subject,
  });
}

/* ── E-mail de confirmação de pagamento ───────────────────────── */
export async function sendPaymentConfirmationEmail({
  payerName,
  payerEmail,
  productLabel,
  amount,
  gateway,
  externalRef,
  guiaSlug,
}: {
  payerName:    string;
  payerEmail:   string;
  productLabel: string;
  amount:       number; // centavos
  gateway:      string;
  externalRef:  string;
  guiaSlug?:    string;
}): Promise<void> {
  const amountStr = (amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const gwLabels: Record<string, string> = {
    mercadopago: "Mercado Pago",
    stripe:      "Stripe",
    pagseguro:   "PagSeguro",
    paypal:      "PayPal",
  };
  const gwLabel = gwLabels[gateway] ?? gateway;

  const profileBtn = guiaSlug
    ? `<tr><td style="padding-top:24px;text-align:center;">
        <a href="https://revistamagnum.com.br/guia/empresa/${guiaSlug}"
           style="background:#ff1f1f;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 32px;border-radius:6px;display:inline-block;">
          Ver meu perfil no Guia →
        </a>
       </td></tr>`
    : "";

  const body = `
    <p style="margin:0 0 6px;font-size:13px;color:#526888;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Pagamento Confirmado</p>
    <h1 style="margin:0 0 16px;font-size:30px;font-weight:900;color:#22c55e;font-family:'Arial Black',Arial,sans-serif;">
      Pagamento realizado!
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#7a9ab5;line-height:24px;">
      Olá, <strong style="color:#d4d4da;">${payerName}</strong>! Seu pagamento foi aprovado com sucesso.
      ${guiaSlug ? "Seu plano no Guia Comercial já está ativo." : ""}
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#070a12;border:1px solid #141d2c;border-radius:10px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #141d2c;">
          <p style="margin:0;font-size:11px;color:#526888;">PRODUTO</p>
          <p style="margin:4px 0 0;font-size:14px;color:#d4d4da;font-weight:bold;">${productLabel}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #141d2c;">
          <p style="margin:0;font-size:11px;color:#526888;">VALOR</p>
          <p style="margin:4px 0 0;font-size:20px;color:#ffffff;font-weight:bold;">${amountStr}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #141d2c;">
          <p style="margin:0;font-size:11px;color:#526888;">GATEWAY</p>
          <p style="margin:4px 0 0;font-size:14px;color:#d4d4da;">${gwLabel}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:11px;color:#526888;">REFERÊNCIA</p>
          <p style="margin:4px 0 0;font-size:11px;color:#253750;font-family:monospace;">${externalRef}</p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${profileBtn}
      <tr>
        <td style="padding-top:16px;">
          <p style="margin:0;font-size:12px;color:#253750;text-align:center;">
            Guarde este e-mail como comprovante. Em caso de dúvidas, entre em contato conosco.
          </p>
        </td>
      </tr>
    </table>
  `;

  await sendEmail({
    to:      payerEmail,
    subject: `✅ Pagamento confirmado — ${productLabel}`,
    html:    wrapHtml("Pagamento confirmado — Revista Magnum", body),
    text:    `Olá ${payerName}, seu pagamento de ${amountStr} para ${productLabel} foi aprovado! Referência: ${externalRef}`,
  });
}

/* ── E-mail de teste ──────────────────────────────────────────── */
export async function sendTestEmail(to: string): Promise<void> {
  const body = `
    <h2 style="margin:0 0 12px;font-size:24px;color:#ffffff;font-weight:bold;">E-mail de teste</h2>
    <p style="margin:0;font-size:15px;color:#7a9ab5;line-height:24px;">
      Se você recebeu este e-mail, o SMTP está configurado corretamente. ✅
    </p>
  `;
  await sendEmail({
    to,
    subject: "✅ Teste de e-mail — Revista Magnum",
    html:    wrapHtml("Teste de e-mail — Revista Magnum", body),
    text:    "E-mail de teste da Revista Magnum. SMTP configurado corretamente.",
  });
}
