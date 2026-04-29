import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PLAN_LABELS, categoryByValue } from "@/lib/guia";
import { getSettings, getActiveGateways } from "@/lib/payment/shared";
import UpgradeForm from "./UpgradeForm";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

interface Listing {
  slug: string; name: string; plan: string; category: string; city: string; state: string;
}

async function getListing(slug: string): Promise<Listing | null> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/guide_listings?slug=eq.${slug}&status=eq.ACTIVE&select=slug,name,plan,category,city,state&limit=1`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) && d.length > 0 ? d[0] : null;
  } catch { return null; }
}

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ slug?: string }> }
): Promise<Metadata> {
  const { slug } = await searchParams;
  if (!slug) return { title: "Upgrade — Guia" };
  const listing = await getListing(slug);
  return {
    title: `Upgrade ${listing?.name ?? ""} — Guia Comercial`,
  };
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; plano?: string }>;
}) {
  const { slug, plano } = await searchParams;

  if (!slug) notFound();

  const listing = await getListing(slug);
  if (!listing) notFound();

  // Só faz sentido fazer upgrade se estiver no FREE
  if (listing.plan !== "FREE") {
    return (
      <div className="min-h-screen bg-[#070a12] flex flex-col">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center py-20 px-5">
            <p className="text-[40px] mb-4">✅</p>
            <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] mb-3">
              Empresa já em plano pago
            </h1>
            <p className="text-[#526888] text-[14px] mb-6">
              <strong className="text-white">{listing.name}</strong> já está no plano{" "}
              <span className={`font-bold ${PLAN_LABELS[listing.plan]?.color ?? ""}`}>
                {PLAN_LABELS[listing.plan]?.label}
              </span>.
            </p>
            <Link href={`/guia/empresa/${slug}`}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-6 inline-flex items-center rounded-[6px] transition-colors">
              Voltar ao perfil
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const defaultPlan = plano === "DESTAQUE" ? "DESTAQUE" : "PREMIUM";
  const cat = categoryByValue(listing.category);

  // Busca gateways ativos e preços configurados
  const settings       = await getSettings();
  const activeGateways = getActiveGateways(settings);
  const premiumPrice   = parseInt(settings["payment.guia.premium_price"]  ?? "7900");
  const destaquePrice  = parseInt(settings["payment.guia.destaque_price"] ?? "14900");

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">

        {/* Breadcrumb */}
        <div className="px-5 lg:px-20 py-4 border-b border-[#141d2c] bg-[#0a0e18] flex items-center gap-2 text-[13px] flex-wrap">
          <Link href="/guia" className="text-[#526888] hover:text-white transition-colors">Guia</Link>
          <span className="text-white">/</span>
          <Link href={`/guia/empresa/${slug}`} className="text-[#526888] hover:text-white transition-colors truncate max-w-[160px]">{listing.name}</Link>
          <span className="text-white">/</span>
          <span className="text-[#d4d4da]">Upgrade</span>
        </div>

        {/* Header */}
        <section className="px-5 lg:px-20 pt-10 pb-10 bg-[#0a0e18] border-b border-[#141d2c]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
            <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">Guia Comercial — Upgrade</span>
          </div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[44px] leading-none mb-2">
            Mais destaque para sua empresa
          </h1>
          <p className="text-[#7a9ab5] text-[15px]">
            {cat?.icon} <strong className="text-white">{listing.name}</strong> · {listing.city}, {listing.state}
          </p>
        </section>

        {/* Formulário + benefícios */}
        <section className="px-5 lg:px-20 py-12">
          <div className="flex flex-col xl:flex-row gap-12 items-start">

            <div className="flex-1">
              <p className="text-[#7a9ab5] text-[15px] mb-6">
                Selecione o plano desejado e preencha seus dados. Nossa equipe entrará em contato para finalizar.
              </p>
              <UpgradeForm
                slug={listing.slug}
                listingName={listing.name}
                defaultPlan={defaultPlan}
                activeGateways={activeGateways}
                premiumPrice={premiumPrice}
                destaquePrice={destaquePrice}
              />
            </div>

            {/* O que muda */}
            <div className="xl:w-[300px] shrink-0">
              <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5 sticky top-24">
                <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">Comparativo de planos</p>
                <div className="flex flex-col gap-1">
                  {[
                    { feature: "Aparece no diretório",        free: true,  premium: true,  destaque: true  },
                    { feature: "Nome e cidade",                free: true,  premium: true,  destaque: true  },
                    { feature: "Telefone",                     free: true,  premium: true,  destaque: true  },
                    { feature: "Logo",                         free: false, premium: true,  destaque: true  },
                    { feature: "Descrição completa",           free: false, premium: true,  destaque: true  },
                    { feature: "WhatsApp, site e Instagram",   free: false, premium: true,  destaque: true  },
                    { feature: "Endereço + mapa Google",       free: false, premium: true,  destaque: true  },
                    { feature: "Horário de funcionamento",     free: false, premium: true,  destaque: true  },
                    { feature: "Topo da categoria",            free: false, premium: false, destaque: true  },
                    { feature: "Badge ★ Destaque",             free: false, premium: false, destaque: true  },
                    { feature: "Seção Parceiros na home",      free: false, premium: false, destaque: true  },
                  ].map(row => (
                    <div key={row.feature}
                      className="grid grid-cols-[1fr_40px_40px_50px] gap-1 py-2 border-b border-[#0e1520] text-[11px]">
                      <span className="text-[#526888]">{row.feature}</span>
                      <span className="text-center">{row.free     ? <span className="text-[#22c55e]">✓</span> : <span className="text-white">—</span>}</span>
                      <span className="text-center">{row.premium  ? <span className="text-[#818cf8]">✓</span> : <span className="text-white">—</span>}</span>
                      <span className="text-center">{row.destaque ? <span className="text-[#ff1f1f]">✓</span> : <span className="text-white">—</span>}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-[1fr_40px_40px_50px] gap-1 pt-3 text-[11px] font-bold">
                    <span className="text-[#526888]">Preço</span>
                    <span className="text-center text-[#526888]">Free</span>
                    <span className="text-center text-[#818cf8]">{premiumPrice / 100}/mês</span>
                    <span className="text-center text-[#ff1f1f]">{destaquePrice / 100}/mês</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
