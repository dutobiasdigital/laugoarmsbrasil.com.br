import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  APPROVED: { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "APROVADO" },
  PENDING: { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "PENDENTE" },
  REJECTED: { bg: "bg-[#2d0a0a]", text: "text-[#ff6b6b]", label: "RECUSADO" },
  REFUNDED: { bg: "bg-[#141d2c]", text: "text-[#7a9ab5]", label: "REEMBOLSADO" },
  CANCELLED: { bg: "bg-[#141d2c]", text: "text-[#253750]", label: "CANCELADO" },
};

export default async function AdminPagamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; pagina?: string }>;
}) {
  const { q, status, pagina } = await searchParams;
  const page = Math.max(1, parseInt(pagina ?? "1", 10));
  const PER_PAGE = 15;

  let payments: {
    id: string;
    amountInCents: number;
    status: string;
    paymentMethod: string | null;
    createdAt: Date;
    paidAt: Date | null;
    user: { name: string; email: string };
    subscription: { plan: { name: string } };
  }[] = [];
  let total = 0;
  let totalRevenue = 0;

  try {
    const where = {
      ...(q
        ? {
            OR: [
              { user: { name: { contains: q, mode: "insensitive" as const } } },
              { user: { email: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
      ...(status && status !== "TODOS"
        ? { status: status as "APPROVED" | "PENDING" | "REJECTED" | "REFUNDED" | "CANCELLED" }
        : {}),
    };

    const [paymentsData, count, revenue] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        select: {
          id: true,
          amountInCents: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
          paidAt: true,
          user: { select: { name: true, email: true } },
          subscription: { select: { plan: { select: { name: true } } } },
        },
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        where: { status: "APPROVED" },
        _sum: { amountInCents: true },
      }),
    ]);

    payments = paymentsData;
    total = count;
    totalRevenue = revenue._sum.amountInCents ?? 0;
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
            Pagamentos
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {total.toLocaleString("pt-BR")} transações · Total:{" "}
            <span className="text-[#22c55e] font-semibold">
              {formatCurrency(totalRevenue)}
            </span>
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
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-[280px]"
        />
        <select
          name="status"
          defaultValue={status ?? "TODOS"}
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f]"
        >
          <option value="TODOS">Todos os status</option>
          <option value="APPROVED">Aprovado</option>
          <option value="PENDING">Pendente</option>
          <option value="REJECTED">Recusado</option>
          <option value="REFUNDED">Reembolsado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
        <button
          type="submit"
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[38px] px-4 rounded-[6px] transition-colors"
        >
          Filtrar
        </button>
        {(q || status) && (
          <Link
            href="/admin/pagamentos"
            className="text-[#7a9ab5] hover:text-white text-[13px] h-[38px] flex items-center px-2 transition-colors"
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
        <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-7 gap-3">
          {["Data", "Assinante", "Plano", "Valor", "Método", "Status", "Pago em"].map((h) => (
            <p key={h} className="text-[#253750] text-[11px] font-semibold tracking-[0.5px]">
              {h}
            </p>
          ))}
        </div>

        {payments.length === 0 ? (
          <p className="text-[#253750] text-[13px] p-8 text-center">
            Nenhum pagamento encontrado.
          </p>
        ) : (
          payments.map((pay, i) => {
            const st = STATUS_STYLE[pay.status] ?? STATUS_STYLE.CANCELLED;
            return (
              <div key={pay.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                <div className="px-5 py-3.5 grid grid-cols-7 gap-3 items-center">
                  <p className="text-[#7a9ab5] text-[13px]">
                    {pay.createdAt.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[13px] truncate">{pay.user.name}</p>
                    <p className="text-[#253750] text-[11px] truncate">{pay.user.email}</p>
                  </div>
                  <p className="text-[#7a9ab5] text-[13px]">
                    {pay.subscription?.plan.name ?? "—"}
                  </p>
                  <p className="text-white text-[14px] font-semibold">
                    {formatCurrency(pay.amountInCents)}
                  </p>
                  <p className="text-[#7a9ab5] text-[13px]">{pay.paymentMethod ?? "—"}</p>
                  <span
                    className={`inline-flex items-center h-[20px] px-2.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}
                  >
                    {st.label}
                  </span>
                  <p className="text-[#7a9ab5] text-[13px]">
                    {pay.paidAt
                      ? pay.paidAt.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3 flex items-center justify-between border-t border-[#141d2c]">
            <p className="text-[#253750] text-[13px]">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de{" "}
              {total.toLocaleString("pt-BR")}
            </p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/admin/pagamentos?${q ? `q=${encodeURIComponent(q)}&` : ""}${status ? `status=${status}&` : ""}pagina=${p}`}
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
