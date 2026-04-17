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
  CANCELLED: "bg-[#141d2c] text-[#526888]",
};
const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Aprovado", PENDING: "Pendente",
  REJECTED: "Recusado", REFUNDED: "Reembolsado", CANCELLED: "Cancelado",
};
const GATEWAY_LABEL: Record<string, string> = {
  mercadopago: "Mercado Pago", stripe: "Stripe", pagseguro: "PagSeguro", paypal: "PayPal",
};

interface PaymentIntent {
  id: string; amount: number; status: string; gateway: string;
  product_label: string | null; createdAt: string;
}
interface Subscription {
  id: string; status: string; planPriceInCents: number; intervalMonths: number;
  currentPeriodEnd: string | null; subscribedAt: string;
  subscription_plans: { name: string } | null;
}

export default async function MinhaContaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const email = user.email ?? "";

  const [userRes, paymentsRes] = await Promise.all([
    fetch(`${BASE}/users?authId=eq.${user.id}&select=id,name&limit=1`, { headers: HEADERS, cache: "no-store" }),
    fetch(`${BASE}/payment_intents?payer_email=eq.${encodeURIComponent(email)}&order=createdAt.desc&limit=5`, { headers: HEADERS, cache: "no-store" }),
  ]);

  const users    = await userRes.json();
  const dbUser   = Array.isArray(users) ? users[0] : null;
  const payments: PaymentIntent[] = await paymentsRes.json().then(d => Array.isArray(d) ? d : []);

  let subscription: Subscription | null = null;
  let favCount = 0;

  if (dbUser?.id) {
    const [subRes, favRes] = await Promise.all([
      fetch(`${BASE}/subscriptions?userId=eq.${dbUser.id}&select=*,subscription_plans(name)&limit=1`, { headers: HEADERS, cache: "no-store" }),
      fetch(`${BASE}/user_favorites?userId=eq.${dbUser.id}&select=id`, { headers: { ...HEADERS, Prefer: "count=exact" }, cache: "no-store" }),
    ]);
    const subs = await subRes.json();
    subscription = Array.isArray(subs) && subs.length > 0 ? subs[0] : null;
    const cr = favRes.headers.get("Content-Range");
    if (cr) { const m = cr.match(/\/(\d+)$/); if (m) favCount = parseInt(m[1], 10); }
  }

  const isActive    = subscription?.status === "ACTIVE";
  const firstName   = (dbUser?.name ?? user.email ?? "Assinante").split(" ")[0];
  const daysRemain  = subscription?.currentPeriodEnd ? daysLeft(subscription.currentPeriodEnd) : 0;
  const INTERVAL_LABEL: Record<number, string> = { 1: "mês", 3: "trimestre", 6: "semestre", 12: "ano" };

  const stats = [
    {
      value: isActive ? "ATIVA" : "—",
      label: "Assinatura",
      sub: isActive ? subscription!.subscription_plans?.name ?? "Plano" : "Nenhuma",
      color: isActive ? "text-[#22c55e]" : "text-[#526888]",
      href: "/minha-conta/assinatura",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    },
    {
      value: isActive ? String(daysRemain) : "—",
      label: "Dias restantes",
      sub: isActive && subscription?.currentPeriodEnd ? `Vence ${fmtDate(subscription.currentPeriodEnd)}` : "—",
      color: daysRemain <= 7 && isActive ? "text-[#f59e0b]" : "text-[#ff1f1f]",
      href: "/minha-conta/assinatura",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
    {
      value: String(payments.length),
      label: "Pagamentos",
      sub: payments.length > 0 ? `Último: ${fmtDate(payments[0].createdAt)}` : "Nenhum ainda",
      color: "text-white",
      href: "/minha-conta/pagamentos",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    },
    {
      value: String(favCount),
      label: "Favoritos",
      sub: favCount > 0 ? "Edições, produtos e guias" : "Nenhum ainda",
      color: "text-[#ff1f1f]",
      href: "/minha-conta/favoritos",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero-metal px-5 lg:px-10 pt-10 pb-8 border-b border-[#141d2c]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
          <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">Área do assinante</span>
        </div>
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[44px] lg:text-[56px] leading-[0.95] mb-2">
          Olá, {firstName}
        </h1>
        <p className="text-[#7a9ab5] text-[15px]">
          Bem-vindo ao seu painel de controle da Revista Magnum.
        </p>
      </section>

      <div className="px-5 lg:px-10 py-8 flex flex-col gap-8 max-w-[900px]">

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <Link key={s.label} href={s.href}
              className="bg-[#0e1520] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[12px] p-5 flex flex-col gap-3 transition-all hover:shadow-lg hover:shadow-black/30 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#526888] group-hover:text-[#7a9ab5] transition-colors">{s.icon}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#1c2a3e] group-hover:text-[#526888] transition-colors">
                  <path d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className={`font-['Barlow_Condensed'] font-bold text-[34px] leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[#7a9ab5] text-[12px] mt-0.5 font-medium">{s.label}</p>
                <p className="text-[#526888] text-[11px] mt-0.5 line-clamp-1">{s.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Assinatura card */}
        {subscription ? (
          <div className="bg-[#0e1520] rounded-[14px] overflow-hidden border border-[#141d2c]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#141d2c]">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
                <p className="text-[#dce8ff] text-[15px] font-semibold">Minha Assinatura</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                isActive ? "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30" : "bg-[#141d2c] text-[#526888]"
              }`}>
                {isActive ? "● ATIVA" : subscription.status}
              </span>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { l: "Plano", v: subscription.subscription_plans?.name ?? "—" },
                { l: "Valor", v: `${fmtCurrency(subscription.planPriceInCents)}/${INTERVAL_LABEL[subscription.intervalMonths] ?? "período"}` },
                { l: "Válido até", v: subscription.currentPeriodEnd ? fmtDate(subscription.currentPeriodEnd) : "—" },
                { l: "Assinante desde", v: fmtDate(subscription.subscribedAt) },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p className="text-[#526888] text-[11px] uppercase tracking-[0.8px] font-semibold mb-1">{l}</p>
                  <p className="text-[#dce8ff] text-[14px] font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              <Link href="/assine"
                className="inline-flex items-center gap-2 bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[13px] font-semibold h-[38px] px-5 rounded-[8px] transition-colors">
                Renovar / Upgrade →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[14px] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ff1f1f]/10 border border-[#ff1f1f]/20 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff1f1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <p className="font-['Barlow_Condensed'] font-bold text-white text-[22px] mb-2">Nenhuma assinatura ativa</p>
            <p className="text-[#7a9ab5] text-[14px] mb-6 max-w-[360px] mx-auto">
              Assine e acesse o maior acervo digital de revistas de armas do Brasil — mais de 200 edições.
            </p>
            <Link href="/assine"
              className="inline-flex items-center bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-8 rounded-[8px] transition-colors gap-2">
              Ver planos e assinar →
            </Link>
          </div>
        )}

        {/* Histórico de pagamentos */}
        {payments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[22px] leading-none">
                  Últimos Pagamentos
                </h2>
              </div>
              <Link href="/minha-conta/pagamentos"
                className="text-[#7a9ab5] hover:text-white text-[13px] font-medium transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] overflow-hidden divide-y divide-[#141d2c]">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5 gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[#d4d4da] text-[13px] font-medium truncate">{p.product_label ?? "—"}</p>
                    <p className="text-[#526888] text-[11px] mt-0.5">
                      {fmtDate(p.createdAt)} · {GATEWAY_LABEL[p.gateway] ?? p.gateway}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-white text-[14px] font-bold">{fmtCurrency(p.amount)}</p>
                    <span className={`text-[10px] font-bold px-2 py-[3px] rounded-full ${STATUS_STYLE[p.status] ?? STATUS_STYLE.CANCELLED}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Atalhos rápidos */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
            <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[22px] leading-none">
              Acesso rápido
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { href: "/edicoes", label: "Navegar Edições", desc: "Acesse o acervo completo", icon: "📚" },
              { href: "/minha-conta/perfil", label: "Editar Perfil", desc: "Dados pessoais e endereço", icon: "👤" },
              { href: "/minha-conta/favoritos", label: "Favoritos", desc: "Seus itens salvos", icon: "❤️" },
            ].map(({ href, label, desc, icon }) => (
              <Link key={href} href={href}
                className="bg-[#0e1520] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[10px] p-4 flex items-start gap-3 transition-all hover:shadow-md hover:shadow-black/20 group"
              >
                <span className="text-[24px]">{icon}</span>
                <div>
                  <p className="text-white text-[13px] font-semibold group-hover:text-white/90">{label}</p>
                  <p className="text-[#526888] text-[12px] mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
