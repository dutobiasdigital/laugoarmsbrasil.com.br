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
    const p: Record<string, unknown> = {};
    if (body.name           !== undefined) p.name           = String(body.name);
    if (body.slug           !== undefined) p.slug           = String(body.slug);
    if (body.description    !== undefined) p.description    = body.description ? String(body.description) : null;
    if (body.listingType    !== undefined) p.listingType    = String(body.listingType);
    if (body.priceInCents   !== undefined) p.priceInCents   = parseInt(String(body.priceInCents).replace(/\D/g, ""), 10);
    if (body.intervalMonths !== undefined) p.intervalMonths = parseInt(String(body.intervalMonths), 10);
    if (body.features       !== undefined) p.features       = body.features ? String(body.features) : null;
    if (body.active         !== undefined) p.active         = body.active === true || body.active === "true";
    if (body.sortOrder      !== undefined) p.sortOrder      = parseInt(String(body.sortOrder), 10);

    const res  = await fetch(`${BASE}/guide_plans?id=eq.${id}`, { method: "PATCH", headers: HEADERS, body: JSON.stringify(p) });
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
    const res = await fetch(`${BASE}/guide_plans?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
    });
    if (!res.ok) { const d = await res.json(); return NextResponse.json({ error: d?.message ?? "Erro ao excluir" }, { status: res.status }); }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
