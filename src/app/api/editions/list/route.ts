import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;

function buildSearchFilter(q: string): string {
  if (!q) return "";
  const t = encodeURIComponent(q);
  const p = `%25${t}%25`;
  const numQ = parseInt(q, 10);
  const numPart = !isNaN(numQ) && numQ > 0 ? `,number.eq.${numQ}` : "";
  return `&or=(title.ilike.${p},editorial.ilike.${p},tableOfContents.ilike.${p}${numPart})`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit  = Math.min(200, Math.max(1, parseInt(searchParams.get("limit")  ?? "16", 10)));
  const offset = Math.max(0,               parseInt(searchParams.get("offset") ?? "0",  10));
  const tipo   = searchParams.get("tipo") ?? "";
  const q      = searchParams.get("q")    ?? "";

  const typeFilter   = tipo === "normais"   ? "&type=eq.REGULAR"
                     : tipo === "especiais" ? "&type=eq.SPECIAL"
                     : "";
  const searchFilter = buildSearchFilter(q);

  try {
    const res = await fetch(
      `${BASE}/editions?isPublished=eq.true${typeFilter}${searchFilter}&order=publishedAt.desc&limit=${limit}&offset=${offset}&select=id,title,number,slug,coverImageUrl,publishedAt,type,pageCount,summary`,
      {
        headers: {
          apikey:        SERVICE,
          Authorization: `Bearer ${SERVICE}`,
          Prefer:        "count=exact",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return NextResponse.json([], { status: 500 });

    const data = await res.json();
    const total = parseInt(res.headers.get("Content-Range")?.split("/")?.[1] ?? "0", 10) || 0;

    return NextResponse.json({
      editions: Array.isArray(data) ? data : [],
      total,
    });
  } catch {
    return NextResponse.json({ editions: [], total: 0 }, { status: 500 });
  }
}
