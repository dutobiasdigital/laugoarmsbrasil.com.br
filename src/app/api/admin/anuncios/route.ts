import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;

const HEADERS = {
  "Content-Type": "application/json",
  "apikey": SERVICE,
  "Authorization": `Bearer ${SERVICE}`,
  "Prefer": "return=representation",
};

function boolField(v: unknown) {
  return v === "on" || v === true || v === "true";
}

export async function GET() {
  const res = await fetch(
    `${BASE}/advertisements?select=*,ad_impressions!adId(id)&order=createdAt.desc`,
    { headers: HEADERS, cache: "no-store" }
  );
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = {
      name:           body.name        as string,
      advertiser:     body.advertiser  as string,
      imageUrl:       body.imageUrl    as string,
      targetUrl:      body.targetUrl   as string,
      position:       body.position    as string,
      active:         boolField(body.active),
      startsAt:       body.startsAt    || null,
      endsAt:         body.endsAt      || null,
      maxImpressions: body.maxImpressions ? Number(body.maxImpressions) : null,
      bannerSize:     body.bannerSize  || null,
      notes:          body.notes       || null,
      advertiserId:   body.advertiserId || null,
    };

    const res = await fetch(`${BASE}/advertisements`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message ?? "Erro ao criar anúncio." }, { status: 500 });
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
      name:           rest.name        as string,
      advertiser:     rest.advertiser  as string,
      imageUrl:       rest.imageUrl    as string,
      targetUrl:      rest.targetUrl   as string,
      position:       rest.position    as string,
      active:         boolField(rest.active),
      startsAt:       rest.startsAt    || null,
      endsAt:         rest.endsAt      || null,
      maxImpressions: rest.maxImpressions ? Number(rest.maxImpressions) : null,
      bannerSize:     rest.bannerSize  || null,
      notes:          rest.notes       || null,
      advertiserId:   rest.advertiserId || null,
    };

    const res = await fetch(`${BASE}/advertisements?id=eq.${id}`, {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message ?? "Erro ao atualizar anúncio." }, { status: 500 });
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    // Remove impressions first (FK constraint: ad_impressions.adId → advertisements.id)
    await fetch(`${BASE}/ad_impressions?adId=eq.${id}`, {
      method: "DELETE",
      headers: { ...HEADERS, "Prefer": "return=minimal" },
    });

    const res = await fetch(`${BASE}/advertisements?id=eq.${id}`, {
      method: "DELETE",
      headers: { ...HEADERS, "Prefer": "return=minimal" },
    });
    if (!res.ok) return NextResponse.json({ error: "Erro ao excluir anúncio." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
