import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BAR_HEIGHTS = [84, 96, 87, 105, 114, 109];
const BAR_MONTHS = ["Nov", "Dez", "Jan", "Fev", "Mar", "Abr"];

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "ATIVO" },
  PAST_DUE: { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "ATRASADO" },
  CANCELED: { bg: "bg-[#141d2c]", text: "text-[#253750]", label: "CANCELADO" },
  PENDING: { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "PENDENTE" },
  EXPIRED: { bg: "bg-[#141d2c]", text: "text-[#253750]", label: "EXPIRADO" },
};

export default async function AdminDashboardPage() {
  let subscribers: {
    id: string;
    name: string;
    email: string;
    subscription: {
      status: string;
      plan: { name: string };
      currentPeriodEnd: Date | null;
      subscribedAt: Date;
    } | null;
  }[] = [];
  let kpis = { totalActive: 0, newThisMonth: 0, canceled: 0, monthlyRevenue: 0, revenueChange: 0 };

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [activeCount, newCount, canceledCount, recentSubs, monthRev, lastMonthRev] = await Promise.all([
      prisma.user.count({ where: { subscription: { status: "ACTIVE" } } }),
      prisma.user.count({
        where: {
          subscription: {
            subscribedAt: { gte: startOfMonth },
          },
        },
      }),
      prisma.user.count({ where: { subscription: { status: "CANCELED" } } }),
      prisma.user.findMany({
        where: { subscription: { isNot: null } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          name: true,
          email: true,
          subscription: {
            select: {
              status: true,
              plan: { select: { name: true } },
              currentPeriodEnd: true,
              subscribedAt: true,
            },
          },
        },
      }),
      prisma.payment.aggregate({
        where: { status: "APPROVED", paidAt: { gte: startOfMonth } },
        _sum: { amountInCents: true },
      }),
      prisma.payment.aggregate({
        where: { status: "APPROVED", paidAt: { gte: startOfLastMonth, lt: startOfMonth } },
        _sum: { amountInCents: true },
      }),
    ]);

    const thisMonthCents = monthRev._sum.amountInCents ?? 0;
    const lastMonthCents = lastMonthRev._sum.amountInCents ?? 0;
    const revenueChange = lastMonthCents > 0
      ? Math.round(((thisMonthCents - lastMonthCents) / lastMonthCents) * 100)
      : 0;

    kpis = { totalActive: activeCount, newThisMonth: newCount, canceled: canceledCount, monthlyRevenue: thisMonthCents, revenueChange };
    subscribers = recentSubs;
  } catch {
    // DB unavailable
  }

  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <>
      {/* Header */}
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Dashboard
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-5">
        Visão geral do sistema · Hoje: {today}
      </p>
      <div className="bg-[#141d2c] h-px mb-7" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            value: kpis.totalActive.toLocaleString("pt-BR") || "0",
            label: "Assinantes ativos",
            trend: `${kpis.newThisMonth} novo${kpis.newThisMonth !== 1 ? "s" : ""} este mês`,
            trendColor: "text-[#22c55e]",
            barColor: "bg-[#22c55e]",
          },
          {
            value: (kpis.monthlyRevenue / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
            label: "Receita mensal",
            trend: kpis.revenueChange >= 0
              ? `+${kpis.revenueChange}% vs mês ant.`
              : `${kpis.revenueChange}% vs mês ant.`,
            trendColor: kpis.revenueChange >= 0 ? "text-[#22c55e]" : "text-[#ef9f1b]",
            barColor: "bg-[#22c55e]",
          },
          {
            value: String(kpis.newThisMonth || 0),
            label: "Novos assinantes",
            trend: "este mês",
            trendColor: "text-[#22c55e]",
            barColor: "bg-[#3c82f6]",
          },
          {
            value: String(kpis.canceled || 0),
            label: "Cancelamentos",
            trend: "total acumulado",
            trendColor: "text-[#ef9f1b]",
            barColor: "bg-[#ef9f1b]",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden"
          >
            <div className={`h-[3px] ${kpi.barColor}`} />
            <div className="p-5">
              <p className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
                {kpi.value}
              </p>
              <p className="text-[#7a9ab5] text-[13px] mb-1">{kpi.label}</p>
              <p className={`text-[12px] font-semibold ${kpi.trendColor}`}>
                {kpi.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent subscribers table */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[24px] leading-none">
            Últimos assinantes
          </h2>
          <Link
            href="/admin/assinantes"
            className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors"
          >
            Ver todos →
          </Link>
        </div>

        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
          <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-6 gap-3">
            {["Nome", "E-mail", "Plano", "Status", "Próx. cobrança", "Ações"].map((h) => (
              <p key={h} className="text-[#253750] text-[11px] font-semibold tracking-[0.5px]">
                {h}
              </p>
            ))}
          </div>

          {subscribers.length === 0 ? (
            <p className="text-[#253750] text-[13px] p-8 text-center">
              Nenhum assinante encontrado.
            </p>
          ) : (
            subscribers.map((sub, i) => {
              const st =
                sub.subscription
                  ? (STATUS_STYLE[sub.subscription.status] ?? STATUS_STYLE.CANCELED)
                  : STATUS_STYLE.CANCELED;
              return (
                <div key={sub.id}>
                  {i > 0 && <div className="bg-[#141d2c] h-px" />}
                  <div className="px-5 py-3.5 grid grid-cols-6 gap-3 items-center">
                    <p className="text-[#d4d4da] text-[14px] truncate">{sub.name}</p>
                    <p className="text-[#7a9ab5] text-[13px] truncate">{sub.email}</p>
                    <p className="text-[#7a9ab5] text-[13px]">
                      {sub.subscription?.plan.name ?? "—"}
                    </p>
                    <span
                      className={`inline-flex items-center h-[22px] px-2.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}
                    >
                      {st.label}
                    </span>
                    <p className="text-[#7a9ab5] text-[13px]">
                      {sub.subscription?.currentPeriodEnd
                        ? sub.subscription.currentPeriodEnd.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                    <Link
                      href={`/admin/assinantes?id=${sub.id}`}
                      className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors"
                    >
                      Ver →
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue chart */}
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white text-[15px] font-semibold mb-0.5">Receita mensal</p>
              <p className="text-[#253750] text-[12px]">Últimos 6 meses</p>
            </div>
            <div className="text-right">
              <p className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[28px] leading-none">
                {(kpis.monthlyRevenue / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-[#253750] text-[12px]">mês atual</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-[140px]">
            {BAR_HEIGHTS.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-[#141d2c] rounded-[4px] relative" style={{ height: "120px" }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-[4px] ${
                      i === BAR_HEIGHTS.length - 1 ? "bg-[#ff1f1f]" : "bg-[#ff1f1f]/60"
                    }`}
                    style={{ height: `${h}px` }}
                  />
                </div>
                <span className="text-[#253750] text-[11px]">{BAR_MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status donut */}
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
          <p className="text-white text-[15px] font-semibold mb-0.5">
            Status de assinantes
          </p>
          <p className="text-[#253750] text-[12px] mb-5">Distribuição atual</p>
          <div className="flex items-center gap-6">
            <div className="w-[140px] h-[140px] rounded-full bg-[#141d2c] border-[16px] border-[#22c55e] flex items-center justify-center shrink-0">
              <div className="text-center">
                <p className="font-['Barlow_Condensed'] font-bold text-white text-[22px] leading-none">
                  {kpis.totalActive.toLocaleString("pt-BR") || "0"}
                </p>
                <p className="text-[#7a9ab5] text-[11px]">ativos</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { dot: "bg-[#22c55e]", label: "Ativos", value: kpis.totalActive },
                { dot: "bg-[#ef9f1b]", label: "Atrasados", value: 0 },
                { dot: "bg-[#253750]", label: "Cancelados", value: kpis.canceled },
              ].map((leg) => (
                <div key={leg.label} className="flex items-center gap-2">
                  <div className={`w-[10px] h-[10px] rounded-[2px] ${leg.dot} shrink-0`} />
                  <span className="text-[#d4d4da] text-[13px] w-[80px]">{leg.label}</span>
                  <span className="text-white text-[13px] font-semibold">
                    {leg.value.toLocaleString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
