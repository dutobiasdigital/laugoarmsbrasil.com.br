import { NextRequest, NextResponse } from "next/server";

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

  if (id) {
    const res  = await fetch(`${BASE}/companies?id=eq.${id}&select=*&limit=1`, { headers: HEADERS, cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) && data.length > 0 ? data[0] : null);
  }

  const res  = await fetch(`${BASE}/companies?select=*&order=tradeName.asc`, { headers: HEADERS, cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = {
      tradeName:       body.tradeName,
      legalName:       body.legalName       || null,
      phone:           body.phone           || null,
      email:           body.email           || null,
      website:         body.website         || null,
      instagram:       body.instagram       || null,
      address:         body.address         || null,
      city:            body.city            || null,
      state:           body.state           || null,
      segment:         body.segment         || "OUTROS",
      logoUrl:         body.logoUrl         || null,
      coverImageUrl:   body.coverImageUrl   || null,
      description:     body.description     || null,
      whatsappNumber:  body.whatsappNumber  || null,
      whatsappMessage: body.whatsappMessage || null,
      cnpj:            body.cnpj            || null,
    };
    const res = await fetch(`${BASE}/companies`, {
      method: "POST", headers: HEADERS, body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message ?? "Erro ao criar empresa." }, { status: 500 });
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;
    const payload = {
      tradeName:       rest.tradeName,
      legalName:       rest.legalName       || null,
      phone:           rest.phone           || null,
      email:           rest.email           || null,
      website:         rest.website         || null,
      instagram:       rest.instagram       || null,
      address:         rest.address         || null,
      city:            rest.city            || null,
      state:           rest.state           || null,
      segment:         rest.segment         || "OUTROS",
      logoUrl:         rest.logoUrl         || null,
      coverImageUrl:   rest.coverImageUrl   || null,
      description:     rest.description     || null,
      whatsappNumber:  rest.whatsappNumber  || null,
      whatsappMessage: rest.whatsappMessage || null,
      cnpj:            rest.cnpj            || null,
      updatedAt:       new Date().toISOString(),
    };
    const res = await fetch(`${BASE}/companies?id=eq.${id}`, {
      method: "PATCH", headers: HEADERS, body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message ?? "Erro ao atualizar empresa." }, { status: 500 });
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const res = await fetch(`${BASE}/companies?id=eq.${id}`, {
      method: "DELETE", headers: { ...HEADERS, "Prefer": "return=minimal" },
    });
    if (!res.ok) return NextResponse.json({ error: "Erro ao excluir empresa." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
