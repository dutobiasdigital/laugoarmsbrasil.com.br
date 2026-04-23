import MediaLibraryClient from "./_components/MediaLibraryClient";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

async function fetchInitial() {
  try {
    const res = await fetch(
      `${BASE}/media_files?select=*&order=created_at.desc&limit=48`,
      { headers: { ...HEADERS, Prefer: "count=exact" }, cache: "no-store" }
    );
    const contentRange = res.headers.get("Content-Range");
    let total = 0;
    if (contentRange) {
      const m = contentRange.match(/\/(\d+)$/);
      if (m) total = parseInt(m[1], 10);
    }
    const files = await res.json();
    return { files: Array.isArray(files) ? files : [], total };
  } catch {
    return { files: [], total: 0 };
  }
}

export default async function AdminMidiasPage() {
  const { files, total } = await fetchInitial();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Biblioteca de Mídias
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {total.toLocaleString("pt-BR")} arquivo(s) no acervo
          </p>
        </div>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      <MediaLibraryClient initialFiles={files} initialTotal={total} />
    </>
  );
}
