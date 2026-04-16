export const dynamic = "force-dynamic";

import Link from "next/link";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

export default async function CategoriasPage() {
  let categories: CategoryRow[] = [];
  let countMap: Record<string, number> = {};

  try {
    const [catRes, artRes] = await Promise.all([
      fetch(
        `${BASE}/article_categories?select=id,name,slug,isActive,sortOrder&order=sortOrder.asc,name.asc`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(`${BASE}/articles?select=categoryId`, { headers: HEADERS, cache: "no-store" }),
    ]);
    const catData = await catRes.json();
    const artData = await artRes.json();

    if (Array.isArray(artData)) {
      for (const a of artData) {
        if (a.categoryId) countMap[a.categoryId] = (countMap[a.categoryId] ?? 0) + 1;
      }
    }
    categories = Array.isArray(catData) ? catData : [];
  } catch {
    // DB unavailable
  }

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">
          Categorias
        </h1>
        <Link
          href="/admin/categorias/nova"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 rounded-[6px] transition-colors flex items-center gap-2"
        >
          + Nova Categoria
        </Link>
      </div>
      <p className="text-[#7a9ab5] text-[14px] mb-6">Categorias dos artigos do blog.</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <div className="max-w-[760px]">
        {categories.length === 0 ? (
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] px-6 py-12 text-center">
            <p className="text-[#526888] text-[14px]">Nenhuma categoria cadastrada.</p>
            <Link href="/admin/categorias/nova" className="mt-4 inline-block text-[#ff1f1f] hover:text-[#ff4444] text-[14px] transition-colors">
              Criar primeira categoria →
            </Link>
          </div>
        ) : (
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
            <div className="bg-[#141d2c] px-5 py-2.5 grid grid-cols-[1fr_60px_80px_80px] gap-4">
              <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Nome / Slug</p>
              <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Status</p>
              <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px] text-center">Artigos</p>
              <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]"></p>
            </div>

            {categories.map((cat, i) => (
              <div key={cat.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                <div className="px-5 py-3.5 grid grid-cols-[1fr_60px_80px_80px] gap-4 items-center">
                  <div>
                    <p className="text-[#d4d4da] text-[14px] font-medium">{cat.name}</p>
                    <p className="text-[#526888] text-[11px] font-mono mt-0.5">{cat.slug}</p>
                  </div>
                  <div>
                    {cat.isActive !== false ? (
                      <span className="inline-flex items-center gap-1 text-green-400 text-[11px] font-semibold">
                        <span className="w-[6px] h-[6px] rounded-full bg-green-400 inline-block" />
                        Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#526888] text-[11px] font-semibold">
                        <span className="w-[6px] h-[6px] rounded-full bg-[#526888] inline-block" />
                        Inativa
                      </span>
                    )}
                  </div>
                  <p className="text-[#7a9ab5] text-[13px] text-center">
                    {countMap[cat.id] ?? 0}
                  </p>
                  <div>
                    <Link
                      href={`/admin/categorias/${cat.id}`}
                      className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[11px] h-[30px] px-3 rounded-[6px] transition-colors flex items-center justify-center"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
