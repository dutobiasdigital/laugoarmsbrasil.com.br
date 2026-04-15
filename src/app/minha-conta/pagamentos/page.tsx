import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Pagamentos — Minha Conta · Revista Magnum",
};
export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

const STATUS_STYLE: Record<string, string> = {
  APPROVED:  "bg-[#0f381f] text-[#22c55e]",
  PENDING:   "bg-[#2a1e05] text-[#f59e0b]",
  REJECTED:  "bg-[#2d0a0a] text-[#ff6b6b]",
  REFUNDED:  "bg-[#141d2c] text-[#7a9ab5]",
  CANCELLED: "bg-[#141d2c] text-white",
};
const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Aprovado", PENDING: "Pendente",
  REJECTED: "Recusado", REFUNDED: "Reembolsado", CANCELLED: "Cancelado",
};
const GATEWAY_ICON: Record<string, string> = {
  mercadopago: "🟡", stripe: "🟣", pagseguro: "🟢", paypal: "🔵",
};

interface Payment {
  id: string;
  amount: number;
  status: string;
  gateway: string;
  product_label: string | null;
  product_type: string;
  createdAt: string;
}

function fmtCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function PagamentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const email = user.email ?? "";

  const res = await fetch(
    `${BASE}/payment_intents?payer_email=eq.${encodeURIComponent(email)}&order=createdAt.desc`,
    { headers: HEADERS, cache: "no-store" }
  );
  const payments: Payment[] = await res.json().then(d => Array.isArray(d) ? d : []);

  const totalPaid = payments
    .filter(p => p.status === "APPROVED")
    .reduce((s, p) => s + p.amount, 0);

  const planName = payments.find(p => p.product_type === "magazine_subscription" && p.status === "APPROVED")?.product_label ?? "—";

  return (
    <div className="max-w-[1100px] py-7">
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-1">
        Pagamentos
      </h1>
      <p className="text-[#7a9ab5] text-[16px] mb-8">Histórico completo das suas transações</p>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total pago",    value: fmtCurrency(totalPaid), color: "text-[#22c55e]" },
          { label: "Transações",    value: String(payments.length), color: "text-white" },
          { label: "Último plano",  value: planName,                color: "text-[#d4d4da]" },
        ].map(s => (
          <div key={s.label} className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
            <p className="text-white text-[11px] font-semibold tracking-[0.5px] mb-1">{s.label.toUpperCase()}</p>
            <p className={`font-['Barlow_Condensed'] font-bold text-[28px] leading-none truncate ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      {payments.length === 0 ? (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-12 text-center">
          <p className="text-[40px] mb-3">💳</p>
          <p className="text-white text-[14px]">Nenhum pagamento registrado ainda.</p>
        </div>
      ) : (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-xl overflow-hidden">
          {/* Header desktop */}
          <div className="bg-[#141d2c] px-5 py-3 hidden sm:grid grid-cols-[1fr_1.4fr_90px_70px_100px] gap-3">
            {["Data", "Produto", "Valor", "Gateway", "Status"].map(h => (
              <p key={h} className="text-white text-[11px] font-semibold tracking-[0.5px]">{h}</p>
            ))}
          </div>

          {payments.map((p, i) => (
            <div key={p.id}>
              {i > 0 && <div className="bg-[#141d2c] h-px" />}

              {/* Desktop */}
              <div className="px-5 py-3.5 hidden sm:grid grid-cols-[1fr_1.4fr_90px_70px_100px] gap-3 items-center">
                <p className="text-[#7a9ab5] text-[13px]">{fmtDate(p.createdAt)}</p>
                <p className="text-[#d4d4da] text-[13px] truncate">{p.product_label ?? p.product_type}</p>
                <p className="text-white text-[14px] font-semibold">{fmtCurrency(p.amount)}</p>
                <p className="text-[#7a9ab5] text-[13px]">{GATEWAY_ICON[p.gateway] ?? "💳"}</p>
                <span className={`inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold ${STATUS_STYLE[p.status] ?? STATUS_STYLE.CANCELLED}`}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>

              {/* Mobile */}
              <div className="px-4 py-3.5 flex items-center justify-between gap-3 sm:hidden">
                <div className="min-w-0">
                  <p className="text-[#d4d4da] text-[13px] font-medium truncate">{p.product_label ?? p.product_type}</p>
                  <p className="text-[#526888] text-[11px]">{fmtDate(p.createdAt)} · {GATEWAY_ICON[p.gateway] ?? p.gateway}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-[14px] font-bold">{fmtCurrency(p.amount)}</p>
                  <span className={`inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold ${STATUS_STYLE[p.status] ?? STATUS_STYLE.CANCELLED}`}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
