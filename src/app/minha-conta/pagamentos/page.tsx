import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Pagamentos — Minha Conta · Revista Magnum",
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  APPROVED: { label: "Aprovado", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  PENDING: { label: "Pendente", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  REJECTED: { label: "Recusado", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  REFUNDED: { label: "Estornado", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  CANCELLED: { label: "Cancelado", color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" },
};

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PagamentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await prisma.user.findUnique({
    where: { authId: user.id },
    select: {
      id: true,
      payments: {
        orderBy: { createdAt: "desc" },
        include: {
          subscription: { select: { plan: { select: { name: true } } } },
        },
      },
      subscription: {
        select: {
          status: true,
          planPriceInCents: true,
          intervalMonths: true,
          currentPeriodEnd: true,
          plan: { select: { name: true } },
        },
      },
    },
  });

  if (!profile) redirect("/auth/login");

  const totalPaid = profile.payments
    .filter((p) => p.status === "APPROVED")
    .reduce((acc, p) => acc + p.amountInCents, 0);

  return (
    <div className="pt-14 lg:pt-0 pb-20 lg:pb-0 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Pagamentos</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Histórico completo das suas transações
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 mb-1">Total pago</p>
          <p className="text-xl font-semibold text-white">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 mb-1">Transações</p>
          <p className="text-xl font-semibold text-white">{profile.payments.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 mb-1">Plano atual</p>
          <p className="text-xl font-semibold text-white">
            {profile.subscription?.plan.name ?? "—"}
          </p>
        </div>
      </div>

      {/* Table */}
      {profile.payments.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <svg className="w-10 h-10 text-zinc-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-zinc-500 text-sm">Nenhuma transação registrada ainda.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          {/* Desktop table */}
          <table className="w-full hidden sm:table">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-4 py-3">
                  Data
                </th>
                <th className="text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-4 py-3">
                  Plano
                </th>
                <th className="text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-4 py-3">
                  Método
                </th>
                <th className="text-right text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-4 py-3">
                  Valor
                </th>
                <th className="text-right text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {profile.payments.map((payment) => {
                const status = PAYMENT_STATUS[payment.status] ?? PAYMENT_STATUS.CANCELLED;
                return (
                  <tr key={payment.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3.5 text-sm text-zinc-300">
                      {payment.createdAt.toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-400">
                      {payment.subscription.plan.name}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-400">
                      {payment.paymentMethod
                        ? `${payment.paymentMethod}${payment.lastFourDigits ? ` ···· ${payment.lastFourDigits}` : ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-white text-right font-medium">
                      {formatCurrency(payment.amountInCents)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded border ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile list */}
          <div className="sm:hidden divide-y divide-zinc-800">
            {profile.payments.map((payment) => {
              const status = PAYMENT_STATUS[payment.status] ?? PAYMENT_STATUS.CANCELLED;
              return (
                <div key={payment.id} className="px-4 py-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {formatCurrency(payment.amountInCents)}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {payment.createdAt.toLocaleDateString("pt-BR")}
                      {payment.paymentMethod && ` · ${payment.paymentMethod}`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
