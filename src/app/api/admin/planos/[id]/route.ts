import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  "Content-Type":  "application/json",
  "apikey":        SERVICE,
  "Authorization": `Bearer ${SERVICE}`,
  "Prefer":        "return=representation",
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body   = await req.json();

    const payload: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (body.name           !== undefined) payload.name           = String(body.name);
    if (body.slug           !== undefined) payload.slug           = String(body.slug);
    if (body.description    !== undefined) payload.description    = body.description ? String(body.description) : null;
    if (body.priceInCents   !== undefined) payload.priceInCents   = parseInt(String(body.priceInCents).replace(/\D/g, ""), 10);
    if (body.intervalMonths !== undefined) payload.intervalMonths = parseInt(String(body.intervalMonths), 10);
    if (body.active         !== undefined) payload.active         = body.active === true || body.active === "true";

    const res = await fetch(`${BASE}/subscription_plans?id=eq.${id}`, {
      method:  "PATCH",
      headers: HEADERS,
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data?.message ?? "Erro ao atualizar plano" }, { status: res.status });
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${BASE}/subscription_plans?id=eq.${id}`, {
      method:  "DELETE",
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
    });
    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json({ error: data?.message ?? "Erro ao excluir plano" }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
