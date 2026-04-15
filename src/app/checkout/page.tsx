import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings, getActiveGateways } from "@/lib/payment/shared";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "./_CheckoutContent";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const PERIOD_LABEL: Record<number, string> = { 1: "mês", 3: "trimestre", 6: "semestre", 12: "ano" };

interface Plan {
  id: string; name: string; slug: string;
  priceInCents: number; intervalMonths: number;
}

async function getPlan(slug: string): Promise<Plan | null> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/subscription_plans?slug=eq.${slug}&active=eq.true&limit=1`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) && d.length > 0 ? d[0] : null;
  } catch { return null; }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}): Promise<Metadata> {
  const { plano } = await searchParams;
  const plan = plano ? await getPlan(plano) : null;
  return {
    title: plan ? `Assinar ${plan.name} — Revista Magnum` : "Checkout — Revista Magnum",
  };
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}) {
  const { plano } = await searchParams;
  if (!plano) notFound();

  const [plan, settings, supabase] = await Promise.all([
    getPlan(plano),
    getSettings(),
    createClient(),
  ]);
  if (!plan) notFound();

  const activeGateways = getActiveGateways(settings);
  const { data: { user } } = await supabase.auth.getUser();

  const periodLabel = PERIOD_LABEL[plan.intervalMonths] ?? "período";
  const priceStr    = (plan.priceInCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const perMonth    = Math.round(plan.priceInCents / plan.intervalMonths);
  const perMonthStr = (perMonth / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <main className="flex-1 pt-16 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-[500px]">

          <p className="text-[#253750] text-[13px] mb-6">
            <a href="/assine" className="hover:text-white transition-colors">Planos</a>
            {" "}<span className="text-[#141d2c] mx-1.5">/</span>
            <span className="text-[#7a9ab5]">Checkout</span>
          </p>

          {/* Resumo do plano */}
          <div className="bg-[#0e1520] border border-[#ff1f1f]/30 rounded-[12px] p-5 mb-6">
            <p className="text-[#ff1f1f] text-[10px] font-semibold tracking-[1.5px] uppercase mb-3">
              Plano selecionado
            </p>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-white text-[20px] font-bold leading-none mb-1">{plan.name}</p>
                <p className="text-[#526888] text-[13px]">
                  Acervo completo · renova a cada {plan.intervalMonths}{" "}
                  {plan.intervalMonths === 1 ? "mês" : "meses"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[30px] leading-none">
                  {priceStr}
                </p>
                <p className="text-[#253750] text-[11px]">/{periodLabel}</p>
                {plan.intervalMonths > 1 && (
                  <p className="text-[#22c55e] text-[11px] mt-0.5">= {perMonthStr}/mês</p>
                )}
              </div>
            </div>
          </div>

          <CheckoutForm
            slug={plan.slug}
            planName={plan.name}
            amountCents={plan.priceInCents}
            intervalMonths={plan.intervalMonths}
            activeGateways={activeGateways}
            defaultName={
              (user?.user_metadata?.full_name as string | undefined)
              ?? (user?.user_metadata?.name as string | undefined)
              ?? ""
            }
            defaultEmail={user?.email ?? ""}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
