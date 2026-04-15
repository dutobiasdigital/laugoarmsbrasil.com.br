import Link from "next/link";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const H = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

function fmtCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  APPROVED:  { bg: "bg-[#0f381f]",  text: "text-[#22c55e]", label: "APROVADO"  },
  PENDING:   { bg: "bg-[#2a1e05]",  text: "text-[#f59e0b]", label: "PENDENTE"  },
  REJECTED:  { bg: "bg-[#2d0a0a]",  text: "text-[#ff6b6b]", label: "RECUSADO"  },
  CANCELLED: { bg: "bg-[#141d2c]",  text: "text-white", label: "CANCELADO" },
};

const GATEWAY_ICON: Record<string, string> = {
  mercadopago: "🟡", stripe: "🟣", pagseguro: "🟢", paypal: "🔵",
};

const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

interface PaymentIntent {
  id: string; gateway: string; status: string; product_type: string;
  product_label: string | null; amount: number; payer_name: string | null;
  payer_email: string | null; createdAt: string;
}
interface Subscription { status: string; }
interface GuideListing { status: string; plan: string; }

export default async function AdminDashboardPage() {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  // ── Fetch em paralelo ──────────────────────────────────────
  const [piRes, subRes, guiaRes, usersRes] = await Promise.all([
    fetch(`${BASE}/payment_intents?select=id,gateway,status,product_type,product_label,amount,payer_name,payer_email,createdAt&order=createdAt.desc&limit=200`, { headers: H, cache: "no-store" }),
    fetch(`${BASE}/subscriptions?select=status`,   { headers: H, cache: "no-store" }),
    fetch(`${BASE}/guide_listings?select=status,plan`, { headers: H, cache: "no-store" }),
    fetch(`${BASE}/users?select=id`,               { headers: H, cache: "no-store" }),
  ]);

  const allIntents: PaymentIntent[]   = await piRes.json().then(d => Array.isArray(d) ? d : []);
  const allSubs:    Subscription[]    = await subRes.json().then(d => Array.isArray(d) ? d : []);
  const allGuia:    GuideListing[]    = await guiaRes.json().then(d => Array.isArray(d) ? d : []);
  const allUsers:   unknown[]         = await usersRes.json().then(d => Array.isArray(d) ? d : []);

  // ── Métricas ──────────────────────────────────────────────
  const approvedIntents = allIntents.filter(i => i.status === "APPROVED");
  const totalRevenue    = approvedIntents.reduce((s, i) => s + i.amount, 0);

  const now          = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthRevenue = approvedIntents
    .filter(i => i.createdAt >= startOfMonth)
    .reduce((s, i) => s + i.amount, 0);

  const activeSubs    = allSubs.filter(s => s.status === "ACTIVE").length;
  const pendingGuia   = allGuia.filter(g => g.status === "PENDING").length;
  const activeGuia    = allGuia.filter(g => g.status === "ACTIVE").length;
  const paidGuia      = allGuia.filter(g => g.plan !== "FREE").length;
  const recentIntents = allIntents.slice(0, 10);

  // ── Receita por mês (últimos 6) ───────────────────────────
  const barData = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const rev  = approvedIntents
      .filter(i => i.createdAt >= d.toISOString() && i.createdAt < next.toISOString())
      .reduce((s, i) => s + i.amount, 0);
    return { month: MONTHS_PT[d.getMonth()], rev, isCurrent: idx === 5 };
  });
  const maxBar = Math.max(...barData.map(b => b.rev), 1);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">
          Dashboard
        </h1>
        <p className="text-[#526888] text-[13px] capitalize hidden sm:block">{today}</p>
      </div>
      <div className="bg-[#141d2c] h-px mb-7" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            value: fmtCurrency(totalRevenue),
            label: "Receita total aprovada",
            trend: `${fmtCurrency(monthRevenue)} este mês`,
            trendColor: "text-[#22c55e]",
            bar: "bg-[#22c55e]",
          },
          {
            value: String(activeSubs),
            label: "Assinantes ativos",
            trend: `${allSubs.length} cadastros no total`,
            trendColor: "text-[#7a9ab5]",
            bar: "bg-[#3c82f6]",
          },
          {
            value: String(activeGuia),
            label: "Guia — Listagens ativas",
            trend: pendingGuia > 0 ? `${pendingGuia} aguardando aprovação` : `${paidGuia} planos pagos`,
            trendColor: pendingGuia > 0 ? "text-[#f59e0b]" : "text-[#22c55e]",
            bar: "bg-[#f59e0b]",
          },
          {
            value: String(allUsers.length),
            label: "Usuários cadastrados",
            trend: `${allIntents.length} transações no total`,
            trendColor: "text-[#7a9ab5]",
            bar: "bg-[#818cf8]",
          },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
            <div className={`h-[3px] ${kpi.bar}`} />
            <div className="p-5">
              <p className="font-['Barlow_Condensed'] font-bold text-white text-[28px] leading-none mb-1 truncate">
                {kpi.value}
              </p>
              <p className="text-[#7a9ab5] text-[12px] mb-1">{kpi.label}</p>
              <p className={`text-[11px] font-semibold ${kpi.trendColor}`}>{kpi.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transações recentes + Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 mb-8">

        {/* Transações recentes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] leading-none">
              Últimas transações
            </h2>
            <Link href="/admin/pagamentos"
              className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors">
              Ver todas →
            </Link>
          </div>

          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
            {recentIntents.length === 0 ? (
              <p className="text-white text-[13px] p-8 text-center">
                Nenhuma transação ainda.
              </p>
            ) : (
              recentIntents.map((intent, i) => {
                const st = STATUS_STYLE[intent.status] ?? STATUS_STYLE.CANCELLED;
                return (
                  <div key={intent.id}>
                    {i > 0 && <div className="bg-[#141d2c] h-px" />}
                    <div className="px-5 py-3.5 flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[#d4d4da] text-[13px] font-medium truncate">
                          {intent.payer_name ?? intent.payer_email ?? "—"}
                        </p>
                        <p className="text-[#526888] text-[11px] truncate">
                          {intent.product_label ?? intent.product_type}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-white text-[14px] font-bold">{fmtCurrency(intent.amount)}</p>
                        <p className="text-white text-[11px]">
                          {GATEWAY_ICON[intent.gateway] ?? "💳"} {fmtDate(intent.createdAt)} {fmtTime(intent.createdAt)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold shrink-0 ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna direita: Gráfico + Atalhos */}
        <div className="flex flex-col gap-5">

          {/* Receita últimos 6 meses */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white text-[14px] font-semibold mb-0.5">Receita mensal</p>
                <p className="text-white text-[11px]">Últimos 6 meses</p>
              </div>
              <p className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[22px] leading-none">
                {fmtCurrency(monthRevenue)}
              </p>
            </div>
            <div className="flex items-end gap-1.5 h-[90px]">
              {barData.map(b => {
                const h = maxBar > 0 ? Math.round((b.rev / maxBar) * 70) : 0;
                return (
                  <div key={b.month} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-[#141d2c] rounded-[3px] relative" style={{ height: "72px" }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-[3px] transition-all ${b.isCurrent ? "bg-[#ff1f1f]" : "bg-[#ff1f1f]/40"}`}
                        style={{ height: `${Math.max(h, b.rev > 0 ? 4 : 0)}px` }}
                      />
                    </div>
                    <span className="text-white text-[10px]">{b.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribuição Guia */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
            <p className="text-white text-[14px] font-semibold mb-3">Guia Comercial</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Ativos",   count: activeGuia,                          color: "bg-[#22c55e]" },
                { label: "Pendentes", count: pendingGuia,                          color: "bg-[#f59e0b]" },
                { label: "Pagos",    count: paidGuia,                             color: "bg-[#818cf8]" },
                { label: "Total",    count: allGuia.length,                       color: "bg-[#7a9ab5]" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-[8px] h-[8px] rounded-[2px] shrink-0 ${item.color}`} />
                    <span className="text-[#7a9ab5] text-[13px]">{item.label}</span>
                  </div>
                  <span className="text-white text-[13px] font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Atalhos */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
            <p className="text-[#ff1f1f] text-[10px] font-semibold tracking-[1.5px] uppercase mb-3">Atalhos</p>
            <div className="flex flex-col gap-1">
              {[
                { href: "/admin/guia?status=PENDING", label: "📋 Aprovar listagens do Guia", badge: pendingGuia > 0 ? String(pendingGuia) : null },
                { href: "/admin/pagamentos",          label: "💳 Ver todos os pagamentos",  badge: null },
                { href: "/admin/assinantes",          label: "👥 Gerenciar assinantes",     badge: null },
                { href: "/admin/configuracoes?aba=pagamentos", label: "⚙ Configurar gateways", badge: null },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[6px] text-[13px] text-[#7a9ab5] hover:text-white hover:bg-[#141d2c] transition-colors">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-[#f59e0b] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
