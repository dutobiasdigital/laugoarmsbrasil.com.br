import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ ok: false });

  try {
    const admin = createAdminClient();
    await admin.from("article_views").insert({ article_slug: slug });
  } catch {
    // Silencia — analytics não deve bloquear a leitura
  }

  return NextResponse.json({ ok: true });
}
