export const dynamic = "force-dynamic";

import Link from "next/link";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { value: "",           label: "Todos" },
  { value: "PENDING",    label: "Pendente" },
  { value: "PAID",       label: "Pago" },
  { value: "PROCESSING", label: "Em preparo" },
  { value: "SHIPPED",    label: "Enviado" },
  { value: "DELIVERED",  label: "Entregue" },
  { value: "CANCELLED",  label: "Cancelado" },
];

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

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD:  "Cartão de Débito",
  PIX:         "Pix",
  BOLETO:      "Boleto",
};

function fmtBRL(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentMethod: string | null;
  paymentGateway: string | null;
  status: string;
  createdAt: string;
}

export default async function PedidosLojaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const sp     = await searchParams;
  const status = sp.status ?? "";
  const q      = sp.q ?? "";
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  let orders: Order[] = [];
  let total = 0;

  try {
    let url = `${BASE}/shop_orders?select=id,orderNumber,customerName,customerEmail,total,paymentMethod,paymentGateway,status,createdAt&order=createdAt.desc&limit=${PAGE_SIZE}&offset=${offset}`;
    if (status) url += `&status=eq.${status}`;
    if (q) {
      const enc = encodeURIComponent(q);
      url += `&or=(customerName.ilike.*${enc}*,customerEmail.ilike.*${enc}*,orderNumber.ilike.*${enc}*)`;
    }

    const res = await fetch(url, {
      headers: { ...HEADERS, Prefer: "count=exact" },
      cache: "no-store",
    });
    const data = await res.json();
    orders = Array.isArray(data) ? data : [];
    total  = parseInt(res.headers.get("content-range")?.split("/")[1] ?? "0", 10);
  } catch {
    // DB unavailable
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function tabHref(s: string) {
    const p = new URLSearchParams();
    if (s) p.set("status", s);
    if (q) p.set("q", q);
    const qs = p.toString();
    return `/admin/loja/pedidos${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/loja" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Loja
        </Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px]">Pedidos</span>
      </div>

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Pedidos
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">{total} pedido{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tabHref(tab.value)}
            className={`px-4 h-[36px] rounded-[6px] text-[13px] font-medium flex items-center transition-colors ${
              status === tab.value
                ? "bg-[#ff1f1f] text-white"
                : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-3 mb-5">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, email ou número do pedido..."
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-[360px]"
        />
        <button
          type="submit"
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[40px] px-5 rounded-[6px] transition-colors"
        >
          Buscar
        </button>
        {q && (
          <Link
            href={tabHref(status)}
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] text-[14px] h-[40px] px-4 rounded-[6px] transition-colors flex items-center"
          >
            Limpar
          </Link>
        )}
      </form>

      <div className="bg-[#0d1520] border border-[#1c2a3e] rounded-[10px] overflow-hidden">
        {orders.length === 0 ? (
          <div className="px-5 py-12 text-center text-[#7a9ab5] text-[14px]">
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
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Forma Pagto</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Status</th>
                  <th className="text-left px-5 py-3 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Data</th>
                  <th className="px-5 py-3 w-[80px]" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#141d2c] hover:bg-[#0a0f1a]">
                    <td className="px-5 py-3 text-[#d4d4da] text-[13px] font-mono">{order.orderNumber}</td>
                    <td className="px-5 py-3">
                      <div className="text-[#d4d4da] text-[13px]">{order.customerName}</div>
                      <div className="text-[#7a9ab5] text-[11px]">{order.customerEmail}</div>
                    </td>
                    <td className="px-5 py-3 text-[#d4d4da] text-[13px] font-medium">{fmtBRL(order.total)}</td>
                    <td className="px-5 py-3 text-[#7a9ab5] text-[13px]">
                      {order.paymentMethod ? (PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${STATUS_COLORS[order.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#7a9ab5] text-[12px]">{fmtDate(order.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/loja/pedidos/${order.id}`}
                        className="text-[#ff1f1f] hover:text-[#ff4444] text-[12px] transition-colors"
                      >
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-5">
          {page > 1 && (
            <Link
              href={`/admin/loja/pedidos?status=${status}&q=${q}&page=${page - 1}`}
              className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] h-[36px] px-4 rounded-[6px] transition-colors flex items-center"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-[#7a9ab5] text-[13px] px-2">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/loja/pedidos?status=${status}&q=${q}&page=${page + 1}`}
              className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] h-[36px] px-4 rounded-[6px] transition-colors flex items-center"
            >
              Próxima →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
