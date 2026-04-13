import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type AdPosition =
  | "HOME_TOP"
  | "HOME_SIDEBAR"
  | "ARTICLE_INLINE"
  | "ARTICLE_SIDEBAR"
  | "EDITIONS_TOP";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    await prisma.advertisement.create({
      data: {
        name: body.name as string,
        advertiser: body.advertiser as string,
        imageUrl: body.imageUrl as string,
        targetUrl: body.targetUrl as string,
        position: body.position as AdPosition,
        active: body.active === "on" || body.active === true || body.active === "true",
        startsAt: body.startsAt ? new Date(body.startsAt as string) : null,
        endsAt: body.endsAt ? new Date(body.endsAt as string) : null,
        maxImpressions: body.maxImpressions ? Number(body.maxImpressions) : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao criar anúncio." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id as string;

    await prisma.advertisement.update({
      where: { id },
      data: {
        name: body.name as string,
        advertiser: body.advertiser as string,
        imageUrl: body.imageUrl as string,
        targetUrl: body.targetUrl as string,
        position: body.position as AdPosition,
        active: body.active === "on" || body.active === true || body.active === "true",
        startsAt: body.startsAt ? new Date(body.startsAt as string) : null,
        endsAt: body.endsAt ? new Date(body.endsAt as string) : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao atualizar anúncio." },
      { status: 500 }
    );
  }
}
