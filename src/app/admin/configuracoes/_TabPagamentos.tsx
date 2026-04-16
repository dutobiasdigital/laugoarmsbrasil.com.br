"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls } from "./_ConfiguracoesClient";

const APP_URL = "https://revistamagnum.com.br";

interface Props { settings: Record<string, string>; }

const GATEWAYS = [
  {
    id:          "mercadopago",
    name:        "Mercado Pago",
    icon:        "🟡",
    badge:       "Recomendado — Brasil",
    badgeColor:  "bg-[#0f381f] text-[#22c55e]",
    description: "Pix, Boleto, Cartão de crédito/débito. Melhor opção para o mercado brasileiro.",
    keys: [
      { key: "payment.mercadopago.access_token",  label: "Access Token (servidor)",     ph: "APP_USR-...",  secret: true  },
      { key: "payment.mercadopago.public_key",     label: "Public Key (frontend)",       ph: "APP_USR-...",  secret: false },
      { key: "payment.mercadopago.webhook_secret", label: "Webhook Secret (opcional)",   ph: "",             secret: true  },
    ],
    webhookPath: "/api/webhooks/mercadopago",
    docsUrl:     "https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing",
  },
  {
    id:          "stripe",
    name:        "Stripe",
    icon:        "🟣",
    badge:       "Internacional",
    badgeColor:  "bg-[#1a1a40] text-[#818cf8]",
    description: "Cartões internacionais, Link, Apple Pay e Google Pay. Melhor UX de checkout.",
    keys: [
      { key: "payment.stripe.secret_key",      label: "Secret Key (servidor)", ph: "sk_live_...",   secret: true  },
      { key: "payment.stripe.publishable_key", label: "Publishable Key",       ph: "pk_live_...",   secret: false },
      { key: "payment.stripe.webhook_secret",  label: "Webhook Secret",        ph: "whsec_...",     secret: true  },
    ],
    webhookPath: "/api/webhooks/stripe",
    docsUrl:     "https://dashboard.stripe.com/webhooks",
  },
  {
    id:          "pagseguro",
    name:        "PagSeguro",
    icon:        "🟢",
    badge:       "Brasil — alternativo",
    badgeColor:  "bg-[#141d2c] text-[#526888]",
    description: "Alternativa brasileira ao Mercado Pago. Suporta boleto, Pix e cartão.",
    keys: [
      { key: "payment.pagseguro.token", label: "Token de integração", ph: "...", secret: true  },
      { key: "payment.pagseguro.email", label: "E-mail da conta",     ph: "...", secret: false },
    ],
    webhookPath: "/api/webhooks/pagseguro",
    docsUrl:     "https://dev.pagseguro.uol.com.br/reference",
  },
  {
    id:          "paypal",
    name:        "PayPal",
    icon:        "🔵",
    badge:       "Internacional",
    badgeColor:  "bg-[#141d2c] text-[#526888]",
    description: "Pagamentos internacionais via conta PayPal ou cartão.",
    keys: [
      { key: "payment.paypal.client_id",     label: "Client ID",     ph: "...", secret: false },
      { key: "payment.paypal.client_secret", label: "Client Secret", ph: "...", secret: true  },
    ],
    webhookPath: "/api/webhooks/paypal",
    docsUrl:     "https://developer.paypal.com/dashboard",
  },
];

export default function TabPagamentos({ settings }: Props) {
  // Inicializa todos os valores dos settings
  const initValues = () => {
    const vals: Record<string, string> = {};
    for (const g of GATEWAYS) {
      vals[`payment.${g.id}.enabled`] = settings[`payment.${g.id}.enabled`] ?? "false";
      for (const k of g.keys) vals[k.key] = settings[k.key] ?? "";
    }
    vals["payment.default_gateway"] = settings["payment.default_gateway"] ?? "mercadopago";
    return vals;
  };

  const [values, setValues]     = useState<Record<string, string>>(initValues);
  const [shown, setShown]       = useState<Record<string, boolean>>({});
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);

  function toggle(gatewayId: string) {
    const key = `payment.${gatewayId}.enabled`;
    setValues(v => ({ ...v, [key]: v[key] === "true" ? "false" : "true" }));
  }
  function isEnabled(id: string) { return values[`payment.${id}.enabled`] === "true"; }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const result = await saveSettings(values);
    if (result.error) setError(result.error);
    else setSaved(true);
    setSaving(false);
    if (result.ok) setTimeout(() => setSaved(false), 3000);
  }

  function copyWebhook(path: string) {
    navigator.clipboard.writeText(`${APP_URL}${path}`);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">
          Gateways de Pagamento
        </h2>
        <p className="text-[#526888] text-[13px]">
          Ative e configure os meios de pagamento disponíveis no site. As chaves são salvas de forma segura e nunca expostas ao público.
        </p>
      </div>

      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>
      )}

      {/* Cards de gateway */}
      {GATEWAYS.map(gw => {
        const enabled = isEnabled(gw.id);
        return (
          <section key={gw.id} className={`bg-[#0e1520] border rounded-[12px] p-6 flex flex-col gap-4 transition-colors ${
            enabled ? "border-[#ff1f1f]/30" : "border-[#141d2c]"
          }`}>
            {/* Header do gateway */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[24px]">{gw.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-[16px] font-bold">{gw.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${gw.badgeColor}`}>
                      {gw.badge}
                    </span>
                  </div>
                  <p className="text-[#526888] text-[12px] mt-0.5">{gw.description}</p>
                </div>
              </div>
              {/* Toggle */}
              <button
                type="button"
                onClick={() => toggle(gw.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  enabled ? "bg-[#ff1f1f]" : "bg-[#1c2a3e]"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>

            {/* Campos — só aparecem quando habilitado */}
            {enabled && (
              <>
                <div className="border-t border-[#141d2c]" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gw.keys.map(k => (
                    <div key={k.key}>
                      <label className={labelCls}>{k.label}</label>
                      <div className="relative">
                        <input
                          type={k.secret && !shown[k.key] ? "password" : "text"}
                          value={values[k.key] ?? ""}
                          onChange={e => setValues(v => ({ ...v, [k.key]: e.target.value }))}
                          placeholder={k.ph}
                          className={`${inputCls} pr-16`}
                          autoComplete="off"
                        />
                        {k.secret && (
                          <button
                            type="button"
                            onClick={() => setShown(s => ({ ...s, [k.key]: !s[k.key] }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-[#7a9ab5] text-[11px] transition-colors"
                          >
                            {shown[k.key] ? "Ocultar" : "Mostrar"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Webhook URL */}
                <div className="bg-[#070a12] border border-[#141d2c] rounded-[8px] p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-[10px] font-semibold uppercase tracking-wide mb-0.5">URL do Webhook</p>
                    <p className="text-[#526888] text-[12px] font-mono truncate">
                      {APP_URL}{gw.webhookPath}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyWebhook(gw.webhookPath)}
                      className="bg-[#141d2c] hover:bg-[#1c2a3e] text-[#7a9ab5] text-[11px] h-[28px] px-2.5 rounded-[4px] transition-colors"
                    >
                      Copiar
                    </button>
                    <a
                      href={gw.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#141d2c] hover:bg-[#1c2a3e] text-[#7a9ab5] text-[11px] h-[28px] px-2.5 rounded-[4px] transition-colors flex items-center"
                    >
                      Docs ↗
                    </a>
                  </div>
                </div>
              </>
            )}
          </section>
        );
      })}

      {/* Gateway padrão */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
        <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">Configurações gerais</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Gateway padrão</label>
            <select
              value={values["payment.default_gateway"]}
              onChange={e => setValues(v => ({ ...v, "payment.default_gateway": e.target.value }))}
              className="bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors"
            >
              {GATEWAYS.map(g => (
                <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Salvar */}
      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
        <button type="submit" disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors">
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
        {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo com sucesso!</p>}
      </div>
    </form>
  );
}
