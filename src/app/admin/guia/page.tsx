import Link from "next/link";
import { Suspense } from "react";
import AdminSearchBar from "../_components/AdminSearchBar";
import GuiaQuickAction from "./_GuiaQuickAction";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: "count=exact" };

const CATEGORY_LABELS: Record<string, string> = {
  ARMAREIRO:   "Armareiro",    CLUBE_TIRO:  "Clube de Tiro", MUNICOES:    "Munições",
  CACA:        "Caça/Pesca",   JURIDICO:    "Jurídico",      TREINAMENTO: "Treinamento",
  MANUTENCAO:  "Manutenção",   IMPORTACAO:  "Importação",    TRANSPORTE:  "Transporte",
  SEGURO:      "Seguros",      OUTROS:      "Outros",
};

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  FREE:     { label: "Free",     color: "bg-[#141d2c] text-[#526888]" },
  PREMIUM:  { label: "Premium",  color: "bg-[#1a1a40] text-[#818cf8]" },
  DESTAQUE: { label: "Destaque", color: "bg-[#260a0a] text-[#ff1f1f]" },
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pendente", color: "bg-[#1a1a0a] text-[#facc15]" },
  ACTIVE:    { label: "Ativo",    color: "bg-[#0f381f] text-[#22c55e]" },
  SUSPENDED: { label: "Inativo",  color: "bg-[#141d2c] text-[#526888]" },
};

interface Listing {
  id: string;
  slug: string;
  name: string;
  category: string;
  plan: string;
  status: string;
  city: string | null;
  state: string | null;
  featured: boolean;
  viewsCount: number;
  createdAt: string;
}

type SortKey = "name" | "category" | "plan" | "status" | "createdAt";
const SORT_COL: Record<SortKey, string> = {
  name:      "name",
  category:  "category",
  plan:      "plan",
  status:    "status",
  createdAt: "createdAt",
};

const PER_PAGE = 40;
const COLS     = "1fr 120px 90px 90px 100px 200px";

export default async function AdminGuiaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filtro?: string; pagina?: string; sortBy?: string; sortDir?: string }>;
}) {
  const { q, filtro, pagina, sortBy: rawSortBy, sortDir: rawSortDir } = await searchParams;

  const page    = Math.max(1, parseInt(pagina ?? "1", 10));
  const sortBy  = (SORT_COL[rawSortBy as SortKey] ? rawSortBy as SortKey : "name") as SortKey;
  const sortDir = rawSortDir === "desc" ? "desc" : "asc";

  let listings: Listing[] = [];
  let total = 0;
  let statsTotal = 0, statsPending = 0, statsActive = 0, statsSuspended = 0;

  try {
    // Stats query
    const statsRes = await fetch(
      `${BASE}/guide_listings?select=status`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: "count=exact" }, cache: "no-store" }
    );
    if (statsRes.ok) {
      const statsData: { status: string }[] = await statsRes.json();
      const scr = statsRes.headers.get("Content-Range");
      statsTotal     = parseInt(scr?.split("/")?.[1] ?? "0", 10) || 0;
      statsPending   = statsData.filter(l => l.status === "PENDING").length;
      statsActive    = statsData.filter(l => l.status === "ACTIVE").length;
      statsSuspended = statsData.filter(l => l.status === "SUSPENDED").length;
    }
  } catch { /* ignore */ }

  try {
    const qp: string[] = [
      `select=id,slug,name,category,plan,status,city,state,featured,viewsCount,createdAt`,
      `order=${SORT_COL[sortBy]}.${sortDir}.nullslast`,
      `limit=${PER_PAGE}`,
      `offset=${(page - 1) * PER_PAGE}`,
    ];
    if (q)                       qp.push(`or=(name.ilike.*${encodeURIComponent(q)}*,city.ilike.*${encodeURIComponent(q)}*,state.ilike.*${encodeURIComponent(q)}*)`);
    if (filtro === "PENDING")    qp.push("status=eq.PENDING");
    if (filtro === "ACTIVE")     qp.push("status=eq.ACTIVE");
    if (filtro === "SUSPENDED")  qp.push("status=eq.SUSPENDED");

    const res = await fetch(`${BASE}/guide_listings?${qp.join("&")}`, { headers: HEADERS, cache: "no-store" });
    if (res.ok) {
      listings = await res.json();
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
            Guia Comercial
          </h1>
          <p className="text-[#526888] text-[14px] mt-1">Gerencie os cadastros do diretório</p>
        </div>
        <div className="flex gap-3">
          <Link href="/guia" target="_blank"
            className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-600 text-[#d4d4da] text-[13px] h-[40px] px-4 flex items-center rounded-[6px] transition-colors">
            ↗ Ver Guia
          </Link>
          <Link href="/admin/guia/nova"
            className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 flex items-center rounded-[6px] transition-colors">
            + Nova Empresa
          </Link>
        </div>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",     value: statsTotal,     color: "text-white"       },
          { label: "Pendentes", value: statsPending,   color: "text-[#facc15]"   },
          { label: "Ativos",    value: statsActive,    color: "text-[#22c55e]"   },
          { label: "Inativos",  value: statsSuspended, color: "text-[#526888]"   },
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
          baseHref="/admin/guia"
          placeholder="Buscar por nome, cidade ou estado..."
          filterParam="filtro"
          initialQ={q ?? ""}
          filters={[
            { value: "",          label: "Todos",     count: undefined },
            { value: "PENDING",   label: "Pendentes", count: statsPending   },
            { value: "ACTIVE",    label: "Ativos",    count: undefined },
            { value: "SUSPENDED", label: "Inativos",  count: undefined },
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
          {thLink("name",      "Empresa")}
          {thLink("category",  "Categoria")}
          {thLink("plan",      "Plano")}
          {thLink("status",    "Status")}
          <span className="text-white">Local</span>
          <span className="text-white">Ações</span>
        </div>

        {listings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#7a9ab5] text-[13px]">
              {q ? `Nenhum resultado para "${q}"` : "Nenhum cadastro encontrado."}
            </p>
          </div>
        ) : (
          listings.map((l, i) => {
            const pl = PLAN_LABELS[l.plan]    ?? PLAN_LABELS.FREE;
            const sl = STATUS_CFG[l.status]   ?? STATUS_CFG.PENDING;
            const rowBg = i % 2 === 0 ? "bg-[#0e1520] hover:bg-white/[0.02]" : "bg-[#080c14] hover:bg-white/[0.015]";

            return (
              <div key={l.id}
                className={`px-4 py-3 hidden sm:grid items-center gap-3 transition-colors border-b border-[#141d2c]/60 last:border-b-0 ${rowBg}`}
                style={{ gridTemplateColumns: COLS }}
              >
                {/* Nome */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {l.featured && <span className="text-[#facc15] text-[11px]">★</span>}
                    <p className="text-[#d4d4da] text-[14px] font-semibold truncate">{l.name}</p>
                  </div>
                  <p className="text-[#526888] text-[11px]">
                    {l.viewsCount ?? 0} views · {new Date(l.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                {/* Categoria */}
                <p className="text-[#526888] text-[12px] truncate">{CATEGORY_LABELS[l.category] ?? l.category}</p>

                {/* Plano */}
                <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] w-fit ${pl.color}`}>{pl.label}</span>

                {/* Status */}
                <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] w-fit ${sl.color}`}>{sl.label}</span>

                {/* Local */}
                <p className="text-[#526888] text-[12px]">
                  {[l.city, l.state].filter(Boolean).join(", ") || "—"}
                </p>

                {/* Ações */}
                <div className="flex gap-1 items-center flex-wrap">
                  <GuiaQuickAction id={l.id} status={l.status} />
                  <Link href={`/admin/guia/${l.id}`}
                    className="bg-[#141d2c] hover:bg-[#1c2a3e] text-[#d4d4da] text-[11px] h-[26px] px-2.5 rounded-[4px] flex items-center transition-colors">
                    Editar
                  </Link>
                  <Link href={`/guia/empresa/${l.slug}`} target="_blank"
                    className="bg-[#141d2c] hover:bg-[#1c2a3e] text-[#526888] text-[11px] h-[26px] px-2 rounded-[4px] flex items-center transition-colors"
                    title="Ver perfil público">
                    ↗
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
