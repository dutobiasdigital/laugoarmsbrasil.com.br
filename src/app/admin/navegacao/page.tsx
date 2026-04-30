export const dynamic = "force-dynamic";

import NavegacaoClient from "./_NavegacaoClient";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

async function getNavSettings() {
  try {
    const res = await fetch(
      `${BASE}/site_settings?key=in.(nav.menu,nav.footer)&select=key,value`,
      { headers: HEADERS, cache: "no-store" }
    );
    const rows: { key: string; value: string | null }[] = await res.json();
    if (!Array.isArray(rows)) return { menu: "[]", footer: "[]" };

    const menu   = rows.find((r) => r.key === "nav.menu")?.value   ?? "[]";
    const footer = rows.find((r) => r.key === "nav.footer")?.value ?? "[]";
    return { menu, footer };
  } catch {
    return { menu: "[]", footer: "[]" };
  }
}

export default async function NavegacaoPage() {
  const { menu, footer } = await getNavSettings();

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">
          Navegação
        </h1>
      </div>
      <p className="text-[#7a9ab5] text-[14px] mb-6">Configure o menu principal e os links do rodapé</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <NavegacaoClient menuJson={menu} footerJson={footer} />
    </>
  );
}
