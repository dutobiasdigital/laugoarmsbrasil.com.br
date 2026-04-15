import { NextRequest, NextResponse } from "next/server";
import { slugify } from "@/lib/guia";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { "apikey": SERVICE, "Authorization": `Bearer ${SERVICE}` };

/** GET — listagem pública (somente ACTIVE) com filtros opcionais */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const state    = searchParams.get("state");
  const plan     = searchParams.get("plan");
  const q        = searchParams.get("q");
  const featured = searchParams.get("featured");

  let url = `${BASE}/guide_listings?status=eq.ACTIVE&select=*&order=featured.desc,plan.desc,createdAt.desc`;
  if (category) url += `&category=eq.${category}`;
  if (state)    url += `&state=eq.${state}`;
  if (plan)     url += `&plan=eq.${plan}`;
  if (featured) url += `&featured=eq.true`;
  if (q)        url += `&name=ilike.*${encodeURIComponent(q)}*`;

  const res  = await fetch(url, { headers: HEADERS, cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}

/** POST — cadastro público (cria com status PENDING) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, city, state, category } = body;
    if (!name || !city || !state || !category) {
      return NextResponse.json({ error: "Nome, cidade, estado e categoria são obrigatórios." }, { status: 400 });
    }

    // Gera slug único
    const base = slugify(`${name}-${city}`);
    const slug = `${base}-${Date.now().toString(36)}`;

    const payload = {
      slug,
      name:        body.name,
      category:    body.category,
      plan:        "FREE",
      status:      "PENDING",
      description: body.description || null,
      phone:       body.phone       || null,
      whatsapp:    body.whatsapp    || null,
      email:       body.email       || null,
      website:     body.website     || null,
      instagram:   body.instagram   || null,
      address:     body.address     || null,
      city:        body.city,
      state:       body.state,
      notes:       body.message     || null,
    };

    const res = await fetch(`${BASE}/guide_listings`, {
      method: "POST",
      headers: { ...HEADERS, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return NextResponse.json({ error: "Erro ao cadastrar." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
