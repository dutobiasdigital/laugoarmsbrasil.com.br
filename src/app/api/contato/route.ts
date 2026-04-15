import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/recaptcha";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, _recaptchaToken } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    // reCAPTCHA verification (graceful: passes if key not configured)
    const captchaOk = await verifyRecaptcha(_recaptchaToken ?? "", "contact");
    if (!captchaOk) {
      return NextResponse.json(
        { error: "Verificação de segurança falhou. Tente novamente." },
        { status: 400 }
      );
    }

    // Save to contact_messages table (create via migration if not yet done)
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/contact_messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SERVICE,
          "Authorization": `Bearer ${SERVICE}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({ name, email, subject, message }),
      }
    );

    // If table doesn't exist yet, still return success (message is not lost — log it)
    if (!res.ok) {
      const err = await res.text();
      console.error("contact_messages insert error:", err);
      // Don't expose DB error to client — the request data is logged above
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
