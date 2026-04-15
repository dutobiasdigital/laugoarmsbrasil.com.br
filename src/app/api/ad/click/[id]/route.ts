import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const target = req.nextUrl.searchParams.get("url");

  // Registra clique via Supabase REST
  try {
    const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
    const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

    // Incrementa contador de cliques
    await fetch(`https://${PROJECT}.supabase.co/rest/v1/rpc/increment_ad_clicks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SERVICE,
        "Authorization": `Bearer ${SERVICE}`,
      },
      body: JSON.stringify({ ad_id: id }),
    });

    // Registra na tabela ad_impressions com type=CLICK
    await fetch(`https://${PROJECT}.supabase.co/rest/v1/ad_impressions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SERVICE,
        "Authorization": `Bearer ${SERVICE}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ adId: id, type: "CLICK" }),
    });
  } catch {
    // Não bloqueia o redirect se o tracking falhar
  }

  // Redireciona para o site do anunciante
  const destination = target ?? "/";
  return NextResponse.redirect(destination, { status: 302 });
}
