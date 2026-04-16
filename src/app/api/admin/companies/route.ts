import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  apikey:         SERVICE,
  Authorization:  `Bearer ${SERVICE}`,
  "Content-Type": "application/json",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status      = searchParams.get("status");
    const listingType = searchParams.get("listingType");
    const q           = searchParams.get("q");

    let url = `${BASE}/companies?select=*,users(name,email)&order=createdAt.desc`;

    if (status)      url += `&pipelineStatus=eq.${encodeURIComponent(status)}`;
    if (listingType) url += `&listingType=eq.${encodeURIComponent(listingType)}`;
    if (q) {
      url += `&tradeName=ilike.*${encodeURIComponent(q)}*`;
    }

    const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payload: Record<string, unknown> = {
      userId:           body.userId           ?? null,
      tradeName:        body.tradeName        ?? "",
      email:            body.email            ?? null,
      phone:            body.phone            ?? null,
      segment:          body.segment          ?? null,
      pipelineStatus:   body.pipelineStatus   ?? "REGISTERED",
      listingType:      body.listingType      ?? "NONE",
      cnpj:             body.cnpj             ?? null,
      razaoSocial:      body.razaoSocial      ?? null,
      legalName:        body.legalName        ?? null,
      website:          body.website          ?? null,
      instagram:        body.instagram        ?? null,
      whatsappNumber:   body.whatsappNumber   ?? null,
      whatsappMessage:  body.whatsappMessage  ?? null,
      address:          body.address          ?? null,
      city:             body.city             ?? null,
      state:            body.state            ?? null,
      zip:              body.zip              ?? null,
      logoUrl:          body.logoUrl          ?? null,
      coverImageUrl:    body.coverImageUrl    ?? null,
      description:      body.description      ?? null,
      metaTitle:        body.metaTitle        ?? null,
      metaDescription:  body.metaDescription  ?? null,
      metaKeywords:     body.metaKeywords     ?? null,
      notes:            body.notes            ?? null,
    };

    const res = await fetch(`${BASE}/companies`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const payload: Record<string, unknown> = {
      userId:           rest.userId           ?? undefined,
      tradeName:        rest.tradeName        ?? undefined,
      email:            rest.email            ?? null,
      phone:            rest.phone            ?? null,
      segment:          rest.segment          ?? null,
      pipelineStatus:   rest.pipelineStatus   ?? undefined,
      listingType:      rest.listingType      ?? undefined,
      cnpj:             rest.cnpj             ?? null,
      razaoSocial:      rest.razaoSocial      ?? null,
      legalName:        rest.legalName        ?? null,
      website:          rest.website          ?? null,
      instagram:        rest.instagram        ?? null,
      whatsappNumber:   rest.whatsappNumber   ?? null,
      whatsappMessage:  rest.whatsappMessage  ?? null,
      address:          rest.address          ?? null,
      city:             rest.city             ?? null,
      state:            rest.state            ?? null,
      zip:              rest.zip              ?? null,
      logoUrl:          rest.logoUrl          ?? null,
      coverImageUrl:    rest.coverImageUrl    ?? null,
      description:      rest.description      ?? null,
      metaTitle:        rest.metaTitle        ?? null,
      metaDescription:  rest.metaDescription  ?? null,
      metaKeywords:     rest.metaKeywords     ?? null,
      notes:            rest.notes            ?? null,
      updatedAt:        new Date().toISOString(),
    };

    // Remove undefined keys to avoid overwriting with null unintentionally
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    const res = await fetch(`${BASE}/companies?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=minimal" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ error: data }, { status: res.status });
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const res = await fetch(`${BASE}/companies?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: HEADERS,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ error: data }, { status: res.status });
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
