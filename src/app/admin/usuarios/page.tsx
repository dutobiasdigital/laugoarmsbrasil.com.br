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

const PER_PAGE = 20;

interface SubscriptionRow {
  id: string;
  status: string;
}
interface CompanyRow {
  id: string;
  tradeName: string;
}
interface ShopOrderRow {
  id: string;
}
interface UserRow {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  subscriptions: SubscriptionRow[];
  companies: CompanyRow[];
  shop_orders: ShopOrderRow[];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day:   "2-digit",
    month: "2-digit",
    year:  "numeric",
  });
}

const TIPO_TABS = [
  { key: "todos",       label: "Todos" },
  { key: "assinantes",  label: "Assinantes" },
  { key: "anunciantes", label: "Anunciantes" },
  { key: "clientes",    label: "Clientes Loja" },
];

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; q?: string; pagina?: string }>;
}) {
  const { tipo, q, pagina } = await searchParams;
  const tipoAtivo = tipo ?? "todos";
  const page      = Math.max(1, parseInt(pagina ?? "1", 10));
  const offset    = (page - 1) * PER_PAGE;

  let users: UserRow[] = [];
  let total = 0;

  try {
    // Monta join de entidades
    const subJoin  = tipoAtivo === "assinantes"  ? "subscriptions!inner(id,status)" : "subscriptions(id,status)";
    const compJoin = tipoAtivo === "anunciantes" ? "companies!inner(id,tradeName)"  : "companies(id,tradeName)";

    // shop_orders join — pode não ter userId, então usa left join normal
    const ordJoin = "shop_orders(id)";

    let url = `${BASE}/users?select=id,name,email,createdAt,${subJoin},${compJoin},${ordJoin}&order=createdAt.desc&limit=${PER_PAGE}&offset=${offset}`;

    if (tipoAtivo === "clientes") {
      url = `${BASE}/users?select=id,name,email,createdAt,subscriptions(id,status),companies(id,tradeName),shop_orders!inner(id)&order=createdAt.desc&limit=${PER_PAGE}&offset=${offset}`;
    }

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
    if (tipoAtivo && tipoAtivo !== "todos") params.set("tipo", tipoAtivo);
    if (q) params.set("q", q);
    params.set("pagina", String(p));
    return `/admin/usuarios?${params}`;
  }

  function buildTabHref(t: string) {
    const params = new URLSearchParams();
    if (t !== "todos") params.set("tipo", t);
    if (q) params.set("q", q);
    return `/admin/usuarios?${params}`;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Usuários
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {total.toLocaleString("pt-BR")} usuário{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Tabs de tipo */}
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {TIPO_TABS.map((t) => (
          <Link
            key={t.key}
            href={buildTabHref(t.key)}
            className={`h-[36px] px-4 flex items-center rounded-[6px] text-[13px] font-semibold whitespace-nowrap transition-colors ${
              tipoAtivo === t.key
                ? "bg-[#ff1f1f] text-white"
                : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Busca */}
      <form method="GET" className="flex gap-2 mb-5">
        {tipoAtivo !== "todos" && (
          <input type="hidden" name="tipo" value={tipoAtivo} />
        )}
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
            href={buildTabHref(tipoAtivo)}
            className="text-[#7a9ab5] hover:text-white text-[13px] h-[38px] flex items-center px-2 transition-colors"
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Tabela */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
        <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-[2fr_2fr_1fr_1fr_80px] gap-3 hidden sm:grid">
          {["Usuário", "E-mail", "Roles", "Cadastro", ""].map((h) => (
            <p key={h} className="text-white text-[11px] font-semibold tracking-[0.5px] uppercase">
              {h}
            </p>
          ))}
        </div>

        {users.length === 0 ? (
          <p className="text-white text-[13px] p-8 text-center">Nenhum usuário encontrado.</p>
        ) : (
          users.map((u, i) => {
            const hasActiveSubscription = u.subscriptions?.some((s) => s.status === "ACTIVE");
            const hasSubscription       = u.subscriptions?.length > 0;
            const hasCompany            = u.companies?.length > 0;
            const hasOrder              = u.shop_orders?.length > 0;

            return (
              <div key={u.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}

                {/* Desktop */}
                <div className="px-5 py-3.5 grid grid-cols-[2fr_2fr_1fr_1fr_80px] gap-3 items-center hidden sm:grid">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#141d2c] border border-[#1c2a3e] flex items-center justify-center text-[11px] text-[#7a9ab5] font-bold shrink-0">
                      {u.name?.slice(0, 2).toUpperCase() ?? "??"}
                    </div>
                    <p className="text-[#d4d4da] text-[13px] font-medium truncate">{u.name}</p>
                  </div>
                  <p className="text-[#7a9ab5] text-[13px] truncate">{u.email}</p>
                  <div className="flex flex-wrap gap-1">
                    {hasSubscription && (
                      <span className={`inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold ${hasActiveSubscription ? "bg-[#0f381f] text-[#22c55e]" : "bg-[#141d2c] text-[#7a9ab5]"}`}>
                        Assinante
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
                  <p className="text-[#7a9ab5] text-[13px]">{fmtDate(u.createdAt)}</p>
                  <Link
                    href={`/admin/usuarios/${u.id}`}
                    className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors text-right"
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
            <p className="text-white text-[13px]">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de {total.toLocaleString("pt-BR")}
            </p>
            <div className="flex items-center gap-1.5">
              {page > 1 && (
                <Link
                  href={buildHref(page - 1)}
                  className="w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white transition-colors"
                >
                  ‹
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
                const p = Math.max(1, page - 3) + idx;
                if (p > totalPages) return null;
                return (
                  <Link
                    key={p}
                    href={buildHref(p)}
                    className={`w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-colors ${
                      p === page
                        ? "bg-[#ff1f1f] text-white"
                        : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
              {page < totalPages && (
                <Link
                  href={buildHref(page + 1)}
                  className="w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white transition-colors"
                >
                  ›
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
