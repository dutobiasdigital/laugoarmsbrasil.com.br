import Link from "next/link";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

/** Monta query string preservando os params existentes */
function qs(base: Record<string, string | undefined>, overrides: Record<string, string | undefined> = {}) {
  const merged = { ...base, ...overrides };
  const params = Object.entries(merged)
    .filter(([, v]) => v !== undefined && v !== "" && v !== "TODOS")
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");
  return params ? `?${params}` : "";
}

export default async function AdminEdicoesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; pagina?: string; ordem?: string }>;
}) {
  const { q, tipo, pagina, ordem } = await searchParams;

  const page      = Math.max(1, parseInt(pagina ?? "1", 10));
  const PER_PAGE  = 12;
  const sortDir   = ordem === "asc" ? "asc" : "desc"; // padrão: decrescente
  const nextDir   = sortDir === "desc" ? "asc" : "desc";

  // Params compartilhados (sem pagina/ordem) para preservar nos links
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
  }[] = [];
  let total = 0;

  try {
    // Build query params
    const qParams: string[] = [];
    qParams.push(`select=id,title,number,slug,type,isPublished,publishedAt,coverImageUrl`);
    qParams.push(`order=number.${sortDir}.nullslast`);
    qParams.push(`limit=${PER_PAGE}`);
    qParams.push(`offset=${(page - 1) * PER_PAGE}`);
    if (q) qParams.push(`title=ilike.*${encodeURIComponent(q)}*`);
    if (tipo && tipo !== "TODOS") qParams.push(`type=eq.${tipo}`);

    const res = await fetch(`${BASE}/editions?${qParams.join("&")}`, {
      headers: { ...HEADERS, Prefer: "count=exact" },
      cache: "no-store",
    });

    if (res.ok) {
      editions = await res.json();
      // Parse total from Content-Range header: "0-11/42"
      const contentRange = res.headers.get("Content-Range");
      if (contentRange) {
        const match = contentRange.match(/\/(\d+)$/);
        if (match) total = parseInt(match[1], 10);
      }
    }
  } catch {
    // DB unavailable
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      {/* Header */}
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

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        {/* Preserva ordem atual ao filtrar */}
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
          <Link
            href={`/admin/edicoes${qs({ ordem })}`}
            className="text-[#7a9ab5] hover:text-white text-[13px] h-[38px] flex items-center px-2 transition-colors"
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">

        {/* Table header — coluna Nº tem botão de toggle de ordem */}
        <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-7 gap-3 items-center">
          {/* Nº com toggle */}
          <div className="flex items-center gap-1.5">
            <p className="text-white text-[11px] font-semibold tracking-[0.5px]">Nº</p>
            <Link
              href={`/admin/edicoes${qs({ ...baseParams, ordem: nextDir, pagina: "1" })}`}
              title={sortDir === "desc" ? "Ordenar crescente" : "Ordenar decrescente"}
              className="flex items-center justify-center w-[20px] h-[20px] rounded-[3px] bg-[#0e1520] border border-[#1c2a3e] hover:border-[#ff1f1f]/50 hover:text-[#ff6b6b] text-[#526888] transition-colors text-[11px]"
            >
              {sortDir === "desc" ? "↓" : "↑"}
            </Link>
          </div>
          {["Capa", "Título", "Tipo", "Data", "Status", "Ações"].map((h) => (
            <p key={h} className="text-white text-[11px] font-semibold tracking-[0.5px]">
              {h}
            </p>
          ))}
        </div>

        {editions.length === 0 ? (
          <p className="text-white text-[13px] p-8 text-center">
            Nenhuma edição encontrada.
          </p>
        ) : (
          editions.map((ed, i) => (
            <div key={ed.id}>
              {i > 0 && <div className="bg-[#141d2c] h-px" />}
              <div className="px-5 py-3.5 grid grid-cols-7 gap-3 items-center">
                <p className="text-[#ff1f1f] font-['Barlow_Condensed'] font-bold text-[18px]">
                  {ed.number ?? "—"}
                </p>
                <div className="w-[36px] h-[48px] bg-[#141d2c] rounded-[2px] overflow-hidden flex items-center justify-center">
                  {ed.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ed.coverImageUrl}
                      alt={ed.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-[10px]">—</span>
                  )}
                </div>
                <p className="text-[#d4d4da] text-[14px] truncate">{ed.title}</p>
                <span
                  className={`inline-flex items-center h-[20px] px-2 rounded-[2px] text-[10px] font-bold ${
                    ed.type === "SPECIAL"
                      ? "bg-[#260a0a] text-[#ff1f1f]"
                      : "bg-[#141d2c] text-[#7a9ab5]"
                  }`}
                >
                  {ed.type === "SPECIAL" ? "ESPECIAL" : "REGULAR"}
                </span>
                <p className="text-[#7a9ab5] text-[13px]">
                  {ed.publishedAt
                    ? new Date(ed.publishedAt).toLocaleDateString("pt-BR", {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
                <span
                  className={`inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold ${
                    ed.isPublished
                      ? "bg-[#0f381f] text-[#22c55e]"
                      : "bg-[#141d2c] text-white"
                  }`}
                >
                  {ed.isPublished ? "PUBLICADA" : "RASCUNHO"}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/edicoes/${ed.id}`}
                    className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors"
                  >
                    Editar
                  </Link>
                  <Link
                    href={`/edicoes/${ed.slug}`}
                    target="_blank"
                    className="text-white hover:text-[#7a9ab5] text-[13px] transition-colors"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 flex items-center justify-between border-t border-[#141d2c]">
            <p className="text-white text-[13px]">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de{" "}
              {total.toLocaleString("pt-BR")} edições
            </p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/admin/edicoes${qs({ ...baseParams, ordem, pagina: String(p) })}`}
                  className={`w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-colors ${
                    p === page
                      ? "bg-[#ff1f1f] text-white"
                      : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
