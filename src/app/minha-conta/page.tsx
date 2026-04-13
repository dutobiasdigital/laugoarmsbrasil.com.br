import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let profile: {
    name: string; email: string;
    subscription: { status: string; plan: { name: string }; planPriceInCents: number; intervalMonths: number; currentPeriodEnd: Date | null; subscribedAt: Date } | null;
    payments: { id: string; amountInCents: number; createdAt: Date; paymentMethod: string | null; status: string }[];
  } | null = null;

  let recentEditions: { id: string; title: string; number: number | null; slug: string; coverImageUrl: string | null; type: string }[] = [];

  try {
    const raw = await prisma.user.findUnique({
      where: { authId: user.id },
      include: {
        subscription: { include: { plan: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 4 },
      },
    });
    if (!raw) redirect("/auth/login");
    profile = {
      name: raw.name,
      email: raw.email,
      subscription: raw.subscription
        ? {
            status: raw.subscription.status,
            plan: { name: raw.subscription.plan.name },
            planPriceInCents: raw.subscription.planPriceInCents,
            intervalMonths: raw.subscription.intervalMonths,
            currentPeriodEnd: raw.subscription.currentPeriodEnd,
            subscribedAt: raw.subscription.subscribedAt,
          }
        : null,
      payments: raw.payments.map((p) => ({
        id: p.id,
        amountInCents: p.amountInCents,
        createdAt: p.createdAt,
        paymentMethod: p.paymentMethod,
        status: p.status,
      })),
    };

    recentEditions = await prisma.edition.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: { id: true, title: true, number: true, slug: true, coverImageUrl: true, type: true },
    });
  } catch {
    redirect("/auth/login");
  }

  if (!profile) redirect("/auth/login");

  const sub = profile.subscription;
  const isActive = sub?.status === "ACTIVE";
  const firstName = profile.name.split(" ")[0];

  const STATS = [
    { value: "207", label: "Edições disponíveis", color: "text-[#ff1f1f]" },
    { value: sub ? String(new Date().getFullYear() - sub.subscribedAt.getFullYear()) : "0", label: "Anos assinante", color: "text-[#22c55e]" },
    { value: "48", label: "Artigos lidos", color: "text-white" },
    { value: sub?.currentPeriodEnd ? String(Math.max(0, Math.ceil((sub.currentPeriodEnd.getTime() - Date.now()) / 86400000))) : "0", label: "Dias restantes", color: "text-[#d4d4da]" },
  ];

  return (
    <div className="max-w-[1160px] py-7">
      {/* Page title */}
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-1">
        Dashboard
      </h1>
      <p className="text-[#a1a1aa] text-[16px] mb-8">Bem-vindo de volta, {firstName}!</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-[#18181b] border border-[#27272a] rounded-[10px] p-5">
            <p className={`font-['Barlow_Condensed'] font-bold text-[40px] leading-none ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-[#a1a1aa] text-[13px] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Subscription card */}
      <div className="bg-[#18181b] border border-[#ff1f1f] rounded-xl p-5 lg:p-7 mb-8 relative overflow-hidden">
        <div className="absolute left-0 top-5 bottom-5 w-[4px] bg-[#ff1f1f] rounded-r" />
        <div className="pl-5 flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <p className="text-white text-[16px] font-semibold">Minha Assinatura</p>
              <span className={`text-[10px] font-bold px-2.5 py-[3px] rounded-full ${
                isActive ? "bg-[#22c55e] text-white" : "bg-[#27272a] text-[#52525b]"
              }`}>
                {isActive ? "ATIVA" : sub?.status ?? "SEM PLANO"}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-[#52525b] text-[12px] mb-1">Plano</p>
                <p className="text-[#d4d4da] text-[15px] font-semibold">{sub?.plan.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-[#52525b] text-[12px] mb-1">Valor</p>
                <p className="text-[#d4d4da] text-[15px] font-semibold">
                  {sub ? `${formatCurrency(sub.planPriceInCents)}/${sub.intervalMonths === 6 ? "semestre" : sub.intervalMonths === 12 ? "ano" : "trimestre"}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[#52525b] text-[12px] mb-1">Próxima cobrança</p>
                <p className="text-[#d4d4da] text-[15px] font-semibold">
                  {sub?.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "—"}
                </p>
              </div>
              <div>
                <p className="text-[#52525b] text-[12px] mb-1">Assinante desde</p>
                <p className="text-[#d4d4da] text-[15px] font-semibold">
                  {sub ? formatDate(sub.subscribedAt) : "—"}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/minha-conta/assinatura"
            className="bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 text-[#d4d4da] hover:text-white text-[13px] h-[40px] px-5 flex items-center justify-center rounded-[6px] transition-colors whitespace-nowrap shrink-0"
          >
            Gerenciar →
          </Link>
        </div>
      </div>

      {/* Recent editions */}
      <div className="mb-8">
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[28px] leading-none mb-1">
          Edições recentes
        </h2>
        <p className="text-[#a1a1aa] text-[14px] mb-5">Acesse rapidamente as últimas edições</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {recentEditions.map((ed) => (
            <Link
              key={ed.id}
              href={isActive ? `/edicoes/${ed.slug}` : "/assine"}
              className="bg-[#18181b] border border-[#27272a] rounded-[8px] overflow-hidden hover:border-zinc-600 transition-colors"
            >
              <div className="h-[148px] bg-[#27272a] flex items-center justify-center">
                {ed.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ed.coverImageUrl} alt={ed.title} className="w-full h-full object-cover" />
                ) : (
                  <p className="font-['Barlow_Condensed'] font-bold text-[#3f3f46] text-[16px]">
                    {ed.number ? `Nº ${ed.number}` : "—"}
                  </p>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-[#d4d4da] text-[13px] font-semibold leading-snug mb-1">
                  {ed.number ? `Edição ${ed.number}` : ed.title}
                </p>
                <p className="text-[#ff1f1f] text-[12px]">Ler →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Payment history */}
      {profile.payments.length > 0 && (
        <div>
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[28px] leading-none mb-5">
            Histórico de pagamentos
          </h2>
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#27272a] px-5 py-3 grid grid-cols-5 gap-4">
              {["Data", "Plano", "Valor", "Método", "Status"].map((h) => (
                <p key={h} className="text-[#52525b] text-[12px] font-semibold tracking-[0.5px]">{h}</p>
              ))}
            </div>
            {/* Rows */}
            {profile.payments.map((payment, i) => (
              <div key={payment.id}>
                {i > 0 && <div className="bg-[#27272a] h-px" />}
                <div className="px-5 py-4 grid grid-cols-5 gap-4 items-center">
                  <p className="text-[#d4d4da] text-[14px]">
                    {payment.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-[#d4d4da] text-[14px]">{sub?.plan.name ?? "—"}</p>
                  <p className="text-white text-[14px]">{formatCurrency(payment.amountInCents)}</p>
                  <p className="text-[#d4d4da] text-[14px]">{payment.paymentMethod ?? "—"}</p>
                  <span className={`inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-semibold ${
                    payment.status === "APPROVED"
                      ? "bg-[#144729] text-[#22c55e]"
                      : payment.status === "PENDING"
                      ? "bg-[#382405] text-[#ef9f1b]"
                      : "bg-[#27272a] text-[#52525b]"
                  }`}>
                    {payment.status === "APPROVED" ? "Aprovado" : payment.status === "PENDING" ? "Pendente" : "Recusado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!sub && (
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-8 text-center">
          <p className="text-[#a1a1aa] text-[15px] mb-4">Você ainda não tem uma assinatura ativa.</p>
          <Link
            href="/assine"
            className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-6 inline-flex items-center rounded-[6px] transition-colors"
          >
            Assinar agora →
          </Link>
        </div>
      )}
    </div>
  );
}
