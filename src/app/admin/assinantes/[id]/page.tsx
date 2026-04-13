import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import AssinanteClient from "./_AssinanteClient";

export const dynamic = "force-dynamic";

const PAYMENT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  APPROVED: { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "APROVADO" },
  PENDING: { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "PENDENTE" },
  REJECTED: { bg: "bg-[#2d0a0a]", text: "text-[#ff6b6b]", label: "REJEITADO" },
  REFUNDED: { bg: "bg-[#27272a]", text: "text-[#a1a1aa]", label: "REEMBOLSADO" },
  CANCELLED: { bg: "bg-[#27272a]", text: "text-[#52525b]", label: "CANCELADO" },
};

export default async function AssinantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, plans] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        subscription: {
          select: {
            id: true,
            status: true,
            planId: true,
            planPriceInCents: true,
            intervalMonths: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            subscribedAt: true,
            canceledAt: true,
            notes: true,
            plan: { select: { name: true } },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            amountInCents: true,
            status: true,
            paidAt: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { priceInCents: "asc" },
      select: { id: true, name: true, priceInCents: true, intervalMonths: true },
    }),
  ]);

  if (!user) notFound();

  const formatCurrency = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/assinantes" className="text-[#a1a1aa] hover:text-white text-[14px] transition-colors">
          ← Assinantes
        </Link>
        <span className="text-[#27272a]">/</span>
        <span className="text-[#d4d4da] text-[14px]">{user.name}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            {user.name}
          </h1>
          <p className="text-[#a1a1aa] text-[14px]">
            Cadastrado em {user.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
      <div className="bg-[#27272a] h-px mb-6" />

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
            }}
            subscription={
              user.subscription
                ? {
                    id: user.subscription.id,
                    status: user.subscription.status,
                    planId: user.subscription.planId,
                    planName: user.subscription.plan.name,
                    planPriceInCents: user.subscription.planPriceInCents,
                    intervalMonths: user.subscription.intervalMonths,
                    currentPeriodStart: user.subscription.currentPeriodStart.toISOString().split("T")[0],
                    currentPeriodEnd: user.subscription.currentPeriodEnd.toISOString().split("T")[0],
                    subscribedAt: user.subscription.subscribedAt.toLocaleDateString("pt-BR"),
                    canceledAt: user.subscription.canceledAt
                      ? user.subscription.canceledAt.toLocaleDateString("pt-BR")
                      : null,
                    notes: user.subscription.notes ?? "",
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
          <div className="bg-[#18181b] border border-[#27272a] rounded-[10px] overflow-hidden">
            <div className="bg-[#27272a] px-4 py-2.5">
              <p className="text-[#52525b] text-[11px] font-semibold tracking-[0.5px] uppercase">
                Últimos Pagamentos
              </p>
            </div>
            {user.payments.length === 0 ? (
              <p className="text-[#52525b] text-[13px] p-5 text-center">Nenhum pagamento.</p>
            ) : (
              user.payments.map((p, i) => {
                const st = PAYMENT_STYLE[p.status] ?? PAYMENT_STYLE.PENDING;
                return (
                  <div key={p.id}>
                    {i > 0 && <div className="bg-[#27272a] h-px" />}
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[#d4d4da] text-[13px] font-semibold">
                          {formatCurrency(p.amountInCents)}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-[#52525b] text-[11px]">
                        {p.paidAt
                          ? p.paidAt.toLocaleDateString("pt-BR")
                          : p.createdAt.toLocaleDateString("pt-BR")}
                        {p.paymentMethod ? ` · ${p.paymentMethod}` : ""}
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
