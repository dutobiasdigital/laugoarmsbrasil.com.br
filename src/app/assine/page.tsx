import Link from "next/link";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Assine — Revista Magnum",
  description:
    "Assine a Revista Magnum e acesse o maior acervo de publicações especializadas em armas do Brasil.",
};

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function AssinePage() {
  let plans: { id: string; name: string; slug: string; description: string | null; priceInCents: number; intervalMonths: number }[] = [];

  try {
    plans = await prisma.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { priceInCents: "asc" },
    });
  } catch {
    // DB unavailable — uses fallback plans below
  }

  // Fallback plans se não tiver no DB ainda
  const displayPlans =
    plans.length > 0
      ? plans.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          priceInCents: p.priceInCents,
          intervalMonths: p.intervalMonths,
          highlight: p.intervalMonths >= 12,
        }))
      : [
          {
            id: "mensal",
            name: "Mensal",
            slug: "mensal",
            description: "Acesso completo ao acervo",
            priceInCents: 2990,
            intervalMonths: 1,
            highlight: false,
          },
          {
            id: "anual",
            name: "Anual",
            slug: "anual",
            description: "Melhor custo-benefício — 2 meses grátis",
            priceInCents: 29900,
            intervalMonths: 12,
            highlight: true,
          },
        ];

  const features = [
    "Acesso a todas as edições publicadas",
    "Leitura online com virador de páginas",
    "Download em PDF",
    "Novas edições assim que publicadas",
    "Acesso em todos os dispositivos",
    "Cancele quando quiser",
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-xs text-[#ff1f1f] font-semibold uppercase tracking-widest mb-3">
              Planos
            </p>
            <h1 className="text-4xl font-bold text-white font-['Barlow_Condensed'] tracking-wide mb-4">
              ACESSO ILIMITADO AO ACERVO
            </h1>
            <p className="text-zinc-400 text-sm max-w-lg mx-auto">
              Assine e acesse imediatamente todas as edições da Revista Magnum —
              o maior acervo especializado em armas do Brasil.
            </p>
          </div>

          {/* Plans */}
          <div className={`grid gap-6 mb-14 ${displayPlans.length === 1 ? "max-w-sm mx-auto" : "sm:grid-cols-2"}`}>
            {displayPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-8 flex flex-col ${
                  plan.highlight
                    ? "bg-zinc-900 border-[#ff1f1f]/40"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#ff1f1f] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Mais popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-1">{plan.name}</h2>
                  {plan.description && (
                    <p className="text-sm text-zinc-500">{plan.description}</p>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-white">
                      {formatCurrency(plan.priceInCents)}
                    </span>
                    <span className="text-zinc-500 text-sm mb-1">
                      /{plan.intervalMonths === 1 ? "mês" : `${plan.intervalMonths} meses`}
                    </span>
                  </div>
                  {plan.intervalMonths > 1 && (
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatCurrency(Math.round(plan.priceInCents / plan.intervalMonths))}/mês
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                      <svg
                        className="w-4 h-4 text-[#ff1f1f] flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/auth/cadastro?plano=${plan.slug}`}
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded text-sm transition-colors ${
                    plan.highlight
                      ? "bg-[#ff1f1f] hover:bg-[#cc0000] text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white"
                  }`}
                >
                  Assinar {plan.name}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div className="text-center border-t border-zinc-800 pt-10">
            <p className="text-xs text-zinc-600 mb-6">
              Pagamento seguro via Mercado Pago · Cancele quando quiser · Sem fidelidade
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { icon: "🔒", label: "Pagamento seguro" },
                { icon: "✓", label: "Sem fidelidade" },
                { icon: "↩", label: "Cancele quando quiser" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-zinc-600">{item.icon}</span>
                  <span className="text-xs text-zinc-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
