export const dynamic = "force-dynamic";

import Link from "next/link";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "bg-amber-900/40 text-amber-400 border border-amber-800/50",
  PAID:       "bg-green-900/40 text-green-400 border border-green-800/50",
  DELIVERED:  "bg-green-900/40 text-green-400 border border-green-800/50",
  PROCESSING: "bg-blue-900/40 text-blue-400 border border-blue-800/50",
  SHIPPED:    "bg-blue-900/40 text-blue-400 border border-blue-800/50",
  CANCELLED:  "bg-red-900/40 text-red-400 border border-red-800/50",
  REFUNDED:   "bg-red-900/40 text-red-400 border border-red-800/50",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:    "Pendente",
  PAID:       "Pago",
  PROCESSING: "Em preparo",
  SHIPPED:    "Enviado",
  DELIVERED:  "Entregue",
  CANCELLED:  "Cancelado",
  REFUNDED:   "Reembolsado",
};

function fmtBRL(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function LojaDashboardPage() {
  const now = new Date();
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const startOfDay   = now.toISOString().slice(0, 10);

  let totalOrders      = 0;
  let ordersToday      = 0;
  let monthRevenue     = 0;
  let activeProducts   = 0;
  let recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }[] = [];

  try {
    const [rTotal, rToday, rRevenue, rProducts, rRecent] = await Promise.all([
      fetch(`${BASE}/shop_orders?select=id&limit=1`, {
        headers: { ...HEADERS, Prefer: "count=exact" },
        cache: "no-store",
      }),
      fetch(`${BASE}/shop_orders?select=id&createdAt=gte.${startOfDay}T00:00:00&limit=1`, {
        headers: { ...HEADERS, Prefer: "count=exact" },
        cache: "no-store",
      }),
      fetch(`${BASE}/shop_orders?select=total&createdAt=gte.${startOfMonth}T00:00:00&status=neq.CANCELLED&status=neq.REFUNDED`, {
        headers: HEADERS,
        cache: "no-store",
      }),
      fetch(`${BASE}/shop_products?select=id&isActive=eq.true&limit=1`, {
        headers: { ...HEADERS, Prefer: "count=exact" },
        cache: "no-store",
      }),
      fetch(`${BASE}/shop_orders?select=id,orderNumber,customerName,total,status,createdAt&order=createdAt.desc&limit=10`, {
        headers: HEADERS,
        cache: "no-store",
      }),
    ]);

    const countHeader = (r: Response) => parseInt(r.headers.get("content-range")?.split("/")[1] ?? "0", 10);
    totalOrders    = countHeader(rTotal);
    ordersToday    = countHeader(rToday);
    activeProducts = countHeader(rProducts);

    const revenueData: { total: number }[] = await rRevenue.json();
    monthRevenue = Array.isArray(revenueData) ? revenueData.reduce((s, o) => s + (o.total ?? 0), 0) : 0;

    const ordersData = await rRecent.json();
    recentOrders = Array.isArray(ordersData) ? ordersData : [];
  } catch {
    // DB unavailable
  }

  const stats = [
    { label: "Total de Pedidos",   value: totalOrders.toString(),   icon: "🛒" },
    { label: "Pedidos Hoje",       value: ordersToday.toString(),   icon: "📅" },
    { label: "Receita do Mês",     value: fmtBRL(monthRevenue),     icon: "💰" },
    { label: "Produtos Ativos",    value: activeProducts.toString(),icon: "📦" },
  ];

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[#7a9ab5] text-[14px]">Admin</span>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px]">Loja</span>
      </div>

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Loja
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">Visão geral das vendas e pedidos</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#0d1520] border border-[#1c2a3e] rounded-[10px] p-5">
            <div className="text-[24px] mb-2">{s.icon}</div>
            <div className="text-white text-[24px] font-bold font-['Barlow_Condensed'] leading-none mb-1">
              {s.value}
            </div>
            <div className="text-[#7a9ab5] text-[12px]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-[#0d1520] border border-[#1c2a3e] rounded-[10px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c2a3e]">
          <h2 className="text-white font-semibold text-[16px]">Últimos Pedidos</h2>
          <Link
            href="/admin/loja/pedidos"
            className="text-[#ff1f1f] hover:text-[#ff4444] text-[13px] transition-colors"
          >
            Ver todos →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#7a9ab5] text-[14px]">
            Nenhum pedido encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#141d2c]">
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">#Pedido</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Cliente</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Total</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Status</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Data</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#141d2c] hover:bg-[#0a0f1a]">
                    <td className="px-5 py-3 text-[#d4d4da] text-[13px] font-mono">{order.orderNumber}</td>
                    <td className="px-5 py-3 text-[#d4d4da] text-[13px]">{order.customerName}</td>
                    <td className="px-5 py-3 text-[#d4d4da] text-[13px]">{fmtBRL(order.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${STATUS_COLORS[order.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#7a9ab5] text-[13px]">{fmtDate(order.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/loja/pedidos/${order.id}`} className="text-[#ff1f1f] hover:text-[#ff4444] text-[12px] transition-colors">
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
