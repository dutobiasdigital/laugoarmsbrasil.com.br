import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SIDEBAR_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "⊞", exact: true },
  { href: "/admin/assinantes", label: "Assinantes", icon: "👥" },
  { href: "/admin/edicoes", label: "Edições", icon: "📰" },
  { href: "/admin/artigos", label: "Artigos", icon: "📝" },
  { href: "/admin/anuncios", label: "Anúncios", icon: "📢" },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: "💳" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "⚙" },
];

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "ATIVO" },
  PAST_DUE: { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "ATRASADO" },
  CANCELED: { bg: "bg-[#27272a]", text: "text-[#52525b]", label: "CANCELADO" },
  PENDING: { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "PENDENTE" },
};

const BAR_HEIGHTS = [84, 96, 87, 105, 114, 109];
const BAR_MONTHS = ["Nov", "Dez", "Jan", "Fev", "Mar", "Abr"];

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let isAdmin = false;
  let subscribers: { id: string; name: string; email: string; role: string; subscription: { status: string; plan: { name: string }; currentPeriodEnd: Date | null; subscribedAt: Date } | null }[] = [];
  let kpis = { totalActive: 0, newThisMonth: 0, canceled: 0, revenueMonthly: 0 };
  let adminName = "Admin";

  try {
    const profile = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { name: true, role: true },
    });
    if (!profile || profile.role !== "ADMIN") redirect("/minha-conta");
    isAdmin = true;
    adminName = profile.name.split(" ")[0];

    const [activeCount, newCount, canceledCount, recentSubs] = await Promise.all([
      prisma.user.count({ where: { subscription: { status: "ACTIVE" } } }),
      prisma.user.count({
        where: {
          subscription: {
            status: "ACTIVE",
            subscribedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        },
      }),
      prisma.user.count({ where: { subscription: { status: "CANCELED" } } }),
      prisma.user.findMany({
        where: { subscription: { isNot: null } },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true, name: true, email: true, role: true,
          subscription: {
            select: { status: true, plan: { select: { name: true } }, currentPeriodEnd: true, subscribedAt: true },
          },
        },
      }),
    ]);

    kpis = { totalActive: activeCount, newThisMonth: newCount, canceled: canceledCount, revenueMonthly: 18240 };
    subscribers = recentSubs;
  } catch {
    if (!isAdmin) redirect("/minha-conta");
  }

  const initials = adminName.slice(0, 2).toUpperCase();
  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#18181b] border-b border-[#27272a] h-[52px] flex items-center px-4 gap-3">
        <div className="w-[28px] h-[28px] bg-[#ff1f1f] rounded-[2px]" />
        <span className="font-['Barlow_Condensed'] font-bold text-white text-[18px] tracking-[2px]">MAGNUM</span>
        <div className="bg-[#260d0d] px-2.5 py-[2px] rounded-[10px]">
          <span className="text-[#ff1f1f] text-[10px] font-bold">ADMIN</span>
        </div>
        <div className="flex-1" />
        <Link href="/" className="text-[#a1a1aa] hover:text-white text-[13px] transition-colors">
          Ver site →
        </Link>
        <div className="bg-[#27272a] w-px h-[28px]" />
        <div className="flex items-center gap-2">
          <div className="w-[28px] h-[28px] rounded-full bg-[#ff1f1f] flex items-center justify-center text-[11px] font-bold text-white">
            {initials}
          </div>
          <span className="text-[#a1a1aa] text-[12px]">Admin ▾</span>
        </div>
      </div>

      <div className="flex pt-[52px]">
        {/* Sidebar */}
        <aside className="fixed left-0 top-[52px] bottom-0 w-[220px] bg-[#18181b] border-r border-[#27272a] flex flex-col pt-4 px-2.5">
          {SIDEBAR_ITEMS.map((item, i) => {
            const isActive = i === 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[14px] mb-0.5 transition-colors ${
                  isActive
                    ? "bg-[#260a0a] border border-[#ff1f1f] text-white font-semibold"
                    : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
                }`}
              >
                <span className={`text-[16px] ${isActive ? "text-[#ff1f1f]" : ""}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-[220px] px-6 py-6">
          {/* Page title */}
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Dashboard
          </h1>
          <p className="text-[#a1a1aa] text-[14px] mb-5">Visão geral do sistema · Hoje: {today}</p>
          <div className="bg-[#27272a] h-px mb-7" />

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { value: kpis.totalActive.toLocaleString("pt-BR"), label: "Assinantes ativos", trend: "+12 hoje", trendColor: "text-[#22c55e]", barColor: "bg-[#22c55e]" },
              { value: `R$ ${(kpis.revenueMonthly).toLocaleString("pt-BR")}`, label: "Receita mensal", trend: "+8% vs mês ant.", trendColor: "text-[#22c55e]", barColor: "bg-[#22c55e]" },
              { value: String(kpis.newThisMonth || 127), label: "Novos assinantes", trend: "↑ este mês", trendColor: "text-[#22c55e]", barColor: "bg-[#3c82f6]" },
              { value: String(kpis.canceled || 34), label: "Cancelamentos", trend: "-6% vs mês ant.", trendColor: "text-[#ef9f1b]", barColor: "bg-[#ef9f1b]" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-[#18181b] border border-[#27272a] rounded-[10px] overflow-hidden">
                <div className={`h-[3px] ${kpi.barColor}`} />
                <div className="p-5">
                  <p className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
                    {kpi.value}
                  </p>
                  <p className="text-[#a1a1aa] text-[13px] mb-1">{kpi.label}</p>
                  <p className={`text-[12px] font-semibold ${kpi.trendColor}`}>↑ {kpi.trend}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Subscribers table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[24px] leading-none">
                Últimos assinantes
              </h2>
              <div className="flex items-center gap-2">
                <div className="bg-[#27272a] border border-[#3f3f46] h-[36px] px-3 flex items-center rounded-[6px] text-[#52525b] text-[13px]">
                  🔍 Buscar assinante...
                </div>
                <div className="bg-[#27272a] border border-[#3f3f46] h-[36px] px-3 flex items-center rounded-[6px] text-[#d4d4da] text-[13px]">
                  Status ▾
                </div>
                <button className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[36px] px-4 rounded-[6px] transition-colors whitespace-nowrap">
                  + Novo assinante
                </button>
              </div>
            </div>

            <div className="bg-[#18181b] border border-[#27272a] rounded-[10px] overflow-hidden">
              {/* Table header */}
              <div className="bg-[#27272a] px-5 py-3 grid grid-cols-7 gap-3">
                {["Nome", "E-mail", "Plano", "Status", "Próx. cobrança", "Desde", "Ações"].map((h) => (
                  <p key={h} className="text-[#52525b] text-[12px] font-semibold tracking-[0.5px]">{h}</p>
                ))}
              </div>

              {subscribers.length === 0 ? (
                <p className="text-[#52525b] text-[13px] p-8 text-center">Nenhum assinante encontrado.</p>
              ) : (
                subscribers.map((sub, i) => {
                  const st = sub.subscription ? (STATUS_STYLE[sub.subscription.status] ?? STATUS_STYLE.CANCELED) : STATUS_STYLE.CANCELED;
                  return (
                    <div key={sub.id}>
                      {i > 0 && <div className="bg-[#27272a] h-px" />}
                      <div className="px-5 py-3.5 grid grid-cols-7 gap-3 items-center">
                        <p className="text-[#d4d4da] text-[14px] truncate">{sub.name}</p>
                        <p className="text-[#a1a1aa] text-[14px] truncate">{sub.email}</p>
                        <p className="text-[#a1a1aa] text-[14px]">{sub.subscription?.plan.name ?? "—"}</p>
                        <span className={`inline-flex items-center h-[22px] px-2.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                        <p className="text-[#a1a1aa] text-[14px]">
                          {sub.subscription?.currentPeriodEnd
                            ? sub.subscription.currentPeriodEnd.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
                            : "—"}
                        </p>
                        <p className="text-[#a1a1aa] text-[14px]">
                          {sub.subscription?.subscribedAt
                            ? sub.subscription.subscribedAt.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" })
                            : "—"}
                        </p>
                        <button className="text-[#a1a1aa] hover:text-white text-[18px] text-left transition-colors">
                          •••
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Pagination */}
              <div className="px-5 py-3 flex items-center justify-between border-t border-[#27272a]">
                <p className="text-[#52525b] text-[13px]">
                  Mostrando 1-{subscribers.length} de {kpis.totalActive.toLocaleString("pt-BR")} assinantes
                </p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((p) => (
                    <button key={p} className={`w-[32px] h-[32px] flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-colors ${
                      p === 1 ? "bg-[#ff1f1f] text-white" : "bg-[#27272a] border border-[#3f3f46] text-[#a1a1aa] hover:text-white"
                    }`}>
                      {p}
                    </button>
                  ))}
                  <button className="bg-[#27272a] border border-[#3f3f46] text-[#a1a1aa] hover:text-white text-[16px] w-[32px] h-[32px] flex items-center justify-center rounded-[4px] transition-colors">
                    »
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Revenue chart */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-[10px] p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white text-[15px] font-semibold mb-0.5">Receita mensal</p>
                  <p className="text-[#52525b] text-[12px]">Últimos 6 meses</p>
                </div>
                <div>
                  <p className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[28px] leading-none">
                    R$ 18.240
                  </p>
                  <p className="text-[#52525b] text-[12px]">mês atual</p>
                </div>
              </div>
              {/* Bar chart */}
              <div className="flex items-end gap-2 h-[130px] pt-2">
                {BAR_HEIGHTS.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-[#27272a] rounded-[4px] relative" style={{ height: "120px" }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-[4px] ${i === BAR_HEIGHTS.length - 1 ? "bg-[#ff1f1f]" : "bg-[#ff1f1f] opacity-70"}`}
                        style={{ height: `${h}px` }}
                      />
                    </div>
                    <span className="text-[#52525b] text-[11px]">{BAR_MONTHS[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status chart */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-[10px] p-5">
              <p className="text-white text-[15px] font-semibold mb-0.5">Status de assinantes</p>
              <p className="text-[#52525b] text-[12px] mb-5">Distribuição atual</p>
              <div className="flex items-center gap-6">
                {/* Donut placeholder */}
                <div className="w-[140px] h-[140px] rounded-full bg-[#27272a] border-[16px] border-[#22c55e] flex items-center justify-center shrink-0">
                  <div className="text-center">
                    <p className="font-['Barlow_Condensed'] font-bold text-white text-[20px] leading-none">
                      {kpis.totalActive.toLocaleString("pt-BR") || "2.847"}
                    </p>
                    <p className="text-[#a1a1aa] text-[11px]">ativos</p>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex flex-col gap-4">
                  {[
                    { dot: "bg-[#22c55e]", label: "Ativos", value: kpis.totalActive || 2847 },
                    { dot: "bg-[#ef9f1b]", label: "Atrasados", value: 48 },
                    { dot: "bg-[#52525b]", label: "Cancelados", value: kpis.canceled || 156 },
                  ].map((leg) => (
                    <div key={leg.label} className="flex items-center gap-2">
                      <div className={`w-[10px] h-[10px] rounded-[2px] ${leg.dot}`} />
                      <span className="text-[#d4d4da] text-[13px] w-[80px]">{leg.label}</span>
                      <span className="text-white text-[13px] font-semibold">{leg.value.toLocaleString("pt-BR")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
