export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

import DesignForm from "./_DesignForm";

export default async function DesignSystemPage() {
  let cfg: Record<string, string> = {};
  try {
    const res = await fetch(
      `${BASE}/site_settings?key=like.brand.%25&select=key,value`,
      { headers: HEADERS, cache: "no-store" }
    );
    const rows: { key: string; value: string | null }[] = await res.json();
    if (Array.isArray(rows)) {
      for (const r of rows) if (r.value) cfg[r.key] = r.value;
    }
  } catch { /* DB unavailable */ }

  return (
    <>
      <div className="mb-6">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
          Design System
        </h1>
        <p className="text-[#7a9ab5] text-[14px]">
          Logotipos, cores e tipografia — aplicados em todo o site automaticamente.
        </p>
      </div>
      <div className="bg-[#141d2c] h-px mb-6" />
      <DesignForm cfg={cfg} />
    </>
  );
}
