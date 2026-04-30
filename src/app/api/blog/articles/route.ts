import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit     = Math.min(200, Math.max(1, parseInt(searchParams.get("limit")  ?? "12", 10)));
  const offset    = Math.max(0,               parseInt(searchParams.get("offset") ?? "0",  10));
  const categoria = searchParams.get("categoria") ?? "";

  const HEADERS = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

  const articleSelect = "id,title,slug,excerpt,featureImageUrl,publishedAt,isExclusive,authorName,category:article_categories(name)";

  const catFilter    = categoria ? `&article_categories.name=eq.${encodeURIComponent(categoria)}` : "";
  const embedSuffix  = categoria ? "!inner" : "";

  const url = categoria
    ? `${BASE}/articles?status=eq.PUBLISHED${catFilter}&order=publishedAt.desc&limit=${limit}&offset=${offset}&select=id,title,slug,excerpt,featureImageUrl,publishedAt,isExclusive,authorName,category:article_categories${embedSuffix}(name)`
    : `${BASE}/articles?status=eq.PUBLISHED&order=publishedAt.desc&limit=${limit}&offset=${offset}&select=${articleSelect}`;

  try {
    const res = await fetch(url, {
      headers: { ...HEADERS, Prefer: "count=exact" },
      cache: "no-store",
    });

    if (!res.ok) return NextResponse.json({ articles: [], total: 0 }, { status: 500 });

    const data = await res.json();
    const total = parseInt(res.headers.get("Content-Range")?.split("/")?.[1] ?? "0", 10) || 0;

    return NextResponse.json({
      articles: Array.isArray(data) ? data : [],
      total,
    });
  } catch {
    return NextResponse.json({ articles: [], total: 0 }, { status: 500 });
  }
}
