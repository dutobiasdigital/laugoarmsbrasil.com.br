import Link from "next/link";
import { Suspense } from "react";
import Header from "@/components/Header";
import FooterMinimal from "@/components/FooterMinimal";
import AdBanner from "@/components/AdBanner";
import EditionSearch from "./_EditionSearch";
import EditionsInfiniteList from "./_EditionsInfiniteList";
import { getModuleConfig } from "@/lib/module-settings";

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
  title: "Edições — Laúgo Arms Brasil",
  description: "Acervo completo da Laúgo Arms Brasil — edições regulares e especiais.",
};

interface Edition {
  id: string; title: string; number: number | null; slug: string;
  coverImageUrl: string | null; publishedAt: string | null;
  type: string; pageCount: number | null; summary: string | null;
}

function buildSearchFilter(q: string): string {
  if (!q) return "";
  const t = encodeURIComponent(q);
  const p = `%25${t}%25`;
  const numQ = parseInt(q, 10);
  const numPart = !isNaN(numQ) && numQ > 0 ? `,number.eq.${numQ}` : "";
  return `&or=(title.ilike.${p},editorial.ilike.${p},tableOfContents.ilike.${p}${numPart})`;
}

export default async function EdicoesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; pagina?: string; q?: string; view?: string }>;
}) {
  const [{ tipo, pagina, q: rawQ, view: rawView }, modConfig] = await Promise.all([
    searchParams,
    getModuleConfig("revistas"),
  ]);
  const q      = rawQ?.trim() ?? "";
  const view   = rawView === "list" ? "list" : "grid";
  const page   = Math.max(1, parseInt(pagina ?? "1", 10));

  const ITEMS_PER_PAGE = modConfig.itemsPerPage;
  const infiniteScroll = modConfig.infiniteScroll;

  // Scroll infinito: o server só busca a 1ª página; o client component cuida do restante
  const limit  = ITEMS_PER_PAGE;
  const offset = infiniteScroll ? 0 : (page - 1) * ITEMS_PER_PAGE;

  type TopEdition = { id: string; title: string; number: number | null; slug: string; totalViews: number };

  let editions: Edition[] = [];
  let total        = 0;
  let totalRegular = 0;
  let totalSpecial = 0;
  let topEditions: TopEdition[] = [];

  try {
    const typeFilter   = tipo === "normais"   ? "&type=eq.REGULAR"
                       : tipo === "especiais" ? "&type=eq.SPECIAL"
                       : "";
    const searchFilter = buildSearchFilter(q);

    const [edRes, regRes, spRes, viewStatsRes] = await Promise.all([
      fetch(
        `${BASE}/editions?isPublished=eq.true${typeFilter}${searchFilter}&order=publishedAt.desc&limit=${limit}&offset=${offset}&select=id,title,number,slug,coverImageUrl,publishedAt,type,pageCount,summary`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(`${BASE}/editions?isPublished=eq.true&type=eq.REGULAR&select=id`,
        { headers: HEADERS, cache: "no-store" }),
      fetch(`${BASE}/editions?isPublished=eq.true&type=eq.SPECIAL&select=id`,
        { headers: HEADERS, cache: "no-store" }),
      fetch(`${BASE}/edition_view_stats?order=total_views.desc&limit=5&select=edition_slug,total_views`,
        { headers: HEADERS, cache: "no-store" }),
    ]);

    total        = parseInt(edRes.headers.get("Content-Range")?.split("/")?.[1]  ?? "0", 10) || 0;
    totalRegular = parseInt(regRes.headers.get("Content-Range")?.split("/")?.[1] ?? "0", 10) || 0;
    totalSpecial = parseInt(spRes.headers.get("Content-Range")?.split("/")?.[1]  ?? "0", 10) || 0;

    const data = await edRes.json();
    editions = Array.isArray(data) ? data : [];

    /* ── Top 5 mais visualizadas ── */
    if (viewStatsRes.ok) {
      const stats: { edition_slug: string; total_views: number }[] = await viewStatsRes.json();
      if (stats.length > 0) {
        const slugList = stats.map((s) => s.edition_slug).join(",");
        const topRes = await fetch(
          `${BASE}/editions?slug=in.(${slugList})&select=id,title,number,slug`,
          { headers: HEADERS, cache: "no-store" }
        );
        if (topRes.ok) {
          const topData: { id: string; title: string; number: number | null; slug: string }[] = await topRes.json();
          topEditions = stats
            .map((s) => {
              const ed = topData.find((e) => e.slug === s.edition_slug);
              return ed ? { ...ed, totalViews: s.total_views } : null;
            })
            .filter(Boolean) as TopEdition[];
        }
      }
    }
  } catch {
    // DB unavailable
  }

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const totalAll   = totalRegular + totalSpecial;

  // Agrupamento por ano (só para paginação normal — sem busca)
  const byYear: Record<string, Edition[]> = {};
  if (!q && !infiniteScroll) {
    for (const ed of editions) {
      const year = ed.publishedAt
        ? String(new Date(ed.publishedAt).getFullYear())
        : "Sem data";
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(ed);
    }
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  /** Monta href preservando todos os params atuais */
  function buildHref(overrides: Record<string, string | undefined>) {
    const params: Record<string, string> = {};
    if (tipo)  params.tipo   = tipo;
    if (q)     params.q      = q;
    if (pagina && pagina !== "1") params.pagina = pagina;
    if (view !== "grid") params.view = view;
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === "" || v === "grid") delete params[k];
      else params[k] = v;
    });
    const qs = new URLSearchParams(params).toString();
    return `/edicoes${qs ? `?${qs}` : ""}`;
  }

  const tabHref  = (t?: string) => buildHref({ tipo: t, pagina: "1" });
  const viewHref = (v: string)  => buildHref({ view: v, pagina: "1" });
  const pageHref = (p: number)  => buildHref({ pagina: String(p) });

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero-metal px-5 lg:px-20 pt-14 pb-12 border-b border-[#141d2c] mt-16">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
          <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">
            Acervo
          </span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-0">
          <div className="flex-1">
            <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[52px] lg:text-[64px] leading-[0.95] mb-4 max-w-[700px]">
              O maior acervo de revistas de armas do Brasil
            </h1>
            <p className="text-[#7a9ab5] text-[16px] leading-[26px] max-w-[520px]">
              {totalRegular} edições regulares e {totalSpecial} edições especiais —
              {" "}{totalAll} revistas disponíveis no acervo digital.
            </p>
          </div>
          <div className="lg:ml-10 shrink-0">
            <Suspense fallback={
              <div className="bg-[#141d2c] border border-[#1c2a3e] rounded-[8px] h-[52px] w-[280px]" />
            }>
              <EditionSearch initialQuery={q} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ── Tabs de filtro + toggle de visualização ──────────────── */}
      <div className="bg-[#070a12] border-b border-[#141d2c] h-[52px] flex items-center px-5 lg:px-20">
        <div className="flex items-center flex-1">
          {[
            { label: "Todas",     count: totalAll,     href: tabHref(),            active: !tipo          },
            { label: "Normais",   count: totalRegular, href: tabHref("normais"),   active: tipo === "normais"   },
            { label: "Especiais", count: totalSpecial, href: tabHref("especiais"), active: tipo === "especiais" },
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
          {q && (
            <p className="ml-5 text-[#526888] text-[13px] hidden sm:block">
              {total} resultado{total !== 1 ? "s" : ""} para{" "}
              <span className="text-white font-semibold">&ldquo;{q}&rdquo;</span>
            </p>
          )}
        </div>

      </div>

      {/* Ad leaderboard */}
      <div className="bg-[#070a12] flex items-center justify-center py-3">
        <AdBanner position="EDITIONS_TOP" bannerSize="LEADERBOARD" />
      </div>

      {/* ── Conteúdo ─────────────────────────────────────────────── */}
      <div className="flex gap-10 px-5 lg:px-20 pt-10 pb-16 items-start">

        {/* Main */}
        <div className="flex flex-col gap-8 flex-1 min-w-0">

          {/* ── Barra de visualização ── */}
          <div className="flex items-center justify-between">
            <p className="text-[#526888] text-[13px]">
              {q
                ? <>{total} resultado{total !== 1 ? "s" : ""} para <span className="text-white font-semibold">&ldquo;{q}&rdquo;</span></>
                : <>{total} edição{total !== 1 ? "es" : ""} no acervo</>
              }
            </p>
            <div className="flex items-center gap-1">
              <Link href={viewHref("grid")} title="Visualização em grade"
                className={`w-[36px] h-[36px] flex items-center justify-center rounded-[6px] transition-colors ${
                  view === "grid" ? "bg-[#ff1f1f] text-white" : "bg-[#141d2c] border border-[#1c2a3e] text-[#526888] hover:text-white"
                }`}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <rect x="0" y="0" width="6.5" height="6.5" rx="1" fill="currentColor"/>
                  <rect x="8.5" y="0" width="6.5" height="6.5" rx="1" fill="currentColor"/>
                  <rect x="0" y="8.5" width="6.5" height="6.5" rx="1" fill="currentColor"/>
                  <rect x="8.5" y="8.5" width="6.5" height="6.5" rx="1" fill="currentColor"/>
                </svg>
              </Link>
              <Link href={viewHref("list")} title="Visualização em lista"
                className={`w-[36px] h-[36px] flex items-center justify-center rounded-[6px] transition-colors ${
                  view === "list" ? "bg-[#ff1f1f] text-white" : "bg-[#141d2c] border border-[#1c2a3e] text-[#526888] hover:text-white"
                }`}>
                <svg width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
                  <rect x="0" y="0" width="15" height="2.5" rx="1" fill="currentColor"/>
                  <rect x="0" y="4.75" width="15" height="2.5" rx="1" fill="currentColor"/>
                  <rect x="0" y="9.5" width="15" height="2.5" rx="1" fill="currentColor"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* ── SCROLL INFINITO ── */}
          {infiniteScroll && (
            <EditionsInfiniteList
              initialEditions={editions}
              total={total}
              itemsPerPage={ITEMS_PER_PAGE}
              tipo={tipo}
              q={q}
              view={view}
            />
          )}

          {/* ── PAGINAÇÃO NORMAL ── */}
          {!infiniteScroll && (
            <>
              {/* Resultados de busca */}
              {q && (
                editions.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-[#526888] text-[16px] mb-2">
                      Nenhuma edição encontrada para &ldquo;{q}&rdquo;
                    </p>
                    <p className="text-[#1c2a3e] text-[13px]">
                      Tente outro termo — título, número, editorial ou conteúdo do índice.
                    </p>
                  </div>
                ) : view === "list" ? (
                  <div className="flex flex-col gap-3">
                    {editions.map((ed) => <EditionListItem key={ed.id} edition={ed} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {editions.map((ed) => <EditionCard key={ed.id} edition={ed} />)}
                  </div>
                )
              )}

              {/* Agrupado por ano */}
              {!q && (
                years.length === 0 ? (
                  <p className="text-white text-sm py-12 text-center">Nenhuma edição encontrada.</p>
                ) : (
                  years.map((year) => (
                    <div key={year} className="flex flex-col gap-4">
                      <p className="text-white text-[13px] font-semibold tracking-[1px]">{year}</p>
                      <div className="bg-[#141d2c] h-px w-full" />
                      {view === "list" ? (
                        <div className="flex flex-col gap-3">
                          {byYear[year].map((ed) => <EditionListItem key={ed.id} edition={ed} />)}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {byYear[year].map((ed) => <EditionCard key={ed.id} edition={ed} />)}
                        </div>
                      )}
                    </div>
                  ))
                )
              )}

              {/* Paginação numerada */}
              {totalPages > 1 && (() => {
                const WING = 2;
                const items: (number | "…")[] = [];
                for (let p = 1; p <= totalPages; p++) {
                  if (p === 1 || p === totalPages || Math.abs(p - page) <= WING) {
                    items.push(p);
                  } else if (items[items.length - 1] !== "…") {
                    items.push("…");
                  }
                }
                const btnBase = "h-[32px] flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-colors";
                return (
                  <div className="flex items-center gap-1 mt-4">
                    {page > 1 ? (
                      <Link href={pageHref(page - 1)} className={`${btnBase} w-[32px] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white`}>‹</Link>
                    ) : (
                      <span className={`${btnBase} w-[32px] border border-[#141d2c] text-[#2a3a4e] cursor-default`}>‹</span>
                    )}
                    {items.map((item, i) =>
                      item === "…" ? (
                        <span key={`e-${i}`} className={`${btnBase} w-[24px] text-[#2a3a4e]`}>…</span>
                      ) : (
                        <Link key={item} href={pageHref(item)}
                          className={`${btnBase} min-w-[32px] px-1 ${
                            item === page
                              ? "bg-[#ff1f1f] text-white"
                              : "border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
                          }`}>
                          {item}
                        </Link>
                      )
                    )}
                    {page < totalPages ? (
                      <Link href={pageHref(page + 1)} className={`${btnBase} w-[32px] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white`}>›</Link>
                    ) : (
                      <span className={`${btnBase} w-[32px] border border-[#141d2c] text-[#2a3a4e] cursor-default`}>›</span>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-8 w-[300px] shrink-0">
          <AdBanner position="EDITIONS_SIDEBAR" bannerSize="MED_RECT" />

          {/* Edições Mais Visualizadas */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-lg p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-1 border-b border-[#141d2c]">
              <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
              <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[18px] leading-none">
                Mais Visualizadas
              </p>
            </div>
            {(topEditions.length > 0
              ? topEditions
              : [
                  { id: "1", title: "Edição 145", slug: "edicao-145", number: 145, totalViews: 0 },
                  { id: "2", title: "Edição 144", slug: "edicao-144", number: 144, totalViews: 0 },
                  { id: "3", title: "Edição 143", slug: "edicao-143", number: 143, totalViews: 0 },
                  { id: "4", title: "Edição 142", slug: "edicao-142", number: 142, totalViews: 0 },
                  { id: "5", title: "Edição 141", slug: "edicao-141", number: 141, totalViews: 0 },
                ]
            ).map((edition, i) => (
              <Link key={edition.id} href={`/edicoes/${edition.slug}`} className="group flex items-start gap-3 hover:opacity-80 transition-opacity">
                <span className="font-['Barlow_Condensed'] font-extrabold text-[22px] leading-none shrink-0 w-8 tabular-nums" style={{ color: "var(--brand, #ff1f1f)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-[#dce8ff] text-[13px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                    {edition.title}
                  </p>
                  {edition.number && (
                    <span className="text-[#526888] text-[11px] font-mono">Nº {edition.number}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

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

/* ── Card — visualização em GRADE (usado na paginação normal) ──── */
function EditionCard({ edition }: { edition: Edition }) {
  const isSpecial = edition.type === "SPECIAL";
  return (
    <div className="card-metal-border hover:scale-[1.02] transition-transform duration-300">
      <Link
        href={`/edicoes/${edition.slug}`}
        className="group relative rounded-[13px] overflow-hidden flex flex-col bg-[#0a0f1a] h-full"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          {edition.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={edition.coverImageUrl} alt={edition.title}
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
        <div className="flex flex-col gap-1 px-3.5 pt-2 pb-4"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)" }}>
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-bold tracking-[0.8px] uppercase px-1.5 py-[2px] rounded-[3px] ${
              isSpecial ? "bg-[#ff1f1f]/20 text-[#ff6b6b] border border-[#ff1f1f]/30" : "bg-white/5 text-white/40 border border-white/10"
            }`}>{isSpecial ? "Especial" : "Regular"}</span>
            {edition.number && !isSpecial && <span className="text-[9px] font-semibold text-white/30">#{edition.number}</span>}
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

/* ── Item — visualização em LISTA (usado na paginação normal) ───── */
function EditionListItem({ edition }: { edition: Edition }) {
  const isSpecial = edition.type === "SPECIAL";
  const publishMeta = edition.publishedAt
    ? new Date(edition.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : null;

  return (
    <Link href={`/edicoes/${edition.slug}`}
      className="group flex bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/25 rounded-[12px] overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/40"
    >
      <div className="w-[100px] sm:w-[120px] shrink-0 aspect-[3/4] relative overflow-hidden bg-[#0a0e18]">
        {edition.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={edition.coverImageUrl} alt={edition.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center ${isSpecial ? "bg-[#cc0000]/15" : "bg-white/[0.03]"}`}>
            <p className={`font-['Barlow_Condensed'] font-extrabold text-[20px] ${isSpecial ? "text-[#ff1f1f]/30" : "text-white/10"}`}>
              {edition.number ? `Nº ${edition.number}` : "—"}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between gap-3 p-4 sm:p-5 flex-1 min-w-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[9px] font-bold tracking-[0.8px] uppercase px-1.5 py-[2px] rounded-[3px] ${
              isSpecial ? "bg-[#ff1f1f]/20 text-[#ff6b6b] border border-[#ff1f1f]/30" : "bg-white/5 text-white/40 border border-white/10"
            }`}>{isSpecial ? "Especial" : "Regular"}</span>
            {edition.number && !isSpecial && <span className="text-[9px] font-semibold text-white/30">#{edition.number}</span>}
            {publishMeta && <span className="text-[#526888] text-[11px]">{publishMeta}</span>}
            {edition.pageCount && <span className="text-[#3a4a5e] text-[11px]">· {edition.pageCount} págs.</span>}
          </div>
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] sm:text-[26px] leading-tight group-hover:text-white/90 transition-colors">
            {edition.number ? `Laúgo Arms Brasil — Edição ${edition.number}` : edition.title}
          </h2>
          {edition.summary && (
            <p className="text-[#7a9ab5] text-[13px] leading-[20px]">{edition.summary}</p>
          )}
        </div>
        <div>
          <span className="inline-flex items-center gap-2 bg-[#ff1f1f] group-hover:bg-[#cc0000] text-white text-[12px] font-semibold h-[34px] px-4 rounded-[6px] transition-colors">
            <span>📖</span> Ler Edição
          </span>
        </div>
      </div>
    </Link>
  );
}
