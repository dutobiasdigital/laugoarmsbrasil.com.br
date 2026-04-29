import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

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
    const authorName = (body.authorName as string) || "Redação Laúgo";
    const featureImageUrl = (body.featureImageUrl as string) || null;
    const categoryId = body.categoryId as string;
    const isExclusive = body.isExclusive === "on" || body.isExclusive === true || body.isExclusive === "true";
    const status = (body.status as string) || "DRAFT";
    const publishedAt =
      body.publishedAt && status === "PUBLISHED"
        ? (body.publishedAt as string)
        : status === "PUBLISHED"
        ? new Date().toISOString()
        : null;

    const res = await fetch(`${BASE}/articles`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        authorName,
        featureImageUrl,
        categoryId,
        isExclusive,
        status,
        publishedAt,
      }),
    });
    if (!res.ok) throw new Error(await res.text());

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
    const authorName = (body.authorName as string) || "Redação Laúgo";
    const featureImageUrl = (body.featureImageUrl as string) || null;
    const featureImageAlt = (body.featureImageAlt as string) || null;
    const categoryId = body.categoryId as string;
    const isExclusive = body.isExclusive === "on" || body.isExclusive === true || body.isExclusive === "true";
    const status = (body.status as string) || "DRAFT";
    const publishedAt = body.publishedAt
      ? (body.publishedAt as string)
      : status === "PUBLISHED"
      ? new Date().toISOString()
      : null;
    const seoTitle       = (body.seoTitle as string) || null;
    const seoDescription = (body.seoDescription as string) || null;
    const seoKeywords    = (body.seoKeywords as string) || null;
    const canonicalUrl   = (body.canonicalUrl as string) || null;

    const res = await fetch(`${BASE}/articles?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        authorName,
        featureImageUrl,
        featureImageAlt,
        categoryId,
        isExclusive,
        status,
        publishedAt,
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl,
      }),
    });
    if (!res.ok) throw new Error(await res.text());

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

    const res = await fetch(`${BASE}/articles?id=eq.${id}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao excluir artigo." },
      { status: 500 }
    );
  }
}
