import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  "Content-Type": "application/json",
  apikey:         SERVICE,
  Authorization:  `Bearer ${SERVICE}`,
  Prefer:         "return=representation",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "name e slug são obrigatórios" }, { status: 400 });
    }
    const payload = {
      name:           String(body.name),
      slug:           String(body.slug),
      description:    body.description ? String(body.description) : null,
      listingType:    String(body.listingType ?? "FREE"),
      priceInCents:   parseInt(String(body.priceInCents ?? "0").replace(/\D/g, ""), 10),
      intervalMonths: parseInt(String(body.intervalMonths ?? "12"), 10),
      features:       body.features ? String(body.features) : null,
      active:         body.active === true || body.active === "true",
      sortOrder:      parseInt(String(body.sortOrder ?? "0"), 10),
      highlight:      body.highlight === true || body.highlight === "true",
      badge:          body.badge ? String(body.badge) : null,
      buttonText:     body.buttonText ? String(body.buttonText) : null,
      createdAt:      new Date().toISOString(),
    };
    const res  = await fetch(`${BASE}/guide_plans`, { method: "POST", headers: HEADERS, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data?.message ?? "Erro ao criar" }, { status: res.status });
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
