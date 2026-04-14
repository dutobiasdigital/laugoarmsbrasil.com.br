import prisma from "@/lib/prisma";
import CategoriasClient from "./_CategoriasClient";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  let categories: { id: string; name: string; slug: string; _count: { articles: number } }[] = [];

  try {
    categories = await prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, _count: { select: { articles: true } } },
    });
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
