import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };
const BUCKET   = "laugo-media";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// PATCH /api/admin/midias/[id] — update metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const patch: Record<string, unknown> = {};
    if ("title"       in body) patch.title       = body.title || null;
    if ("alt_text"    in body) patch.alt_text    = body.alt_text || null;
    if ("description" in body) patch.description = body.description || null;
    if ("folder"      in body) patch.folder      = body.folder || "geral";

    const res = await fetch(`${BASE}/media_files?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(await res.text());
    const [updated] = await res.json();
    return NextResponse.json({ file: updated });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/admin/midias/[id] — delete single file
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  try {
    const { id } = await params;

    const fileRes = await fetch(`${BASE}/media_files?select=storage_path&id=eq.${id}`, {
      headers: HEADERS,
      cache: "no-store",
    });
    const [file] = await fileRes.json();
    if (!file) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });

    await supabase.storage.from(BUCKET).remove([file.storage_path]);

    const delRes = await fetch(`${BASE}/media_files?id=eq.${id}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    if (!delRes.ok) throw new Error(await delRes.text());

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
