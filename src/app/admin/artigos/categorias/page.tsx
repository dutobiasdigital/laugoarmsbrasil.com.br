import Link from "next/link";
import DeleteCategoryButton from "./_DeleteCategoryButton";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

async function getCategories(): Promise<ArticleCategory[]> {
  try {
    const res = await fetch(
      `${BASE}/article_categories?select=id,name,slug,description,sortOrder,isActive&order=sortOrder.asc,name.asc`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function ArticleCategoriasPage() {
  const categories = await getCategories();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Categorias de Artigos
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {categories.length} {categories.length === 1 ? "categoria" : "categorias"} cadastradas
          </p>
        </div>
        <Link
          href="/admin/artigos/categorias/nova"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 flex items-center rounded-[6px] transition-colors"
        >
          + Nova Categoria
        </Link>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
        {/* Header */}
        <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-5 gap-3">
          {["Nome", "Slug", "Ordem", "Status", "Ações"].map((h) => (
            <p key={h} className="text-white text-[11px] font-semibold tracking-[0.5px]">{h}</p>
          ))}
        </div>

        {categories.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[#7a9ab5] text-[14px] mb-4">Nenhuma categoria cadastrada.</p>
            <Link
              href="/admin/artigos/categorias/nova"
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[36px] px-5 inline-flex items-center rounded-[6px] transition-colors"
            >
              + Nova Categoria
            </Link>
          </div>
        ) : (
          categories.map((cat, i) => (
            <div key={cat.id}>
              {i > 0 && <div className="bg-[#141d2c] h-px" />}
              <div className="px-5 py-3.5 grid grid-cols-5 gap-3 items-center">
                <p className="text-[#d4d4da] text-[14px] font-medium truncate">{cat.name}</p>
                <p className="text-[#526888] text-[13px] font-mono truncate">{cat.slug}</p>
                <p className="text-[#7a9ab5] text-[13px]">{cat.sortOrder}</p>
                <span className={`inline-flex items-center h-[20px] px-2.5 rounded-full text-[10px] font-bold ${
                  cat.isActive
                    ? "bg-[#0f381f] text-[#22c55e]"
                    : "bg-[#141d2c] text-[#526888]"
                }`}>
                  {cat.isActive ? "ATIVA" : "INATIVA"}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/artigos/categorias/${cat.id}`}
                    className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors"
                  >
                    Editar
                  </Link>
                  <DeleteCategoryButton id={cat.id} name={cat.name} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
