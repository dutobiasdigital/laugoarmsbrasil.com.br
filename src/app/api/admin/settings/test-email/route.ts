import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const to   = body.to as string | undefined;
    const tpl  = body.template as string | undefined;

    if (!to) {
      return NextResponse.json({ error: "Campo 'to' obrigatório." }, { status: 400 });
    }

    await sendTestEmail(to, tpl);
    return NextResponse.json({ ok: true, to, template: tpl ?? "smtp" });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
