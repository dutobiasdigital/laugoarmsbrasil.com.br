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
    const excerpt = (body.excerpt as string) || null;
    const content = (body.content as string) || "";
    const authorName = (body.authorName as string) || "Redação Magnum";
    const featureImageUrl = (body.featureImageUrl as string) || null;
    const categoryId = body.categoryId as string;
    const isExclusive = body.isExclusive === "on" || body.isExclusive === true || body.isExclusive === "true";
    const status = (body.status as string) || "DRAFT";
    const publishedAt =
      body.publishedAt && status === "PUBLISHED"
        ? new Date(body.publishedAt as string)
        : status === "PUBLISHED"
        ? new Date()
        : null;

    await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        authorName,
        featureImageUrl,
        categoryId,
        isExclusive,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        publishedAt,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao criar artigo." },
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
    const excerpt = (body.excerpt as string) || null;
    const content = (body.content as string) || "";
    const authorName = (body.authorName as string) || "Redação Magnum";
    const featureImageUrl = (body.featureImageUrl as string) || null;
    const categoryId = body.categoryId as string;
    const isExclusive = body.isExclusive === "on" || body.isExclusive === true || body.isExclusive === "true";
    const status = (body.status as string) || "DRAFT";
    const publishedAt = body.publishedAt
      ? new Date(body.publishedAt as string)
      : status === "PUBLISHED"
      ? new Date()
      : null;

    await prisma.article.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        authorName,
        featureImageUrl,
        categoryId,
        isExclusive,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        publishedAt,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao atualizar artigo." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id as string;

    await prisma.article.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao excluir artigo." },
      { status: 500 }
    );
  }
}
