"use client";

import { useState } from "react";
import Link from "next/link";

const inputCls = "bg-[#0e1520] border border-[#1c2a3e] rounded-[6px] h-[44px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";

interface Props {
  slug:         string;
  listingName:  string;
  defaultPlan:  "PREMIUM" | "DESTAQUE";
}

export default function UpgradeForm({ slug, listingName, defaultPlan }: Props) {
  const [plan, setPlan]     = useState<"PREMIUM" | "DESTAQUE">(defaultPlan);
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");
  const [msg, setMsg]       = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/guia/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, plan, name, email, phone, message: msg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar.");
      setSuccess(true);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-12 max-w-[420px] mx-auto">
        <div className="w-[72px] h-[72px] bg-[#0f381f] border border-[#22c55e]/30 rounded-full flex items-center justify-center text-[36px] mb-5">✅</div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[28px] mb-2">Solicitação enviada!</h2>
        <p className="text-[#7a9ab5] text-[14px] leading-[22px] mb-6">
          Nossa equipe vai analisar o pedido e entrar em contato em até 24 horas no e-mail informado.
        </p>
        <Link href={`/guia/empresa/${slug}`}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
          Voltar ao perfil
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-[560px]">
      {/* Seletor de plano */}
      <div className="grid grid-cols-2 gap-3">
        {([
          { value: "PREMIUM",  price: "R$ 79/mês",  items: ["Logo + fotos", "Descrição completa", "WhatsApp e site", "Endereço + mapa", "Destaque na listagem"] },
          { value: "DESTAQUE", price: "R$ 149/mês", items: ["Tudo do Premium", "Topo da categoria", "Badge Destaque", "★ Marcado em destaque"] },
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
              {p.items.map(i => (
                <li key={i} className="text-[#526888] text-[11px] flex items-start gap-1.5">
                  <span className="text-[#22c55e] shrink-0">✓</span> {i}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f]/30 rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>
      )}

      {/* Dados de contato */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5 flex flex-col gap-4">
        <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">Seus dados de contato</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Nome completo *</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              placeholder="João da Silva" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>E-mail *</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="joao@empresa.com.br" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Telefone / WhatsApp</label>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="(00) 9 0000-0000" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Mensagem (opcional)</label>
            <textarea
              rows={3}
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="Informações adicionais, dúvidas ou preferências..."
              className="bg-[#0e1520] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[15px] font-semibold h-[48px] px-8 rounded-[8px] transition-colors"
        >
          {loading ? "Enviando..." : `Solicitar plano ${plan} →`}
        </button>
        <Link href={`/guia/empresa/${slug}`} className="text-[#526888] hover:text-white text-[13px] transition-colors">
          Cancelar
        </Link>
      </div>

      <p className="text-[#253750] text-[12px]">
        Após o envio, nossa equipe entrará em contato em até 24h úteis. Pagamento processado após confirmação.
      </p>
    </form>
  );
}
