export const dynamic = "force-dynamic";

import GaleriaForm, { type MediaFileOption } from "../_GaleriaForm";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

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

export default async function NovaGaleriaPage() {
  const mediaFiles = await getMediaFiles();

  return (
    <>
      <div className="flex items-center gap-2 mb-6 text-[14px]">
        <a href="/admin/galerias" className="text-[#7a9ab5] hover:text-white transition-colors">Galerias</a>
        <span className="text-[#1c2a3e]">/</span>
        <span className="text-[#d4d4da]">Nova</span>
      </div>

      <div className="mb-6">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
          Nova Galeria
        </h1>
        <p className="text-[#7a9ab5] text-[14px]">Crie uma nova galeria de imagens</p>
      </div>
      <div className="bg-[#141d2c] h-px mb-6" />

      <GaleriaForm mode="create" mediaFiles={mediaFiles} />
    </>
  );
}
