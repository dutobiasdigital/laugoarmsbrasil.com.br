import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  "Content-Type": "application/json",
  "apikey":        SERVICE,
  "Authorization": `Bearer ${SERVICE}`,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status  = searchParams.get("status");
    const gateway = searchParams.get("gateway");

    let url = `${BASE}/payment_intents?select=*&order=createdAt.desc&limit=300`;
    if (status  && status  !== "TODOS") url += `&status=eq.${status}`;
    if (gateway && gateway !== "TODOS") url += `&gateway=eq.${gateway}`;

    const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message ?? "Erro ao buscar pagamentos." }, { status: 500 });
    }

    const intents = await res.json();
    return NextResponse.json({ intents: Array.isArray(intents) ? intents : [] });
  } catch (e: unknown) {
    console.error("[api/admin/pagamentos]", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
