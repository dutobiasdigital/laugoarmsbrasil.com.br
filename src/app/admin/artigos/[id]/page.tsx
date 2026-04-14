import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import ArticleEditForm from "./_ArticleEditForm";

export const dynamic = "force-dynamic";

export default async function EditarArtigoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    authorName: string;
    featureImageUrl: string | null;
    categoryId: string;
    isExclusive: boolean;
    status: string;
    publishedAt: Date | null;
  } | null = null;
  let categories: { id: string; name: string }[] = [];

  try {
    [article, categories] = await Promise.all([
      prisma.article.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          authorName: true,
          featureImageUrl: true,
          categoryId: true,
          isExclusive: true,
          status: true,
          publishedAt: true,
        },
      }),
      prisma.articleCategory.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
  } catch {
    // DB unavailable
  }

  if (!article) notFound();

  const serialized = {
    ...article,
    publishedAt: article.publishedAt?.toISOString().slice(0, 10) ?? null,
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/artigos"
          className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors"
        >
          ← Artigos
        </Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px] truncate max-w-[300px]">
          {article.title}
        </span>
      </div>

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Editar Artigo
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">{article.title}</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <ArticleEditForm article={serialized} categories={categories} />
    </>
  );
}
