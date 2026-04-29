import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Minha Assinatura — Minha Conta · Laúgo Arms Brasil",
};
export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
function fmtCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

const INTERVAL_LABEL: Record<number, string> = { 1: "mês", 3: "trimestre", 6: "semestre", 12: "ano" };

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  ACTIVE:   { label: "Ativa",     bg: "bg-[#22c55e]", text: "text-white" },
  PENDING:  { label: "Pendente",  bg: "bg-[#f59e0b]", text: "text-black" },
  CANCELED: { label: "Cancelada", bg: "bg-[#141d2c]", text: "text-[#526888]" },
  EXPIRED:  { label: "Expirada",  bg: "bg-[#141d2c]", text: "text-[#526888]" },
  PAST_DUE: { label: "Atrasada",  bg: "bg-[#f59e0b]", text: "text-black" },
};

interface Subscription {
  id: string;
  status: string;
  planPriceInCents: number;
  intervalMonths: number;
  currentPeriodEnd: string | null;
  currentPeriodStart: string | null;
  subscribedAt: string;
  subscription_plans: { name: string } | null;
}

export default async function MinhaAssinaturaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Busca usuário
  const userRes = await fetch(
    `${BASE}/users?authId=eq.${user.id}&select=id,name&limit=1`,
    { headers: HEADERS, cache: "no-store" }
  );
  const users  = await userRes.json();
  const dbUser = Array.isArray(users) ? users[0] : null;

  let subscription: Subscription | null = null;
  if (dbUser?.id) {
    const subRes = await fetch(
      `${BASE}/subscriptions?userId=eq.${dbUser.id}&select=id,status,planPriceInCents,intervalMonths,currentPeriodEnd,currentPeriodStart,subscribedAt,subscription_plans(name)&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const subs = await subRes.json();
    subscription = Array.isArray(subs) && subs.length > 0 ? subs[0] : null;
  }

  const isActive   = subscription?.status === "ACTIVE";
  const st         = subscription ? (STATUS_CONFIG[subscription.status] ?? STATUS_CONFIG.CANCELED) : null;
  const days       = subscription?.currentPeriodEnd ? daysLeft(subscription.currentPeriodEnd) : 0;

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-metal px-5 lg:px-10 pt-10 pb-8 border-b border-[#141d2c]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
          <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">Assinante</span>
        </div>
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[44px] lg:text-[52px] leading-[0.95] mb-2">
          Minha Assinatura
        </h1>
        <p className="text-[#7a9ab5] text-[15px]">
          {isActive
            ? `${subscription!.subscription_plans?.name ?? "Plano Laúgo"} — ${days} dia${days !== 1 ? "s" : ""} restante${days !== 1 ? "s" : ""}`
            : "Detalhes e gerenciamento da sua assinatura"}
        </p>
      </section>

    <div className="px-5 lg:px-10 py-8 max-w-[760px] flex flex-col gap-5">

      {subscription ? (
        <>
          {/* Status card */}
          <div className="bg-[#0e1520] border border-[#ff1f1f]/30 rounded-xl p-6 mb-5 relative overflow-hidden">
            <div className="absolute left-0 top-4 bottom-4 w-[4px] bg-[#ff1f1f] rounded-r" />
            <div className="pl-5">
              <div className="flex items-center gap-3 mb-5">
                <p className="text-white text-[18px] font-bold">
                  {(subscription.subscription_plans as { name: string } | null)?.name ?? "Plano Laúgo"}
                </p>
                {st && (
                  <span className={`text-[10px] font-bold px-2.5 py-[3px] rounded-full ${st.bg} ${st.text}`}>
                    {st.label.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <p className="text-white text-[11px] font-semibold tracking-[0.5px] mb-1">VALOR</p>
                  <p className="text-[#d4d4da] text-[18px] font-bold">
                    {fmtCurrency(subscription.planPriceInCents)}/{INTERVAL_LABEL[subscription.intervalMonths] ?? "período"}
                  </p>
                </div>
                <div>
                  <p className="text-white text-[11px] font-semibold tracking-[0.5px] mb-1">
                    {isActive ? "EXPIRA EM" : "EXPIROU EM"}
                  </p>
                  <p className="text-[#d4d4da] text-[16px] font-semibold">
                    {subscription.currentPeriodEnd ? fmtDate(subscription.currentPeriodEnd) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-white text-[11px] font-semibold tracking-[0.5px] mb-1">ASSINANTE DESDE</p>
                  <p className="text-[#d4d4da] text-[16px] font-semibold">{fmtDate(subscription.subscribedAt)}</p>
                </div>
                <div>
                  <p className="text-white text-[11px] font-semibold tracking-[0.5px] mb-1">
                    {isActive ? "DIAS RESTANTES" : "STATUS"}
                  </p>
                  <p className={`text-[16px] font-bold ${isActive && days <= 7 ? "text-[#f59e0b]" : "text-[#d4d4da]"}`}>
                    {isActive ? `${days} dia${days !== 1 ? "s" : ""}` : st?.label ?? "—"}
                  </p>
                </div>
              </div>

              {/* Alerta de vencimento próximo */}
              {isActive && days <= 7 && days > 0 && (
                <div className="bg-[#2a1e05] border border-[#f59e0b]/30 rounded-[8px] px-4 py-3 mb-4">
                  <p className="text-[#f59e0b] text-[13px] font-semibold">
                    ⚠ Sua assinatura vence em {days} dia{days !== 1 ? "s" : ""}. Renove para manter o acesso.
                  </p>
                </div>
              )}

              {/* Período atual */}
              {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
                <div className="bg-[#070a12] border border-[#141d2c] rounded-[8px] px-4 py-3 mb-5">
                  <p className="text-white text-[11px] font-semibold tracking-[0.5px] mb-1">PERÍODO ATUAL</p>
                  <p className="text-[#7a9ab5] text-[13px]">
                    {fmtDate(subscription.currentPeriodStart)} → {fmtDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-3">
            <Link href="/assine"
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[48px] flex items-center justify-center rounded-[8px] transition-colors">
              {isActive ? "Fazer upgrade / renovar plano →" : "Reativar assinatura →"}
            </Link>
            <Link href="/minha-conta/edicoes"
              className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] flex items-center justify-center rounded-[8px] transition-colors">
              Ver edições disponíveis
            </Link>
          </div>

          {/* Info cancelamento */}
          <div className="mt-8 p-5 bg-[#070a12] border border-[#141d2c] rounded-[10px]">
            <p className="text-[#526888] text-[13px] font-semibold mb-2">Sobre cancelamentos</p>
            <p className="text-white text-[12px] leading-[20px]">
              Você pode cancelar sua assinatura a qualquer momento. O acesso ao acervo permanece ativo
              até o final do período já pago. Para solicitar o cancelamento, entre em contato pelo e-mail{" "}
              <a href="mailto:publicidade@laugoarmsbrasil.com.br"
                className="text-[#526888] hover:text-white transition-colors underline">
                publicidade@laugoarmsbrasil.com.br
              </a>.
            </p>
          </div>
        </>
      ) : (
        /* Sem assinatura */
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-xl p-8 text-center">
          <p className="text-[40px] mb-4">📰</p>
          <p className="text-white text-[20px] font-bold mb-2">Nenhuma assinatura ativa</p>
          <p className="text-[#7a9ab5] text-[14px] leading-[22px] mb-6">
            Assine a Laúgo Arms Brasil e tenha acesso completo a mais de 200 edições do maior acervo
            sobre armamento civil do Brasil.
          </p>
          <Link href="/assine"
            className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[50px] px-8 inline-flex items-center justify-center rounded-[8px] transition-colors">
            Ver planos e assinar →
          </Link>
        </div>
      )}
    </div>
    </div>
  );
}
