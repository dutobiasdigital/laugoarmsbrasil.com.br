import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "ATIVO" },
  PAST_DUE: { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "ATRASADO" },
  CANCELED: { bg: "bg-[#141d2c]", text: "text-[#253750]", label: "CANCELADO" },
  PENDING: { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "PENDENTE" },
  EXPIRED: { bg: "bg-[#141d2c]", text: "text-[#253750]", label: "EXPIRADO" },
};

export default async function AdminAssinantesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; pagina?: string }>;
}) {
  const { q, status, pagina } = await searchParams;
  const page = Math.max(1, parseInt(pagina ?? "1", 10));
  const PER_PAGE = 15;

  let users: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    subscription: {
      status: string;
      plan: { name: string };
      planPriceInCents: number;
      intervalMonths: number;
      currentPeriodEnd: Date | null;
      subscribedAt: Date;
    } | null;
  }[] = [];
  let total = 0;

  try {
    const where = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(status && status !== "TODOS"
        ? { subscription: { status: status as "ACTIVE" | "CANCELED" | "PAST_DUE" | "PENDING" } }
        : {}),
    };

    [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          subscription: {
            select: {
              status: true,
              plan: { select: { name: true } },
              planPriceInCents: true,
              intervalMonths: true,
              currentPeriodEnd: true,
              subscribedAt: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);
  } catch {
    // DB unavailable
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const formatCurrency = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Assinantes
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {total.toLocaleString("pt-BR")} usuários cadastrados
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
        </select>
        <button
          type="submit"
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[38px] px-4 rounded-[6px] transition-colors"
        >
          Filtrar
        </button>
        {(q || status) && (
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
        <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-8 gap-3">
          {["Nome", "E-mail", "Plano", "Valor", "Status", "Próx. cobrança", "Desde", "Ações"].map(
            (h) => (
              <p key={h} className="text-[#253750] text-[11px] font-semibold tracking-[0.5px]">
                {h}
              </p>
            )
          )}
        </div>

        {users.length === 0 ? (
          <p className="text-[#253750] text-[13px] p-8 text-center">
            Nenhum usuário encontrado.
          </p>
        ) : (
          users.map((u, i) => {
            const st = u.subscription
              ? (STATUS_STYLE[u.subscription.status] ?? STATUS_STYLE.CANCELED)
              : null;
            return (
              <div key={u.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                <div className="px-5 py-3.5 grid grid-cols-8 gap-3 items-center">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-[28px] h-[28px] rounded-full bg-[#141d2c] flex items-center justify-center text-[11px] text-[#7a9ab5] font-semibold shrink-0">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-[#d4d4da] text-[13px] truncate">{u.name}</p>
                  </div>
                  <p className="text-[#7a9ab5] text-[13px] truncate">{u.email}</p>
                  <p className="text-[#7a9ab5] text-[13px]">
                    {u.subscription?.plan.name ?? "—"}
                  </p>
                  <p className="text-[#7a9ab5] text-[13px]">
                    {u.subscription
                      ? formatCurrency(u.subscription.planPriceInCents)
                      : "—"}
                  </p>
                  {st ? (
                    <span
                      className={`inline-flex items-center h-[20px] px-2.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}
                    >
                      {st.label}
                    </span>
                  ) : (
                    <span className="text-[#253750] text-[13px]">—</span>
                  )}
                  <p className="text-[#7a9ab5] text-[13px]">
                    {u.subscription?.currentPeriodEnd
                      ? u.subscription.currentPeriodEnd.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                  <p className="text-[#7a9ab5] text-[13px]">
                    {u.subscription?.subscribedAt
                      ? u.subscription.subscribedAt.toLocaleDateString("pt-BR", {
                          month: "2-digit",
                          year: "numeric",
                        })
                      : u.createdAt.toLocaleDateString("pt-BR", {
                          month: "2-digit",
                          year: "numeric",
                        })}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/assinantes/${u.id}`}
                      className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3 flex items-center justify-between border-t border-[#141d2c]">
            <p className="text-[#253750] text-[13px]">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de{" "}
              {total.toLocaleString("pt-BR")} usuários
            </p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/admin/assinantes?${q ? `q=${encodeURIComponent(q)}&` : ""}${status ? `status=${status}&` : ""}pagina=${p}`}
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
