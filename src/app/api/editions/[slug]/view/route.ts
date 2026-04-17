import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Registra apenas sessões autenticadas (o leitor já exige login)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    await admin
      .from("edition_views")
      .insert({ edition_slug: slug, user_id: user.id });
  } catch {
    // Silencia — analytics não deve bloquear o leitor
  }

  return NextResponse.json({ ok: true });
}
