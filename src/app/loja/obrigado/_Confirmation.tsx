"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const METHOD_LABELS: Record<string, { label: string; icon: string; msg: string }> = {
  pix:    { label: "Pix",               icon: "⚡", msg: "Você receberá o QR Code e a chave Pix no e-mail em instantes." },
  boleto: { label: "Boleto Bancário",   icon: "🏦", msg: "O boleto foi enviado para o seu e-mail. Vence em 3 dias úteis." },
  credit: { label: "Cartão de Crédito", icon: "💳", msg: "Pagamento em análise. A confirmação chegará por e-mail." },
  debit:  { label: "Cartão de Débito",  icon: "🏧", msg: "Pagamento confirmado. Acompanhe por e-mail." },
};

export default function Confirmation() {
  const params = useSearchParams();
  const pedido = params.get("pedido") ?? "MAG-XXXXXX";
  const total  = parseInt(params.get("total") ?? "0", 10);
  const metodo = params.get("metodo") ?? "pix";
  const method = METHOD_LABELS[metodo] ?? METHOD_LABELS.pix;

  return (
    <div className="px-5 lg:px-20 py-16 flex flex-col items-center gap-8 max-w-[620px] mx-auto text-center">
      {/* Ícone de sucesso */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-[#071a10] border border-[#22c55e]/30 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="#22c55e" strokeWidth="1.5" opacity="0.3"/>
            <path d="M10 20l7 7 13-14" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 text-2xl">🎉</div>
      </div>

      {/* Título */}
      <div>
        <p className="text-[#22c55e] text-[11px] font-bold tracking-[2px] uppercase mb-2">Pedido confirmado</p>
        <h1 className="font-['Barlow_Condensed'] font-extrabold text-[#dce8ff] text-[48px] leading-none">
          Obrigado!
        </h1>
        <p className="text-[#7a9ab5] text-[16px] mt-3">
          Seu pedido foi recebido e está sendo processado.
        </p>
      </div>

      {/* Número do pedido */}
      <div className="w-full bg-[#0e1520] border border-[#141d2c] rounded-[14px] p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[#526888] text-[12px] font-semibold uppercase tracking-[0.5px]">Número do pedido</span>
          <span className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[20px] tracking-wider">{pedido}</span>
        </div>
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-[#0a0f1a] pt-4">
            <span className="text-[#526888] text-[12px] font-semibold uppercase tracking-[0.5px]">Total pago</span>
            <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[24px]">{formatCurrency(total)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-[#0a0f1a] pt-4">
          <span className="text-[#526888] text-[12px] font-semibold uppercase tracking-[0.5px]">Pagamento</span>
          <span className="flex items-center gap-1.5 text-[#dce8ff] text-[14px] font-semibold">
            <span>{method.icon}</span>
            {method.label}
          </span>
        </div>
      </div>

      {/* Instrução de pagamento */}
      <div className="w-full bg-[#080f1a] border border-[#1c2a3e] rounded-[12px] p-5">
        <p className="text-[#7a9ab5] text-[14px] leading-relaxed">{method.msg}</p>
      </div>

      {/* Próximos passos */}
      <div className="w-full flex flex-col gap-3">
        {[
          { icon: "📧", title: "Confirmação por e-mail", desc: "Você receberá um e-mail com os detalhes do pedido." },
          { icon: "📦", title: "Preparação do pedido",   desc: "Separamos e embalamos seu pedido com cuidado." },
          { icon: "🚚", title: "Envio",                  desc: "Você receberá o código de rastreamento por e-mail." },
        ].map(s => (
          <div key={s.title} className="flex items-start gap-3 text-left">
            <span className="text-xl shrink-0 mt-0.5">{s.icon}</span>
            <div>
              <p className="text-[#dce8ff] text-[13px] font-semibold">{s.title}</p>
              <p className="text-[#526888] text-[12px] mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link href="/loja"
          className="flex-1 h-[52px] bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-bold rounded-[8px] flex items-center justify-center gap-2 transition-colors">
          Continuar comprando
        </Link>
        <Link href="/"
          className="flex-1 h-[52px] border border-[#1c2a3e] hover:border-[#526888] text-[#7a9ab5] hover:text-white text-[14px] font-semibold rounded-[8px] flex items-center justify-center transition-colors">
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
