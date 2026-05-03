import HomeEditor from "./_HomeEditor";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

async function getHomeContent(): Promise<string> {
  try {
    const res = await fetch(
      `${BASE}/site_settings?key=eq.home.content&select=value&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    if (!res.ok) return "";
    const rows: { value: string | null }[] = await res.json();
    return rows?.[0]?.value ?? "";
  } catch {
    return "";
  }
}

export default async function AdminHomePage() {
  const content = await getHomeContent();

  return (
    <div className="p-6 lg:p-10 max-w-[1000px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Home
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            Conteúdo HTML exibido na página inicial abaixo do hero
          </p>
        </div>
      </div>
      <div className="bg-[#141d2c] h-px mb-6" />
      <HomeEditor initialContent={content} />
    </div>
  );
}
