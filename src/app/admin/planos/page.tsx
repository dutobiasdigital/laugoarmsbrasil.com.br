import prisma from "@/lib/prisma";
import PlanosClient from "./_PlanosClient";

export const dynamic = "force-dynamic";

export default async function AdminPlanosPage() {
  let plans: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    priceInCents: number;
    intervalMonths: number;
    active: boolean;
    _count?: { subscriptions: number };
  }[] = [];

  try {
    plans = await prisma.subscriptionPlan.findMany({
      orderBy: { intervalMonths: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        priceInCents: true,
        intervalMonths: true,
        active: true,
        _count: { select: { subscriptions: true } },
      },
    });
  } catch {
    // DB unavailable
  }

  const serialized = plans.map((p) => ({
    ...p,
    subscriberCount: p._count?.subscriptions ?? 0,
  }));

  return (
    <>
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Planos
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">
        Gerencie os planos de assinatura disponíveis.
      </p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <PlanosClient plans={serialized} />
    </>
  );
}
