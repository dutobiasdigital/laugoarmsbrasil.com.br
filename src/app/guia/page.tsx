import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES, PLAN_LABELS } from "@/lib/guia";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Guia Comercial — Revista Magnum",
  description: "O maior diretório especializado do setor de armas, tiro esportivo, caça e defesa do Brasil. Encontre armareiros, clubes, advogados e mais.",
};

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

interface Listing {
  id: string; slug: string; name: string; category: string;
  plan: string; city: string; state: string;
  logoUrl: string | null; description: string | null;
  phone: string | null; whatsapp: string | null; website: string | null;
  featured: boolean; viewsCount: number;
}

interface GuidePlan {
  id: string;
  name: string;
  listingType: string;
  priceInCents: number;
  intervalMonths: number;
  features: string | null;
  highlight: boolean;
  badge: string | null;
  buttonText: string | null;
  sortOrder: number;
}

async function getGuidePlans(): Promise<GuidePlan[]> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/guide_plans?active=eq.true&order=sortOrder.asc&select=id,name,listingType,priceInCents,intervalMonths,features,highlight,badge,buttonText,sortOrder`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

async function getDestaques(): Promise<Listing[]> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/guide_listings?status=eq.ACTIVE&plan=in.(DESTAQUE,PREMIUM)&select=id,slug,name,category,plan,city,state,logoUrl,description,phone,whatsapp,website,featured,viewsCount&order=featured.desc,plan.desc&limit=6`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

async function getTotal(): Promise<number> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/guide_listings?status=eq.ACTIVE&select=id`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Prefer": "count=exact" }, cache: "no-store" }
    );
    const range = res.headers.get("content-range");
    if (range) return parseInt(range.split("/")[1]) || 0;
    const d = await res.json();
    return Array.isArray(d) ? d.length : 0;
  } catch { return 0; }
}

export default async function GuiaPage() {
  const [destaques, total, guidePlans] = await Promise.all([getDestaques(), getTotal(), getGuidePlans()]);

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">

        {/* ── Hero + Busca ─────────────────────────────────── */}
        <section className="hero-metal px-5 lg:px-20 pt-14 pb-12 border-b border-[#141d2c]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
            <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">
              Guia Comercial
            </span>
          </div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[52px] lg:text-[68px] leading-[0.95] mb-4 max-w-[700px]">
            O diretório do setor de armas no Brasil
          </h1>
          <p className="text-[#7a9ab5] text-[17px] leading-[28px] max-w-[560px] mb-8">
            Encontre armareiros, clubes de tiro, advogados especializados,
            instrutores táticos e muito mais — tudo em um só lugar.
          </p>

          {/* Busca */}
          <form action="/guia/busca" method="GET" className="flex gap-2 max-w-[580px]">
            <input
              name="q"
              placeholder="Buscar empresa, cidade ou serviço..."
              className="flex-1 bg-[#141d2c] border border-[#1c2a3e] rounded-[8px] h-[52px] px-4 text-[15px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] transition-colors"
            />
            <button type="submit"
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[52px] px-7 rounded-[8px] transition-colors whitespace-nowrap">
              Buscar
            </button>
          </form>

          <p className="text-white text-[13px] mt-4">
            {total > 0 ? `${total} empresa${total !== 1 ? "s" : ""} cadastrada${total !== 1 ? "s" : ""}` : "Seja o primeiro a cadastrar sua empresa"}
            {" "}·{" "}
            <Link href="/guia/cadastrar" className="text-[#ff1f1f] hover:text-white transition-colors">
              Cadastrar minha empresa →
            </Link>
          </p>
        </section>

        {/* ── Categorias ───────────────────────────────────── */}
        <section className="px-5 lg:px-20 py-14">
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-2">Navegue por categoria</p>
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-8">
            O que você está procurando?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <Link key={cat.value} href={`/guia/${cat.slug}`}
                className="group bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/40 rounded-[12px] p-4 flex flex-col gap-2 transition-all hover:bg-[#111827]">
                <span className="text-[28px]">{cat.icon}</span>
                <p className="text-[#d4d4da] text-[14px] font-semibold leading-snug group-hover:text-white transition-colors">
                  {cat.label}
                </p>
                <p className="text-white text-[11px] leading-[16px]">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Destaques ────────────────────────────────────── */}
        {destaques.length > 0 && (
          <section className="px-5 lg:px-20 pb-14">
            <div className="bg-[#141d2c] h-px mb-12" />
            <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-2">Empresas em destaque</p>
            <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-8">
              Parceiros do Guia Magnum
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {destaques.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}

        {/* ── Como funciona (para empresas) ────────────────── */}
        <section className="px-5 lg:px-20 pb-16 bg-[#0a0e18] border-t border-[#141d2c] pt-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-3">Para empresas</p>
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[42px] leading-[1] mb-5">
                Apareça para 45 mil leitores qualificados
              </h2>
              <p className="text-[#7a9ab5] text-[16px] leading-[26px] mb-8">
                O Guia Comercial da Revista Magnum é o único diretório especializado
                do setor no Brasil. Cadastre sua empresa e seja encontrado por
                atiradores, colecionadores e profissionais da área.
              </p>
              <div className="flex flex-col gap-4 mb-8">
                {[
                  { step: "01", title: "Cadastre sua empresa", desc: "Preencha o formulário em menos de 5 minutos." },
                  { step: "02", title: "Aguarde a aprovação", desc: "Nossa equipe valida e publica em até 24h." },
                  { step: "03", title: "Seja encontrado", desc: "Apareça nas buscas e categorias do guia." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-[36px] h-[36px] bg-[#ff1f1f]/10 border border-[#ff1f1f]/20 rounded-[6px] flex items-center justify-center shrink-0">
                      <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[13px]">{item.step}</span>
                    </div>
                    <div>
                      <p className="text-white text-[15px] font-semibold mb-0.5">{item.title}</p>
                      <p className="text-[#526888] text-[13px]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link href="/guia/cadastrar"
                  className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[48px] px-7 flex items-center rounded-[6px] transition-colors">
                  Cadastrar gratuitamente →
                </Link>
                <Link href="/anuncie"
                  className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-600 text-[#d4d4da] text-[14px] h-[48px] px-6 flex items-center rounded-[6px] transition-colors">
                  Ver planos
                </Link>
              </div>
            </div>

            {/* Planos resumidos */}
            <div className="flex flex-col gap-3">
              {guidePlans.map((pkg) => {
                const pl = PLAN_LABELS[pkg.listingType] ?? PLAN_LABELS["FREE"];
                const items = pkg.features ? pkg.features.split("\n").filter(Boolean) : [];
                const priceLabel = pkg.priceInCents === 0
                  ? "Gratuito"
                  : `${(pkg.priceInCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/${pkg.intervalMonths === 1 ? "mês" : pkg.intervalMonths === 3 ? "trim" : pkg.intervalMonths === 6 ? "sem" : "ano"}`;
                return (
                  <div key={pkg.id} className={`bg-[#0e1520] rounded-[10px] p-5 flex items-center gap-5 border ${pkg.highlight ? "border-[#ff1f1f]/30" : "border-[#141d2c]"}`}>
                    <div className="shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-[4px] ${pl.color}`}>{pl.label}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2">
                        {items.map(i => (
                          <span key={i} className="text-[#526888] text-[12px]">✓ {i}</span>
                        ))}
                      </div>
                    </div>
                    <p className="font-['Barlow_Condensed'] font-bold text-white text-[20px] shrink-0">{priceLabel}</p>
                  </div>
                );
              })}
              <p className="text-white text-[12px] text-center">
                Entre em contato: <a href="mailto:publicidade@revistamagnum.com.br" className="text-[#7a9ab5] hover:text-white transition-colors">publicidade@revistamagnum.com.br</a>
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

/* ── Card de listing ──────────────────────────────────────────── */
function ListingCard({ listing }: { listing: Listing }) {
  const cat = CATEGORIES.find(c => c.value === listing.category);
  const pl  = PLAN_LABELS[listing.plan];
  return (
    <Link href={`/guia/empresa/${listing.slug}`}
      className="group bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/30 rounded-[12px] overflow-hidden flex flex-col transition-all">
      {/* Header colorido */}
      <div className="h-[80px] bg-[#141d2c] flex items-center px-5 gap-4">
        {listing.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.logoUrl} alt={listing.name} className="w-[48px] h-[48px] object-contain rounded-[6px] bg-[#0e1520] shrink-0" />
        ) : (
          <div className="w-[48px] h-[48px] bg-[#0e1520] rounded-[6px] flex items-center justify-center text-[22px] shrink-0">
            {cat?.icon ?? "🏢"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-[15px] font-bold truncate group-hover:text-[#ff1f1f] transition-colors">{listing.name}</p>
          <p className="text-[#526888] text-[12px]">{listing.city} · {listing.state}</p>
        </div>
        {listing.plan !== "FREE" && (
          <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] shrink-0 ${pl.color}`}>{pl.label}</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        {listing.description && (
          <p className="text-[#7a9ab5] text-[13px] leading-[20px] line-clamp-2">{listing.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="flex items-center gap-1.5 text-[#526888] text-[11px]">
            <span>{cat?.icon}</span> {cat?.label}
          </span>
          <span className="text-[#ff1f1f] text-[12px] font-semibold group-hover:translate-x-1 transition-transform">
            Ver perfil →
          </span>
        </div>
      </div>
    </Link>
  );
}
