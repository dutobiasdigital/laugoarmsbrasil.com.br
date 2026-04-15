import { NextRequest, NextResponse } from "next/server";
import { slugify } from "@/lib/guia";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  "Content-Type": "application/json",
  "apikey": SERVICE,
  "Authorization": `Bearer ${SERVICE}`,
  "Prefer": "return=representation",
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  const url = id
    ? `${BASE}/guide_listings?id=eq.${id}&limit=1`
    : `${BASE}/guide_listings?select=*&order=createdAt.desc`;
  const res  = await fetch(url, { headers: HEADERS, cache: "no-store" });
  const data = await res.json();
  if (id) return NextResponse.json(Array.isArray(data) && data.length > 0 ? data[0] : null);
  return NextResponse.json(Array.isArray(data) ? data : []);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const base = slugify(`${body.name}-${body.city}`);
    const slug = body.slug || `${base}-${Date.now().toString(36)}`;
    const payload = { ...body, slug };
    const res = await fetch(`${BASE}/guide_listings`, {
      method: "POST", headers: HEADERS, body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message ?? "Erro ao criar." }, { status: 500 });
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;
    const res = await fetch(`${BASE}/guide_listings?id=eq.${id}`, {
      method: "PATCH", headers: HEADERS,
      body: JSON.stringify({ ...rest, updatedAt: new Date().toISOString() }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message ?? "Erro ao atualizar." }, { status: 500 });
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const res = await fetch(`${BASE}/guide_listings?id=eq.${id}`, {
      method: "DELETE", headers: { ...HEADERS, "Prefer": "return=minimal" },
    });
    if (!res.ok) return NextResponse.json({ error: "Erro ao excluir." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
