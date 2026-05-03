import ArticleCategoryForm from "../_ArticleCategoryForm";

export const dynamic = "force-dynamic";

export default function NovaArticleCategoriaPage() {
  return (
    <div className="p-6 lg:p-10 max-w-[800px]">
      <div className="mb-6">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
          Nova Categoria de Artigos
        </h1>
        <p className="text-[#7a9ab5] text-[14px]">Crie uma nova categoria para organizar os artigos</p>
      </div>
      <div className="bg-[#141d2c] h-px mb-6" />
      <ArticleCategoryForm mode="create" />
    </div>
  );
}
