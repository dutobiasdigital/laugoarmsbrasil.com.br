"use client";

import { useState } from "react";

const inputCls = "bg-[#0e1520] border border-[#1c2a3e] rounded-[6px] h-[44px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";

const GATEWAY_LABELS: Record<string, { icon: string; name: string }> = {
  mercadopago: { icon: "🟡", name: "Mercado Pago" },
  stripe:      { icon: "🟣", name: "Stripe"        },
  pagseguro:   { icon: "🟢", name: "PagSeguro"     },
  paypal:      { icon: "🔵", name: "PayPal"         },
};

const PERIOD_LABEL: Record<number, string> = { 1: "mês", 3: "trimestre", 6: "semestre", 12: "ano" };

interface Props {
  slug:           string;
  planName:       string;
  amountCents:    number;
  intervalMonths: number;
  activeGateways: string[];
  defaultName:    string;
  defaultEmail:   string;
  mode?:          "subscription" | "edition";
  editionSlug?:   string;
}

export default function CheckoutForm({
  slug, planName, amountCents, intervalMonths,
  activeGateways, defaultName, defaultEmail,
  mode = "subscription", editionSlug,
}: Props) {
  const [name, setName]       = useState(defaultName);
  const [email, setEmail]     = useState(defaultEmail);
  const [gateway, setGateway] = useState(activeGateways[0] ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const periodLabel = PERIOD_LABEL[intervalMonths] ?? "período";
  const priceStr    = (amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const hasGateways = activeGateways.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasGateways || !gateway) return;
    setLoading(true); setError(null);
    try {
      const isEdition = mode === "edition";
      const res = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          gateway,
          product_type:  isEdition ? "edition_purchase" : "magazine_subscription",
          product_id:    slug,
          product_label: isEdition
            ? `Acesso avulso — ${planName} — Revista Magnum`
            : `Assinatura ${planName} — Revista Magnum`,
          amount_cents:  amountCents,
          payer_name:    name,
          payer_email:   email,
          metadata:      isEdition
            ? { edition_slug: editionSlug ?? slug }
            : { plan: slug },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao iniciar pagamento.");
      if (!data.checkout_url) throw new Error("URL de pagamento não recebida.");
      window.location.href = data.checkout_url;
    } catch (err: unknown) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  /* ── Sem gateway configurado ─────────────────────────────── */
  if (!hasGateways) {
    return (
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-8 text-center">
        <p className="text-[36px] mb-3">🔧</p>
        <p className="text-white text-[18px] font-bold mb-2">Pagamentos em configuração</p>
        <p className="text-[#526888] text-[14px] leading-[22px] mb-5">
          O sistema de pagamento ainda está sendo configurado. Fale conosco para assinar.
        </p>
        <a href="mailto:publicidade@revistamagnum.com.br"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-6 flex items-center justify-center rounded-[6px] transition-colors">
          Falar com nossa equipe →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Dados pessoais */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5 flex flex-col gap-4">
        <p className="text-[#ff1f1f] text-[10px] font-semibold tracking-[1.5px] uppercase">
          Seus dados
        </p>
        <div>
          <label className={labelCls}>Nome completo *</label>
          <input
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="João da Silva"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>E-mail *</label>
          <input
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="joao@email.com"
            className={inputCls}
          />
        </div>
      </div>

      {/* Forma de pagamento (só se > 1 gateway) */}
      {activeGateways.length > 1 && (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
          <p className="text-[#ff1f1f] text-[10px] font-semibold tracking-[1.5px] uppercase mb-3">
            Forma de pagamento
          </p>
          <div className="grid grid-cols-2 gap-2">
            {activeGateways.map(gw => {
              const meta = GATEWAY_LABELS[gw] ?? { icon: "💳", name: gw };
              return (
                <button
                  key={gw}
                  type="button"
                  onClick={() => setGateway(gw)}
                  className={`flex items-center gap-2.5 h-[44px] px-3 rounded-[8px] border transition-all text-[14px] ${
                    gateway === gw
                      ? "border-[#ff1f1f] bg-[#260a0a] text-white"
                      : "border-[#1c2a3e] bg-[#070a12] text-[#7a9ab5] hover:border-[#526888]"
                  }`}
                >
                  <span className="text-[16px]">{meta.icon}</span>
                  <span className="font-medium">{meta.name}</span>
                  {gateway === gw && <span className="ml-auto text-[#ff1f1f] text-[12px]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f]/30 rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      {/* Resumo */}
      <div className="bg-[#070a12] border border-[#141d2c] rounded-[10px] p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[#526888] text-[12px] mb-0.5">
            {mode === "edition" ? "Você está comprando" : "Você está assinando"}
          </p>
          <p className="text-white text-[14px] font-bold">
            {mode === "edition"
              ? `${planName} — Acesso 30 dias`
              : `Revista Magnum ${planName} · ${priceStr}/${periodLabel}`
            }
          </p>
          <p className="text-white text-[11px]">
            {mode === "edition"
              ? "Pagamento único · acesso por 30 dias corridos"
              : "Renova automaticamente · cancele quando quiser"
            }
          </p>
        </div>
        {activeGateways.length === 1 && (
          <span className="text-[20px] shrink-0">
            {GATEWAY_LABELS[activeGateways[0]]?.icon ?? "💳"}
          </span>
        )}
      </div>

      {/* CTA */}
      <button
        type="submit"
        disabled={loading || !gateway}
        className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[15px] font-semibold h-[50px] rounded-[8px] transition-colors"
      >
        {loading ? "Processando..." : "Finalizar assinatura →"}
      </button>

      <p className="text-white text-[12px] text-center">
        Você será redirecionado para o pagamento seguro.
      </p>

      <a
        href={mode === "edition" && editionSlug ? `/edicoes/${editionSlug}` : "/assine"}
        className="text-[#526888] hover:text-white text-[13px] text-center transition-colors"
      >
        {mode === "edition" ? "← Voltar à edição" : "← Voltar aos planos"}
      </a>
    </form>
  );
}
