import Link from "next/link";
import EditionThumb from "./_EditionThumb";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

function qs(base: Record<string, string | undefined>, overrides: Record<string, string | undefined> = {}) {
  const merged = { ...base, ...overrides };
  const params = Object.entries(merged)
    .filter(([, v]) => v !== undefined && v !== "" && v !== "TODOS")
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");
  return params ? `?${params}` : "";
}

/** Formata número de views de forma compacta */
function fmtViews(n: number): string {
  if (n === 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

/** Badge de conteúdo (Editorial / Índice / Leitor) */
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

export default async function AdminEdicoesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; pagina?: string; ordem?: string }>;
}) {
  const { q, tipo, pagina, ordem } = await searchParams;

  const page      = Math.max(1, parseInt(pagina ?? "1", 10));
  const PER_PAGE  = 12;
  const sortDir   = ordem === "asc" ? "asc" : "desc";
  const nextDir   = sortDir === "desc" ? "asc" : "desc";
  const baseParams = { q, tipo };

  let editions: {
    id: string;
    title: string;
    number: number | null;
    slug: string;
    type: string;
    isPublished: boolean;
    publishedAt: string | null;
    coverImageUrl: string | null;
    editorial: string | null;
    tableOfContents: string | null;
    pageFlipUrl: string | null;
  }[] = [];
  let total = 0;

  // View counts agrupados por slug
  let viewsMap: Record<string, number> = {};

  try {
    const qParams: string[] = [];
    qParams.push(`select=id,title,number,slug,type,isPublished,publishedAt,coverImageUrl,editorial,tableOfContents,pageFlipUrl`);
    qParams.push(`order=number.${sortDir}.nullslast`);
    qParams.push(`limit=${PER_PAGE}`);
    qParams.push(`offset=${(page - 1) * PER_PAGE}`);
    if (q)    qParams.push(`title=ilike.*${encodeURIComponent(q)}*`);
    if (tipo && tipo !== "TODOS") qParams.push(`type=eq.${tipo}`);

    const res = await fetch(`${BASE}/editions?${qParams.join("&")}`, {
      headers: { ...HEADERS, Prefer: "count=exact" },
      cache: "no-store",
    });

    if (res.ok) {
      editions = await res.json();
      const cr = res.headers.get("Content-Range");
      if (cr) { const m = cr.match(/\/(\d+)$/); if (m) total = parseInt(m[1], 10); }
    }

    // Busca views para os slugs desta página
    if (editions.length > 0) {
      const slugList = editions.map((e) => e.slug).join(",");
      const vRes = await fetch(
        `${BASE}/edition_view_stats?edition_slug=in.(${slugList})&select=edition_slug,total_views`,
        { headers: HEADERS, cache: "no-store" }
      );
      if (vRes.ok) {
        const vData: { edition_slug: string; total_views: number }[] = await vRes.json();
        viewsMap = Object.fromEntries(
          (vData ?? []).map((r) => [r.edition_slug, Number(r.total_views)])
        );
      }
    }
  } catch {
    // DB unavailable
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Edições
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {total.toLocaleString("pt-BR")} edições cadastradas
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

      {/* ── Filtros ─────────────────────────────────────────────────── */}
      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        {ordem && <input type="hidden" name="ordem" value={ordem} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="🔍 Buscar por título..."
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-[260px]"
        />
        <select
          name="tipo"
          defaultValue={tipo ?? "TODOS"}
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f]"
        >
          <option value="TODOS">Todos os tipos</option>
          <option value="REGULAR">Regular</option>
          <option value="SPECIAL">Especial</option>
        </select>
        <button
          type="submit"
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[38px] px-4 rounded-[6px] transition-colors"
        >
          Filtrar
        </button>
        {(q || tipo) && (
          <Link href={`/admin/edicoes${qs({ ordem })}`} className="text-[#7a9ab5] hover:text-white text-[13px] h-[38px] flex items-center px-2 transition-colors">
            Limpar
          </Link>
        )}
      </form>

      {/* ── Tabela ──────────────────────────────────────────────────── */}
      {/*
          Colunas: Nº | Capa | Título | Tipo | Data | Status/Conteúdo | Visualiz. | Ações
          grid-cols-[50px_44px_1fr_78px_78px_180px_68px_100px]
      */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">

        {/* Cabeçalho */}
        <div
          className="bg-[#141d2c] px-4 py-3 grid items-center gap-3 text-white text-[11px] font-semibold tracking-[0.5px]"
          style={{ gridTemplateColumns: "50px 44px 1fr 78px 78px 180px 68px 100px" }}
        >
          {/* Nº com toggle de ordem */}
          <div className="flex items-center gap-1.5">
            <span>Nº</span>
            <Link
              href={`/admin/edicoes${qs({ ...baseParams, ordem: nextDir, pagina: "1" })}`}
              title={sortDir === "desc" ? "Ordenar crescente" : "Ordenar decrescente"}
              className="w-[20px] h-[20px] flex items-center justify-center rounded-[3px] bg-[#0e1520] border border-[#1c2a3e] hover:border-[#ff1f1f]/50 text-[#526888] hover:text-[#ff6b6b] transition-colors text-[11px]"
            >
              {sortDir === "desc" ? "↓" : "↑"}
            </Link>
          </div>
          <span>Capa</span>
          <span>Título</span>
          <span>Tipo</span>
          <span>Data</span>
          <span>Status / Conteúdo</span>
          <span title="Total de visualizações no leitor">👁 Leit.</span>
          <span>Ações</span>
        </div>

        {/* Linhas */}
        {editions.length === 0 ? (
          <p className="text-white text-[13px] p-8 text-center">Nenhuma edição encontrada.</p>
        ) : (
          editions.map((ed, i) => {
            const hasEditorial = !!ed.editorial?.trim();
            const hasIndex     = (() => {
              try { return JSON.parse(ed.tableOfContents ?? "[]").length > 0; }
              catch { return false; }
            })();
            // Leitor ativo: tem pageFlipUrl (qualquer valor) OU pode ter pages no Storage
            const hasPageFlip  = !!ed.pageFlipUrl?.trim();
            const views        = viewsMap[ed.slug] ?? 0;

            return (
              <div key={ed.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                <div
                  className="px-4 py-3 grid items-center gap-3 hover:bg-white/[0.015] transition-colors"
                  style={{ gridTemplateColumns: "50px 44px 1fr 78px 78px 180px 68px 100px" }}
                >
                  {/* Nº */}
                  <p className="text-[#ff1f1f] font-['Barlow_Condensed'] font-bold text-[18px]">
                    {ed.number ?? "—"}
                  </p>

                  {/* Capa */}
                  <div className="w-[36px] h-[48px] bg-[#141d2c] rounded-[2px] overflow-hidden flex items-center justify-center shrink-0">
                    {ed.coverImageUrl
                      ? <EditionThumb src={ed.coverImageUrl} alt={ed.title} />
                      : <span className="text-white text-[10px]">—</span>}
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
                  <p className="text-[#7a9ab5] text-[12px]">
                    {ed.publishedAt
                      ? new Date(ed.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
                      : "—"}
                  </p>

                  {/* Status + Conteúdo */}
                  <div className="flex flex-col gap-1.5">
                    {/* Linha 1: publicação */}
                    <span className={`inline-flex items-center h-[18px] px-2 rounded-full text-[9px] font-bold w-fit ${
                      ed.isPublished ? "bg-[#0f381f] text-[#22c55e]" : "bg-[#141d2c] text-white"
                    }`}>
                      {ed.isPublished ? "● PUBLICADA" : "○ RASCUNHO"}
                    </span>
                    {/* Linha 2: badges de conteúdo */}
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
                    {views > 0 && (
                      <span className="text-[#3a4a5e] text-[9px]">leituras</span>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/admin/edicoes/${ed.id}`}
                      className="text-[#7a9ab5] hover:text-white text-[12px] transition-colors"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/admin/edicoes/${ed.id}/paginas`}
                      className="text-[#526888] hover:text-white text-[12px] transition-colors"
                      title="Páginas do leitor"
                    >
                      Pág.
                    </Link>
                    <Link
                      href={`/edicoes/${ed.slug}`}
                      target="_blank"
                      className="text-white hover:text-[#7a9ab5] text-[12px] transition-colors"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Paginação */}
        {totalPages > 1 && (() => {
          // Monta array de itens: número de página ou "…"
          const items: (number | "…")[] = [];
          const WING = 2; // páginas ao redor da atual

          for (let p = 1; p <= totalPages; p++) {
            const isFirst   = p === 1;
            const isLast    = p === totalPages;
            const nearCur   = Math.abs(p - page) <= WING;
            if (isFirst || isLast || nearCur) {
              items.push(p);
            } else if (items[items.length - 1] !== "…") {
              items.push("…");
            }
          }

          const btnBase = "h-[30px] flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-colors";

          return (
            <div className="px-5 py-3 flex items-center justify-between border-t border-[#141d2c] flex-wrap gap-2">
              <p className="text-white text-[13px]">
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de{" "}
                {total.toLocaleString("pt-BR")} edições
              </p>
              <div className="flex items-center gap-1">
                {/* Anterior */}
                {page > 1 ? (
                  <Link
                    href={`/admin/edicoes${qs({ ...baseParams, ordem, pagina: String(page - 1) })}`}
                    className={`${btnBase} w-[30px] bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white`}
                  >‹</Link>
                ) : (
                  <span className={`${btnBase} w-[30px] bg-[#0e1520] border border-[#141d2c] text-[#2a3a4e] cursor-default`}>‹</span>
                )}

                {items.map((item, i) =>
                  item === "…" ? (
                    <span key={`ellipsis-${i}`} className={`${btnBase} w-[24px] text-[#2a3a4e]`}>…</span>
                  ) : (
                    <Link
                      key={item}
                      href={`/admin/edicoes${qs({ ...baseParams, ordem, pagina: String(item) })}`}
                      className={`${btnBase} min-w-[30px] px-1 ${
                        item === page
                          ? "bg-[#ff1f1f] text-white"
                          : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
                      }`}
                    >
                      {item}
                    </Link>
                  )
                )}

                {/* Próxima */}
                {page < totalPages ? (
                  <Link
                    href={`/admin/edicoes${qs({ ...baseParams, ordem, pagina: String(page + 1) })}`}
                    className={`${btnBase} w-[30px] bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white`}
                  >›</Link>
                ) : (
                  <span className={`${btnBase} w-[30px] bg-[#0e1520] border border-[#141d2c] text-[#2a3a4e] cursor-default`}>›</span>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
