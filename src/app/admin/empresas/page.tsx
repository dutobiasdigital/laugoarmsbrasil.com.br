import Link from "next/link";
import { Suspense } from "react";
import AdminSearchBar from "../_components/AdminSearchBar";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: "count=exact" };

const SEGMENT_LABELS: Record<string, string> = {
  ARMAS:          "Armas",
  MUNICOES:       "Munições",
  ACESSORIOS:     "Acessórios",
  CACA:           "Caça",
  TIRO_ESPORTIVO: "Tiro Esportivo",
  OUTROS:         "Outros",
};

const PIPELINE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  REGISTERED:     { bg: "bg-[#141d2c]", text: "text-[#7a9ab5]", label: "Cadastrado"      },
  EMAIL_VERIFIED: { bg: "bg-[#0f2438]", text: "text-[#60a5fa]", label: "E-mail Validado" },
  COMPLETE:       { bg: "bg-[#1a1f0f]", text: "text-[#a3e635]", label: "Completo"         },
  ACTIVE:         { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "Ativo"            },
  SUSPENDED:      { bg: "bg-[#380f0f]", text: "text-[#f87171]", label: "Suspenso"         },
};

interface UserRow { name: string | null; email: string | null; }
interface Company {
  id: string;
  tradeName: string;
  email: string | null;
  segment: string | null;
  pipelineStatus: string;
  listingType: string;
  createdAt: string;
  users: UserRow | UserRow[] | null;
}

type SortKey = "tradeName" | "pipelineStatus" | "listingType" | "createdAt";
const SORT_COL: Record<SortKey, string> = {
  tradeName:      "tradeName",
  pipelineStatus: "pipelineStatus",
  listingType:    "listingType",
  createdAt:      "createdAt",
};

const PER_PAGE = 30;
const COLS     = "2fr 1.5fr 1fr 1fr 1fr 80px";

export default async function AdminEmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filtro?: string; pagina?: string; sortBy?: string; sortDir?: string }>;
}) {
  const { q, filtro, pagina, sortBy: rawSortBy, sortDir: rawSortDir } = await searchParams;

  const page    = Math.max(1, parseInt(pagina ?? "1", 10));
  const sortBy  = (SORT_COL[rawSortBy as SortKey] ? rawSortBy as SortKey : "tradeName") as SortKey;
  const sortDir = rawSortDir === "desc" ? "desc" : "asc";

  let companies: Company[] = [];
  let total = 0;

  // Stats query (sem filtro de status)
  let statsTotal = 0, statsAtivos = 0, statsPendentes = 0, statsSuspensos = 0;

  try {
    // Query de stats
    const statsRes = await fetch(
      `${BASE}/companies?select=pipelineStatus`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: "count=exact" }, cache: "no-store" }
    );
    if (statsRes.ok) {
      const statsData: { pipelineStatus: string }[] = await statsRes.json();
      const scr = statsRes.headers.get("Content-Range");
      statsTotal     = parseInt(scr?.split("/")?.[1] ?? "0", 10) || 0;
      statsAtivos    = statsData.filter(c => c.pipelineStatus === "ACTIVE").length;
      statsPendentes = statsData.filter(c => ["REGISTERED", "EMAIL_VERIFIED"].includes(c.pipelineStatus)).length;
      statsSuspensos = statsData.filter(c => c.pipelineStatus === "SUSPENDED").length;
    }
  } catch { /* ignore */ }

  try {
    const qp: string[] = [
      `select=id,tradeName,email,segment,pipelineStatus,listingType,createdAt,users(name,email)`,
      `order=${SORT_COL[sortBy]}.${sortDir}.nullslast`,
      `limit=${PER_PAGE}`,
      `offset=${(page - 1) * PER_PAGE}`,
    ];
    if (q) qp.push(`tradeName=ilike.*${encodeURIComponent(q)}*`);
    if (filtro === "ativos")    qp.push("pipelineStatus=eq.ACTIVE");
    if (filtro === "pendentes") qp.push("pipelineStatus=in.(REGISTERED,EMAIL_VERIFIED)");
    if (filtro === "suspensos") qp.push("pipelineStatus=eq.SUSPENDED");

    const res = await fetch(`${BASE}/companies?${qp.join("&")}`, { headers: HEADERS, cache: "no-store" });
    if (res.ok) {
      companies = await res.json();
      const cr = res.headers.get("Content-Range");
      if (cr) { const m = cr.match(/\/(\d+)$/); if (m) total = parseInt(m[1], 10); }
    }
  } catch { /* DB unavailable */ }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  function buildUrl(overrides: Record<string, string | undefined>) {
    const base: Record<string, string | undefined> = {
      q:       q || undefined,
      filtro:  filtro || undefined,
      sortBy:  rawSortBy,
      sortDir: rawSortDir,
    };
    const merged = { ...base, ...overrides };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) { if (v) params.set(k, v); }
    const qs = params.toString();
    return `/admin/empresas${qs ? `?${qs}` : ""}`;
  }

  function sortHref(col: SortKey) {
    const isActive = sortBy === col;
    const nextDir  = isActive && sortDir === "asc" ? "desc" : "asc";
    return buildUrl({ sortBy: col, sortDir: nextDir, pagina: "1" });
  }
  function sortIcon(col: SortKey) {
    const isActive = sortBy === col;
    if (!isActive) return <span className="text-[#2a3a4e] group-hover:text-[#526888] ml-0.5 transition-colors">↕</span>;
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Empresas Anunciantes
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {total.toLocaleString("pt-BR")} empresa{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/empresas/nova"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 flex items-center rounded-[6px] transition-colors"
        >
          + Nova Empresa
        </Link>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",     value: statsTotal,     color: "text-white"         },
          { label: "Ativos",    value: statsAtivos,    color: "text-[#22c55e]"     },
          { label: "Pendentes", value: statsPendentes, color: "text-[#facc15]"     },
          { label: "Suspensos", value: statsSuspensos, color: "text-[#f87171]"     },
        ].map(s => (
          <div key={s.label} className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4">
            <p className={`font-['Barlow_Condensed'] font-bold text-[36px] leading-none ${s.color}`}>{s.value}</p>
            <p className="text-[#526888] text-[12px] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Omnisearch + filtros */}
      <Suspense fallback={<div className="h-[38px] mb-5 bg-[#141d2c] rounded-[6px] animate-pulse w-[300px]" />}>
        <AdminSearchBar
          baseHref="/admin/empresas"
          placeholder="Buscar empresa..."
          filterParam="filtro"
          initialQ={q ?? ""}
          filters={[
            { value: "",          label: "Todos"     },
            { value: "ativos",    label: "Ativos"    },
            { value: "pendentes", label: "Pendentes" },
            { value: "suspensos", label: "Suspensos" },
          ]}
        />
      </Suspense>

      {/* Tabela */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">

        {/* Header */}
        <div
          className="bg-[#0a0e18] border-b border-[#1c2a3e] px-4 py-2.5 hidden sm:grid items-center gap-3 text-[11px] font-semibold tracking-[0.4px] uppercase"
          style={{ gridTemplateColumns: COLS }}
        >
          {thLink("tradeName",      "Empresa")}
          <span className="text-white">Dono</span>
          <span className="text-white">Segmento</span>
          {thLink("listingType",    "Tipo")}
          {thLink("pipelineStatus", "Pipeline")}
          <span className="text-white">Ações</span>
        </div>

        {companies.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-[#7a9ab5] text-[13px] mb-4">Nenhuma empresa encontrada.</p>
            <Link href="/admin/empresas/nova" className="inline-flex bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[38px] px-5 items-center rounded-[6px] transition-colors">
              Cadastrar primeira empresa
            </Link>
          </div>
        ) : (
          companies.map((c, i) => {
            const ps = PIPELINE_STYLE[c.pipelineStatus] ?? PIPELINE_STYLE.REGISTERED;
            // users pode ser objeto ou array dependendo do Supabase
            const owner = Array.isArray(c.users) ? c.users[0] : c.users;
            const rowBg = i % 2 === 0 ? "bg-[#0e1520] hover:bg-white/[0.02]" : "bg-[#080c14] hover:bg-white/[0.015]";

            return (
              <div key={c.id}
                className={`px-4 py-3 hidden sm:grid items-center gap-3 transition-colors border-b border-[#141d2c]/60 last:border-b-0 ${rowBg}`}
                style={{ gridTemplateColumns: COLS }}
              >
                {/* Empresa */}
                <div className="min-w-0">
                  <p className="text-[#d4d4da] text-[14px] font-semibold truncate">{c.tradeName}</p>
                  {c.email && <p className="text-[#526888] text-[11px] truncate">{c.email}</p>}
                </div>

                {/* Dono */}
                <div className="min-w-0">
                  <p className="text-[#7a9ab5] text-[13px] truncate">{owner?.name ?? "—"}</p>
                  {owner?.email && <p className="text-[#526888] text-[11px] truncate">{owner.email}</p>}
                </div>

                {/* Segmento */}
                <p className="text-[#7a9ab5] text-[13px] truncate">
                  {SEGMENT_LABELS[c.segment ?? ""] ?? c.segment ?? "—"}
                </p>

                {/* Tipo */}
                <span className="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold bg-[#141d2c] text-[#7a9ab5] w-fit">
                  {c.listingType}
                </span>

                {/* Pipeline */}
                <span className={`inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold w-fit ${ps.bg} ${ps.text}`}>
                  {ps.label}
                </span>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <Link href={`/admin/empresas/${c.id}`} className="text-[#7a9ab5] hover:text-white text-[12px] transition-colors">
                    Editar
                  </Link>
                </div>
              </div>
            );
          })
        )}

        {/* Paginação com elipses */}
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
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de {total.toLocaleString("pt-BR")} empresas
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
