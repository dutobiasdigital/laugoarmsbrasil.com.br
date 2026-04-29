import Link from "next/link";
import { Suspense } from "react";
import AdminSearchBar from "../_components/AdminSearchBar";
import GuiaQuickAction from "./_GuiaQuickAction";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: "count=exact" };

const SEGMENT_LABELS: Record<string, string> = {
  ARMAS:          "Armas",
  MUNICOES:       "Munições",
  ACESSORIOS:     "Acessórios",
  CACA:           "Caça/Pesca",
  TIRO_ESPORTIVO: "Tiro Esportivo",
  OUTROS:         "Outros",
};

const PLAN_CFG: Record<string, { label: string; color: string }> = {
  NONE:     { label: "Sem plano", color: "bg-[#0e1520] text-[#2a3a4e] border border-[#141d2c]" },
  FREE:     { label: "Free",      color: "bg-[#141d2c] text-[#526888]"  },
  PREMIUM:  { label: "Premium",   color: "bg-[#1a1a40] text-[#818cf8]"  },
  DESTAQUE: { label: "Destaque",  color: "bg-[#260a0a] text-[#ff1f1f]"  },
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  REGISTERED:     { label: "Cadastrado",      color: "bg-[#141d2c] text-[#526888]"  },
  EMAIL_VERIFIED: { label: "E-mail OK",       color: "bg-[#0f2438] text-[#60a5fa]"  },
  COMPLETE:       { label: "Completo",        color: "bg-[#1a1f0f] text-[#a3e635]"  },
  ACTIVE:         { label: "Ativo",           color: "bg-[#0f381f] text-[#22c55e]"  },
  SUSPENDED:      { label: "Inativo",         color: "bg-[#141d2c] text-[#526888]"  },
};

interface Company {
  id: string;
  tradeName: string;
  segment: string;
  listingType: string;
  pipelineStatus: string;
  city: string | null;
  state: string | null;
  featured: boolean;
  viewsCount: number;
  createdAt: string;
}

type SortKey = "tradeName" | "segment" | "listingType" | "pipelineStatus" | "createdAt";
const SORT_COL: Record<SortKey, string> = {
  tradeName:      "tradeName",
  segment:        "segment",
  listingType:    "listingType",
  pipelineStatus: "pipelineStatus",
  createdAt:      "createdAt",
};

const PER_PAGE = 40;
const COLS     = "1fr 110px 100px 120px 110px 180px";

export default async function AdminGuiaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filtro?: string; plano?: string; pagina?: string; sortBy?: string; sortDir?: string }>;
}) {
  const { q, filtro, plano, pagina, sortBy: rawSortBy, sortDir: rawSortDir } = await searchParams;

  const page    = Math.max(1, parseInt(pagina ?? "1", 10));
  const sortBy  = (SORT_COL[rawSortBy as SortKey] ? rawSortBy as SortKey : "tradeName") as SortKey;
  const sortDir = rawSortDir === "desc" ? "desc" : "asc";

  let companies: Company[] = [];
  let total = 0;
  let statsTotal = 0, statsPending = 0, statsActive = 0, statsSuspended = 0;

  try {
    const statsRes = await fetch(
      `${BASE}/companies?select=pipelineStatus`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: "count=exact" }, cache: "no-store" }
    );
    if (statsRes.ok) {
      const statsData: { pipelineStatus: string }[] = await statsRes.json();
      const scr = statsRes.headers.get("Content-Range");
      statsTotal     = parseInt(scr?.split("/")?.[1] ?? "0", 10) || 0;
      statsActive    = statsData.filter(c => c.pipelineStatus === "ACTIVE").length;
      statsSuspended = statsData.filter(c => c.pipelineStatus === "SUSPENDED").length;
      statsPending   = statsTotal - statsActive - statsSuspended;
    }
  } catch { /* ignore */ }

  try {
    const qp: string[] = [
      `select=id,tradeName,segment,listingType,pipelineStatus,city,state,featured,viewsCount,createdAt`,
      `order=${SORT_COL[sortBy]}.${sortDir}.nullslast`,
      `limit=${PER_PAGE}`,
      `offset=${(page - 1) * PER_PAGE}`,
    ];
    if (q)                      qp.push(`tradeName=ilike.*${encodeURIComponent(q)}*`);
    if (filtro === "ativos")    qp.push("pipelineStatus=eq.ACTIVE");
    if (filtro === "inativos")  qp.push("pipelineStatus=eq.SUSPENDED");
    if (filtro === "pendentes") qp.push("pipelineStatus=in.(REGISTERED,EMAIL_VERIFIED,COMPLETE)");
    if (plano && plano !== "")  qp.push(`listingType=eq.${plano}`);

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
      plano:   plano || undefined,
      sortBy:  rawSortBy,
      sortDir: rawSortDir,
    };
    const merged = { ...base, ...overrides };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) { if (v) params.set(k, v); }
    const qs = params.toString();
    return `/admin/guia${qs ? `?${qs}` : ""}`;
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
            Guia
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {statsTotal.toLocaleString("pt-BR")} empresa{statsTotal !== 1 ? "s" : ""} cadastrada{statsTotal !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/guia/novo"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 flex items-center rounded-[6px] transition-colors"
        >
          + Nova Empresa
        </Link>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",     value: statsTotal,     color: "text-white"     },
          { label: "Ativos",    value: statsActive,    color: "text-[#22c55e]" },
          { label: "Pendentes", value: statsPending,   color: "text-[#ef9f1b]" },
          { label: "Inativos",  value: statsSuspended, color: "text-[#526888]" },
        ].map(s => (
          <div key={s.label} className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4">
            <p className={`font-['Barlow_Condensed'] font-bold text-[36px] leading-none ${s.color}`}>{s.value}</p>
            <p className="text-[#526888] text-[12px] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Omnisearch + filtro status */}
      <Suspense fallback={<div className="h-[38px] mb-5 bg-[#141d2c] rounded-[6px] animate-pulse w-[300px]" />}>
        <AdminSearchBar
          baseHref="/admin/guia"
          placeholder="Buscar por nome da empresa..."
          filterParam="filtro"
          initialQ={q ?? ""}
          filters={[
            { value: "",          label: "Todos"     },
            { value: "ativos",    label: "Ativos"    },
            { value: "pendentes", label: "Pendentes" },
            { value: "inativos",  label: "Inativos"  },
          ]}
        />
      </Suspense>

      {/* Filtro por plano */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="text-[#526888] text-[11px] font-semibold uppercase tracking-[0.8px] mr-1">Plano:</span>
        {[
          { value: "",         label: "Todos"     },
          { value: "NONE",     label: "Sem plano" },
          { value: "FREE",     label: "Free"      },
          { value: "PREMIUM",  label: "Premium"   },
          { value: "DESTAQUE", label: "Destaque"  },
        ].map(p => {
          const isActive = (plano ?? "") === p.value;
          return (
            <Link
              key={p.value}
              href={buildUrl({ plano: p.value || undefined, pagina: "1" })}
              className={`h-[30px] px-3 rounded-[4px] text-[12px] font-semibold transition-colors ${
                isActive
                  ? "bg-[#ff1f1f] text-white"
                  : "bg-[#141d2c] text-[#526888] hover:text-white border border-[#1c2a3e]"
              }`}
            >
              {p.label}
            </Link>
          );
        })}
      </div>

      {/* Tabela */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">

        {/* Header */}
        <div
          className="bg-[#0a0e18] border-b border-[#1c2a3e] px-4 py-2.5 hidden sm:grid items-center gap-3 text-[11px] font-semibold tracking-[0.4px] uppercase"
          style={{ gridTemplateColumns: COLS }}
        >
          {thLink("tradeName",      "Empresa")}
          {thLink("segment",        "Segmento")}
          {thLink("listingType",    "Plano")}
          {thLink("pipelineStatus", "Status")}
          <span className="text-white">Localização</span>
          <span className="text-white">Ações</span>
        </div>

        {companies.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#7a9ab5] text-[13px] mb-4">Nenhuma empresa encontrada.</p>
            <Link href="/admin/guia/novo" className="inline-flex bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[38px] px-5 items-center rounded-[6px] transition-colors">
              Cadastrar primeira empresa
            </Link>
          </div>
        ) : (
          companies.map((co, i) => {
            const plan   = PLAN_CFG[co.listingType]      ?? PLAN_CFG.NONE;
            const status = STATUS_CFG[co.pipelineStatus] ?? STATUS_CFG.REGISTERED;
            const rowBg  = i % 2 === 0 ? "bg-[#0e1520] hover:bg-white/[0.02]" : "bg-[#080c14] hover:bg-white/[0.015]";

            return (
              <div key={co.id}>
                {/* Desktop */}
                <div
                  className={`px-4 py-3 hidden sm:grid items-center gap-3 transition-colors border-b border-[#141d2c]/60 last:border-b-0 ${rowBg}`}
                  style={{ gridTemplateColumns: COLS }}
                >
                  {/* Empresa */}
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[13px] font-semibold truncate">{co.tradeName}</p>
                    <p className="text-[#526888] text-[11px] mt-0.5">
                      👁 {co.viewsCount.toLocaleString("pt-BR")} visitas
                      {co.featured ? " · ⭐ Destaque" : ""}
                    </p>
                  </div>

                  {/* Segmento */}
                  <p className="text-[#526888] text-[11px] truncate">
                    {SEGMENT_LABELS[co.segment] ?? co.segment}
                  </p>

                  {/* Plano */}
                  <span className={`inline-flex items-center h-[20px] px-2 rounded-[2px] text-[10px] font-bold w-fit ${plan.color}`}>
                    {plan.label}
                  </span>

                  {/* Status */}
                  <span className={`inline-flex items-center h-[20px] px-2 rounded-[2px] text-[10px] font-bold w-fit ${status.color}`}>
                    {status.label}
                  </span>

                  {/* Localização */}
                  <p className="text-[#526888] text-[11px] truncate">
                    {co.city && co.state ? `${co.city}, ${co.state}` : co.city ?? co.state ?? "—"}
                  </p>

                  {/* Ações */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <GuiaQuickAction id={co.id} status={co.pipelineStatus} />
                    <Link href={`/admin/guia/${co.id}`} className="text-[#7a9ab5] hover:text-white text-[12px] transition-colors">
                      Editar
                    </Link>
                  </div>
                </div>

                {/* Mobile */}
                <div className={`px-4 py-3.5 flex items-center justify-between gap-3 sm:hidden border-b border-[#141d2c]/60 last:border-b-0 ${rowBg}`}>
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[13px] font-semibold truncate">{co.tradeName}</p>
                    <p className="text-[#526888] text-[11px] truncate">
                      {SEGMENT_LABELS[co.segment] ?? co.segment} · {co.city ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`inline-flex items-center h-[18px] px-2 rounded-[2px] text-[10px] font-bold ${plan.color}`}>
                      {plan.label}
                    </span>
                    <Link href={`/admin/guia/${co.id}`} className="text-[#526888] hover:text-white text-[12px] transition-colors">
                      Editar →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Paginação */}
        {totalPages > 1 && (() => {
          const items: (number | "…")[] = [];
          const WING = 2;
          for (let p = 1; p <= totalPages; p++) {
            if (p === 1 || p === totalPages || Math.abs(p - page) <= WING) items.push(p);
            else if (items[items.length - 1] !== "…") items.push("…");
          }
          const btn = "h-[30px] flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-colors";
          return (
            <div className="px-5 py-3 flex items-center justify-between border-t border-[#141d2c] flex-wrap gap-2">
              <p className="text-[#7a9ab5] text-[13px]">
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de {total.toLocaleString("pt-BR")} empresas
              </p>
              <div className="flex items-center gap-1">
                {page > 1
                  ? <Link href={buildUrl({ pagina: String(page - 1) })} className={`${btn} w-[30px] bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white`}>‹</Link>
                  : <span className={`${btn} w-[30px] bg-[#0e1520] border border-[#141d2c] text-[#2a3a4e] cursor-default`}>‹</span>}
                {items.map((item, idx) =>
                  item === "…"
                    ? <span key={`e${idx}`} className={`${btn} w-[24px] text-[#2a3a4e]`}>…</span>
                    : <Link key={item} href={buildUrl({ pagina: String(item) })}
                        className={`${btn} min-w-[30px] px-1 ${item === page ? "bg-[#ff1f1f] text-white" : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"}`}
                      >{item}</Link>
                )}
                {page < totalPages
                  ? <Link href={buildUrl({ pagina: String(page + 1) })} className={`${btn} w-[30px] bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white`}>›</Link>
                  : <span className={`${btn} w-[30px] bg-[#0e1520] border border-[#141d2c] text-[#2a3a4e] cursor-default`}>›</span>}
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
