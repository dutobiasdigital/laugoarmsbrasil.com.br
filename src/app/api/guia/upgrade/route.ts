import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  "Content-Type": "application/json",
  "apikey": SERVICE,
  "Authorization": `Bearer ${SERVICE}`,
};

export async function POST(req: NextRequest) {
  try {
    const { slug, plan, name, email, phone, message } = await req.json();
    if (!slug || !plan || !name || !email) {
      return NextResponse.json({ error: "Preencha nome, e-mail e plano." }, { status: 400 });
    }

    // 1. Salva na tabela ad_requests para o admin ver
    await fetch(`${BASE}/ad_requests`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=minimal" },
      body: JSON.stringify({
        tradeName: `[GUIA] ${slug}`,
        contact:   name,
        email,
        phone:     phone || null,
        segment:   "GUIA_UPGRADE",
        interests: plan,
        message:   `Plano: ${plan} | Slug: ${slug}\n${message ?? ""}`.trim(),
        status:    "PENDING",
      }),
    });

    // 2. Anota no próprio listing para visibilidade no admin
    const note = `⬆ UPGRADE ${plan} — ${name} <${email}> — ${new Date().toLocaleDateString("pt-BR")}`;
    await fetch(`${BASE}/guide_listings?slug=eq.${slug}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=minimal" },
      body: JSON.stringify({ notes: note }),
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
