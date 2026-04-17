import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Accepts { id } (company UUID) or legacy { slug } (ignored gracefully)
    const id = body.id ?? body.slug;
    if (!id) return NextResponse.json({ ok: false });

    await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/rpc/increment_company_views`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SERVICE,
          "Authorization": `Bearer ${SERVICE}`,
        },
        body: JSON.stringify({ p_id: id }),
      }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
