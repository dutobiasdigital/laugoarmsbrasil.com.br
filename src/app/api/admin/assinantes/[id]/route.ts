import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await prisma.user.findUnique({
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
    });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: body.name || undefined,
        phone: body.phone || null,
        role: body.role || undefined,
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
