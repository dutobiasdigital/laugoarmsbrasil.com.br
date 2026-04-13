import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = body.title as string;
    const slug = (body.slug as string) || toSlug(title);
    const number = body.number ? Number(body.number) : null;
    const type = (body.type as string) || "REGULAR";
    const editorial = (body.editorial as string) || null;
    const tableOfContents = (body.tableOfContents as string) || null;
    const pageCount = body.pageCount ? Number(body.pageCount) : null;
    const coverImageUrl = (body.coverImageUrl as string) || null;
    const pdfStoragePath = (body.pdfStoragePath as string) || null;
    const pageFlipUrl = (body.pageFlipUrl as string) || null;
    const isPublished = body.isPublished === "on" || body.isPublished === true || body.isPublished === "true";
    const publishedAt = body.publishedAt ? new Date(body.publishedAt as string) : null;

    await prisma.edition.create({
      data: {
        title,
        slug,
        number,
        type: type as "REGULAR" | "SPECIAL",
        editorial,
        tableOfContents,
        pageCount,
        coverImageUrl,
        pdfStoragePath,
        pageFlipUrl,
        isPublished,
        publishedAt,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao criar edição." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id as string;
    const title = body.title as string;
    const slug = body.slug as string;
    const number = body.number ? Number(body.number) : null;
    const type = (body.type as string) || "REGULAR";
    const editorial = (body.editorial as string) || null;
    const tableOfContents = (body.tableOfContents as string) || null;
    const pageCount = body.pageCount ? Number(body.pageCount) : null;
    const coverImageUrl = (body.coverImageUrl as string) || null;
    const pdfStoragePath = (body.pdfStoragePath as string) || null;
    const pageFlipUrl = (body.pageFlipUrl as string) || null;
    const isPublished = body.isPublished === "on" || body.isPublished === true || body.isPublished === "true";
    const publishedAt = body.publishedAt ? new Date(body.publishedAt as string) : null;

    await prisma.edition.update({
      where: { id },
      data: {
        title,
        slug,
        number,
        type: type as "REGULAR" | "SPECIAL",
        editorial,
        tableOfContents,
        pageCount,
        coverImageUrl,
        pdfStoragePath,
        pageFlipUrl,
        isPublished,
        publishedAt,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao atualizar edição." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id as string;

    await prisma.edition.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao excluir edição." },
      { status: 500 }
    );
  }
}
