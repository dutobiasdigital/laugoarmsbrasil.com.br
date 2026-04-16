import Link from "next/link";
import { notFound } from "next/navigation";
import AssinanteClient from "./_AssinanteClient";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const PAYMENT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  APPROVED: { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "APROVADO" },
  PENDING: { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "PENDENTE" },
  REJECTED: { bg: "bg-[#2d0a0a]", text: "text-[#ff6b6b]", label: "REJEITADO" },
  REFUNDED: { bg: "bg-[#141d2c]", text: "text-[#7a9ab5]", label: "REEMBOLSADO" },
  CANCELLED: { bg: "bg-[#141d2c]", text: "text-white", label: "CANCELADO" },
};

interface Subscription {
  id: string; status: string; planId: string;
  planPriceInCents: number; intervalMonths: number;
  currentPeriodStart: string; currentPeriodEnd: string;
  subscribedAt: string; canceledAt: string | null; notes: string | null;
  subscription_plans: { name: string } | null;
}

interface Payment {
  id: string; amount_cents: number; status: string;
  gateway: string | null; createdAt: string;
}

interface UserRow {
  id: string; name: string; email: string; phone: string | null;
  role: string; createdAt: string; avatarUrl: string | null;
  subscriptions: Subscription[];
}

export default async function AssinantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let user: UserRow | null = null;
  let plans: { id: string; name: string; priceInCents: number; intervalMonths: number }[] = [];
  let payments: Payment[] = [];

  try {
    // Fetch user with embedded subscription
    const userRes = await fetch(
      `${BASE}/users?id=eq.${id}&select=id,name,email,phone,role,createdAt,avatarUrl,subscriptions(id,status,planId,planPriceInCents,intervalMonths,currentPeriodStart,currentPeriodEnd,subscribedAt,canceledAt,notes,subscription_plans(name))&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const userData = await userRes.json();
    user = Array.isArray(userData) && userData.length > 0 ? userData[0] : null;

    if (!user) { notFound(); return; }

    // Parallel: plans + payment history
    const [plansRes, paymentsRes] = await Promise.all([
      fetch(`${BASE}/subscription_plans?active=eq.true&select=id,name,priceInCents,intervalMonths&order=priceInCents.asc`, { headers: HEADERS, cache: "no-store" }),
      fetch(`${BASE}/payment_intents?payer_email=eq.${encodeURIComponent(user.email)}&order=createdAt.desc&limit=10&select=id,amount_cents,status,gateway,createdAt`, { headers: HEADERS, cache: "no-store" }),
    ]);

    const plansData = await plansRes.json();
    plans = Array.isArray(plansData) ? plansData : [];

    const paymentsData = await paymentsRes.json();
    payments = Array.isArray(paymentsData) ? paymentsData : [];
  } catch {
    // DB unavailable
  }

  if (!user) notFound();

  const formatCurrency = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const subscription = user.subscriptions?.[0] ?? null;

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/assinantes" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          ← Assinantes
        </Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px]">{user.name}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            {user.name}
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            Cadastrado em {new Date(user.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
      <div className="bg-[#141d2c] h-px mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1100px]">
        {/* Dados + Assinatura (client) */}
        <div className="lg:col-span-2 space-y-5">
          <AssinanteClient
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone ?? "",
              role: user.role,
              avatarUrl: user.avatarUrl ?? null,
            }}
            subscription={
              subscription
                ? {
                    id: subscription.id,
                    status: subscription.status,
                    planId: subscription.planId,
                    planName: subscription.subscription_plans?.name ?? "—",
                    planPriceInCents: subscription.planPriceInCents,
                    intervalMonths: subscription.intervalMonths,
                    currentPeriodStart: subscription.currentPeriodStart.split("T")[0],
                    currentPeriodEnd: subscription.currentPeriodEnd.split("T")[0],
                    subscribedAt: new Date(subscription.subscribedAt).toLocaleDateString("pt-BR"),
                    canceledAt: subscription.canceledAt
                      ? new Date(subscription.canceledAt).toLocaleDateString("pt-BR")
                      : null,
                    notes: subscription.notes ?? "",
                  }
                : null
            }
            plans={plans.map((p) => ({
              id: p.id,
              name: p.name,
              priceInCents: p.priceInCents,
              intervalMonths: p.intervalMonths,
            }))}
          />
        </div>

        {/* Histórico de pagamentos */}
        <div>
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
            <div className="bg-[#141d2c] px-4 py-2.5">
              <p className="text-white text-[11px] font-semibold tracking-[0.5px] uppercase">
                Últimos Pagamentos
              </p>
            </div>
            {payments.length === 0 ? (
              <p className="text-white text-[13px] p-5 text-center">Nenhum pagamento.</p>
            ) : (
              payments.map((p, i) => {
                const st = PAYMENT_STYLE[p.status] ?? PAYMENT_STYLE.PENDING;
                return (
                  <div key={p.id}>
                    {i > 0 && <div className="bg-[#141d2c] h-px" />}
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[#d4d4da] text-[13px] font-semibold">
                          {formatCurrency(p.amount_cents)}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-white text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                        {p.gateway ? ` · ${p.gateway}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
