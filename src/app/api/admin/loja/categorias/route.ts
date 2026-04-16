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
    const body        = await req.json();
    const title       = (body.title as string)?.trim();
    const slug        = ((body.slug as string) || toSlug(title)).trim();
    const description = (body.description as string) || null;
    const isActive    = body.isActive === true || body.isActive === "true";
    const sortOrder   = Number(body.sortOrder ?? 0);

    if (!title) return NextResponse.json({ error: "Título obrigatório." }, { status: 400 });

    const metaTitle       = (body.metaTitle as string) || null;
    const metaDescription = (body.metaDescription as string) || null;
    const metaKeywords    = (body.metaKeywords as string) || null;

    const res = await fetch(`${BASE}/shop_categories`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({ title, slug, description, isActive, sortOrder, metaTitle, metaDescription, metaKeywords }),
    });
    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    return NextResponse.json({ success: true, id: data[0]?.id });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao criar categoria." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body        = await req.json();
    const id          = body.id as string;
    const title       = (body.title as string)?.trim();
    const slug        = (body.slug as string)?.trim();
    const description = (body.description as string) || null;
    const isActive    = body.isActive === true || body.isActive === "true";
    const sortOrder   = Number(body.sortOrder ?? 0);

    if (!id)    return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Título obrigatório." }, { status: 400 });

    const metaTitle       = (body.metaTitle as string) || null;
    const metaDescription = (body.metaDescription as string) || null;
    const metaKeywords    = (body.metaKeywords as string) || null;

    const res = await fetch(`${BASE}/shop_categories?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({ title, slug, description, isActive, sortOrder, metaTitle, metaDescription, metaKeywords }),
    });
    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao atualizar categoria." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const id   = body.id as string;
    if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

    // Check if any products reference this category
    const checkRes = await fetch(
      `${BASE}/shop_products?categoryId=eq.${id}&select=id&limit=1`,
      { headers: { ...HEADERS, Prefer: "count=exact" }, cache: "no-store" }
    );
    const countStr = checkRes.headers.get("content-range")?.split("/")[1] ?? "0";
    if (parseInt(countStr, 10) > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir: existem produtos nessa categoria." },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE}/shop_categories?id=eq.${id}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao excluir categoria." },
      { status: 500 }
    );
  }
}
