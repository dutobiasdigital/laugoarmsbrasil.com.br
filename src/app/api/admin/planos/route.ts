import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        priceInCents: parseInt(body.priceInCents, 10),
        intervalMonths: parseInt(body.intervalMonths, 10),
        active: body.active === true || body.active === "true",
      },
    });
    return NextResponse.json(plan);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
