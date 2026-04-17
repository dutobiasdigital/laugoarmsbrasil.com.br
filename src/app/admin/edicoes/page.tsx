import Link from "next/link";
import { Suspense } from "react";
import EditionThumb from "./_EditionThumb";
import EditionsSearchBar from "./_EditionsSearchBar";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

function fmtViews(n: number): string {
  if (n === 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

function ContentBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      title={ok ? `${label}: cadastrado` : `${label}: não cadastrado`}
      className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-[2px] rounded-[2px] tracking-wide ${
        ok
          ? "bg-[#0f2a1a] text-[#22c55e] border border-[#22c55e]/20"
          : "bg-[#141d2c] text-[#2a3a4e] border border-[#1c2a3e]"
      }`}
    >
      {ok ? "✓" : "·"} {label}
    </span>
  );
}

type SortKey = "number" | "title" | "type" | "date" | "status" | "featured";

const SORT_COL: Record<SortKey, string> = {
  number:   "number",
  title:    "title",
  type:     "type",
  date:     "publishedAt",
  status:   "isPublished",
  featured: "isFeatured",
};

const COLS = "50px 44px 1fr 90px 90px 210px 68px 100px";

export default async function AdminEdicoesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string; filtro?: string; pagina?: string;
    sortBy?: string; sortDir?: string;
  }>;
}) {
  const { q, filtro, pagina, sortBy: rawSortBy, sortDir: rawSortDir } = await searchParams;

  const page     = Math.max(1, parseInt(pagina ?? "1", 10));
  const PER_PAGE = 50;
  const sortBy   = (SORT_COL[rawSortBy as SortKey] ? rawSortBy as SortKey : "number");
  const sortDir  = rawSortDir === "asc" ? "asc" : "desc";

  interface Edition {
    id: string; title: string; number: number | null; slug: string;
    type: string; isPublished: boolean; isFeatured: boolean;
    publishedAt: string | null; coverImageUrl: string | null;
    editorial: string | null; tableOfContents: string | null;
    pageFlipUrl: string | null;
  }

  let editions: Edition[] = [];
  let total = 0;
  let viewsMap: Record<string, number> = {};

  try {
    const qp: string[] = [
      `select=id,title,number,slug,type,isPublished,isFeatured,publishedAt,coverImageUrl,editorial,tableOfContents,pageFlipUrl`,
      `order=${SORT_COL[sortBy]}.${sortDir}.nullslast`,
      `limit=${PER_PAGE}`,
      `offset=${(page - 1) * PER_PAGE}`,
    ];
    if (q)                   qp.push(`title=ilike.*${encodeURIComponent(q)}*`);
    if (filtro === "destaque") qp.push(`isFeatured=eq.true`);
    else if (filtro === "regular")  qp.push(`type=eq.REGULAR`);
    else if (filtro === "especial") qp.push(`type=eq.SPECIAL`);

    const res = await fetch(`${BASE}/editions?${qp.join("&")}`, {
      headers: { ...HEADERS, Prefer: "count=exact" },
      cache: "no-store",
    });
    if (res.ok) {
      editions = await res.json();
      const cr = res.headers.get("Content-Range");
      if (cr) { const m = cr.match(/\/(\d+)$/); if (m) total = parseInt(m[1], 10); }
    }

    if (editions.length > 0) {
      const slugList = editions.map((e) => e.slug).join(",");
      const vRes = await fetch(
        `${BASE}/edition_view_stats?edition_slug=in.(${slugList})&select=edition_slug,total_views`,
        { headers: HEADERS, cache: "no-store" }
      );
      if (vRes.ok) {
        const vData: { edition_slug: string; total_views: number }[] = await vRes.json();
        viewsMap = Object.fromEntries((vData ?? []).map((r) => [r.edition_slug, Number(r.total_views)]));
      }
    }
  } catch { /* DB unavailable */ }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  /* ── URL builder (server-side, preserves all current params) ── */
  function buildUrl(overrides: Record<string, string | undefined>) {
    const base: Record<string, string | undefined> = {
      q,
      filtro,
      sortBy: rawSortBy,
      sortDir: rawSortDir,
    };
    const merged = { ...base, ...overrides };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return `/admin/edicoes${qs ? `?${qs}` : ""}`;
  }

  /* ── Sort link + icon helpers ── */
  function sortHref(col: SortKey) {
    const isActive  = sortBy === col;
    const nextDir   = isActive && sortDir === "desc" ? "asc" : "desc";
    return buildUrl({ sortBy: col, sortDir: nextDir, pagina: "1" });
  }
  function sortIcon(col: SortKey) {
    const isActive = sortBy === col;
    if (!isActive)
      return <span className="text-[#2a3a4e] group-hover:text-[#526888] ml-0.5 transition-colors">↕</span>;
    return <span className="text-[#ff6b6b] ml-0.5">{sortDir === "desc" ? "↓" : "↑"}</span>;
  }
  function thLink(col: SortKey, label: string) {
    return (
      <Link href={sortHref(col)} className="group flex items-center text-white hover:text-[#ff6b6b] transition-colors whitespace-nowrap">
        {label}{sortIcon(col)}
      </Link>
    );
  }

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Edições
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {total.toLocaleString("pt-BR")} {filtro === "destaque" ? "em destaque" : filtro === "regular" ? "regulares" : filtro === "especial" ? "especiais" : "edições cadastradas"}
          </p>
        </div>
        <Link
          href="/admin/edicoes/nova"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 flex items-center rounded-[6px] transition-colors"
        >
          + Nova Edição
        </Link>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {/* ── Omnisearch + filter buttons (Client Component) ─────── */}
      <Suspense fallback={<div className="h-[38px] mb-5 bg-[#141d2c] rounded-[6px] animate-pulse w-[500px]" />}>
        <EditionsSearchBar initialQ={q ?? ""} />
      </Suspense>

      {/* ── Data Table ──────────────────────────────────────────── */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">

        {/* Table header */}
        <div
          className="bg-[#0a0e18] border-b border-[#1c2a3e] px-4 py-2.5 grid items-center gap-3 text-[11px] font-semibold tracking-[0.4px] uppercase"
          style={{ gridTemplateColumns: COLS }}
        >
          {thLink("number",   "Nº")}
          <span className="text-white">Capa</span>
          {thLink("title",    "Título")}
          {thLink("type",     "Tipo")}
          {thLink("date",     "Data")}
          {thLink("status",   "Status / Conteúdo")}
          <span className="text-white" title="Visualizações no leitor">👁 Leit.</span>
          <span className="text-white">Ações</span>
        </div>

        {/* Rows */}
        {editions.length === 0 ? (
          <p className="text-[#526888] text-[14px] p-10 text-center">Nenhuma edição encontrada.</p>
        ) : (
          editions.map((ed, i) => {
            const hasEditorial = !!ed.editorial?.trim();
            const hasIndex     = (() => {
              try { return JSON.parse(ed.tableOfContents ?? "[]").length > 0; }
              catch { return false; }
            })();
            const hasPageFlip  = !!ed.pageFlipUrl?.trim();
            const views        = viewsMap[ed.slug] ?? 0;

            /* zebra + destaque tinting */
            const rowBg = ed.isFeatured
              ? "bg-[#ff1f1f]/[0.07] hover:bg-[#ff1f1f]/[0.12]"
              : i % 2 === 0
                ? "bg-[#0e1520] hover:bg-white/[0.02]"
                : "bg-[#080c14] hover:bg-white/[0.015]";

            return (
              <div
                key={ed.id}
                className={`px-4 py-2.5 grid items-center gap-3 transition-colors border-b border-[#141d2c]/60 last:border-b-0 ${rowBg}`}
                style={{ gridTemplateColumns: COLS }}
              >
                {/* Nº + star */}
                <div className="flex items-center gap-1 min-w-0">
                  <p className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[18px] leading-none tabular-nums shrink-0">
                    {ed.number ?? "—"}
                  </p>
                  {ed.isFeatured && (
                    <span title="Em destaque" className="text-[11px] leading-none shrink-0">⭐</span>
                  )}
                </div>

                {/* Capa */}
                <div className="w-[36px] h-[48px] bg-[#141d2c] rounded-[2px] overflow-hidden flex items-center justify-center shrink-0">
                  {ed.coverImageUrl
                    ? <EditionThumb src={ed.coverImageUrl} alt={ed.title} />
                    : <span className="text-[#2a3a4e] text-[10px]">—</span>}
                </div>

                {/* Título */}
                <p className="text-[#d4d4da] text-[13px] truncate leading-snug">{ed.title}</p>

                {/* Tipo */}
                <span className={`inline-flex items-center h-[20px] px-2 rounded-[2px] text-[10px] font-bold w-fit ${
                  ed.type === "SPECIAL" ? "bg-[#260a0a] text-[#ff1f1f]" : "bg-[#141d2c] text-[#7a9ab5]"
                }`}>
                  {ed.type === "SPECIAL" ? "ESPECIAL" : "REGULAR"}
                </span>

                {/* Data */}
                <p className="text-[#7a9ab5] text-[12px] tabular-nums">
                  {ed.publishedAt
                    ? new Date(ed.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
                    : "—"}
                </p>

                {/* Status + badges de conteúdo */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className={`inline-flex items-center h-[18px] px-2 rounded-full text-[9px] font-bold w-fit ${
                      ed.isPublished ? "bg-[#0f381f] text-[#22c55e]" : "bg-[#141d2c] text-[#526888]"
                    }`}>
                      {ed.isPublished ? "● PUBLICADA" : "○ RASCUNHO"}
                    </span>
                    {ed.isFeatured && (
                      <span className="inline-flex items-center h-[18px] px-2 rounded-full text-[9px] font-bold bg-[#3a0f0f] text-[#ff8080] border border-[#ff1f1f]/20 w-fit">
                        ⭐ DESTAQUE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <ContentBadge ok={hasEditorial} label="Editorial" />
                    <ContentBadge ok={hasIndex}     label="Índice"    />
                    <ContentBadge ok={hasPageFlip}  label="Leitor"    />
                  </div>
                </div>

                {/* Visualizações */}
                <div className="flex flex-col items-start gap-0.5">
                  <span className={`font-['Barlow_Condensed'] font-bold text-[16px] tabular-nums leading-none ${
                    views > 0 ? "text-white" : "text-[#2a3a4e]"
                  }`}>
                    {fmtViews(views)}
                  </span>
                  {views > 0 && <span className="text-[#3a4a5e] text-[9px]">leituras</span>}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/admin/edicoes/${ed.id}`}          className="text-[#7a9ab5] hover:text-white text-[12px] transition-colors">Editar</Link>
                  <Link href={`/admin/edicoes/${ed.id}/paginas`}  className="text-[#526888] hover:text-white text-[12px] transition-colors" title="Páginas do leitor">Pág.</Link>
                  <Link href={`/edicoes/${ed.slug}`} target="_blank" className="text-[#3a4a5e] hover:text-white text-[12px] transition-colors">Ver</Link>
                </div>
              </div>
            );
          })
        )}

        {/* ── Paginação ── */}
        {totalPages > 1 && (() => {
          const items: (number | "…")[] = [];
          const WING = 2;
          for (let p = 1; p <= totalPages; p++) {
            if (p === 1 || p === totalPages || Math.abs(p - page) <= WING) {
              items.push(p);
            } else if (items[items.length - 1] !== "…") {
              items.push("…");
            }
          }
          const btn = "h-[30px] flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-colors";
          return (
            <div className="px-5 py-3 flex items-center justify-between border-t border-[#141d2c] flex-wrap gap-2">
              <p className="text-[#7a9ab5] text-[13px]">
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de {total.toLocaleString("pt-BR")} edições
              </p>
              <div className="flex items-center gap-1">
                {page > 1 ? (
                  <Link href={buildUrl({ pagina: String(page - 1) })} className={`${btn} w-[30px] bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white`}>‹</Link>
                ) : (
                  <span className={`${btn} w-[30px] bg-[#0e1520] border border-[#141d2c] text-[#2a3a4e] cursor-default`}>‹</span>
                )}
                {items.map((item, idx) =>
                  item === "…" ? (
                    <span key={`e${idx}`} className={`${btn} w-[24px] text-[#2a3a4e]`}>…</span>
                  ) : (
                    <Link key={item} href={buildUrl({ pagina: String(item) })}
                      className={`${btn} min-w-[30px] px-1 ${
                        item === page ? "bg-[#ff1f1f] text-white" : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
                      }`}
                    >{item}</Link>
                  )
                )}
                {page < totalPages ? (
                  <Link href={buildUrl({ pagina: String(page + 1) })} className={`${btn} w-[30px] bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white`}>›</Link>
                ) : (
                  <span className={`${btn} w-[30px] bg-[#0e1520] border border-[#141d2c] text-[#2a3a4e] cursor-default`}>›</span>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
