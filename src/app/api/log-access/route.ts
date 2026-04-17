import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const ADMIN_H  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false });

    // Encontra o registro na tabela users pelo authId
    const uRes = await fetch(`${BASE}/users?authId=eq.${user.id}&select=id&limit=1`, { headers: ADMIN_H });
    const uRows = await uRes.json();
    const userId = uRows?.[0]?.id;
    if (!userId) return NextResponse.json({ ok: false });

    // Não registra se já houve acesso nas últimas 4 horas
    const since = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const chkRes = await fetch(
      `${BASE}/user_access_logs?userId=eq.${userId}&createdAt=gte.${encodeURIComponent(since)}&select=id&limit=1`,
      { headers: ADMIN_H }
    );
    const recent = await chkRes.json();
    if (Array.isArray(recent) && recent.length > 0) {
      return NextResponse.json({ ok: true, logged: false });
    }

    // Coleta IP e User-Agent
    const fwd = req.headers.get("x-forwarded-for");
    const ip  = fwd?.split(",")[0]?.trim() ?? "—";
    const ua  = req.headers.get("user-agent") ?? "—";

    await fetch(`${BASE}/user_access_logs`, {
      method: "POST",
      headers: { ...ADMIN_H, Prefer: "return=minimal" },
      body: JSON.stringify({ userId, ipAddress: ip, userAgent: ua }),
    });

    return NextResponse.json({ ok: true, logged: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
