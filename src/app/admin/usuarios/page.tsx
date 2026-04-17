import Link from "next/link";
import { Suspense } from "react";
import AdminSearchBar from "../_components/AdminSearchBar";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: "count=exact" };

const SUB_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE:   { bg: "bg-[#0f381f]",  text: "text-[#22c55e]",  label: "ATIVO"     },
  PAST_DUE: { bg: "bg-[#382405]",  text: "text-[#ef9f1b]",  label: "ATRASADO"  },
  CANCELED: { bg: "bg-[#1c1c1c]",  text: "text-[#7a9ab5]",  label: "CANCELADO" },
  PENDING:  { bg: "bg-[#382405]",  text: "text-[#ef9f1b]",  label: "PENDENTE"  },
  EXPIRED:  { bg: "bg-[#1c1c1c]",  text: "text-[#7a9ab5]",  label: "EXPIRADO"  },
};

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return "—"; }
}

interface SubscriptionRow { status: string; }
interface CompanyRow      { id: string; }
interface ShopOrderRow    { id: string; }
interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string | null;
  subscriptions: SubscriptionRow[];
  companies:     CompanyRow[];
  shop_orders:   ShopOrderRow[];
}

type SortKey = "name" | "email" | "createdAt";
const SORT_COL: Record<SortKey, string> = {
  name:      "name",
  email:     "email",
  createdAt: "createdAt",
};

const PER_PAGE = 20;
const COLS     = "2fr 2fr 1fr 1.5fr 1fr 60px";

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; q?: string; pagina?: string; sortBy?: string; sortDir?: string }>;
}) {
  const { tipo, q, pagina, sortBy: rawSortBy, sortDir: rawSortDir } = await searchParams;

  const tab     = tipo ?? "";
  const page    = Math.max(1, parseInt(pagina ?? "1", 10));
  const offset  = (page - 1) * PER_PAGE;
  const sortBy  = (SORT_COL[rawSortBy as SortKey] ? rawSortBy as SortKey : "createdAt") as SortKey;
  const sortDir = rawSortDir === "asc" ? "asc" : "desc";

  let users: UserRow[] = [];
  let total = 0;

  try {
    const subJoin  = tab === "assinantes"  ? "subscriptions!inner(status)" : "subscriptions(status)";
    const compJoin = tab === "anunciantes" ? "companies!inner(id)"         : "companies(id)";
    const ordJoin  = tab === "clientes"    ? "shop_orders!inner(id)"       : "shop_orders(id)";

    const qp: string[] = [
      `select=id,name,email,phone,createdAt,${subJoin},${compJoin},${ordJoin}`,
      `order=${SORT_COL[sortBy]}.${sortDir}.nullslast`,
      `limit=${PER_PAGE}`,
      `offset=${offset}`,
    ];
    if (q) qp.push(`or=(name.ilike.*${encodeURIComponent(q)}*,email.ilike.*${encodeURIComponent(q)}*)`);

    const res = await fetch(`${BASE}/users?${qp.join("&")}`, { headers: HEADERS, cache: "no-store" });
    const cr  = res.headers.get("Content-Range");
    total = parseInt(cr?.split("/")?.[1] ?? "0", 10);
    if (isNaN(total)) total = 0;

    const data = await res.json();
    users = (Array.isArray(data) ? data : []).map((u: Record<string, unknown>) => ({
      ...(u as Omit<UserRow, "subscriptions" | "companies" | "shop_orders">),
      subscriptions: Array.isArray(u.subscriptions) ? u.subscriptions : (u.subscriptions != null ? [u.subscriptions] : []),
      companies:     Array.isArray(u.companies)     ? u.companies     : (u.companies     != null ? [u.companies]     : []),
      shop_orders:   Array.isArray(u.shop_orders)   ? u.shop_orders   : (u.shop_orders   != null ? [u.shop_orders]   : []),
    })) as UserRow[];
  } catch { /* DB unavailable */ }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  function buildUrl(overrides: Record<string, string | undefined>) {
    const base: Record<string, string | undefined> = {
      tipo:    tab || undefined,
      q:       q || undefined,
      sortBy:  rawSortBy,
      sortDir: rawSortDir,
    };
    const merged = { ...base, ...overrides };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) { if (v) params.set(k, v); }
    const qs = params.toString();
    return `/admin/usuarios${qs ? `?${qs}` : ""}`;
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
            Usuários Cadastrados
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {total.toLocaleString("pt-BR")} usuário{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Omnisearch + filtros */}
      <Suspense fallback={<div className="h-[38px] mb-5 bg-[#141d2c] rounded-[6px] animate-pulse w-[300px]" />}>
        <AdminSearchBar
          baseHref="/admin/usuarios"
          placeholder="Buscar por nome ou e-mail..."
          filterParam="tipo"
          initialQ={q ?? ""}
          filters={[
            { value: "",            label: "Todos"         },
            { value: "assinantes",  label: "Assinantes"    },
            { value: "anunciantes", label: "Anunciantes"   },
            { value: "clientes",    label: "Clientes Loja" },
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
          {thLink("name",      "Nome")}
          {thLink("email",     "E-mail")}
          <span className="text-white">Telefone</span>
          <span className="text-white">Perfil</span>
          {thLink("createdAt", "Cadastro")}
          <span className="text-white"></span>
        </div>

        {users.length === 0 ? (
          <p className="text-[#7a9ab5] text-[13px] p-8 text-center">Nenhum usuário encontrado.</p>
        ) : (
          users.map((u, i) => {
            const hasSub       = (u.subscriptions?.length ?? 0) > 0;
            const hasActiveSub = u.subscriptions?.some((s) => s.status === "ACTIVE") ?? false;
            const hasCompany   = (u.companies?.length ?? 0) > 0;
            const hasOrder     = (u.shop_orders?.length ?? 0) > 0;
            const subStatus    = u.subscriptions?.[0]?.status ?? null;
            const st           = subStatus ? (SUB_STATUS[subStatus] ?? SUB_STATUS.EXPIRED) : null;
            const initials     = (u.name ?? "??").slice(0, 2).toUpperCase();

            const rowBg = i % 2 === 0 ? "bg-[#0e1520] hover:bg-white/[0.02]" : "bg-[#080c14] hover:bg-white/[0.015]";

            return (
              <div key={u.id}
                className={`px-4 py-3 hidden sm:grid items-center gap-3 transition-colors border-b border-[#141d2c]/60 last:border-b-0 ${rowBg}`}
                style={{ gridTemplateColumns: COLS }}
              >
                {/* Nome */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-[30px] h-[30px] rounded-full bg-[#141d2c] border border-[#1c2a3e] flex items-center justify-center text-[11px] text-[#7a9ab5] font-bold shrink-0">
                    {initials}
                  </div>
                  <p className="text-[#d4d4da] text-[13px] font-medium truncate">{u.name ?? "—"}</p>
                </div>

                {/* E-mail */}
                <p className="text-[#7a9ab5] text-[13px] truncate">{u.email ?? "—"}</p>

                {/* Telefone */}
                <p className="text-[#7a9ab5] text-[12px] truncate">{u.phone ?? "—"}</p>

                {/* Perfil */}
                <div className="flex flex-wrap gap-1">
                  {hasSub && st ? (
                    <span className={`inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                      {hasActiveSub ? "Assinante" : `Assinante · ${st.label}`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-semibold bg-[#141d2c] text-[#526888]">
                      Cadastrado
                    </span>
                  )}
                  {hasCompany && (
                    <span className="inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold bg-[#1a0f38] text-[#a78bfa]">
                      Anunciante
                    </span>
                  )}
                  {hasOrder && (
                    <span className="inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold bg-[#0f2438] text-[#60a5fa]">
                      Cliente
                    </span>
                  )}
                </div>

                {/* Cadastro */}
                <p className="text-[#7a9ab5] text-[12px] tabular-nums">{fmtDate(u.createdAt)}</p>

                {/* Ações */}
                <Link
                  href={`/admin/usuarios/${u.id}`}
                  className="text-[#7a9ab5] hover:text-white text-[12px] transition-colors text-right"
                >
                  Ver →
                </Link>
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
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de {total.toLocaleString("pt-BR")} usuários
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
