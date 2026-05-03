import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const DEFAULT_FOLDERS = ["geral", "loja", "hero", "banners"];
const SETTINGS_KEY = "media.folders";

async function getFolders(): Promise<string[]> {
  const res = await fetch(
    `${BASE}/site_settings?key=eq.${SETTINGS_KEY}&select=value&limit=1`,
    { headers: HEADERS, cache: "no-store" }
  );
  const rows = await res.json();
  if (Array.isArray(rows) && rows.length > 0 && rows[0].value) {
    try { return JSON.parse(rows[0].value); } catch { /* fallback */ }
  }
  return DEFAULT_FOLDERS;
}

async function saveFolders(folders: string[]) {
  await fetch(`${BASE}/site_settings`, {
    method: "POST",
    headers: { ...HEADERS, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ key: SETTINGS_KEY, value: JSON.stringify(folders) }),
  });
}

// GET — lista todas as pastas
export async function GET() {
  try {
    const folders = await getFolders();
    return NextResponse.json({ folders });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST { name } — cria nova pasta
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!slug) return NextResponse.json({ error: "Nome inválido." }, { status: 400 });

    const folders = await getFolders();
    if (folders.includes(slug)) return NextResponse.json({ error: "Pasta já existe." }, { status: 409 });

    const updated = [...folders, slug];
    await saveFolders(updated);
    return NextResponse.json({ folders: updated });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PUT { oldName, newName } — renomeia pasta + atualiza registros de mídia
export async function PUT(req: NextRequest) {
  try {
    const { oldName, newName } = await req.json();
    const slug = newName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!slug) return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
    if (slug === oldName) return NextResponse.json({ error: "O nome é igual ao atual." }, { status: 400 });

    const folders = await getFolders();
    if (!folders.includes(oldName)) return NextResponse.json({ error: "Pasta não encontrada." }, { status: 404 });
    if (folders.includes(slug)) return NextResponse.json({ error: "Já existe uma pasta com este nome." }, { status: 409 });

    // Atualiza media_files: folder = slug onde folder = oldName
    await fetch(`${BASE}/media_files?folder=eq.${encodeURIComponent(oldName)}`, {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify({ folder: slug }),
    });

    const updated = folders.map((f) => (f === oldName ? slug : f));
    await saveFolders(updated);
    return NextResponse.json({ folders: updated });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE { name, action: "move" | "delete" } — exclui pasta
// action=move → move arquivos para "geral"; action=delete → exclui todos os arquivos
export async function DELETE(req: NextRequest) {
  try {
    const { name, action } = await req.json();
    if (!name) return NextResponse.json({ error: "Nome não informado." }, { status: 400 });
    if (name === "geral") return NextResponse.json({ error: "A pasta \"geral\" não pode ser excluída." }, { status: 400 });

    const folders = await getFolders();
    if (!folders.includes(name)) return NextResponse.json({ error: "Pasta não encontrada." }, { status: 404 });

    if (action === "delete") {
      // Busca todos os arquivos da pasta para deletar do Storage
      const listRes = await fetch(
        `${BASE}/media_files?folder=eq.${encodeURIComponent(name)}&select=id,storage_path`,
        { headers: HEADERS, cache: "no-store" }
      );
      const files: { id: string; storage_path: string }[] = await listRes.json();

      if (files.length > 0) {
        const BUCKET  = "laugo-media";
        const STORAGE = `https://${PROJECT}.supabase.co/storage/v1/object`;
        const prefixes = files.map((f) => f.storage_path).filter(Boolean);

        await fetch(`${STORAGE}/${BUCKET}`, {
          method: "DELETE",
          headers: {
            apikey:         SERVICE,
            Authorization:  `Bearer ${SERVICE}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prefixes }),
        });

        const ids = files.map((f) => f.id);
        await fetch(`${BASE}/media_files?id=in.(${ids.join(",")})`, {
          method: "DELETE",
          headers: HEADERS,
        });
      }
    } else {
      // action=move → move para "geral"
      await fetch(`${BASE}/media_files?folder=eq.${encodeURIComponent(name)}`, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({ folder: "geral" }),
      });
    }

    const updated = folders.filter((f) => f !== name);
    await saveFolders(updated);
    return NextResponse.json({ folders: updated });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
