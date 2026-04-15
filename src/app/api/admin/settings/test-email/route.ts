import { NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/email";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;

async function getAdminEmail(): Promise<string | null> {
  try {
    const res = await fetch(
      `${BASE}/site_settings?key=eq.smtp.from_email&select=value&limit=1`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const rows = await res.json();
    return rows?.[0]?.value ?? null;
  } catch { return null; }
}

export async function POST() {
  try {
    const to = await getAdminEmail();
    if (!to) {
      return NextResponse.json(
        { error: "Configure o e-mail remetente (smtp.from_email) antes de testar." },
        { status: 400 }
      );
    }
    await sendTestEmail(to);
    return NextResponse.json({ ok: true, to });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
