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
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    });
  }
}

/** Atualiza pageFlipUrl para "native" se estiver vazio, ou para null se não houver mais páginas */
async function syncPageFlipUrl(slug: string, hasPages: boolean) {
  try {
    if (hasPages) {
      // Só define "native" se pageFlipUrl estiver null ou vazio
      await fetch(`${BASE}/editions?slug=eq.${slug}&pageFlipUrl=is.null`, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({ pageFlipUrl: "native" }),
      });
      // Também trata string vazia
      await fetch(`${BASE}/editions?slug=eq.${slug}&pageFlipUrl=eq.`, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({ pageFlipUrl: "native" }),
      });
    } else {
      // Sem páginas: limpa "native" (não toca em URLs externas)
      await fetch(`${BASE}/editions?slug=eq.${slug}&pageFlipUrl=eq.native`, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({ pageFlipUrl: null }),
      });
    }
  } catch {
    // analytics não deve bloquear upload/delete
  }
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
    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Erro ao verificar permissão." }, { status: 500 });
  }

  const admin = createAdminClient();
  const { data: files, error } = await admin.storage
    .from("edition-pages")
    .list(slug, { limit: 500, sortBy: { column: "name", order: "asc" } });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rawPages = (files ?? []).filter((f) => f.name && f.id);

  // Gera signed URLs em lote (1h de validade)
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
    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Erro ao verificar permissão." }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const pageNum = formData.get("pageNum") as string | null;

  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = pageNum ? `page-${pageNum.padStart(3, "0")}.${ext}` : file.name;
  const storagePath = `${slug}/${filename}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();
  await ensureBucket(admin);

  const { error: uploadErr } = await admin.storage
    .from("edition-pages")
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  // Ativa o leitor nativo se ainda não havia URL configurada
  await syncPageFlipUrl(slug, true);

  return NextResponse.json({ path: storagePath, filename });
}

// ─── DELETE — remove uma página específica ────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
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

  // Verifica se ainda restam páginas para sincronizar pageFlipUrl
  const { data: remaining } = await admin.storage
    .from("edition-pages")
    .list(slug, { limit: 1 });
  const hasPages = (remaining ?? []).some((f) => f.name && f.id);
  await syncPageFlipUrl(slug, hasPages);

  return NextResponse.json({ ok: true });
}

// ─── PATCH — marca página como Editorial ou Índice ───────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Erro ao verificar permissão." }, { status: 500 });
  }

  const { type, filename } = await req.json() as {
    type: "editorial" | "index";
    filename: string | null;
  };

  if (type !== "editorial" && type !== "index") {
    return NextResponse.json({ error: "type deve ser 'editorial' ou 'index'." }, { status: 400 });
  }

  const field = type === "editorial" ? "editorialPageFile" : "indexPageFile";

  const res = await fetch(`${BASE}/editions?slug=eq.${slug}`, {
    method: "PATCH",
    headers: HEADERS,
    body: JSON.stringify({ [field]: filename }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: 500 });
  }

  return NextResponse.json({ ok: true, field, filename });
}
