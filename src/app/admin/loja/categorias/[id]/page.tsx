export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import CategoryForm from "../_CategoryForm";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let category: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    sortOrder: number;
  } | null = null;

  try {
    const res = await fetch(
      `${BASE}/shop_categories?id=eq.${id}&select=id,title,slug,description,isActive,sortOrder&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    category = Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    // DB unavailable
  }

  if (!category) notFound();

  const initial = {
    id: category.id,
    title: category.title,
    slug: category.slug,
    description: category.description ?? "",
    isActive: category.isActive,
    sortOrder: category.sortOrder,
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/loja" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Loja
        </Link>
        <span className="text-[#141d2c]">/</span>
        <Link href="/admin/loja/categorias" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Categorias
        </Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px] truncate max-w-[200px]">{category.title}</span>
      </div>

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Editar Categoria
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">{category.title}</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <CategoryForm mode="edit" initial={initial} />
    </>
  );
}
