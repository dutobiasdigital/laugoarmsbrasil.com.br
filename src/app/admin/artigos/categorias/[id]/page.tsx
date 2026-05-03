import { notFound } from "next/navigation";
import ArticleCategoryForm from "../_ArticleCategoryForm";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

async function getCategory(id: string) {
  try {
    const res = await fetch(
      `${BASE}/article_categories?id=eq.${id}&select=id,name,slug,description,sortOrder,isActive&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

export default async function EditArticleCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);
  if (!category) notFound();

  return (
    <div className="p-6 lg:p-10 max-w-[800px]">
      <div className="mb-6">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
          Editar Categoria
        </h1>
        <p className="text-[#7a9ab5] text-[14px]">{category.name}</p>
      </div>
      <div className="bg-[#141d2c] h-px mb-6" />
      <ArticleCategoryForm
        mode="edit"
        initial={{
          id: category.id,
          name: category.name,
          slug: category.slug ?? "",
          description: category.description ?? "",
          sortOrder: category.sortOrder ?? 0,
          isActive: category.isActive ?? true,
        }}
      />
    </div>
  );
}
