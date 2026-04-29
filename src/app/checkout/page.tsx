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
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

const PERIOD_LABEL: Record<number, string> = { 1: "mês", 3: "trimestre", 6: "semestre", 12: "ano" };

interface Plan {
  id: string; name: string; slug: string;
  priceInCents: number; intervalMonths: number;
}
interface Edition {
  id: string; title: string; number: number | null; slug: string; coverImageUrl: string | null;
}

async function getPlan(slug: string): Promise<Plan | null> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/subscription_plans?slug=eq.${slug}&active=eq.true&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) && d.length > 0 ? d[0] : null;
  } catch { return null; }
}

async function getEdition(slug: string): Promise<Edition | null> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/editions?slug=eq.${slug}&isPublished=eq.true&select=id,title,number,slug,coverImageUrl&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) && d.length > 0 ? d[0] : null;
  } catch { return null; }
}

async function getEditionPrice(settings: Record<string, string>): Promise<number> {
  return parseInt(settings["payment.edition.price_cents"] ?? "990", 10);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string; edicao?: string }>;
}): Promise<Metadata> {
  const { plano, edicao } = await searchParams;
  if (plano) {
    const plan = await getPlan(plano);
    return { title: plan ? `Assinar ${plan.name} — Laúgo Arms Brasil` : "Checkout — Laúgo Arms Brasil" };
  }
  if (edicao) {
    const edition = await getEdition(edicao);
    return { title: edition ? `Comprar Edição ${edition.number ?? edition.title} — Laúgo Arms Brasil` : "Checkout — Laúgo Arms Brasil" };
  }
  return { title: "Checkout — Laúgo Arms Brasil" };
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string; edicao?: string }>;
}) {
  const { plano, edicao } = await searchParams;
  if (!plano && !edicao) notFound();

  const [settings, supabase] = await Promise.all([getSettings(), createClient()]);
  const activeGateways = getActiveGateways(settings);
  const { data: { user } } = await supabase.auth.getUser();

  const defaultName  = (user?.user_metadata?.full_name as string | undefined)
    ?? (user?.user_metadata?.name as string | undefined) ?? "";
  const defaultEmail = user?.email ?? "";

  /* ── Modo assinatura de plano ─────────────────────────────── */
  if (plano) {
    const plan = await getPlan(plano);
    if (!plan) notFound();

    const priceStr   = (plan.priceInCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const periodLabel = PERIOD_LABEL[plan.intervalMonths] ?? "período";
    const perMonth    = Math.round(plan.priceInCents / plan.intervalMonths);
    const perMonthStr = (perMonth / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    return (
      <div className="min-h-screen bg-[#070a12] flex flex-col">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center px-5 py-16">
          <div className="w-full max-w-[500px]">
            <p className="text-white text-[13px] mb-6">
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
                  <p className="text-white text-[11px]">/{periodLabel}</p>
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
              defaultName={defaultName}
              defaultEmail={defaultEmail}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Modo compra avulsa de edição ─────────────────────────── */
  const edition  = await getEdition(edicao!);
  if (!edition) notFound();

  const priceInCents = await getEditionPrice(settings);
  const priceStr     = (priceInCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <main className="flex-1 pt-16 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-[500px]">
          <p className="text-white text-[13px] mb-6">
            <a href={`/edicoes/${edition.slug}`} className="hover:text-white transition-colors">
              {edition.number ? `Edição ${edition.number}` : edition.title}
            </a>
            {" "}<span className="text-[#141d2c] mx-1.5">/</span>
            <span className="text-[#7a9ab5]">Comprar acesso</span>
          </p>

          {/* Resumo da edição */}
          <div className="bg-[#0e1520] border border-[#ff1f1f]/30 rounded-[12px] p-5 mb-6">
            <p className="text-[#ff1f1f] text-[10px] font-semibold tracking-[1.5px] uppercase mb-3">
              Edição selecionada
            </p>
            <div className="flex items-start gap-4">
              {edition.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={edition.coverImageUrl} alt={edition.title}
                  className="w-[60px] h-[80px] object-cover rounded-[4px] shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-white text-[18px] font-bold leading-snug mb-1">
                  {edition.number ? `Edição Nº ${edition.number}` : edition.title}
                </p>
                <p className="text-[#526888] text-[13px]">Acesso por 30 dias · apenas esta edição</p>
                <div className="mt-3 flex items-end gap-1">
                  <p className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[28px] leading-none">
                    {priceStr}
                  </p>
                  <p className="text-white text-[12px] mb-0.5">pagamento único</p>
                </div>
              </div>
            </div>
          </div>

          <CheckoutForm
            slug={edition.slug}
            planName={edition.number ? `Edição Nº ${edition.number}` : edition.title}
            amountCents={priceInCents}
            intervalMonths={0}
            activeGateways={activeGateways}
            defaultName={defaultName}
            defaultEmail={defaultEmail}
            mode="edition"
            editionSlug={edition.slug}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
