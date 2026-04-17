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
const H_READ   = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body   = await req.json();
    const p: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    const str = (k: string) => { if (body[k] !== undefined) p[k] = body[k] ? String(body[k]) : null; };
    str("title"); str("slug"); str("icon"); str("description"); str("shortCall");
    str("imageUrl"); str("imageAlt"); str("metaTitle"); str("metaDescription"); str("metaKeywords");
    str("segmentKey");
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

    /* ── 1. Fetch the category to get segmentKey ── */
    const catRes = await fetch(
      `${BASE}/guide_categories?id=eq.${id}&select=id,title,segmentKey`,
      { headers: H_READ, cache: "no-store" }
    );
    const cats = await catRes.json();
    const cat  = Array.isArray(cats) ? cats[0] : null;

    /* ── 2. If segmentKey is set, check for linked companies ── */
    if (cat?.segmentKey) {
      const compRes = await fetch(
        `${BASE}/companies?segment=eq.${encodeURIComponent(cat.segmentKey)}&select=id,tradeName,city,state,segment,logoUrl&order=tradeName.asc`,
        { headers: H_READ, cache: "no-store" }
      );
      const companies = await compRes.json();
      if (Array.isArray(companies) && companies.length > 0) {
        return NextResponse.json(
          {
            error:         "has_companies",
            message:       `Existem ${companies.length} empresa(s) vinculada(s) a esta categoria. Reatribua-as antes de excluir.`,
            companies,
            categoryTitle: cat.title,
            segmentKey:    cat.segmentKey,
          },
          { status: 409 }
        );
      }
    }

    /* ── 3. Safe to delete ── */
    const res = await fetch(`${BASE}/guide_categories?id=eq.${id}`, {
      method:  "DELETE",
      headers: H_READ,
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return NextResponse.json({ error: d?.message ?? "Erro ao excluir" }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
