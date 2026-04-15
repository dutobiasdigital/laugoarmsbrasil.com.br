import CategoriasClient from "./_CategoriasClient";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

export default async function CategoriasPage() {
  let categories: { id: string; name: string; slug: string; _count: { articles: number } }[] = [];

  try {
    const [catRes, artRes] = await Promise.all([
      fetch(`${BASE}/article_categories?select=id,name,slug&order=name.asc`, { headers: HEADERS, cache: "no-store" }),
      fetch(`${BASE}/articles?select=categoryId`, { headers: HEADERS, cache: "no-store" }),
    ]);
    const catData = await catRes.json();
    const artData = await artRes.json();

    const countMap: Record<string, number> = {};
    if (Array.isArray(artData)) {
      for (const a of artData) {
        if (a.categoryId) countMap[a.categoryId] = (countMap[a.categoryId] ?? 0) + 1;
      }
    }

    categories = Array.isArray(catData)
      ? catData.map((c: { id: string; name: string; slug: string }) => ({
          ...c,
          _count: { articles: countMap[c.id] ?? 0 },
        }))
      : [];
  } catch {
    // DB unavailable
  }

  return (
    <>
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Categorias
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">Gerencie as categorias dos artigos do blog.</p>
      <div className="bg-[#141d2c] h-px mb-6" />
      <CategoriasClient categories={categories} />
    </>
  );
}
