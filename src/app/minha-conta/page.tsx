import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativa", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  PENDING: { label: "Pendente", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  PAST_DUE: { label: "Em atraso", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  CANCELED: { label: "Cancelada", color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" },
  EXPIRED: { label: "Expirada", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [profile, recentEditions] = await Promise.all([
    prisma.user.findUnique({
      where: { authId: user.id },
      include: {
        subscription: { include: { plan: true } },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    }),
    prisma.edition.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
      select: { id: true, title: true, number: true, coverImageUrl: true, slug: true, publishedAt: true, type: true },
    }),
  ]);

  if (!profile) redirect("/auth/login");

  const sub = profile.subscription;
  const subStatus = sub ? STATUS_LABEL[sub.status] ?? STATUS_LABEL.EXPIRED : null;
  const isActive = sub?.status === "ACTIVE";

  return (
    <div className="pt-14 lg:pt-0 pb-20 lg:pb-0 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Olá, {profile.name.split(" ")[0]}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Bem-vindo à sua área de assinante
        </p>
      </div>

      {/* Subscription card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Assinatura</p>
            {sub ? (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-semibold text-white">{sub.plan.name}</h2>
                  {subStatus && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${subStatus.color}`}>
                      {subStatus.label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400">
                  {formatCurrency(sub.planPriceInCents)} /{" "}
                  {sub.intervalMonths === 1 ? "mês" : `${sub.intervalMonths} meses`}
                </p>
                {isActive && sub.currentPeriodEnd && (
                  <p className="text-xs text-zinc-500 mt-2">
                    Renova em {formatDate(sub.currentPeriodEnd)}
                  </p>
                )}
                {!isActive && sub.status === "CANCELED" && sub.currentPeriodEnd && (
                  <p className="text-xs text-zinc-500 mt-2">
                    Acesso até {formatDate(sub.currentPeriodEnd)}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-white font-medium mb-1">Sem assinatura ativa</p>
                <p className="text-sm text-zinc-400">Assine para acessar o acervo completo</p>
              </>
            )}
          </div>
          {!isActive && (
            <Link
              href="/assine"
              className="inline-flex items-center gap-2 bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-sm font-semibold px-4 py-2.5 rounded transition-colors whitespace-nowrap"
            >
              {sub ? "Reativar" : "Assinar agora"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Edições disponíveis", value: recentEditions.length > 0 ? recentEditions.length.toString() + "+" : "0", active: isActive },
          { label: "Pagamentos realizados", value: profile.payments.length.toString(), active: true },
          { label: "Membro desde", value: profile.subscription ? formatDate(profile.subscription.subscribedAt).split(" de ").slice(1).join("/") : "—", active: true },
          { label: "Status", value: subStatus?.label ?? "Sem plano", active: isActive },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
            <p className={`text-lg font-semibold ${stat.active ? "text-white" : "text-zinc-400"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent editions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-widest">
            Edições recentes
          </h3>
          <Link href="/minha-conta/edicoes" className="text-xs text-zinc-500 hover:text-[#ff1f1f] transition-colors">
            Ver todas →
          </Link>
        </div>

        {recentEditions.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-500 text-sm">Nenhuma edição publicada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentEditions.map((edition) => (
              <Link
                key={edition.id}
                href={isActive ? `/minha-conta/edicoes/${edition.slug}` : "/assine"}
                className="group block"
              >
                <div className="aspect-[3/4] bg-zinc-800 rounded overflow-hidden mb-2 relative">
                  {edition.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={edition.coverImageUrl}
                      alt={edition.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                      <div className="text-[10px] font-bold tracking-widest text-zinc-500 mb-1">
                        REVISTA MAGNUM
                      </div>
                      {edition.number && (
                        <div className="text-2xl font-bold text-zinc-600">
                          #{edition.number}
                        </div>
                      )}
                    </div>
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-zinc-950/70 flex items-center justify-center">
                      <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-zinc-300 line-clamp-2 leading-relaxed">
                  {edition.number ? `Nº ${edition.number} — ` : ""}{edition.title}
                </p>
                {edition.publishedAt && (
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {edition.publishedAt.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent payments */}
      {profile.payments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest">
              Últimos pagamentos
            </h3>
            <Link href="/minha-conta/pagamentos" className="text-xs text-zinc-500 hover:text-[#ff1f1f] transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
            {profile.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-white">{formatCurrency(payment.amountInCents)}</p>
                  <p className="text-xs text-zinc-500">
                    {payment.createdAt.toLocaleDateString("pt-BR")}
                    {payment.paymentMethod && ` · ${payment.paymentMethod}`}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded border ${
                    payment.status === "APPROVED"
                      ? "text-green-400 bg-green-400/10 border-green-400/20"
                      : payment.status === "PENDING"
                      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                      : "text-red-400 bg-red-400/10 border-red-400/20"
                  }`}
                >
                  {payment.status === "APPROVED" ? "Aprovado" : payment.status === "PENDING" ? "Pendente" : "Recusado"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
