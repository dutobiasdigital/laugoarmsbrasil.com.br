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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "title e slug são obrigatórios" }, { status: 400 });
    }
    const payload = {
      title:           String(body.title),
      slug:            String(body.slug),
      icon:            body.icon ? String(body.icon) : null,
      description:     body.description ? String(body.description) : null,
      shortCall:       body.shortCall ? String(body.shortCall) : null,
      imageUrl:        body.imageUrl ? String(body.imageUrl) : null,
      imageAlt:        body.imageAlt ? String(body.imageAlt) : null,
      metaTitle:       body.metaTitle ? String(body.metaTitle) : null,
      metaDescription: body.metaDescription ? String(body.metaDescription) : null,
      metaKeywords:    body.metaKeywords ? String(body.metaKeywords) : null,
      isActive:        body.isActive !== false,
      sortOrder:       parseInt(String(body.sortOrder ?? "0"), 10),
      createdAt:       new Date().toISOString(),
      updatedAt:       new Date().toISOString(),
    };
    const res  = await fetch(`${BASE}/guide_categories`, { method: "POST", headers: HEADERS, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data?.message ?? "Erro ao criar" }, { status: res.status });
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
