"use client";

import { useState } from "react";
import Link from "next/link";

const inputCls = "bg-[#0e1520] border border-[#1c2a3e] rounded-[6px] h-[44px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";

const GATEWAY_LABELS: Record<string, { icon: string; name: string }> = {
  mercadopago: { icon: "🟡", name: "Mercado Pago"  },
  stripe:      { icon: "🟣", name: "Stripe"         },
  pagseguro:   { icon: "🟢", name: "PagSeguro"      },
  paypal:      { icon: "🔵", name: "PayPal"          },
};

interface Props {
  slug:           string;
  listingName:    string;
  defaultPlan:    "PREMIUM" | "DESTAQUE";
  activeGateways: string[];
  premiumPrice:   number; // centavos
  destaquePrice:  number; // centavos
}

export default function UpgradeForm({
  slug, listingName, defaultPlan, activeGateways, premiumPrice, destaquePrice,
}: Props) {
  const [plan, setPlan]       = useState<"PREMIUM" | "DESTAQUE">(defaultPlan);
  const [gateway, setGateway] = useState<string>(activeGateways[0] ?? "");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const price      = plan === "PREMIUM" ? premiumPrice : destaquePrice;
  const priceLabel = `R$ ${(price / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês`;
  const hasGateways = activeGateways.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasGateways || !gateway) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          gateway,
          product_type:  "guia_plan",
          product_id:    slug,
          product_label: `Guia ${plan} — ${listingName}`,
          amount_cents:  price,
          payer_name:    name,
          payer_email:   email,
          metadata:      { slug, plan },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao iniciar pagamento.");
      if (!data.checkout_url) throw new Error("URL de pagamento não recebida.");
      // Redireciona para o checkout do gateway
      window.location.href = data.checkout_url;
    } catch (err: unknown) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  /* ── Sem gateways configurados ────────────────────────────── */
  if (!hasGateways) {
    return (
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-8 text-center max-w-[480px]">
        <p className="text-[40px] mb-3">🔧</p>
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] mb-2">
          Pagamentos em configuração
        </h3>
        <p className="text-[#526888] text-[14px] leading-[22px] mb-5">
          O sistema de pagamentos ainda está sendo configurado. Entre em contato diretamente para contratar seu plano.
        </p>
        <a
          href="mailto:publicidade@laugoarmsbrasil.com.br"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-6 flex items-center justify-center rounded-[6px] transition-colors max-w-[260px] mx-auto"
        >
          Falar com nossa equipe →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-[560px]">

      {/* ── Seletor de plano ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {([
          {
            value: "PREMIUM",
            price: `R$ ${(premiumPrice / 100).toFixed(0)}/mês`,
            items: ["Logo + fotos", "Descrição completa", "WhatsApp e site", "Endereço + mapa", "Destaque na listagem"],
          },
          {
            value: "DESTAQUE",
            price: `R$ ${(destaquePrice / 100).toFixed(0)}/mês`,
            items: ["Tudo do Premium", "Topo da categoria", "Badge Destaque", "★ Marcado em destaque"],
          },
        ] as const).map(p => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPlan(p.value)}
            className={`rounded-[12px] p-4 text-left border-2 transition-all ${
              plan === p.value
                ? "border-[#ff1f1f] bg-[#260a0a]"
                : "border-[#141d2c] bg-[#0e1520] hover:border-[#526888]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-[4px] ${
                p.value === "DESTAQUE"
                  ? "bg-[#260a0a] text-[#ff1f1f] border border-[#ff1f1f]/30"
                  : "bg-[#1a1a40] text-[#818cf8]"
              }`}>{p.value}</span>
              {plan === p.value && <span className="text-[#ff1f1f] text-[14px]">✓</span>}
            </div>
            <p className="font-['Barlow_Condensed'] font-bold text-white text-[22px] mb-2">{p.price}</p>
            <ul className="flex flex-col gap-1">
              {p.items.map(item => (
                <li key={item} className="text-[#526888] text-[11px] flex items-start gap-1.5">
                  <span className="text-[#22c55e] shrink-0">✓</span> {item}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* ── Forma de pagamento (só se > 1 gateway) ─────────── */}
      {activeGateways.length > 1 && (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-3">
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

      {/* ── Erro ──────────────────────────────────────────────── */}
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f]/30 rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      {/* ── Dados do responsável ──────────────────────────────── */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5 flex flex-col gap-4">
        <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">
          Dados do responsável
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Nome completo *</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="João da Silva"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>E-mail *</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="joao@empresa.com.br"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── Resumo do pedido ─────────────────────────────────── */}
      <div className="bg-[#070a12] border border-[#141d2c] rounded-[10px] p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[#526888] text-[12px] mb-0.5">Resumo do pedido</p>
          <p className="text-white text-[15px] font-bold">Guia {plan} · {priceLabel}</p>
          <p className="text-white text-[12px]">Renovação mensal · cancele quando quiser</p>
        </div>
        {activeGateways.length === 1 && (
          <div className="flex items-center gap-1.5 text-[#7a9ab5] text-[13px] shrink-0">
            <span className="text-[16px]">{GATEWAY_LABELS[activeGateways[0]]?.icon ?? "💳"}</span>
            <span>{GATEWAY_LABELS[activeGateways[0]]?.name ?? activeGateways[0]}</span>
          </div>
        )}
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading || !gateway}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[15px] font-semibold h-[48px] px-8 rounded-[8px] transition-colors"
        >
          {loading ? "Processando..." : "Ir para pagamento →"}
        </button>
        <Link
          href={`/guia/empresa/${slug}`}
          className="text-[#526888] hover:text-white text-[13px] transition-colors"
        >
          Cancelar
        </Link>
      </div>

      <p className="text-white text-[12px]">
        Você será redirecionado para a página segura de pagamento. O plano é ativado automaticamente após a confirmação.
      </p>
    </form>
  );
}
