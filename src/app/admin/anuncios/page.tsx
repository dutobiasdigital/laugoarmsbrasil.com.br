import Link from "next/link";
import { Suspense } from "react";
import AdminSearchBar from "../_components/AdminSearchBar";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: "count=exact" };

const POSITION_LABELS: Record<string, string> = {
  HOME_TOP:         "Home — Topo",
  HOME_SIDEBAR:     "Home — Sidebar",
  ARTICLE_INLINE:   "Artigo — Inline",
  ARTICLE_SIDEBAR:  "Artigo — Sidebar",
  EDITIONS_TOP:     "Edições — Topo",
  EDITIONS_SIDEBAR: "Edições — Sidebar",
  BLOG_TOP:         "Blog — Topo",
  GLOBAL_FOOTER:    "Rodapé global",
};

const BANNER_LABELS: Record<string, string> = {
  BILLBOARD:    "Billboard 970×250",
  LEADERBOARD:  "Leaderboard 728×90",
  MED_RECT:     "Med. Rect 300×250",
  HALF_PAGE:    "Half Page 300×600",
  LARGE_MOBILE: "Mobile 320×100",
};

interface Ad {
  id: string;
  name: string;
  advertiser: string;
  imageUrl: string;
  targetUrl: string;
  position: string;
  bannerSize: string | null;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  clicks: number;
  createdAt: string;
  ad_impressions: { id: string }[] | null;
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }); }
  catch { return "—"; }
}

type SortKey = "name" | "advertiser" | "position" | "active" | "createdAt";
const SORT_COL: Record<SortKey, string> = {
  name:       "name",
  advertiser: "advertiser",
  position:   "position",
  active:     "active",
  createdAt:  "createdAt",
};

const COLS = "44px 1fr 1.5fr 160px 130px 80px 160px 90px";

export default async function AdminAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filtro?: string; pagina?: string; sortBy?: string; sortDir?: string }>;
}) {
  const { q, filtro, pagina, sortBy: rawSortBy, sortDir: rawSortDir } = await searchParams;

  const page    = Math.max(1, parseInt(pagina ?? "1", 10));
  const sortBy  = (SORT_COL[rawSortBy as SortKey] ? rawSortBy as SortKey : "createdAt") as SortKey;
  const sortDir = rawSortDir === "asc" ? "asc" : "desc";

  let ads: Ad[] = [];
  let total = 0;

  try {
    const params: string[] = [
      "select=*,ad_impressions!adId(id)",
      `order=${SORT_COL[sortBy]}.${sortDir}.nullslast`,
    ];
    if (q)                    params.push(`or=(name.ilike.*${encodeURIComponent(q)}*,advertiser.ilike.*${encodeURIComponent(q)}*)`);
    if (filtro === "ativos")   params.push("active=eq.true");
    if (filtro === "inativos") params.push("active=eq.false");

    const res = await fetch(`${BASE}/advertisements?${params.join("&")}`, { headers: HEADERS, cache: "no-store" });
    const data = await res.json();
    const cr   = res.headers.get("Content-Range");
    total      = parseInt(cr?.split("/")?.[1] ?? "0", 10);
    if (isNaN(total)) total = 0;
    ads        = Array.isArray(data) ? data : [];
  } catch { /* DB unavailable */ }

  const now = new Date();
  const stats = {
    total,
    ativos:    ads.filter(a => a.active && !(a.endsAt && new Date(a.endsAt) < now)).length,
    inativos:  ads.filter(a => !a.active).length,
    expirados: ads.filter(a => !!a.endsAt && new Date(a.endsAt) < now).length,
  };

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
    return `/admin/anuncios${qs ? `?${qs}` : ""}`;
  }

  function sortHref(col: SortKey) {
    const isActive = sortBy === col;
    const nextDir  = isActive && sortDir === "desc" ? "asc" : "desc";
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
            Banners Publicitários
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {total.toLocaleString("pt-BR")} banner{total !== 1 ? "s" : ""} cadastrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/anuncios/novo"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 flex items-center rounded-[6px] transition-colors"
        >
          + Novo Banner
        </Link>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",     value: stats.total,     color: "text-white"     },
          { label: "Ativos",    value: stats.ativos,    color: "text-[#22c55e]" },
          { label: "Inativos",  value: stats.inativos,  color: "text-[#526888]" },
          { label: "Expirados", value: stats.expirados, color: "text-[#ef9f1b]" },
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
          baseHref="/admin/anuncios"
          placeholder="Buscar por nome ou empresa..."
          filterParam="filtro"
          initialQ={q ?? ""}
          filters={[
            { value: "",         label: "Todos"   },
            { value: "ativos",   label: "Ativos"  },
            { value: "inativos", label: "Inativos" },
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
          <span className="text-white">Img</span>
          {thLink("name",       "Nome")}
          {thLink("advertiser", "Empresa / Anunciante")}
          {thLink("position",   "Posição")}
          <span className="text-white">Tamanho</span>
          {thLink("active",     "Status")}
          <span className="text-white">Período</span>
          <span className="text-white">Ações</span>
        </div>

        {ads.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#7a9ab5] text-[13px] mb-4">Nenhum banner encontrado.</p>
            <Link href="/admin/anuncios/novo" className="inline-flex bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[38px] px-5 items-center rounded-[6px] transition-colors">
              Criar primeiro banner
            </Link>
          </div>
        ) : (
          ads.map((ad, i) => {
            const expired      = !!ad.endsAt && new Date(ad.endsAt) < now;
            const impressions  = ad.ad_impressions?.length ?? 0;
            const statusBg     = expired ? "bg-[#1a1a0a] text-[#ef9f1b]"
                               : ad.active ? "bg-[#0f381f] text-[#22c55e]"
                               : "bg-[#141d2c] text-[#526888]";
            const statusLabel  = expired ? "EXPIRADO" : ad.active ? "ATIVO" : "INATIVO";
            const rowBg        = i % 2 === 0 ? "bg-[#0e1520] hover:bg-white/[0.02]" : "bg-[#080c14] hover:bg-white/[0.015]";

            return (
              <div key={ad.id}>
                {/* Desktop */}
                <div
                  className={`px-4 py-3 hidden sm:grid items-center gap-3 transition-colors border-b border-[#141d2c]/60 last:border-b-0 ${rowBg}`}
                  style={{ gridTemplateColumns: COLS }}
                >
                  {/* Thumbnail */}
                  <div className="w-[36px] h-[36px] bg-[#141d2c] rounded-[4px] overflow-hidden flex items-center justify-center shrink-0">
                    {ad.imageUrl
                      ? /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={ad.imageUrl} alt={ad.name} className="w-full h-full object-cover" />
                      : <span className="text-[#2a3a4e] text-[10px]">—</span>
                    }
                  </div>

                  {/* Nome */}
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[13px] font-semibold truncate">{ad.name}</p>
                    <p className="text-[#526888] text-[11px] mt-0.5">
                      👁 {impressions.toLocaleString("pt-BR")} · 🖱 {(ad.clicks ?? 0).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  {/* Empresa */}
                  <p className="text-[#7a9ab5] text-[13px] truncate">{ad.advertiser || "—"}</p>

                  {/* Posição */}
                  <p className="text-[#526888] text-[11px] truncate leading-snug">
                    {POSITION_LABELS[ad.position] ?? ad.position}
                  </p>

                  {/* Tamanho */}
                  <p className="text-[#526888] text-[11px] truncate leading-snug">
                    {ad.bannerSize ? (BANNER_LABELS[ad.bannerSize] ?? ad.bannerSize) : "—"}
                  </p>

                  {/* Status */}
                  <span className={`inline-flex items-center h-[20px] px-2 rounded-[2px] text-[10px] font-bold w-fit ${statusBg}`}>
                    {statusLabel}
                  </span>

                  {/* Período */}
                  <p className="text-[#526888] text-[11px] leading-snug">
                    {fmtDate(ad.startsAt)}{ad.startsAt && ad.endsAt ? " – " : ""}{fmtDate(ad.endsAt)}
                  </p>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/anuncios/${ad.id}`} className="text-[#7a9ab5] hover:text-white text-[12px] transition-colors">
                      Editar
                    </Link>
                    {ad.targetUrl && (
                      <Link href={ad.targetUrl} target="_blank" className="text-[#3a4a5e] hover:text-white text-[12px] transition-colors" title="Abrir destino">
                        ↗
                      </Link>
                    )}
                  </div>
                </div>

                {/* Mobile */}
                <div className={`px-4 py-3.5 flex items-center justify-between gap-3 sm:hidden border-b border-[#141d2c]/60 last:border-b-0 ${rowBg}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-[36px] h-[36px] bg-[#141d2c] rounded-[4px] overflow-hidden flex items-center justify-center shrink-0">
                      {ad.imageUrl
                        ? /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={ad.imageUrl} alt={ad.name} className="w-full h-full object-cover" />
                        : <span className="text-[#2a3a4e] text-[10px]">—</span>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#d4d4da] text-[13px] font-semibold truncate">{ad.name}</p>
                      <p className="text-[#526888] text-[11px] truncate">{ad.advertiser || "—"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`inline-flex items-center h-[18px] px-2 rounded-[2px] text-[10px] font-bold ${statusBg}`}>
                      {statusLabel}
                    </span>
                    <Link href={`/admin/anuncios/${ad.id}`} className="text-[#526888] hover:text-white text-[12px] transition-colors">
                      Editar →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
