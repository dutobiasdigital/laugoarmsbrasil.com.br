import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Create or update subscription for a user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  try {
    const body = await req.json();
    const { planId, status, currentPeriodStart, currentPeriodEnd, notes } = body;

    if (!planId || !status || !currentPeriodStart || !currentPeriodEnd) {
      return NextResponse.json({ error: "Campos obrigatórios: planId, status, currentPeriodStart, currentPeriodEnd" }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    const existing = await prisma.subscription.findUnique({ where: { userId } });

    const subData = {
      planId,
      status,
      planPriceInCents: plan.priceInCents,
      intervalMonths: plan.intervalMonths,
      currentPeriodStart: new Date(currentPeriodStart),
      currentPeriodEnd: new Date(currentPeriodEnd),
      notes: notes || null,
      canceledAt: status === "CANCELED" ? new Date() : null,
    };

    let subscription;
    if (existing) {
      subscription = await prisma.subscription.update({
        where: { userId },
        data: subData,
      });
    } else {
      subscription = await prisma.subscription.create({
        data: { userId, mpSubscriptionId: null, ...subData },
      });
    }

    return NextResponse.json(subscription);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
