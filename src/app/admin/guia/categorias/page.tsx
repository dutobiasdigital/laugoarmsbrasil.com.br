export const dynamic = "force-dynamic";

import Link from "next/link";
import GuiaCategoriasClient from "./_GuiaCategoriasClient";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

export interface GuiaCategory {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  shortCall: string | null;
  description: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  isActive: boolean;
  sortOrder: number;
  segmentKey: string | null;
}

export default async function GuiaCategoriasPage() {
  let categories: GuiaCategory[] = [];

  try {
    const res = await fetch(
      `${BASE}/guide_categories?select=id,title,slug,icon,shortCall,description,imageUrl,imageAlt,metaTitle,metaDescription,metaKeywords,isActive,sortOrder,segmentKey&order=sortOrder.asc`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    categories = Array.isArray(data) ? data : [];
  } catch {
    // DB unavailable
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] text-[#526888] mb-5">
        <Link href="/admin/guia" className="hover:text-[#d4d4da] transition-colors">
          Guia
        </Link>
        <span className="text-[#1c2a3e]">/</span>
        <span className="text-[#7a9ab5]">Categorias</span>
      </nav>

      {/* Header */}
      <div className="mb-1">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">
          Categorias do Guia
        </h1>
      </div>
      <p className="text-[#7a9ab5] text-[14px] mb-6">
        Gerencie as categorias de anunciantes do Guia Comercial
      </p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <GuiaCategoriasClient categories={categories} />
    </>
  );
}
