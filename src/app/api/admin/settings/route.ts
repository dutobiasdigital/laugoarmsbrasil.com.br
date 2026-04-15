import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;

const HEADERS = {
  "Content-Type": "application/json",
  "apikey": SERVICE,
  "Authorization": `Bearer ${SERVICE}`,
};

/** GET — retorna todas as configs como { key: value } */
export async function GET() {
  const res = await fetch(`${BASE}/site_settings?select=key,value`, {
    headers: HEADERS,
    cache: "no-store",
  });
  const rows: { key: string; value: string | null }[] = await res.json();
  if (!Array.isArray(rows)) return NextResponse.json({});
  const obj: Record<string, string> = {};
  for (const row of rows) obj[row.key] = row.value ?? "";
  return NextResponse.json(obj);
}

/** POST — body: { "site.name": "...", "integrations.gtm_id": "..." }
 *  Faz upsert individual de cada chave. */
export async function POST(req: NextRequest) {
  try {
    const body: Record<string, string> = await req.json();
    const rows = Object.entries(body).map(([key, value]) => ({
      key,
      value: value ?? null,
      updatedAt: new Date().toISOString(),
    }));

    const res = await fetch(`${BASE}/site_settings`, {
      method: "POST",
      headers: { ...HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(rows),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
