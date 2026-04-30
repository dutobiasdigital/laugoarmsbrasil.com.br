export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import GaleriaForm, { type MediaFileOption, type GaleriaData } from "../_GaleriaForm";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

async function getGaleria(id: string): Promise<GaleriaData | null> {
  try {
    const [galRes, itemsRes] = await Promise.all([
      fetch(`${BASE}/galleries?id=eq.${id}&select=*&limit=1`, {
        headers: HEADERS,
        cache: "no-store",
      }),
      fetch(`${BASE}/gallery_items?gallery_id=eq.${id}&select=*&order=sort_order.asc`, {
        headers: HEADERS,
        cache: "no-store",
      }),
    ]);

    const galData   = await galRes.json();
    const itemsData = await itemsRes.json();

    const gal = Array.isArray(galData) ? galData[0] : null;
    if (!gal) return null;

    return {
      id:          gal.id,
      title:       gal.title,
      slug:        gal.slug,
      description: gal.description ?? "",
      cover_url:   gal.cover_url ?? "",
      is_active:   gal.is_active ?? true,
      sort_order:  gal.sort_order ?? 0,
      items:       Array.isArray(itemsData) ? itemsData : [],
    };
  } catch {
    return null;
  }
}

async function getMediaFiles(): Promise<MediaFileOption[]> {
  try {
    const res = await fetch(
      `${BASE}/media_files?select=id,url,filename,alt_text,type&type=in.(image,video)&order=created_at.desc&limit=96`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function EditarGaleriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [galeria, mediaFiles] = await Promise.all([getGaleria(id), getMediaFiles()]);

  if (!galeria) notFound();

  return (
    <>
      <div className="flex items-center gap-2 mb-6 text-[14px]">
        <a href="/admin/galerias" className="text-[#7a9ab5] hover:text-white transition-colors">Galerias</a>
        <span className="text-[#1c2a3e]">/</span>
        <span className="text-[#d4d4da]">Editar</span>
      </div>

      <div className="mb-6">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
          Editar Galeria
        </h1>
        <p className="text-[#7a9ab5] text-[14px]">{galeria.title}</p>
      </div>
      <div className="bg-[#141d2c] h-px mb-6" />

      <GaleriaForm mode="edit" initial={galeria} mediaFiles={mediaFiles} />
    </>
  );
}
