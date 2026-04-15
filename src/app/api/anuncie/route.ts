import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/* Salva a solicitação de anúncio na tabela ad_requests
   (campos já suficientes para criar a empresa depois no admin) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      tradeName, legalName, contact, phone, email,
      website, instagram, segment, address, interests, message,
    } = body;

    if (!tradeName || !contact || !email || !phone) {
      return NextResponse.json(
        { error: "Preencha os campos obrigatórios: empresa, contato, e-mail e telefone." },
        { status: 400 }
      );
    }

    const payload = {
      tradeName,
      legalName:  legalName  || null,
      contact,
      phone,
      email,
      website:    website    || null,
      instagram:  instagram  || null,
      segment:    segment    || "OUTROS",
      address:    address    || null,
      interests:  interests  || null,
      message:    message    || null,
    };

    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/ad_requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SERVICE,
          "Authorization": `Bearer ${SERVICE}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("ad_requests insert error:", err);
      return NextResponse.json({ error: "Erro ao registrar solicitação." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
