import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    const res = await fetch(
      `${BASE}/article_categories?select=id,name,slug,description,sortOrder,isActive&order=sortOrder.asc,name.asc`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 });
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name        = (body.name as string)?.trim();
    const slug        = ((body.slug as string)?.trim()) || toSlug(name);
    const description = (body.description as string) || null;
    const sortOrder   = Number(body.sortOrder ?? 0);
    const isActive    = body.isActive !== false;

    if (!name) return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });

    const res = await fetch(`${BASE}/article_categories`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({ name, slug, description, sortOrder, isActive }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id          = body.id as string;
    const name        = (body.name as string)?.trim();
    const slug        = ((body.slug as string)?.trim()) || toSlug(name);
    const description = (body.description as string) || null;
    const sortOrder   = Number(body.sortOrder ?? 0);
    const isActive    = body.isActive !== false;

    if (!id)   return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });

    const res = await fetch(`${BASE}/article_categories?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({ name, slug, description, sortOrder, isActive }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id as string;
    if (!id) return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });

    const res = await fetch(`${BASE}/article_categories?id=eq.${id}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
