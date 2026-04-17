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
  const id     = searchParams.get("id");
  const status = searchParams.get("status");

  let url: string;
  if (id) {
    url = `${BASE}/companies?id=eq.${id}&select=*&limit=1`;
  } else {
    url = `${BASE}/companies?select=*&order=tradeName.asc`;
    if (status) url += `&pipelineStatus=eq.${status}`;
  }

  const res  = await fetch(url, { headers: HEADERS, cache: "no-store" });
  const data = await res.json();
  if (id) return NextResponse.json(Array.isArray(data) && data.length > 0 ? data[0] : null);
  return NextResponse.json(Array.isArray(data) ? data : []);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = {
      tradeName:       body.tradeName,
      email:           body.email           || null,
      phone:           body.phone           || null,
      segment:         body.segment         || "OUTROS",
      listingType:     body.listingType     || "NONE",
      legalName:       body.legalName       || null,
      cnpj:            body.cnpj            || null,
      website:         body.website         || null,
      instagram:       body.instagram       || null,
      whatsappNumber:  body.whatsappNumber  || null,
      whatsappMessage: body.whatsappMessage || null,
      address:         body.address         || null,
      city:            body.city            || null,
      state:           body.state           || null,
      zip:             body.zip             || null,
      description:     body.description     || null,
      logoUrl:         body.logoUrl         || null,
      coverImageUrl:   body.coverImageUrl   || null,
      notes:           body.notes           || null,
      // campos obrigatórios com defaults
      pipelineStatus:  "REGISTERED",
      emailVerified:   false,
      featured:        false,
      viewsCount:      0,
      clicksCount:     0,
    };
    const res = await fetch(`${BASE}/companies`, {
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
    const { id, status, ...rest } = body;
    // GuiaQuickAction envia { id, status } — mapeamos para pipelineStatus
    const updateData: Record<string, unknown> = {
      ...rest,
      ...(status !== undefined ? { pipelineStatus: status } : {}),
      updatedAt: new Date().toISOString(),
    };
    const res = await fetch(`${BASE}/companies?id=eq.${id}`, {
      method: "PATCH", headers: HEADERS,
      body: JSON.stringify(updateData),
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
    const res = await fetch(`${BASE}/companies?id=eq.${id}`, {
      method: "DELETE", headers: { ...HEADERS, "Prefer": "return=minimal" },
    });
    if (!res.ok) return NextResponse.json({ error: "Erro ao excluir." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
