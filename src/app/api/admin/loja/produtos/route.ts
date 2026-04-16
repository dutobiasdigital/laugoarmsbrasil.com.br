import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

function toSlug(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface VariationPayload {
  id?: string;
  name: string;
  attributes?: { tamanho?: string; cor?: string };
  price?: number | null;
  stock?: number;
  sku?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

interface PdfPayload {
  id?: string;
  title: string;
  fileUrl: string;
  sortOrder: number;
}

async function upsertVariations(productId: string, variations: VariationPayload[], existingIds: string[]) {
  const incomingIds: string[] = [];
  for (const v of variations) {
    if (v.id) {
      await fetch(`${BASE}/shop_product_variations?id=eq.${v.id}`, {
        method: "PATCH", headers: HEADERS,
        body: JSON.stringify({ name: v.name, attributes: v.attributes ?? {}, price: v.price ?? null, stock: v.stock ?? 0, sku: v.sku ?? null, isActive: v.isActive ?? true, sortOrder: v.sortOrder ?? 0 }),
      });
      incomingIds.push(v.id);
    } else {
      const res = await fetch(`${BASE}/shop_product_variations`, {
        method: "POST", headers: { ...HEADERS, Prefer: "return=representation" },
        body: JSON.stringify({ productId, name: v.name, attributes: v.attributes ?? {}, price: v.price ?? null, stock: v.stock ?? 0, sku: v.sku ?? null, isActive: v.isActive ?? true, sortOrder: v.sortOrder ?? 0 }),
      });
      if (res.ok) { const c = await res.json(); if (c[0]?.id) incomingIds.push(c[0].id); }
    }
  }
  for (const delId of existingIds.filter((id) => !incomingIds.includes(id))) {
    await fetch(`${BASE}/shop_product_variations?id=eq.${delId}`, { method: "DELETE", headers: HEADERS });
  }
}

async function upsertPdfs(productId: string, pdfs: PdfPayload[], existingIds: string[]) {
  const incomingIds: string[] = [];
  for (const p of pdfs) {
    if (!p.fileUrl) continue;
    if (p.id) {
      await fetch(`${BASE}/shop_product_pdfs?id=eq.${p.id}`, {
        method: "PATCH", headers: HEADERS,
        body: JSON.stringify({ title: p.title, fileUrl: p.fileUrl, sortOrder: p.sortOrder }),
      });
      incomingIds.push(p.id);
    } else {
      const res = await fetch(`${BASE}/shop_product_pdfs`, {
        method: "POST", headers: { ...HEADERS, Prefer: "return=representation" },
        body: JSON.stringify({ productId, title: p.title, fileUrl: p.fileUrl, sortOrder: p.sortOrder }),
      });
      if (res.ok) { const c = await res.json(); if (c[0]?.id) incomingIds.push(c[0].id); }
    }
  }
  for (const delId of existingIds.filter((id) => !incomingIds.includes(id))) {
    await fetch(`${BASE}/shop_product_pdfs?id=eq.${delId}`, { method: "DELETE", headers: HEADERS });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q          = searchParams.get("q") ?? "";
    const categoryId = searchParams.get("categoryId") ?? "";
    const limit      = parseInt(searchParams.get("limit") ?? "20", 10);
    const offset     = parseInt(searchParams.get("offset") ?? "0", 10);

    let url = `${BASE}/shop_products?select=id,name,slug,mainImageUrl,basePrice,stock,hasVariations,isActive,isFeatured,categoryId,sku,createdAt&order=createdAt.desc&limit=${limit}&offset=${offset}`;
    if (q) url += `&name=ilike.*${encodeURIComponent(q)}*`;
    if (categoryId) url += `&categoryId=eq.${categoryId}`;

    const res = await fetch(url, { headers: { ...HEADERS, Prefer: "count=exact" }, cache: "no-store" });
    const data = await res.json();
    const total = parseInt(res.headers.get("content-range")?.split("/")[1] ?? "0", 10);

    return NextResponse.json({ products: data, total });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name           = (body.name as string)?.trim();
    const slug           = ((body.slug as string) || toSlug(name)).trim();
    const categoryId     = (body.categoryId as string) || null;
    const isActive       = body.isActive === true || body.isActive === "true";
    const isFeatured     = body.isFeatured === true || body.isFeatured === "true";
    const basePrice      = Number(body.basePrice ?? 0);
    const hasVariations  = body.hasVariations === true || body.hasVariations === "true";
    const stock          = body.stock != null ? Number(body.stock) : null;
    const sku            = (body.sku as string) || null;
    const description    = (body.description as string) || null;
    const contentTabs    = Array.isArray(body.contentTabs) ? body.contentTabs : [];
    const weight         = body.weight ? Number(body.weight) : null;
    const dimensionWidth  = body.dimensionWidth  != null && body.dimensionWidth  !== "" ? Number(body.dimensionWidth)  : null;
    const dimensionHeight = body.dimensionHeight != null && body.dimensionHeight !== "" ? Number(body.dimensionHeight) : null;
    const dimensionLength = body.dimensionLength != null && body.dimensionLength !== "" ? Number(body.dimensionLength) : null;
    const mainImageUrl   = (body.mainImageUrl as string) || null;
    const mainImageAlt   = (body.mainImageAlt as string) || null;
    const metaTitle      = (body.metaTitle as string) || null;
    const metaDescription = (body.metaDescription as string) || null;
    const metaKeywords   = (body.metaKeywords as string) || null;

    if (!name) return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });

    const res = await fetch(`${BASE}/shop_products`, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        name, slug, categoryId, isActive, isFeatured, basePrice, hasVariations,
        stock, sku, description, contentTabs, weight,
        dimensionWidth, dimensionHeight, dimensionLength,
        mainImageUrl, mainImageAlt,
        metaTitle, metaDescription, metaKeywords,
      }),
    });
    if (!res.ok) throw new Error(await res.text());

    const created = await res.json();
    const productId = created[0]?.id;

    if (hasVariations && Array.isArray(body.variations) && body.variations.length > 0) {
      await upsertVariations(productId, body.variations as VariationPayload[], []);
    }

    if (Array.isArray(body.pdfs) && body.pdfs.length > 0) {
      await upsertPdfs(productId, body.pdfs as PdfPayload[], []);
    }

    return NextResponse.json({ success: true, id: productId });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message || "Erro ao criar produto." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const id             = body.id as string;
    const name           = (body.name as string)?.trim();
    const slug           = (body.slug as string)?.trim();
    const categoryId     = (body.categoryId as string) || null;
    const isActive       = body.isActive === true || body.isActive === "true";
    const isFeatured     = body.isFeatured === true || body.isFeatured === "true";
    const basePrice      = Number(body.basePrice ?? 0);
    const hasVariations  = body.hasVariations === true || body.hasVariations === "true";
    const stock          = body.stock != null ? Number(body.stock) : null;
    const sku            = (body.sku as string) || null;
    const description    = (body.description as string) || null;
    const contentTabs    = Array.isArray(body.contentTabs) ? body.contentTabs : [];
    const weight         = body.weight ? Number(body.weight) : null;
    const dimensionWidth  = body.dimensionWidth  != null && body.dimensionWidth  !== "" ? Number(body.dimensionWidth)  : null;
    const dimensionHeight = body.dimensionHeight != null && body.dimensionHeight !== "" ? Number(body.dimensionHeight) : null;
    const dimensionLength = body.dimensionLength != null && body.dimensionLength !== "" ? Number(body.dimensionLength) : null;
    const mainImageUrl   = (body.mainImageUrl as string) || null;
    const mainImageAlt   = (body.mainImageAlt as string) || null;
    const metaTitle      = (body.metaTitle as string) || null;
    const metaDescription = (body.metaDescription as string) || null;
    const metaKeywords   = (body.metaKeywords as string) || null;

    if (!id)   return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });

    const res = await fetch(`${BASE}/shop_products?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        name, slug, categoryId, isActive, isFeatured, basePrice, hasVariations,
        stock, sku, description, contentTabs, weight,
        dimensionWidth, dimensionHeight, dimensionLength,
        mainImageUrl, mainImageAlt,
        metaTitle, metaDescription, metaKeywords,
      }),
    });
    if (!res.ok) throw new Error(await res.text());

    // Upsert variations
    const existingVarsRes = await fetch(`${BASE}/shop_product_variations?productId=eq.${id}&select=id`, { headers: HEADERS, cache: "no-store" });
    const existingVars: { id: string }[] = await existingVarsRes.json();
    const existingVarIds = existingVars.map((v) => v.id);

    if (Array.isArray(body.variations)) {
      await upsertVariations(id, body.variations as VariationPayload[], existingVarIds);
    } else if (!hasVariations) {
      for (const delId of existingVarIds) {
        await fetch(`${BASE}/shop_product_variations?id=eq.${delId}`, { method: "DELETE", headers: HEADERS });
      }
    }

    // Upsert PDFs
    const existingPdfsRes = await fetch(`${BASE}/shop_product_pdfs?productId=eq.${id}&select=id`, { headers: HEADERS, cache: "no-store" });
    const existingPdfsJson: { id: string }[] = existingPdfsRes.ok ? await existingPdfsRes.json() : [];
    const existingPdfIds = Array.isArray(existingPdfsJson) ? existingPdfsJson.map((p) => p.id) : [];

    if (Array.isArray(body.pdfs)) {
      await upsertPdfs(id, body.pdfs as PdfPayload[], existingPdfIds);
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message || "Erro ao atualizar produto." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const id   = body.id as string;
    if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

    await fetch(`${BASE}/shop_product_variations?productId=eq.${id}`, { method: "DELETE", headers: HEADERS });
    await fetch(`${BASE}/shop_product_pdfs?productId=eq.${id}`, { method: "DELETE", headers: HEADERS });

    const res = await fetch(`${BASE}/shop_products?id=eq.${id}`, { method: "DELETE", headers: HEADERS });
    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message || "Erro ao excluir produto." }, { status: 500 });
  }
}
