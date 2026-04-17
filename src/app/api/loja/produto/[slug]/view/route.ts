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
    await admin.from("product_views").insert({ product_slug: slug });
  } catch {
    // Silencia — analytics não deve bloquear a navegação
  }

  return NextResponse.json({ ok: true });
}
