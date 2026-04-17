import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES, PLAN_LABELS, categoryBySegment } from "@/lib/guia";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const H        = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface Company {
  id: string;
  tradeName: string;
  segment: string;
  listingType: string;
  city: string | null;
  state: string | null;
  logoUrl: string | null;
  description: string | null;
  featured: boolean;
}

async function search(q: string): Promise<Company[]> {
  if (!q.trim()) return [];
  try {
    const encoded = encodeURIComponent(q.trim());
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/companies?pipelineStatus=eq.ACTIVE&or=(tradeName.ilike.*${encoded}*,city.ilike.*${encoded}*,description.ilike.*${encoded}*)&select=id,tradeName,segment,listingType,city,state,logoUrl,description,featured&order=featured.desc,listingType.desc&limit=30`,
      { headers: H, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ q?: string }> }
): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" — Busca no Guia Magnum` : "Busca — Guia Comercial Magnum",
  };
}

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query   = q?.trim() ?? "";
  const results = await search(query);

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">

        {/* Busca bar */}
        <section className="px-5 lg:px-20 py-10 bg-[#0a0e18] border-b border-[#141d2c]">
          <div className="flex items-center gap-2 mb-2 text-[13px]">
            <Link href="/guia" className="text-[#526888] hover:text-white transition-colors">Guia Comercial</Link>
            <span className="text-white">/</span>
            <span className="text-[#d4d4da]">Busca</span>
          </div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-6">
            {query ? `Resultados para "${query}"` : "Buscar no Guia"}
          </h1>
          <form action="/guia/busca" method="GET" className="flex gap-2 max-w-[560px]">
            <input
              name="q"
              defaultValue={query}
              placeholder="Buscar empresa, cidade ou serviço..."
              className="flex-1 bg-[#141d2c] border border-[#1c2a3e] rounded-[8px] h-[52px] px-4 text-[15px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] transition-colors"
            />
            <button type="submit"
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[52px] px-7 rounded-[8px] transition-colors whitespace-nowrap">
              Buscar
            </button>
          </form>
        </section>

        {/* Results */}
        <section className="px-5 lg:px-20 py-10">
          {!query ? (
            <BrowseByCategory />
          ) : results.length === 0 ? (
            <EmptySearch query={query} />
          ) : (
            <>
              <p className="text-[#526888] text-[13px] mb-6">
                {results.length} resultado{results.length !== 1 ? "s" : ""} para <strong className="text-[#d4d4da]">&quot;{query}&quot;</strong>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map(co => <CompanyCard key={co.id} company={co} />)}
              </div>
            </>
          )}
        </section>

      </main>
      <Footer />
    </div>
  );
}

function BrowseByCategory() {
  return (
    <div>
      <p className="text-[#7a9ab5] text-[15px] mb-6">Ou navegue por categoria:</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {CATEGORIES.map(cat => (
          <Link key={cat.value} href={`/guia/${cat.slug}`}
            className="group bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/40 rounded-[12px] p-4 flex flex-col gap-2 transition-all hover:bg-[#111827]">
            <span className="text-[28px]">{cat.icon}</span>
            <p className="text-[#d4d4da] text-[14px] font-semibold group-hover:text-white transition-colors">{cat.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EmptySearch({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-[48px] mb-4">🔍</p>
      <p className="font-['Barlow_Condensed'] font-bold text-white text-[26px] mb-2">
        Nenhum resultado para &quot;{query}&quot;
      </p>
      <p className="text-[#526888] text-[14px] mb-8 max-w-[400px]">
        Tente buscar por outro termo ou navegue pelas categorias abaixo.
      </p>
      <BrowseByCategory />
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const cat = categoryBySegment(company.segment);
  const pl  = PLAN_LABELS[company.listingType] ?? PLAN_LABELS["FREE"];
  return (
    <Link href={`/guia/empresa/${company.id}`}
      className="group bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/30 rounded-[12px] overflow-hidden flex flex-col transition-all">
      <div className="h-[80px] bg-[#141d2c] flex items-center px-5 gap-4">
        {company.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.logoUrl} alt={company.tradeName}
            className="w-[48px] h-[48px] object-contain rounded-[6px] bg-[#0e1520] shrink-0" />
        ) : (
          <div className="w-[48px] h-[48px] bg-[#0e1520] rounded-[6px] flex items-center justify-center text-[22px] shrink-0">
            {cat?.icon ?? "🏢"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-[15px] font-bold truncate group-hover:text-[#ff1f1f] transition-colors">{company.tradeName}</p>
          <p className="text-[#526888] text-[12px]">{company.city} · {company.state}</p>
        </div>
        {company.listingType !== "FREE" && company.listingType !== "NONE" && (
          <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] shrink-0 ${pl.color}`}>{pl.label}</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        {company.description && (
          <p className="text-[#7a9ab5] text-[13px] leading-[20px] line-clamp-2">{company.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="flex items-center gap-1.5 text-[#526888] text-[11px]">
            <span>{cat?.icon}</span> {cat?.label ?? company.segment}
          </span>
          <span className="text-[#ff1f1f] text-[12px] font-semibold group-hover:translate-x-1 transition-transform">
            Ver perfil →
          </span>
        </div>
      </div>
    </Link>
  );
}
