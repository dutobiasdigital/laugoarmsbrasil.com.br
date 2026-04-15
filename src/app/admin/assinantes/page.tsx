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

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE:   { bg: "bg-[#0f381f]",  text: "text-[#22c55e]",  label: "ATIVO"      },
  PAST_DUE: { bg: "bg-[#382405]",  text: "text-[#ef9f1b]",  label: "ATRASADO"   },
  CANCELED: { bg: "bg-[#141d2c]",  text: "text-[#253750]",  label: "CANCELADO"  },
  PENDING:  { bg: "bg-[#382405]",  text: "text-[#ef9f1b]",  label: "PENDENTE"   },
  EXPIRED:  { bg: "bg-[#141d2c]",  text: "text-[#253750]",  label: "EXPIRADO"   },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtMon(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });
}
function fmtCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface SubPlan { name: string; }
interface Subscription {
  status: string;
  planPriceInCents: number;
  intervalMonths: number;
  currentPeriodEnd: string | null;
  subscribedAt: string;
  subscription_plans: SubPlan | null;
}
interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  subscriptions: Subscription[];
}

const PER_PAGE = 15;

export default async function AdminAssinantesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; pagina?: string }>;
}) {
  const { q, status, pagina } = await searchParams;
  const page   = Math.max(1, parseInt(pagina ?? "1", 10));
  const offset = (page - 1) * PER_PAGE;

  let users: UserRow[] = [];
  let total = 0;

  try {
    const hasStatusFilter = status && status !== "TODOS";

    // Monta select — usa !inner se há filtro de status (só retorna usuários com assinatura nesse status)
    const subJoin = hasStatusFilter
      ? "subscriptions!inner(status,planPriceInCents,intervalMonths,currentPeriodEnd,subscribedAt,subscription_plans(name))"
      : "subscriptions(status,planPriceInCents,intervalMonths,currentPeriodEnd,subscribedAt,subscription_plans(name))";

    let url = `${BASE}/users?select=id,name,email,role,createdAt,${subJoin}&order=createdAt.desc&limit=${PER_PAGE}&offset=${offset}`;

    if (q) {
      url += `&or=(name.ilike.*${encodeURIComponent(q)}*,email.ilike.*${encodeURIComponent(q)}*)`;
    }
    if (hasStatusFilter) {
      url += `&subscriptions.status=eq.${status}`;
    }

    const res = await fetch(url, { headers: HEADERS, cache: "no-store" });

    // Content-Range: 0-14/350
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
    if (q)      params.set("q", q);
    if (status) params.set("status", status);
    params.set("pagina", String(p));
    return `/admin/assinantes?${params}`;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Assinantes
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {total.toLocaleString("pt-BR")} usuário{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="🔍 Buscar por nome ou e-mail..."
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-[300px]"
        />
        <select
          name="status"
          defaultValue={status ?? "TODOS"}
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f]"
        >
          <option value="TODOS">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="PAST_DUE">Atrasado</option>
          <option value="CANCELED">Cancelado</option>
          <option value="PENDING">Pendente</option>
          <option value="EXPIRED">Expirado</option>
        </select>
        <button
          type="submit"
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[38px] px-4 rounded-[6px] transition-colors"
        >
          Filtrar
        </button>
        {(q || (status && status !== "TODOS")) && (
          <Link
            href="/admin/assinantes"
            className="text-[#7a9ab5] hover:text-white text-[13px] h-[38px] flex items-center px-2 transition-colors"
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
        <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-8 gap-3 hidden sm:grid">
          {["Nome", "E-mail", "Plano", "Valor", "Status", "Próx. cobrança", "Desde", "Ações"].map(h => (
            <p key={h} className="text-[#253750] text-[11px] font-semibold tracking-[0.5px]">{h}</p>
          ))}
        </div>

        {users.length === 0 ? (
          <p className="text-[#253750] text-[13px] p-8 text-center">
            Nenhum usuário encontrado.
          </p>
        ) : (
          users.map((u, i) => {
            const sub = u.subscriptions?.[0] ?? null;
            const st  = sub ? (STATUS_STYLE[sub.status] ?? STATUS_STYLE.EXPIRED) : null;
            return (
              <div key={u.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}

                {/* Desktop */}
                <div className="px-5 py-3.5 grid grid-cols-8 gap-3 items-center hidden sm:grid">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-[28px] h-[28px] rounded-full bg-[#141d2c] flex items-center justify-center text-[11px] text-[#7a9ab5] font-semibold shrink-0">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-[#d4d4da] text-[13px] truncate">{u.name}</p>
                  </div>
                  <p className="text-[#7a9ab5] text-[13px] truncate">{u.email}</p>
                  <p className="text-[#7a9ab5] text-[13px] truncate">
                    {(sub?.subscription_plans as SubPlan | null)?.name ?? "—"}
                  </p>
                  <p className="text-[#7a9ab5] text-[13px]">
                    {sub ? fmtCurrency(sub.planPriceInCents) : "—"}
                  </p>
                  {st ? (
                    <span className={`inline-flex items-center h-[20px] px-2.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                  ) : (
                    <span className="text-[#253750] text-[13px]">—</span>
                  )}
                  <p className="text-[#7a9ab5] text-[13px]">
                    {sub?.currentPeriodEnd ? fmtDate(sub.currentPeriodEnd) : "—"}
                  </p>
                  <p className="text-[#7a9ab5] text-[13px]">
                    {sub ? fmtMon(sub.subscribedAt) : fmtMon(u.createdAt)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/assinantes/${u.id}`}
                      className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors"
                    >
                      Ver →
                    </Link>
                  </div>
                </div>

                {/* Mobile */}
                <div className="px-4 py-3.5 flex items-center justify-between gap-3 sm:hidden">
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[13px] font-medium truncate">{u.name}</p>
                    <p className="text-[#526888] text-[11px] truncate">{u.email}</p>
                    <p className="text-[#253750] text-[11px] mt-0.5">
                      {(sub?.subscription_plans as SubPlan | null)?.name ?? "Sem assinatura"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {st && (
                      <span className={`inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    )}
                    <Link href={`/admin/assinantes/${u.id}`} className="text-[#526888] hover:text-white text-[12px] transition-colors">
                      Ver →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-5 py-3 flex items-center justify-between border-t border-[#141d2c]">
            <p className="text-[#253750] text-[13px]">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de {total.toLocaleString("pt-BR")}
            </p>
            <div className="flex items-center gap-1.5">
              {page > 1 && (
                <Link href={buildHref(page - 1)}
                  className="w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white transition-colors">
                  ‹
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = Math.max(1, page - 3) + i;
                if (p > totalPages) return null;
                return (
                  <Link key={p} href={buildHref(p)}
                    className={`w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-colors ${
                      p === page
                        ? "bg-[#ff1f1f] text-white"
                        : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
                    }`}>
                    {p}
                  </Link>
                );
              })}
              {page < totalPages && (
                <Link href={buildHref(page + 1)}
                  className="w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white transition-colors">
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
