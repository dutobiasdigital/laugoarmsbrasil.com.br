import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

const STATUS_STYLE: Record<string, string> = {
  APPROVED:  "bg-[#0f381f] text-[#22c55e]",
  PENDING:   "bg-[#2a1e05] text-[#f59e0b]",
  REJECTED:  "bg-[#2d0a0a] text-[#ff6b6b]",
  REFUNDED:  "bg-[#141d2c] text-[#7a9ab5]",
  CANCELLED: "bg-[#141d2c] text-[#253750]",
};
const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Aprovado", PENDING: "Pendente",
  REJECTED: "Recusado", REFUNDED: "Reembolsado", CANCELLED: "Cancelado",
};
const GATEWAY_ICON: Record<string, string> = {
  mercadopago: "🟡", stripe: "🟣", pagseguro: "🟢", paypal: "🔵",
};

interface PaymentIntent {
  id: string; amount: number; status: string; gateway: string;
  product_label: string | null; external_reference: string | null; createdAt: string;
}
interface Subscription {
  id: string; status: string; planPriceInCents: number; intervalMonths: number;
  currentPeriodEnd: string | null; subscribedAt: string;
  subscription_plans: { name: string } | null;
}
interface Edition {
  id: string; title: string; number: number | null; slug: string;
  coverImageUrl: string | null;
}

export default async function MinhaContaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const email = user.email ?? "";

  // Fetch em paralelo
  const [userRes, paymentsRes, editionsRes] = await Promise.all([
    fetch(`${BASE}/users?authId=eq.${user.id}&select=id,name&limit=1`,
      { headers: HEADERS, cache: "no-store" }),
    fetch(`${BASE}/payment_intents?payer_email=eq.${encodeURIComponent(email)}&order=createdAt.desc&limit=8`,
      { headers: HEADERS, cache: "no-store" }),
    fetch(`${BASE}/editions?isPublished=eq.true&order=publishedAt.desc&select=id,title,number,slug,coverImageUrl&limit=5`,
      { headers: HEADERS, cache: "no-store" }),
  ]);

  const users    = await userRes.json();
  const dbUser   = Array.isArray(users) ? users[0] : null;
  const payments: PaymentIntent[] = await paymentsRes.json().then(d => Array.isArray(d) ? d : []);
  const editions: Edition[]       = await editionsRes.json().then(d => Array.isArray(d) ? d : []);

  let subscription: Subscription | null = null;
  if (dbUser?.id) {
    const subRes = await fetch(
      `${BASE}/subscriptions?userId=eq.${dbUser.id}&select=*,subscription_plans(name)&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const subs = await subRes.json();
    subscription = Array.isArray(subs) && subs.length > 0 ? subs[0] : null;
  }

  const isActive   = subscription?.status === "ACTIVE";
  const firstName  = (dbUser?.name ?? user.email ?? "Assinante").split(" ")[0];
  const daysRemain = subscription?.currentPeriodEnd ? daysLeft(subscription.currentPeriodEnd) : 0;

  const INTERVAL_LABEL: Record<number, string> = { 1: "mês", 3: "trimestre", 6: "semestre", 12: "ano" };

  const stats = [
    { value: "207",         label: "Edições no acervo",  color: "text-[#ff1f1f]" },
    { value: isActive ? "✓" : "—", label: "Assinatura ativa", color: isActive ? "text-[#22c55e]" : "text-[#526888]" },
    { value: String(payments.length), label: "Pagamentos",      color: "text-white" },
    { value: isActive ? String(daysRemain) : "—", label: "Dias restantes", color: "text-[#d4d4da]" },
  ];

  return (
    <div className="max-w-[1100px] py-7">
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-1">
        Dashboard
      </h1>
      <p className="text-[#7a9ab5] text-[16px] mb-8">Bem-vindo de volta, {firstName}!</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
            <p className={`font-['Barlow_Condensed'] font-bold text-[40px] leading-none ${s.color}`}>
              {s.value}
            </p>
            <p className="text-[#7a9ab5] text-[13px] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Assinatura */}
      {subscription ? (
        <div className="bg-[#0e1520] border border-[#ff1f1f]/30 rounded-xl p-5 lg:p-7 mb-8 relative overflow-hidden">
          <div className="absolute left-0 top-5 bottom-5 w-[4px] bg-[#ff1f1f] rounded-r" />
          <div className="pl-5 flex flex-col lg:flex-row lg:items-center gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <p className="text-white text-[16px] font-semibold">Minha Assinatura</p>
                <span className={`text-[10px] font-bold px-2.5 py-[3px] rounded-full ${
                  isActive ? "bg-[#22c55e] text-white" : "bg-[#141d2c] text-[#253750]"
                }`}>
                  {isActive ? "ATIVA" : subscription.status}
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-[#253750] text-[12px] mb-1">Plano</p>
                  <p className="text-[#d4d4da] text-[15px] font-semibold">
                    {subscription.subscription_plans?.name ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[#253750] text-[12px] mb-1">Valor</p>
                  <p className="text-[#d4d4da] text-[15px] font-semibold">
                    {fmtCurrency(subscription.planPriceInCents)}/{INTERVAL_LABEL[subscription.intervalMonths] ?? "período"}
                  </p>
                </div>
                <div>
                  <p className="text-[#253750] text-[12px] mb-1">Válido até</p>
                  <p className="text-[#d4d4da] text-[15px] font-semibold">
                    {subscription.currentPeriodEnd ? fmtDate(subscription.currentPeriodEnd) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[#253750] text-[12px] mb-1">Assinante desde</p>
                  <p className="text-[#d4d4da] text-[15px] font-semibold">
                    {fmtDate(subscription.subscribedAt)}
                  </p>
                </div>
              </div>
            </div>
            <Link href="/assine"
              className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] hover:text-white text-[13px] h-[40px] px-5 flex items-center justify-center rounded-[6px] transition-colors whitespace-nowrap shrink-0">
              Renovar plano →
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-xl p-8 text-center mb-8">
          <p className="text-[40px] mb-3">📰</p>
          <p className="text-white text-[18px] font-bold mb-2">Nenhuma assinatura ativa</p>
          <p className="text-[#7a9ab5] text-[14px] mb-5">
            Assine e acesse 207 edições completas da Revista Magnum.
          </p>
          <Link href="/assine"
            className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-8 inline-flex items-center rounded-[6px] transition-colors">
            Ver planos e assinar →
          </Link>
        </div>
      )}

      {/* Edições recentes */}
      {editions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none">
              Edições recentes
            </h2>
            <Link href="/edicoes" className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors">
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {editions.map(ed => (
              <Link
                key={ed.id}
                href={isActive ? `/edicoes/${ed.slug}` : "/assine"}
                className="bg-[#0e1520] border border-[#141d2c] rounded-[8px] overflow-hidden hover:border-zinc-600 transition-colors group"
              >
                <div className="h-[148px] bg-[#141d2c] flex items-center justify-center overflow-hidden">
                  {ed.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ed.coverImageUrl} alt={ed.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <p className="font-['Barlow_Condensed'] font-bold text-[#1c2a3e] text-[16px]">
                      {ed.number ? `Nº ${ed.number}` : "—"}
                    </p>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[#d4d4da] text-[12px] font-semibold leading-snug">
                    {ed.number ? `Edição ${ed.number}` : ed.title}
                  </p>
                  <p className="text-[#ff1f1f] text-[11px] mt-0.5">
                    {isActive ? "Ler →" : "🔒 Assine"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de pagamentos */}
      {payments.length > 0 && (
        <div>
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-5">
            Histórico de pagamentos
          </h2>
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-xl overflow-hidden">
            <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-[1fr_1.2fr_90px_70px_100px] gap-3 hidden sm:grid">
              {["Data", "Produto", "Valor", "Gateway", "Status"].map(h => (
                <p key={h} className="text-[#253750] text-[11px] font-semibold tracking-[0.5px]">{h}</p>
              ))}
            </div>
            {payments.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                {/* Desktop */}
                <div className="px-5 py-3.5 grid grid-cols-[1fr_1.2fr_90px_70px_100px] gap-3 items-center hidden sm:grid">
                  <p className="text-[#7a9ab5] text-[13px]">{fmtDate(p.createdAt)}</p>
                  <p className="text-[#d4d4da] text-[13px] truncate">{p.product_label ?? "—"}</p>
                  <p className="text-white text-[14px] font-semibold">{fmtCurrency(p.amount)}</p>
                  <p className="text-[#7a9ab5] text-[13px]">
                    {GATEWAY_ICON[p.gateway] ?? "💳"}
                  </p>
                  <span className={`inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold ${STATUS_STYLE[p.status] ?? STATUS_STYLE.CANCELLED}`}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                </div>
                {/* Mobile */}
                <div className="px-4 py-3.5 flex items-center justify-between gap-3 sm:hidden">
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[13px] truncate">{p.product_label ?? "—"}</p>
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
        </div>
      )}

      {payments.length === 0 && subscription === null && (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-6 text-center">
          <p className="text-[#253750] text-[14px]">Nenhum pagamento registrado ainda.</p>
        </div>
      )}
    </div>
  );
}
