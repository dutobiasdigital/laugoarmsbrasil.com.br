import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  apikey: SERVICE,
  Authorization: `Bearer ${SERVICE}`,
  "Content-Type": "application/json",
};

/** Verifica se o usuário autenticado é ADMIN */
async function isAdmin(userId: string): Promise<boolean> {
  const res = await fetch(`${BASE}/users?authId=eq.${userId}&select=role&limit=1`, {
    headers: HEADERS,
    cache: "no-store",
  });
  const data = await res.json();
  return Array.isArray(data) && data[0]?.role === "ADMIN";
}

/** Garante que o bucket existe (cria se necessário) */
async function ensureBucket(admin: ReturnType<typeof createAdminClient>) {
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === "edition-pages");
  if (!exists) {
    await admin.storage.createBucket("edition-pages", {
      public: false,
      fileSizeLimit: 52428800,
      allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    });
  }
}

/** Atualiza pageFlipUrl para "native" se estiver vazio, ou para null se não houver mais páginas */
async function syncPageFlipUrl(slug: string, hasPages: boolean) {
  try {
    if (hasPages) {
      await fetch(`${BASE}/editions?slug=eq.${slug}&pageFlipUrl=is.null`, {
        method: "PATCH", headers: HEADERS,
        body: JSON.stringify({ pageFlipUrl: "native" }),
      });
      await fetch(`${BASE}/editions?slug=eq.${slug}&pageFlipUrl=eq.`, {
        method: "PATCH", headers: HEADERS,
        body: JSON.stringify({ pageFlipUrl: "native" }),
      });
    } else {
      await fetch(`${BASE}/editions?slug=eq.${slug}&pageFlipUrl=eq.native`, {
        method: "PATCH", headers: HEADERS,
        body: JSON.stringify({ pageFlipUrl: null }),
      });
    }
  } catch { /* silencioso */ }
}

// ─── GET — lista páginas com signed URLs ─────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    if (!(await isAdmin(user.id)))
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Erro ao verificar permissão." }, { status: 500 });
  }

  const admin = createAdminClient();
  const { data: files, error } = await admin.storage
    .from("edition-pages")
    .list(slug, { limit: 500, sortBy: { column: "name", order: "asc" } });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rawPages = (files ?? []).filter((f) => f.name && f.id);

  let signedMap: Record<string, string> = {};
  if (rawPages.length > 0) {
    const paths = rawPages.map((f) => `${slug}/${f.name}`);
    const { data: signed } = await admin.storage
      .from("edition-pages")
      .createSignedUrls(paths, 3600);
    (signed ?? []).forEach((s) => {
      const filename = (s.path ?? "").split("/").pop() ?? "";
      if (s.signedUrl) signedMap[filename] = s.signedUrl;
    });
  }

  const pages = rawPages.map((f) => ({
    name: f.name,
    size: f.metadata?.size ?? 0,
    signedUrl: signedMap[f.name] ?? "",
  }));

  return NextResponse.json({ pages, total: pages.length });
}

// ─── POST — faz upload de uma página ─────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    if (!(await isAdmin(user.id)))
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Erro ao verificar permissão." }, { status: 500 });
  }

  const formData = await req.formData();
  const file    = formData.get("file")    as File   | null;
  const pageNum = formData.get("pageNum") as string | null;

  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = pageNum ? `page-${pageNum.padStart(3, "0")}.${ext}` : file.name;
  const buffer   = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();
  await ensureBucket(admin);

  const { error: uploadErr } = await admin.storage
    .from("edition-pages")
    .upload(`${slug}/${filename}`, buffer, { contentType: file.type, upsert: true });

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  await syncPageFlipUrl(slug, true);

  return NextResponse.json({ path: `${slug}/${filename}`, filename });
}

// ─── DELETE — remove uma página e limpa marcadores ───────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    if (!(await isAdmin(user.id)))
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Erro ao verificar permissão." }, { status: 500 });
  }

  const { filename } = await req.json();
  if (!filename) return NextResponse.json({ error: "filename obrigatório." }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("edition-pages")
    .remove([`${slug}/${filename}`]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Remove filename dos arrays de marcadores, se presente
  try {
    const { data: ed } = await admin
      .from("editions")
      .select('"editorialPageFiles","indexPageFiles"')
      .eq("slug", slug)
      .single() as { data: { editorialPageFiles: string[] | null; indexPageFiles: string[] | null } | null };

    if (ed) {
      const newEditorial = (ed.editorialPageFiles ?? []).filter((f) => f !== filename);
      const newIndex     = (ed.indexPageFiles     ?? []).filter((f) => f !== filename);
      await admin
        .from("editions")
        .update({
          editorialPageFiles: newEditorial.length > 0 ? newEditorial : null,
          indexPageFiles:     newIndex.length     > 0 ? newIndex     : null,
        })
        .eq("slug", slug);
    }
  } catch { /* silencioso */ }

  // Sincroniza pageFlipUrl
  const { data: remaining } = await admin.storage
    .from("edition-pages")
    .list(slug, { limit: 1 });
  await syncPageFlipUrl(slug, (remaining ?? []).some((f) => f.name && f.id));

  return NextResponse.json({ ok: true });
}

// ─── PATCH — adiciona ou remove página dos marcadores Editorial / Índice ──────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    if (!(await isAdmin(user.id)))
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Erro ao verificar permissão." }, { status: 500 });
  }

  const { type, filename, action } = await req.json() as {
    type:     "editorial" | "index";
    filename: string;
    action:   "add" | "remove";
  };

  if (type !== "editorial" && type !== "index")
    return NextResponse.json({ error: "type deve ser 'editorial' ou 'index'." }, { status: 400 });
  if (action !== "add" && action !== "remove")
    return NextResponse.json({ error: "action deve ser 'add' ou 'remove'." }, { status: 400 });
  if (!filename)
    return NextResponse.json({ error: "filename obrigatório." }, { status: 400 });

  const field = type === "editorial" ? "editorialPageFiles" : "indexPageFiles";

  const admin = createAdminClient();

  // Busca o array atual
  const { data: ed, error: fetchErr } = await admin
    .from("editions")
    .select(`"${field}"`)
    .eq("slug", slug)
    .single() as { data: Record<string, string[] | null> | null; error: unknown };

  if (fetchErr || !ed)
    return NextResponse.json({ error: "Edição não encontrada." }, { status: 404 });

  const current: string[] = ed[field] ?? [];
  const updated =
    action === "add"
      ? [...new Set([...current, filename])]
      : current.filter((f) => f !== filename);

  const { error: updateErr } = await admin
    .from("editions")
    .update({ [field]: updated.length > 0 ? updated : null })
    .eq("slug", slug);

  if (updateErr)
    return NextResponse.json({ error: (updateErr as Error).message }, { status: 500 });

  return NextResponse.json({ ok: true, field, files: updated });
}
