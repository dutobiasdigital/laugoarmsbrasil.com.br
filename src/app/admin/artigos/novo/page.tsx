import ArticleForm from "./_ArticleForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

export default async function NovoArtigoPage() {
  let categories: { id: string; name: string }[] = [];

  try {
    const res = await fetch(`${BASE}/article_categories?select=id,name&order=name.asc`, {
      headers: HEADERS,
      cache: "no-store",
    });
    const data = await res.json();
    categories = Array.isArray(data) ? data : [];
  } catch {
    // DB unavailable
  }

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
        <span className="text-[#d4d4da] text-[14px]">Novo Artigo</span>
      </div>

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Novo Artigo
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">
        Preencha os dados para criar um novo artigo no blog.
      </p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <ArticleForm categories={categories} />
    </>
  );
}
