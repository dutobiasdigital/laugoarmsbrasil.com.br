import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { category } = await req.json();
    if (!category) return NextResponse.json({ ok: false });

    const admin = createAdminClient();
    await admin.from("guia_category_views").insert({ category_slug: category });
  } catch {
    // Silencia
  }

  return NextResponse.json({ ok: true });
}
