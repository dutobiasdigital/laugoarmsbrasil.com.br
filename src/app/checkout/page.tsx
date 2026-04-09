"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";

const PLANS: Record<string, { name: string; price: string; interval: string; nextCharge: string }> = {
  trimestral: { name: "Trimestral", price: "R$ 29,90", interval: "3 meses", nextCharge: "Jul / 2026" },
  semestral: { name: "Semestral", price: "R$ 54,90", interval: "6 meses", nextCharge: "Out / 2026" },
  anual: { name: "Anual", price: "R$ 99,90", interval: "12 meses", nextCharge: "Abr / 2027" },
};

const STEPS = ["Dados pessoais", "Escolha do plano", "Pagamento"];

export default function CheckoutPage() {
  const [payMethod, setPayMethod] = useState<"cartao" | "pix" | "boleto">("cartao");

  // Read plan from URL client-side
  const planSlug =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("plano") ?? "semestral"
      : "semestral";
  const plan = PLANS[planSlug] ?? PLANS["semestral"];

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Checkout nav bar */}
        <div className="bg-[#18181b] border-b border-[#27272a] h-[64px] flex items-center px-5 lg:px-20 gap-4">
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <div className="w-[26px] h-[26px] bg-[#ff1f1f] rounded-[2px]" />
            <span className="font-['Barlow_Condensed'] font-extrabold text-[20px] text-[#ff1f1f] leading-none tracking-wide">
              MAGNUM
            </span>
          </Link>
          <span className="text-[#a1a1aa] text-[13px] hidden sm:block">🔒 Checkout seguro</span>
          <div className="flex-1" />
          {/* Progress steps */}
          <div className="hidden md:flex items-center gap-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`w-[80px] h-px ${i <= 2 ? "bg-[#22c55e]" : "bg-[#3f3f46]"}`} />
                )}
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[11px] font-bold ${
                    i < 2 ? "bg-[#22c55e] text-white" : "bg-[#ff1f1f] text-white"
                  }`}>
                    {i < 2 ? "✓" : i + 1}
                  </div>
                  <span className={`text-[11px] ${i < 2 ? "text-[#d4d4da]" : "text-[#52525b]"}`}>
                    {step}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 lg:px-20 py-10 flex flex-col lg:flex-row gap-8 items-start max-w-[1440px]">
          {/* Left — Payment Form */}
          <div className="flex-1 min-w-0">
            <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-2">
              Pagamento
            </h1>
            <p className="text-[#a1a1aa] text-[15px] mb-6">
              Plano {plan.name} — {plan.price}
            </p>
            <div className="bg-[#27272a] h-px mb-6" />

            {/* Payment method tabs */}
            <div className="flex gap-2 mb-7">
              {[
                { key: "cartao" as const, label: "Cartão de Crédito" },
                { key: "pix" as const, label: "PIX" },
                { key: "boleto" as const, label: "Boleto" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPayMethod(tab.key)}
                  className={`h-[40px] px-4 rounded-[6px] text-[13px] font-semibold transition-colors ${
                    payMethod === tab.key
                      ? "bg-[#27272a] border border-[#ff1f1f] text-white"
                      : "bg-[#09090b] border border-[#3f3f46] text-[#a1a1aa] hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {payMethod === "cartao" && (
              <div className="flex flex-col gap-5">
                {/* Card number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#a1a1aa] text-[13px] font-medium">Número do cartão</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[48px] px-4 text-[#52525b] text-[15px] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b]">💳</span>
                  </div>
                </div>

                {/* Cardholder */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#a1a1aa] text-[13px] font-medium">Nome no cartão</label>
                  <input
                    type="text"
                    placeholder="JOAO DA SILVA"
                    className="w-full bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[48px] px-4 text-[#52525b] text-[15px] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f] uppercase"
                  />
                </div>

                {/* Expiry + CVV */}
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-[#a1a1aa] text-[13px] font-medium">Validade</label>
                    <input
                      type="text"
                      placeholder="MM / AA"
                      maxLength={7}
                      className="w-full bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[48px] px-4 text-[#52525b] text-[15px] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-[#a1a1aa] text-[13px] font-medium">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      className="w-full bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[48px] px-4 text-[#52525b] text-[15px] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f]"
                    />
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[16px] font-semibold h-[56px] rounded-[8px] transition-colors mt-2">
                  Confirmar pagamento — {plan.price}
                </button>

                <p className="text-[#52525b] text-[12px] text-center">
                  🔒 Pagamento 100% seguro · Mercado Pago · SSL 256-bit
                </p>
              </div>
            )}

            {payMethod === "pix" && (
              <div className="flex flex-col items-center gap-5 py-8">
                <div className="bg-[#27272a] border border-[#3f3f46] rounded-xl w-[180px] h-[180px] flex items-center justify-center">
                  <p className="text-[#52525b] text-[11px] font-mono text-center">QR Code<br />PIX</p>
                </div>
                <p className="text-[#a1a1aa] text-[14px] text-center max-w-[400px]">
                  Abra o app do seu banco, escolha PIX e escaneie o QR Code acima.
                </p>
                <button className="bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 text-[#d4d4da] text-[14px] font-medium h-[44px] px-6 rounded-[6px] transition-colors">
                  Copiar código PIX
                </button>
              </div>
            )}

            {payMethod === "boleto" && (
              <div className="flex flex-col gap-5 py-4">
                <p className="text-[#a1a1aa] text-[14px] leading-[22px]">
                  O boleto será gerado após confirmar. O pagamento pode levar até 3 dias úteis para ser processado.
                </p>
                <button className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[16px] font-semibold h-[56px] rounded-[8px] transition-colors">
                  Gerar boleto — {plan.price}
                </button>
              </div>
            )}
          </div>

          {/* Right — Order Summary */}
          <div className="w-full lg:w-[400px] bg-[#18181b] border border-[#27272a] rounded-xl p-6 shrink-0">
            <p className="text-white text-[16px] font-semibold mb-4">Resumo do pedido</p>
            <div className="bg-[#27272a] h-px mb-4" />

            <div className="flex flex-col gap-3 mb-4">
              <div className="flex justify-between">
                <span className="text-[#a1a1aa] text-[14px]">Plano {plan.name}</span>
                <span className="text-[#d4d4da] text-[14px] font-medium">{plan.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a1a1aa] text-[14px]">Cobrança recorrente</span>
                <span className="text-[#d4d4da] text-[14px] font-medium">a cada {plan.interval}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a1a1aa] text-[14px]">Próxima cobrança</span>
                <span className="text-[#d4d4da] text-[14px] font-medium">{plan.nextCharge}</span>
              </div>
            </div>

            <div className="bg-[#27272a] h-px mb-4" />

            <div className="flex justify-between items-end mb-4">
              <span className="text-white text-[16px] font-semibold">Total hoje</span>
              <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[32px] leading-none">
                {plan.price}
              </span>
            </div>

            <div className="bg-[#27272a] h-px mb-4" />

            <p className="text-[#a1a1aa] text-[13px] font-semibold mb-3">O que está incluído:</p>
            <ul className="flex flex-col gap-2">
              {[
                "Acesso ao acervo completo (207 edições)",
                "Novas edições mensais",
                "Leitura no app e navegador",
                "Cancele quando quiser",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-[#d4d4da] text-[13px]">
                  <span className="text-[#22c55e]">✓</span> {item}
                </li>
              ))}
            </ul>

            <Link
              href="/assine"
              className="flex items-center gap-1 text-[#a1a1aa] hover:text-white text-[14px] mt-6 transition-colors"
            >
              ← Voltar para planos
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
