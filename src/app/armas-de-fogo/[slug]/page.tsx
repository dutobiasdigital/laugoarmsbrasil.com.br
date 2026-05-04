import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface ShopCategory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

async function getCategory(slug: string): Promise<ShopCategory | null> {
  try {
    const res = await fetch(
      `${BASE}/shop_categories?slug=eq.${encodeURIComponent(slug)}&isActive=eq.true&select=id,title,slug,description,imageUrl,metaTitle,metaDescription&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch { return null; }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) return {};
  return {
    title: cat.metaTitle || `${cat.title} — Laúgo Arms Brasil`,
    description: cat.metaDescription || undefined,
    openGraph: cat.imageUrl ? { images: [cat.imageUrl] } : undefined,
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      <div className="mt-16 flex-1">
        {category.description ? (
          <div
            className="overflow-hidden"
            dangerouslySetInnerHTML={{ __html: category.description }}
          />
        ) : (
          <div className="flex items-center justify-center py-24 text-center">
            <p className="font-['Barlow_Condensed'] font-bold text-[#526888] text-[22px]">
              Conteúdo em breve
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
