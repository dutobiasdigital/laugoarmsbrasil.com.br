import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { "Content-Type": "application/json", apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

const RPC_MAP: Record<string, string> = {
  WHATSAPP:   "increment_company_whatsapp",
  FORM:       "increment_company_form",
  PHONE:      "increment_company_phone",
  DIRECTIONS: "increment_company_directions",
  VIEW:       "increment_company_views",
};

export async function POST(req: NextRequest) {
  try {
    const { id, type } = await req.json();
    if (!id || !type) return NextResponse.json({ error: "id e type obrigatórios" }, { status: 400 });

    const rpc = RPC_MAP[String(type).toUpperCase()];
    if (!rpc) return NextResponse.json({ error: "type inválido" }, { status: 400 });

    await fetch(`${BASE}/rpc/${rpc}`, {
      method:  "POST",
      headers: HEADERS,
      body:    JSON.stringify({ p_id: id }),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
