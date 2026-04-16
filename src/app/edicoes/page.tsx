import Link from "next/link";
import { Suspense } from "react";
import Header from "@/components/Header";
import FooterMinimal from "@/components/FooterMinimal";
import AdBanner from "@/components/AdBanner";
import EditionSearch from "./_EditionSearch";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  apikey:        SERVICE,
  Authorization: `Bearer ${SERVICE}`,
  Prefer:        "count=exact",
};

export const metadata = {
  title: "Edições — Revista Magnum",
  description: "Acervo completo da Revista Magnum — edições regulares e especiais.",
};

interface Edition {
  id: string; title: string; number: number | null; slug: string;
  coverImageUrl: string | null; publishedAt: string | null;
  type: string; pageCount: number | null;
}

const ITEMS_PER_PAGE = 16;

/** Builds PostgREST OR-filter for full-text search across edition fields */
function buildSearchFilter(q: string): string {
  if (!q) return "";
  // Encode the term; use %25 so PostgREST receives literal % wildcards
  const t = encodeURIComponent(q);
  const p = `%25${t}%25`;
  const numQ = parseInt(q, 10);
  const numPart = !isNaN(numQ) && numQ > 0 ? `,number.eq.${numQ}` : "";
  return `&or=(title.ilike.${p},editorial.ilike.${p},tableOfContents.ilike.${p}${numPart})`;
}

export default async function EdicoesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; pagina?: string; q?: string }>;
}) {
  const { tipo, pagina, q: rawQ } = await searchParams;
  const q      = rawQ?.trim() ?? "";
  const page   = Math.max(1, parseInt(pagina ?? "1", 10));
  const offset = (page - 1) * ITEMS_PER_PAGE;

  let editions: Edition[] = [];
  let total        = 0;
  let totalRegular = 0;
  let totalSpecial = 0;

  try {
    const typeFilter   = tipo === "normais"   ? "&type=eq.REGULAR"
                       : tipo === "especiais" ? "&type=eq.SPECIAL"
                       : "";
    const searchFilter = buildSearchFilter(q);

    const [edRes, regRes, spRes] = await Promise.all([
      fetch(
        `${BASE}/editions?isPublished=eq.true${typeFilter}${searchFilter}&order=publishedAt.desc&limit=${ITEMS_PER_PAGE}&offset=${offset}&select=id,title,number,slug,coverImageUrl,publishedAt,type,pageCount`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(`${BASE}/editions?isPublished=eq.true&type=eq.REGULAR&select=id`,
        { headers: HEADERS, cache: "no-store" }),
      fetch(`${BASE}/editions?isPublished=eq.true&type=eq.SPECIAL&select=id`,
        { headers: HEADERS, cache: "no-store" }),
    ]);

    total        = parseInt(edRes.headers.get("Content-Range")?.split("/")?.[1]  ?? "0", 10) || 0;
    totalRegular = parseInt(regRes.headers.get("Content-Range")?.split("/")?.[1] ?? "0", 10) || 0;
    totalSpecial = parseInt(spRes.headers.get("Content-Range")?.split("/")?.[1]  ?? "0", 10) || 0;

    const data = await edRes.json();
    editions = Array.isArray(data) ? data : [];
  } catch {
    // DB unavailable
  }

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const totalAll   = totalRegular + totalSpecial;

  // Group by year (only when NOT searching)
  const byYear: Record<string, Edition[]> = {};
  if (!q) {
    for (const ed of editions) {
      const year = ed.publishedAt
        ? String(new Date(ed.publishedAt).getFullYear())
        : "Sem data";
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(ed);
    }
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  const tabHref = (t?: string) =>
    t ? `/edicoes?tipo=${t}${q ? `&q=${encodeURIComponent(q)}` : ""}` : `/edicoes${q ? `?q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      {/* Page hero */}
      <div className="hero-metal border-b border-[#141d2c] h-[100px] flex items-center px-5 lg:px-20 mt-16">
        <div className="flex flex-col gap-1">
          <h1 className="font-['Barlow_Condensed'] font-extrabold text-[#dce8ff] text-[36px] leading-none">
            Edições
          </h1>
          <p className="text-[#526888] text-[13px]">
            {totalRegular} edições regulares · {totalSpecial} edições especiais · {totalAll} no total
          </p>
        </div>
        <div className="flex-1" />
        {/* Search input — wrapped in Suspense because it uses useSearchParams */}
        <Suspense fallback={
          <div className="bg-[#141d2c] border border-[#1c2a3e] rounded-md h-[38px] w-[220px]" />
        }>
          <EditionSearch initialQuery={q} />
        </Suspense>
      </div>

      {/* Filters */}
      <div className="bg-[#070a12] border-b border-[#141d2c] h-[52px] flex items-center px-5 lg:px-20">
        <div className="flex items-center">
          {[
            { label: "Todas",    count: totalAll,     href: tabHref(),           active: !tipo },
            { label: "Normais",  count: totalRegular, href: tabHref("normais"),  active: tipo === "normais"   },
            { label: "Especiais",count: totalSpecial, href: tabHref("especiais"),active: tipo === "especiais" },
          ].map((tab) => (
            <Link key={tab.label} href={tab.href}
              className={`flex items-center gap-1.5 px-5 h-[52px] border-b-2 transition-colors ${
                tab.active
                  ? "border-[#ff1f1f] text-[#ff1f1f]"
                  : "border-transparent text-[#526888] hover:text-[#7a9ab5]"
              }`}>
              <span className="text-[14px] font-semibold">{tab.label}</span>
              <span className={`text-[11px] font-semibold px-1.5 py-[2px] rounded-full ${
                tab.active ? "bg-[#cc0000] text-white" : "bg-[#141d2c] text-[#526888]"
              }`}>{tab.count}</span>
            </Link>
          ))}
        </div>

        {/* Search result count */}
        {q && (
          <p className="ml-5 text-[#526888] text-[13px]">
            {total} resultado{total !== 1 ? "s" : ""} para{" "}
            <span className="text-white font-semibold">&ldquo;{q}&rdquo;</span>
          </p>
        )}
      </div>

      {/* Ad leaderboard */}
      <div className="bg-[#070a12] flex items-center justify-center py-3">
        <AdBanner position="EDITIONS_TOP" bannerSize="LEADERBOARD" />
      </div>

      {/* Content row */}
      <div className="flex gap-10 px-5 lg:px-20 pt-12 pb-16 items-start">

        {/* Main */}
        <div className="flex flex-col gap-8 flex-1 min-w-0">

          {/* Search: flat grid */}
          {q && (
            <>
              {editions.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-[#526888] text-[16px] mb-2">
                    Nenhuma edição encontrada para &ldquo;{q}&rdquo;
                  </p>
                  <p className="text-[#1c2a3e] text-[13px]">
                    Tente outro termo — título, número, editorial ou conteúdo do índice.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {editions.map((edition) => <EditionCard key={edition.id} edition={edition} />)}
                </div>
              )}
            </>
          )}

          {/* Normal: grouped by year */}
          {!q && (
            <>
              {years.length === 0 ? (
                <p className="text-white text-sm py-12 text-center">Nenhuma edição encontrada.</p>
              ) : (
                years.map((year) => (
                  <div key={year} className="flex flex-col gap-4">
                    <p className="text-white text-[13px] font-semibold tracking-[1px]">{year}</p>
                    <div className="bg-[#141d2c] h-px w-full" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {byYear[year].map((edition) => <EditionCard key={edition.id} edition={edition} />)}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 mt-4">
              {page > 1 && (
                <Link href={`/edicoes?${tipo ? `tipo=${tipo}&` : ""}${q ? `q=${encodeURIComponent(q)}&` : ""}pagina=${page - 1}`}
                  className="border border-[#1c2a3e] text-[#7a9ab5] hover:text-white text-[13px] font-semibold px-3 py-2 rounded transition-colors">
                  ‹
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 12) }, (_, i) => i + 1).map((p) => {
                if (p > 3 && p < totalPages - 1 && Math.abs(p - page) > 1) {
                  if (p === 4) return <span key={p} className="text-[#1c2a3e] px-1">...</span>;
                  return null;
                }
                return (
                  <Link key={p}
                    href={`/edicoes?${tipo ? `tipo=${tipo}&` : ""}${q ? `q=${encodeURIComponent(q)}&` : ""}pagina=${p}`}
                    className={`text-[13px] font-semibold px-3 py-2 rounded transition-colors ${
                      p === page ? "bg-[#ff1f1f] text-white" : "border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
                    }`}>
                    {p}
                  </Link>
                );
              })}
              {page < totalPages && (
                <Link href={`/edicoes?${tipo ? `tipo=${tipo}&` : ""}${q ? `q=${encodeURIComponent(q)}&` : ""}pagina=${page + 1}`}
                  className="border border-[#1c2a3e] text-[#7a9ab5] hover:text-white text-[13px] font-semibold px-3 py-2 rounded transition-colors">
                  ›
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-8 w-[300px] shrink-0">
          <AdBanner position="EDITIONS_SIDEBAR" bannerSize="MED_RECT" />
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-lg p-5 flex flex-col gap-3">
            <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[18px]">Edições Especiais</p>
            <p className="text-[#526888] text-[12px] leading-relaxed">
              {totalSpecial} edições temáticas sobre armas, munições, caça e legislação.
            </p>
            <Link href="/edicoes?tipo=especiais"
              className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#b0c4d8] hover:text-white text-[13px] font-semibold h-[36px] flex items-center justify-center rounded transition-colors">
              Ver Edições Especiais →
            </Link>
          </div>
          <AdBanner position="EDITIONS_SIDEBAR" bannerSize="HALF_PAGE" />
        </aside>
      </div>

      <FooterMinimal />
    </div>
  );
}

/* ── Card component (shared) ──────────────────────────────────── */
function EditionCard({ edition }: { edition: Edition }) {
  const isSpecial = edition.type === "SPECIAL";
  return (
    <div className="card-metal-border hover:scale-[1.02] transition-transform duration-300">
      <Link
        href={`/edicoes/${edition.slug}`}
        className="group relative rounded-[13px] overflow-hidden flex flex-col bg-[#0a0f1a] h-full"
      >
        {/* Cover */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {edition.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={edition.coverImageUrl}
              alt={edition.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`absolute inset-0 flex items-center justify-center ${isSpecial ? "bg-[#cc0000]/20" : "bg-white/5"}`}>
              <p className={`font-['Barlow_Condensed'] font-extrabold text-[24px] ${isSpecial ? "text-[#ff1f1f]/40" : "text-white/10"}`}>
                {isSpecial ? "ESP" : edition.number ? `Nº ${edition.number}` : "—"}
              </p>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#141416] to-transparent" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 px-3.5 pt-2 pb-4"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)" }}>
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-bold tracking-[0.8px] uppercase px-1.5 py-[2px] rounded-[3px] ${
              isSpecial
                ? "bg-[#ff1f1f]/20 text-[#ff6b6b] border border-[#ff1f1f]/30"
                : "bg-white/5 text-white/40 border border-white/10"
            }`}>
              {isSpecial ? "Especial" : "Regular"}
            </span>
            {edition.number && !isSpecial && (
              <span className="text-[9px] font-semibold text-white/30">#{edition.number}</span>
            )}
          </div>
          <p className="font-['Barlow_Condensed'] font-bold text-white text-[15px] leading-snug line-clamp-2 group-hover:text-white/90 transition-colors">
            {edition.number ? `Edição ${edition.number}` : edition.title}
          </p>
          {edition.publishedAt && (
            <p className="text-white/25 text-[10px]">
              {new Date(edition.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
              {edition.pageCount ? ` · ${edition.pageCount}p` : ""}
            </p>
          )}
        </div>

        {isSpecial && (
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ boxShadow: "inset 0 0 30px rgba(255,31,31,0.06)" }} />
        )}
      </Link>
    </div>
  );
}
