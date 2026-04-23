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

function parseBool(v: unknown) {
  return v === "on" || v === true || v === "true";
}

function str(v: unknown): string | null {
  const s = (v as string) ?? "";
  return s.trim() !== "" ? s.trim() : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title            = body.title as string;
    const slug             = (body.slug as string) || toSlug(title);
    const number           = body.number ? Number(body.number) : null;
    const type             = (body.type as string) || "REGULAR";
    const summary          = str(body.summary);
    const editorial        = str(body.editorial);
    const tableOfContents  = str(body.tableOfContents);
    const pageCount        = body.pageCount ? Number(body.pageCount) : null;
    const coverImageUrl    = str(body.coverImageUrl);
    const pdfStoragePath   = str(body.pdfStoragePath);
    const pageFlipUrl      = str(body.pageFlipUrl);
    const isPublished      = parseBool(body.isPublished);
    const isOnNewstand     = parseBool(body.isOnNewstand);
    const isFeatured       = parseBool(body.isFeatured);
    const publishedAt      = body.publishedAt ? (body.publishedAt as string) : null;
    const seoTitle         = str(body.seoTitle);
    const seoDescription   = str(body.seoDescription);
    const seoKeywords      = str(body.seoKeywords);
    const canonicalUrl     = str(body.canonicalUrl);
    const teaser           = str(body.teaser);
    const videoUrl         = str(body.videoUrl);
    const galleryImages    = str(body.galleryImages) ?? "[]";

    if (isOnNewstand) {
      await fetch(`${BASE}/editions?isOnNewstand=eq.true`, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({ isOnNewstand: false }),
      });
    }

    const res = await fetch(`${BASE}/editions`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        title, slug, number, type, summary, editorial, tableOfContents, pageCount,
        coverImageUrl, pdfStoragePath, pageFlipUrl, isPublished, isOnNewstand, isFeatured,
        publishedAt, seoTitle, seoDescription, seoKeywords, canonicalUrl,
        teaser, video_url: videoUrl, gallery_images: galleryImages,
      }),
    });
    if (!res.ok) throw new Error(await res.text());

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
    const id               = body.id as string;
    const title            = body.title as string;
    const slug             = body.slug as string;
    const number           = body.number ? Number(body.number) : null;
    const type             = (body.type as string) || "REGULAR";
    const summary          = str(body.summary);
    const editorial        = str(body.editorial);
    const tableOfContents  = str(body.tableOfContents);
    const pageCount        = body.pageCount ? Number(body.pageCount) : null;
    const coverImageUrl    = str(body.coverImageUrl);
    const pdfStoragePath   = str(body.pdfStoragePath);
    const pageFlipUrl      = str(body.pageFlipUrl);
    const isPublished      = parseBool(body.isPublished);
    const isOnNewstand     = parseBool(body.isOnNewstand);
    const isFeatured       = parseBool(body.isFeatured);
    const publishedAt      = body.publishedAt ? (body.publishedAt as string) : null;
    const seoTitle         = str(body.seoTitle);
    const seoDescription   = str(body.seoDescription);
    const seoKeywords      = str(body.seoKeywords);
    const canonicalUrl     = str(body.canonicalUrl);
    const teaser           = str(body.teaser);
    const videoUrl         = str(body.videoUrl);
    const galleryImages    = str(body.galleryImages) ?? "[]";

    if (isOnNewstand) {
      await fetch(`${BASE}/editions?isOnNewstand=eq.true&id=neq.${id}`, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({ isOnNewstand: false }),
      });
    }

    const res = await fetch(`${BASE}/editions?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        title, slug, number, type, summary, editorial, tableOfContents, pageCount,
        coverImageUrl, pdfStoragePath, pageFlipUrl, isPublished, isOnNewstand, isFeatured,
        publishedAt, seoTitle, seoDescription, seoKeywords, canonicalUrl,
        teaser, video_url: videoUrl, gallery_images: galleryImages,
      }),
    });
    if (!res.ok) throw new Error(await res.text());

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

    const res = await fetch(`${BASE}/editions?id=eq.${id}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao excluir edição." },
      { status: 500 }
    );
  }
}
