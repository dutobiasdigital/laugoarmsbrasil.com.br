import Link from "next/link";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  apikey:        SERVICE,
  Authorization: `Bearer ${SERVICE}`,
  Prefer:        "count=exact",
};

const SUB_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE:   { bg: "bg-[#0f381f]",  text: "text-[#22c55e]",  label: "ATIVO"      },
  PAST_DUE: { bg: "bg-[#382405]",  text: "text-[#ef9f1b]",  label: "ATRASADO"   },
  CANCELED: { bg: "bg-[#1c1c1c]",  text: "text-[#7a9ab5]",  label: "CANCELADO"  },
  PENDING:  { bg: "bg-[#382405]",  text: "text-[#ef9f1b]",  label: "PENDENTE"   },
  EXPIRED:  { bg: "bg-[#1c1c1c]",  text: "text-[#7a9ab5]",  label: "EXPIRADO"   },
};

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

interface SubscriptionRow {
  status: string;
  planPriceInCents: number;
  subscription_plans: { name: string } | null;
}
interface CompanyRow   { id: string }
interface ShopOrderRow { id: string }
interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  subscriptions: SubscriptionRow[];
  companies: CompanyRow[];
  shop_orders: ShopOrderRow[];
}

const PER_PAGE = 20;

const TABS = [
  { key: "todos",       label: "Todos"        },
  { key: "assinantes",  label: "Assinantes"   },
  { key: "anunciantes", label: "Anunciantes"  },
  { key: "clientes",    label: "Clientes Loja"},
];

export default async function AdminListaUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; q?: string; pagina?: string }>;
}) {
  const { tipo, q, pagina } = await searchParams;
  const tab    = tipo ?? "todos";
  const page   = Math.max(1, parseInt(pagina ?? "1", 10));
  const offset = (page - 1) * PER_PAGE;

  let users: UserRow[] = [];
  let total = 0;

  try {
    const subJoin  = tab === "assinantes"  ? "subscriptions!inner(status,planPriceInCents,subscription_plans(name))" : "subscriptions(status,planPriceInCents,subscription_plans(name))";
    const compJoin = tab === "anunciantes" ? "companies!inner(id)"  : "companies(id)";
    const ordJoin  = tab === "clientes"    ? "shop_orders!inner(id)" : "shop_orders(id)";

    let url = `${BASE}/users?select=id,name,email,phone,createdAt,${subJoin},${compJoin},${ordJoin}&order=createdAt.desc&limit=${PER_PAGE}&offset=${offset}`;

    if (q) {
      url += `&or=(name.ilike.*${encodeURIComponent(q)}*,email.ilike.*${encodeURIComponent(q)}*)`;
    }

    const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
    const cr = res.headers.get("Content-Range");
    total = parseInt(cr?.split("/")?.[1] ?? "0", 10);
    if (isNaN(total)) total = 0;

    const data = await res.json();
    users = Array.isArray(data) ? data : [];
  } catch {
    // DB unavailable
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  function buildHref(p: number) {
    const params = new URLSearchParams();
    if (tab !== "todos") params.set("tipo", tab);
    if (q) params.set("q", q);
    params.set("pagina", String(p));
    return `/admin/assinantes?${params}`;
  }

  function buildTabHref(t: string) {
    const params = new URLSearchParams();
    if (t !== "todos") params.set("tipo", t);
    if (q) params.set("q", q);
    return `/admin/assinantes?${params}`;
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

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={buildTabHref(t.key)}
            className={`h-[34px] px-4 flex items-center rounded-[6px] text-[12px] font-semibold whitespace-nowrap transition-colors ${
              tab === t.key
                ? "bg-[#ff1f1f] text-white"
                : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        {tab !== "todos" && <input type="hidden" name="tipo" value={tab} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou e-mail..."
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-[300px]"
        />
        <button
          type="submit"
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[38px] px-4 rounded-[6px] transition-colors"
        >
          Filtrar
        </button>
        {q && (
          <Link
            href={buildTabHref(tab)}
            className="text-[#7a9ab5] hover:text-white text-[13px] h-[38px] flex items-center px-2 transition-colors"
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">

        {/* Header row — desktop */}
        <div className="bg-[#141d2c] px-5 py-3 hidden sm:grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr_60px] gap-3">
          {["Usuário", "E-mail", "Telefone", "Perfil", "Cadastro", ""].map((h) => (
            <p key={h} className="text-white text-[11px] font-semibold tracking-[0.5px] uppercase">{h}</p>
          ))}
        </div>

        {users.length === 0 ? (
          <p className="text-[#7a9ab5] text-[13px] p-8 text-center">Nenhum usuário encontrado.</p>
        ) : (
          users.map((u, i) => {
            const sub = u.subscriptions?.[0] ?? null;
            const hasActiveSub  = u.subscriptions?.some((s) => s.status === "ACTIVE");
            const hasSub        = u.subscriptions?.length > 0;
            const hasCompany    = u.companies?.length > 0;
            const hasOrder      = u.shop_orders?.length > 0;
            const st            = sub ? (SUB_STATUS[sub.status] ?? SUB_STATUS.EXPIRED) : null;

            return (
              <div key={u.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}

                {/* Desktop */}
                <div className="px-5 py-3.5 hidden sm:grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr_60px] gap-3 items-center">
                  {/* Avatar + Nome */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#141d2c] border border-[#1c2a3e] flex items-center justify-center text-[11px] text-[#7a9ab5] font-bold shrink-0">
                      {u.name?.slice(0, 2).toUpperCase() ?? "??"}
                    </div>
                    <p className="text-[#d4d4da] text-[13px] font-medium truncate">{u.name}</p>
                  </div>

                  {/* E-mail */}
                  <p className="text-[#7a9ab5] text-[13px] truncate">{u.email}</p>

                  {/* Telefone */}
                  <p className="text-[#7a9ab5] text-[12px] truncate">{u.phone ?? "—"}</p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1">
                    {hasSub && st && (
                      <span className={`inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                        {hasActiveSub ? "Assinante" : `Assinante · ${st.label}`}
                      </span>
                    )}
                    {!hasSub && (
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

                  {/* Data */}
                  <p className="text-[#7a9ab5] text-[12px]">{fmtDate(u.createdAt)}</p>

                  {/* Ação */}
                  <Link
                    href={`/admin/usuarios/${u.id}`}
                    className="text-[#7a9ab5] hover:text-white text-[12px] transition-colors text-right"
                  >
                    Ver →
                  </Link>
                </div>

                {/* Mobile */}
                <div className="px-4 py-3.5 flex items-center justify-between gap-3 sm:hidden">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#141d2c] border border-[#1c2a3e] flex items-center justify-center text-[10px] text-[#7a9ab5] font-bold shrink-0">
                      {u.name?.slice(0, 2).toUpperCase() ?? "??"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#d4d4da] text-[13px] font-medium truncate">{u.name}</p>
                      <p className="text-[#526888] text-[11px] truncate">{u.email}</p>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {hasSub && st && (
                          <span className={`inline-flex items-center h-[16px] px-1.5 rounded-full text-[9px] font-bold ${st.bg} ${st.text}`}>
                            Assinante
                          </span>
                        )}
                        {hasCompany && (
                          <span className="inline-flex items-center h-[16px] px-1.5 rounded-full text-[9px] font-bold bg-[#1a0f38] text-[#a78bfa]">
                            Anunciante
                          </span>
                        )}
                        {hasOrder && (
                          <span className="inline-flex items-center h-[16px] px-1.5 rounded-full text-[9px] font-bold bg-[#0f2438] text-[#60a5fa]">
                            Cliente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/admin/usuarios/${u.id}`}
                    className="text-[#526888] hover:text-white text-[12px] transition-colors shrink-0"
                  >
                    Ver →
                  </Link>
                </div>
              </div>
            );
          })
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-5 py-3 flex items-center justify-between border-t border-[#141d2c]">
            <p className="text-[#7a9ab5] text-[13px]">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de {total.toLocaleString("pt-BR")}
            </p>
            <div className="flex items-center gap-1.5">
              {page > 1 && (
                <Link href={buildHref(page - 1)} className="w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white transition-colors">‹</Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
                const p = Math.max(1, page - 3) + idx;
                if (p > totalPages) return null;
                return (
                  <Link key={p} href={buildHref(p)} className={`w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-colors ${p === page ? "bg-[#ff1f1f] text-white" : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"}`}>
                    {p}
                  </Link>
                );
              })}
              {page < totalPages && (
                <Link href={buildHref(page + 1)} className="w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white transition-colors">›</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
