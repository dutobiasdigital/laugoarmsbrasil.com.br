import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const sessionId: string = body.sessionId ?? "";

    const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
    const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

    await fetch(`https://${PROJECT}.supabase.co/rest/v1/ad_impressions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SERVICE,
        "Authorization": `Bearer ${SERVICE}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ adId: id, type: "VIEW", sessionId }),
    });
  } catch {
    // Não bloqueia
  }

  return NextResponse.json({ ok: true });
}
