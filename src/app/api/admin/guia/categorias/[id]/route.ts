import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  "Content-Type":  "application/json",
  apikey:          SERVICE,
  Authorization:   `Bearer ${SERVICE}`,
  Prefer:          "return=representation",
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body   = await req.json();
    const p: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    const str = (k: string) => { if (body[k] !== undefined) p[k] = body[k] ? String(body[k]) : null; };
    str("title"); str("slug"); str("icon"); str("description"); str("shortCall");
    str("imageUrl"); str("imageAlt"); str("metaTitle"); str("metaDescription"); str("metaKeywords");
    if (body.isActive   !== undefined) p.isActive   = body.isActive !== false;
    if (body.sortOrder  !== undefined) p.sortOrder  = parseInt(String(body.sortOrder), 10);

    const res  = await fetch(`${BASE}/guide_categories?id=eq.${id}`, { method: "PATCH", headers: HEADERS, body: JSON.stringify(p) });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data?.message ?? "Erro ao atualizar" }, { status: res.status });
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(`${BASE}/guide_categories?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
    });
    if (!res.ok) { const d = await res.json(); return NextResponse.json({ error: d?.message ?? "Erro" }, { status: res.status }); }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
