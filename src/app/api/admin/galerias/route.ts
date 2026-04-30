import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

function slugify(str: string) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

// GET — sem id: lista todas; com ?id=xxx: retorna galeria + items
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      // Busca galeria
      const [galRes, itemsRes] = await Promise.all([
        fetch(`${BASE}/galleries?id=eq.${id}&select=*&limit=1`, {
          headers: HEADERS,
          cache: "no-store",
        }),
        fetch(`${BASE}/gallery_items?gallery_id=eq.${id}&select=*&order=sort_order.asc`, {
          headers: HEADERS,
          cache: "no-store",
        }),
      ]);

      const galData   = await galRes.json();
      const itemsData = await itemsRes.json();

      const gallery = Array.isArray(galData) ? galData[0] : null;
      if (!gallery) return NextResponse.json({ error: "Galeria não encontrada." }, { status: 404 });

      return NextResponse.json({ ...gallery, items: Array.isArray(itemsData) ? itemsData : [] });
    }

    // Lista todas
    const res = await fetch(
      `${BASE}/galleries?select=id,title,slug,is_active,sort_order,cover_url,created_at&order=sort_order.asc,created_at.desc`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST — cria galeria
export async function POST(req: NextRequest) {
  try {
    const body       = await req.json();
    const title      = (body.title as string)?.trim();
    const slug       = ((body.slug as string)?.trim()) || slugify(title);
    const description = (body.description as string) || null;
    const cover_url  = (body.cover_url as string) || null;
    const is_active  = body.is_active !== false;
    const sort_order = Number(body.sort_order ?? 0);

    if (!title) return NextResponse.json({ error: "Título obrigatório." }, { status: 400 });
    if (!slug)  return NextResponse.json({ error: "Slug obrigatório." }, { status: 400 });

    const res = await fetch(`${BASE}/galleries`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({ title, slug, description, cover_url, is_active, sort_order }),
    });
    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    return NextResponse.json({ success: true, id: data[0]?.id });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message || "Erro ao criar galeria." }, { status: 500 });
  }
}

// PUT — atualiza galeria + recria items
export async function PUT(req: NextRequest) {
  try {
    const body        = await req.json();
    const id          = body.id as string;
    const title       = (body.title as string)?.trim();
    const slug        = (body.slug as string)?.trim();
    const description = (body.description as string) || null;
    const cover_url   = (body.cover_url as string) || null;
    const is_active   = body.is_active !== false;
    const sort_order  = Number(body.sort_order ?? 0);
    const items: { url: string; filename?: string; alt_text?: string; media_type?: string; sort_order?: number }[] =
      Array.isArray(body.items) ? body.items : [];

    if (!id)    return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Título obrigatório." }, { status: 400 });
    if (!slug)  return NextResponse.json({ error: "Slug obrigatório." }, { status: 400 });

    // Atualiza galeria
    const updRes = await fetch(`${BASE}/galleries?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=minimal" },
      body: JSON.stringify({
        title, slug, description, cover_url, is_active, sort_order,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!updRes.ok) throw new Error(await updRes.text());

    // Recria items: DELETE → INSERT
    const delRes = await fetch(`${BASE}/gallery_items?gallery_id=eq.${id}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    if (!delRes.ok) throw new Error(await delRes.text());

    if (items.length > 0) {
      const rows = items.map((item, idx) => ({
        gallery_id: id,
        url:        item.url,
        filename:   item.filename || null,
        alt_text:   item.alt_text || null,
        media_type: item.media_type || "image",
        sort_order: item.sort_order ?? idx,
      }));

      const insRes = await fetch(`${BASE}/gallery_items`, {
        method: "POST",
        headers: { ...HEADERS, Prefer: "return=minimal" },
        body: JSON.stringify(rows),
      });
      if (!insRes.ok) throw new Error(await insRes.text());
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message || "Erro ao atualizar galeria." }, { status: 500 });
  }
}

// DELETE — deleta galeria (cascade deleta items)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

    const res = await fetch(`${BASE}/galleries?id=eq.${id}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message || "Erro ao excluir galeria." }, { status: 500 });
  }
}
