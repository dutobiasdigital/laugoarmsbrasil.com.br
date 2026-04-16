import Link from "next/link";
import CategoryForm from "../_CategoryForm";

export default function NovaCategoriaPage() {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/categorias" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Categorias
        </Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px]">Nova Categoria</span>
      </div>

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Nova Categoria
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">Crie uma nova categoria para os artigos do blog.</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <CategoryForm mode="create" />
    </>
  );
}
