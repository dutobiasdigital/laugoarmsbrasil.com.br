import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };
const BUCKET   = "magnum-media";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function mimeToType(mime: string): string {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  if (
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime.startsWith("text/")
  ) return "document";
  return "other";
}

// GET /api/admin/midias — list with filters + pagination
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q       = searchParams.get("q")?.trim() || "";
  const type    = searchParams.get("type") || "";
  const folder  = searchParams.get("folder") || "";
  const page    = Math.max(1, parseInt(searchParams.get("pagina") ?? "1", 10));
  const perPage = Math.min(100, parseInt(searchParams.get("per_page") ?? "48", 10));
  const offset  = (page - 1) * perPage;

  let url = `${BASE}/media_files?select=*&order=created_at.desc&limit=${perPage}&offset=${offset}`;
  if (q)      url += `&filename=ilike.*${encodeURIComponent(q)}*`;
  if (type)   url += `&type=eq.${encodeURIComponent(type)}`;
  if (folder) url += `&folder=eq.${encodeURIComponent(folder)}`;

  try {
    const res = await fetch(url, {
      headers: { ...HEADERS, Prefer: "count=exact" },
      cache: "no-store",
    });
    const contentRange = res.headers.get("Content-Range");
    let total = 0;
    if (contentRange) {
      const m = contentRange.match(/\/(\d+)$/);
      if (m) total = parseInt(m[1], 10);
    }
    const data = await res.json();
    return NextResponse.json({ files: Array.isArray(data) ? data : [], total });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/admin/midias — upload file + save metadata
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

    const folder   = (formData.get("folder") as string | null)?.trim() || "geral";
    const title    = (formData.get("title") as string | null)?.trim() || "";
    const altText  = (formData.get("alt_text") as string | null)?.trim() || "";
    const ext      = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const random   = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const storagePath = `midias/${folder}/${random}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const fileType = mimeToType(file.type);
    const record = {
      filename:     file.name,
      storage_path: storagePath,
      url:          urlData.publicUrl,
      type:         fileType,
      mime_type:    file.type,
      size_bytes:   file.size,
      alt_text:     altText || null,
      title:        title || file.name,
      folder,
    };

    const dbRes = await fetch(`${BASE}/media_files`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify(record),
    });

    if (!dbRes.ok) {
      // rollback storage
      await supabase.storage.from(BUCKET).remove([storagePath]);
      throw new Error(await dbRes.text());
    }

    const [created] = await dbRes.json();
    return NextResponse.json({ file: created });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/admin/midias — bulk delete
export async function DELETE(req: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await req.json();
    const ids: string[] = body.ids ?? [];
    if (!ids.length) return NextResponse.json({ error: "Nenhum ID informado." }, { status: 400 });

    // fetch storage_path for each file
    const listRes = await fetch(
      `${BASE}/media_files?select=id,storage_path&id=in.(${ids.join(",")})`,
      { headers: HEADERS, cache: "no-store" }
    );
    const files: { id: string; storage_path: string }[] = await listRes.json();

    const paths = files.map((f) => f.storage_path);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);

    for (const id of ids) {
      await fetch(`${BASE}/media_files?id=eq.${id}`, { method: "DELETE", headers: HEADERS });
    }

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
