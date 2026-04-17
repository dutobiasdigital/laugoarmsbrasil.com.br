"use client";

import { useActionState, useState } from "react";
import { signup } from "@/actions/auth";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PLANS = [
  { slug: "trimestral", name: "Trimestral", price: "R$ 29,90", period: "/trimestre", savings: null },
  { slug: "semestral", name: "Semestral", price: "R$ 54,90", period: "/semestre", savings: "Economize 8%", popular: true },
  { slug: "anual", name: "Anual", price: "R$ 99,90", period: "/ano", savings: "Economize 17%", popular: false },
];

const STEPS = ["Seus dados", "Seu plano", "Confirmação"];

const LEFT_PANEL: Record<number, { headline: string; sub: string }> = {
  1: { headline: "Crie sua conta\ne acesse tudo.", sub: "Acervo completo · 207 edições · Desde 1985" },
  2: { headline: "Escolha seu\nplano ideal.", sub: "3 meses · 6 meses · anual" },
  3: { headline: "Quase lá!\nFalte pouco.", sub: "Sua conta foi criada com sucesso." },
};

export default function CadastroPage() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("semestral");
  const [state, formAction, pending] = useActionState(signup, {});
  const { executeRecaptcha } = useRecaptcha();
  const router = useRouter();
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const panel = LEFT_PANEL[step] ?? LEFT_PANEL[1];

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="hidden lg:flex relative w-[720px] shrink-0 bg-[#0e1520] flex-col p-20 justify-between">
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#ff1f1f]" />

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-[40px] h-[40px] bg-[#ff1f1f] rounded-[3px]" />
          <span className="font-['Barlow_Condensed'] font-bold text-white text-[24px] tracking-[3px]">
            MAGNUM
          </span>
        </div>

        {/* Hero */}
        <div className="flex flex-col gap-5">
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[64px] leading-[68px] whitespace-pre-line">
            {panel.headline}
          </h1>
          <p className="text-[#7a9ab5] text-[18px] leading-[28px]">{panel.sub}</p>
          {step === 1 && (
            <p className="text-white text-[14px]">Planos a partir de R$ 29,90/trimestre</p>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-[32px] h-[32px] bg-[#ff1f1f] rounded-[2px]" />
          <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[22px] tracking-wide">MAGNUM</span>
        </div>

        <div className="w-full max-w-[520px]">
          {/* Stepper */}
          <div className="flex items-center gap-3 mb-8">
            {STEPS.map((label, i) => {
              const s = i + 1;
              const completed = s < step;
              const active = s === step;
              return (
                <div key={label} className="flex items-center gap-3">
                  {i > 0 && (
                    <div className={`h-px flex-1 w-[80px] ${s <= step ? "bg-[#22c55e]" : "bg-[#1c2a3e]"}`} />
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[12px] font-bold ${
                      completed ? "bg-[#22c55e] text-white" : active ? "bg-[#ff1f1f] text-white" : "bg-[#141d2c] border border-[#1c2a3e] text-white"
                    }`}>
                      {completed ? "✓" : s}
                    </div>
                    <span className={`text-[11px] ${active ? "text-[#d4d4da]" : "text-white"}`}>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: Dados ── */}
          {step === 1 && (
            <>
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-2">
                Criar sua conta
              </h2>
              <p className="text-[#7a9ab5] text-[15px] mb-6">Preencha seus dados para começar</p>

              {state?.error && (
                <div className="bg-red-950/50 border border-red-800 text-red-300 text-[13px] px-4 py-3 rounded-[6px] mb-5">
                  {state.error}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  // Inject reCAPTCHA token before server action
                  const token = await executeRecaptcha("signup");
                  fd.set("_recaptchaToken", token);
                  await formAction(fd);
                  if (!state?.error) setStep(2);
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7a9ab5] text-[13px] font-medium">Nome completo</label>
                  <input type="text" name="name" required placeholder="João da Silva"
                    className="w-full bg-[#141d2c] border border-[#1c2a3e] text-white placeholder-white/30 rounded-[6px] h-[44px] px-4 text-[14px] focus:outline-none focus:border-[#ff1f1f] transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7a9ab5] text-[13px] font-medium">E-mail</label>
                  <input type="email" name="email" required placeholder="seu@email.com"
                    className="w-full bg-[#141d2c] border border-[#1c2a3e] text-white placeholder-white/30 rounded-[6px] h-[44px] px-4 text-[14px] focus:outline-none focus:border-[#ff1f1f] transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7a9ab5] text-[13px] font-medium">Telefone <span className="text-white">(opcional)</span></label>
                  <input type="tel" name="phone" placeholder="(11) 99999-9999"
                    className="w-full bg-[#141d2c] border border-[#1c2a3e] text-white placeholder-white/30 rounded-[6px] h-[44px] px-4 text-[14px] focus:outline-none focus:border-[#ff1f1f] transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7a9ab5] text-[13px] font-medium">Senha</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} name="password" required minLength={8} placeholder="Mínimo 8 caracteres" autoComplete="new-password"
                      className="w-full bg-[#141d2c] border border-[#1c2a3e] text-white placeholder-white/30 rounded-[6px] h-[44px] px-4 pr-11 text-[14px] focus:outline-none focus:border-[#ff1f1f] transition-colors" />
                    <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? "Ocultar senha" : "Exibir senha"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526888] hover:text-[#d4d4da] transition-colors p-1">
                      {showPass ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7a9ab5] text-[13px] font-medium">Confirmar senha</label>
                  <div className="relative">
                    <input type={showConfirm ? "text" : "password"} name="confirmPassword" required minLength={8} placeholder="Repita a senha" autoComplete="new-password"
                      className="w-full bg-[#141d2c] border border-[#1c2a3e] text-white placeholder-white/30 rounded-[6px] h-[44px] px-4 pr-11 text-[14px] focus:outline-none focus:border-[#ff1f1f] transition-colors" />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? "Ocultar senha" : "Exibir senha"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526888] hover:text-[#d4d4da] transition-colors p-1">
                      {showConfirm ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="terms" required className="mt-1 accent-[#ff1f1f] shrink-0" />
                  <label htmlFor="terms" className="text-[#d4d4da] text-[13px] leading-[20px]">
                    Li e concordo com os{" "}
                    <Link href="/termos" className="text-[#ff1f1f] hover:underline">Termos de Uso</Link>{" "}
                    e a{" "}
                    <Link href="/privacidade" className="text-[#ff1f1f] hover:underline">Política de Privacidade</Link>
                  </label>
                </div>
                <button type="submit" disabled={pending}
                  className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[16px] font-semibold h-[52px] rounded-[6px] transition-colors mt-1">
                  {pending ? "Criando conta..." : "Continuar →"}
                </button>
              </form>

              <div className="flex items-center justify-center gap-1 mt-5">
                <span className="text-[#7a9ab5] text-[14px]">Já tem conta?</span>
                <Link href="/auth/login" className="text-[#ff1f1f] hover:text-[#ff4444] text-[14px] font-semibold transition-colors">
                  {" "}Entrar →
                </Link>
              </div>
            </>
          )}

          {/* ── STEP 2: Plano ── */}
          {step === 2 && (
            <>
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-2">
                Escolha seu plano
              </h2>
              <p className="text-[#7a9ab5] text-[15px] mb-6">Todos os planos incluem acesso ao acervo completo</p>

              <div className="flex flex-col gap-3 mb-7">
                {PLANS.map((plan) => {
                  const active = selectedPlan === plan.slug;
                  return (
                    <button
                      key={plan.slug}
                      onClick={() => setSelectedPlan(plan.slug)}
                      className={`relative flex items-center gap-4 p-4 rounded-[10px] border text-left transition-all ${
                        active ? "bg-[#260d0d] border-2 border-[#ff1f1f]" : "bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500"
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 left-4 bg-[#ff1f1f] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-[0.5px]">
                          Popular
                        </span>
                      )}
                      {/* Radio */}
                      <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-[#ff1f1f] bg-[#ff1f1f]" : "border-[#1c2a3e] bg-[#141d2c]"}`}>
                        {active && <div className="w-[8px] h-[8px] bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <span className={`text-[18px] font-semibold ${active ? "text-white" : "text-[#d4d4da]"}`}>{plan.name}</span>
                        {plan.savings && (
                          <span className="text-[#22c55e] text-[12px] font-semibold ml-2">{plan.savings}</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`font-['Barlow_Condensed'] font-bold text-[40px] leading-none ${active ? "text-[#ff1f1f]" : "text-white"}`}>
                          {plan.price}
                        </span>
                        <span className="text-[#7a9ab5] text-[14px]">{plan.period}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[16px] font-semibold h-[52px] rounded-[6px] transition-colors"
              >
                Confirmar plano →
              </button>
              <button onClick={() => setStep(1)} className="w-full text-[#7a9ab5] hover:text-white text-[14px] mt-3 transition-colors">
                ← Voltar
              </button>
            </>
          )}

          {/* ── STEP 3: Confirmação ── */}
          {step === 3 && (
            <>
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="w-[80px] h-[80px] rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e] flex items-center justify-center text-[36px]">
                  ✓
                </div>

                <div>
                  <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-2">
                    Conta criada com sucesso!
                  </h2>
                  <p className="text-[#7a9ab5] text-[15px]">
                    Confirme seu e-mail para ativar sua conta.
                  </p>
                </div>

                {/* Summary */}
                <div className="w-full bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5 text-left">
                  <p className="text-[#7a9ab5] text-[14px] font-semibold mb-3">Resumo da assinatura</p>
                  <div className="bg-[#141d2c] h-px mb-3" />
                  {[
                    ["Plano", PLANS.find((p) => p.slug === selectedPlan)?.name ?? "Semestral"],
                    ["Valor", PLANS.find((p) => p.slug === selectedPlan)?.price ?? "R$ 54,90"],
                    ["Status", "ATIVO"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center py-2">
                      <span className="text-white text-[14px]">{label}</span>
                      {label === "Status" ? (
                        <span className="bg-[#22c55e] text-white text-[10px] font-bold px-2.5 py-[3px] rounded-full uppercase">
                          {value}
                        </span>
                      ) : (
                        <span className="text-white text-[14px] font-semibold">{value}</span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => router.push(`/checkout?plano=${selectedPlan}`)}
                  className="w-full bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[16px] font-semibold h-[52px] rounded-[6px] transition-colors"
                >
                  Começar a ler →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
