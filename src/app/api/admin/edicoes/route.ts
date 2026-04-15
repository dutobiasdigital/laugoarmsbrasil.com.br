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
    const number = body.number ? Number(body.number) : null;
    const type = (body.type as string) || "REGULAR";
    const editorial = (body.editorial as string) || null;
    const tableOfContents = (body.tableOfContents as string) || null;
    const pageCount = body.pageCount ? Number(body.pageCount) : null;
    const coverImageUrl = (body.coverImageUrl as string) || null;
    const pdfStoragePath = (body.pdfStoragePath as string) || null;
    const pageFlipUrl = (body.pageFlipUrl as string) || null;
    const isPublished = body.isPublished === "on" || body.isPublished === true || body.isPublished === "true";
    const publishedAt = body.publishedAt ? (body.publishedAt as string) : null;

    const res = await fetch(`${BASE}/editions`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        title,
        slug,
        number,
        type,
        editorial,
        tableOfContents,
        pageCount,
        coverImageUrl,
        pdfStoragePath,
        pageFlipUrl,
        isPublished,
        publishedAt,
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
    const publishedAt = body.publishedAt ? (body.publishedAt as string) : null;

    const res = await fetch(`${BASE}/editions?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        title,
        slug,
        number,
        type,
        editorial,
        tableOfContents,
        pageCount,
        coverImageUrl,
        pdfStoragePath,
        pageFlipUrl,
        isPublished,
        publishedAt,
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
