import { notFound } from "next/navigation";
import Link from "next/link";
import ArticleEditForm from "./_ArticleEditForm";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

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
    featureImageAlt: string | null;
    categoryId: string;
    isExclusive: boolean;
    status: string;
    publishedAt: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;
    canonicalUrl: string | null;
  } | null = null;
  let categories: { id: string; name: string }[] = [];

  try {
    const [artRes, catRes] = await Promise.all([
      fetch(
        `${BASE}/articles?id=eq.${id}&select=id,title,slug,excerpt,content,authorName,featureImageUrl,featureImageAlt,categoryId,isExclusive,status,publishedAt,seoTitle,seoDescription,seoKeywords,canonicalUrl&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/article_categories?select=id,name&order=name.asc`,
        { headers: HEADERS, cache: "no-store" }
      ),
    ]);

    const artData = await artRes.json();
    const catData = await catRes.json();

    article = Array.isArray(artData) && artData.length > 0 ? artData[0] : null;
    categories = Array.isArray(catData) ? catData : [];
  } catch {
    // DB unavailable
  }

  if (!article) notFound();
  const art = article!;

  const serialized = {
    ...art,
    publishedAt: art.publishedAt ? art.publishedAt.slice(0, 10) : null,
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
          {art.title}
        </span>
      </div>

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Editar Artigo
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">{art.title}</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <ArticleEditForm article={serialized} categories={categories} />
    </>
  );
}
