export const dynamic = "force-dynamic";

import Link from "next/link";
import CategoryForm, { type CategoryOption } from "../_CategoryForm";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

async function getAllCategories(): Promise<CategoryOption[]> {
  try {
    const res = await fetch(
      `${BASE}/shop_categories?select=id,title,parentId&isActive=eq.true&order=sortOrder.asc,title.asc`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export default async function NovaCategoriaPage() {
  const allCategories = await getAllCategories();

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/loja" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Loja
        </Link>
        <span className="text-[#26262C]">/</span>
        <Link href="/admin/loja/categorias" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Categorias
        </Link>
        <span className="text-[#26262C]">/</span>
        <span className="text-[#d4d4da] text-[14px]">Nova</span>
      </div>

      <h1 className="font-['Archivo'] font-bold text-white text-[32px] leading-none mb-1">
        Nova Categoria
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">Crie uma nova categoria ou subcategoria para a loja</p>
      <div className="bg-[#26262C] h-px mb-6" />

      <CategoryForm mode="create" allCategories={allCategories} />
    </>
  );
}
