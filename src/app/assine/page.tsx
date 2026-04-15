import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const metadata = {
  title: "Assine — Revista Magnum",
  description: "Acesso completo a 207 edições. Planos a partir de R$ 29,90/trimestre.",
};

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const FALLBACK_PLANS = [
  {
    id: "trimestral", name: "Trimestral", slug: "trimestral",
    description: "Cobrança a cada 3 meses",
    priceInCents: 2990, intervalMonths: 3,
    highlight: false, badge: null,
    features: [
      "Acesso ao acervo completo",
      "207 edições disponíveis",
      "Leitura em qualquer dispositivo",
      "Suporte padrão",
    ],
  },
  {
    id: "semestral", name: "Semestral", slug: "semestral",
    description: "Cobrança a cada 6 meses",
    priceInCents: 5490, intervalMonths: 6,
    highlight: true, badge: "MAIS POPULAR",
    savings: "Economize 8% vs trimestral",
    features: [
      "Acesso ao acervo completo",
      "207 edições disponíveis",
      "Leitura em qualquer dispositivo",
      "Suporte prioritário",
      "Economize 8% vs trimestral",
    ],
  },
  {
    id: "anual", name: "Anual", slug: "anual",
    description: "Cobrança anual",
    priceInCents: 9990, intervalMonths: 12,
    highlight: false, badge: "MELHOR VALOR",
    savings: "Economize 17% vs trimestral",
    features: [
      "Acesso ao acervo completo",
      "207 edições disponíveis",
      "Leitura em qualquer dispositivo",
      "Suporte VIP",
      "Economize 17% vs trimestral",
      "Acesso antecipado a edições",
    ],
  },
];

const FAQS = [
  {
    q: "Quando posso cancelar?",
    a: "Você pode cancelar a qualquer momento. O acesso permanece ativo até o fim do período pago.",
  },
  {
    q: "Quais formas de pagamento?",
    a: "Aceitamos cartão de crédito, PIX e boleto bancário via Mercado Pago.",
  },
  {
    q: "Posso acessar edições antigas?",
    a: "Sim! Com qualquer plano você acessa as 145 edições regulares e 62 edições especiais do acervo.",
  },
  {
    q: "A assinatura renova automaticamente?",
    a: "Sim. Você será notificado por e-mail 3 dias antes da renovação. Cancele quando quiser.",
  },
];

const TESTIMONIALS = [
  { quote: "Melhor investimento para quem é apaixonado por armas. Acervo completo e incrível.", author: "Carlos M." },
  { quote: "Uso para pesquisa de legislação. Fundamental para o meu trabalho como instrutor CAC.", author: "Roberto S." },
  { quote: "Assino há 2 anos. As edições especiais valem muito a pena. Recomendo!", author: "Ana P." },
];

export default async function AssinePage() {
  let dbPlans: { id: string; name: string; slug: string; description: string | null; priceInCents: number; intervalMonths: number }[] = [];

  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/subscription_plans?active=eq.true&order=priceInCents.asc`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const data = await res.json();
    if (Array.isArray(data)) dbPlans = data;
  } catch {
    // usa fallback
  }

  const plans = dbPlans.length > 0
    ? dbPlans.map((p) => ({
        ...p,
        highlight: p.intervalMonths === 6,
        badge: p.intervalMonths === 6 ? "MAIS POPULAR" : p.intervalMonths === 12 ? "MELHOR VALOR" : null,
        savings: p.intervalMonths === 6 ? "Economize 8% vs trimestral" : p.intervalMonths === 12 ? "Economize 17% vs trimestral" : undefined,
        features: [
          "Acesso ao acervo completo",
          "207 edições disponíveis",
          "Leitura em qualquer dispositivo",
          p.intervalMonths >= 12 ? "Suporte VIP" : p.intervalMonths >= 6 ? "Suporte prioritário" : "Suporte padrão",
          ...(p.intervalMonths >= 12 ? ["Acesso antecipado a edições"] : []),
        ],
      }))
    : FALLBACK_PLANS;

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Red accent bar */}
        <div className="h-[4px] bg-[#ff1f1f] w-full" />

        {/* Hero */}
        <div className="hero-metal py-16 flex flex-col items-center px-5">
          <div className="flex items-center gap-2 bg-[#141d2c] border border-[#ff1f1f]/40 px-3.5 py-1.5 rounded-full mb-6">
            <span className="text-[#ff1f1f] text-[10px] font-semibold tracking-[1px] uppercase">
              ⭐ Mais de 20 anos
            </span>
          </div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] lg:text-[56px] leading-[44px] lg:leading-[60px] text-center mb-4">
            Assine a Revista Magnum
          </h1>
          <p className="text-[#d4d4da] text-[16px] lg:text-[18px] text-center max-w-[760px]">
            Acesso completo a 207 edições · Novidades mensais · Leia em qualquer dispositivo
          </p>
        </div>

        {/* Trust bar */}
        <div className="bg-[#141d2c] border-y border-[#141d2c]">
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10 px-5 py-4">
            {[
              "✓  Cancele quando quiser",
              "✓  Sem fidelidade obrigatória",
              "✓  Acesso imediato após pagamento",
              "✓  Suporte via WhatsApp",
            ].map((item) => (
              <span key={item} className="text-[#d4d4da] text-[14px]">{item}</span>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="px-5 lg:px-20 pt-14 pb-16">
          <div className="flex flex-col lg:flex-row items-end gap-4 mb-10">
            <div>
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] lg:text-[44px] leading-none mb-2">
                Escolha seu plano
              </h2>
              <p className="text-[#7a9ab5] text-[16px]">
                Todos os planos incluem acesso ao acervo completo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl p-7 ${
                  plan.highlight
                    ? "bg-[#1f0a0a] border-2 border-[#ff1f1f]"
                    : "bg-[#0e1520] border border-[#141d2c]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className={`text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-[0.5px] ${
                      plan.highlight ? "bg-[#ff1f1f] text-white" : "bg-[#141d2c] text-[#7a9ab5]"
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className={`text-[20px] font-semibold mb-0.5 ${plan.highlight ? "text-white" : "text-[#d4d4da]"}`}>
                    {plan.name}
                  </h3>
                  <p className="text-white text-[12px]">{plan.description}</p>
                </div>

                <div className="mb-5">
                  <div className="flex items-end gap-1">
                    <span className={`font-['Barlow_Condensed'] font-bold text-[52px] leading-none ${plan.highlight ? "text-[#ff1f1f]" : "text-white"}`}>
                      {formatCurrency(plan.priceInCents)}
                    </span>
                    <span className="text-[#7a9ab5] text-[15px] mb-1.5">
                      /{plan.intervalMonths === 1 ? "mês" : plan.intervalMonths === 3 ? "trimestre" : plan.intervalMonths === 6 ? "semestre" : "ano"}
                    </span>
                  </div>
                  <p className="text-[#22c55e] text-[13px] mt-1">
                    {formatCurrency(Math.round(plan.priceInCents / plan.intervalMonths))}/mês
                  </p>
                </div>

                <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[14px] text-[#d4d4da]">
                      <svg className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/checkout?plano=${plan.slug}`}
                  className={`w-full h-[48px] flex items-center justify-center rounded-[8px] text-[15px] font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-[#ff1f1f] hover:bg-[#cc0000] text-white"
                      : "bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da]"
                  }`}
                >
                  {plan.highlight ? "Assinar agora →" : "Escolher plano"}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="px-5 lg:px-20 pb-16">
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] mb-8 text-center">
            Perguntas frequentes
          </h2>
          <div className="flex flex-col gap-3 max-w-[1040px] mx-auto">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-[#0e1520] border border-[#141d2c] rounded-[8px] px-6 py-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white text-[16px] font-semibold mb-1.5">{faq.q}</p>
                  <p className="text-[#7a9ab5] text-[14px] leading-[20px]">{faq.a}</p>
                </div>
                <span className="text-white text-[18px] shrink-0">∨</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="px-5 lg:px-20 pb-20">
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] mb-8">
            O que nossos leitores dizem
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
                <p className="text-[#ff1f1f] text-[14px] mb-3">★★★★★</p>
                <p className="text-[#d4d4da] text-[14px] leading-[22px] mb-3">"{t.quote}"</p>
                <p className="text-white text-[13px] font-medium">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
