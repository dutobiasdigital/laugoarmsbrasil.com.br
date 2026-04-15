import ConfiguracoesClient from "./_ConfiguracoesClient";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

async function getSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${BASE}/site_settings?select=key,value`, {
      headers: HEADERS, cache: "no-store",
    });
    const rows: { key: string; value: string | null }[] = await res.json();
    if (!Array.isArray(rows)) return {};
    const obj: Record<string, string> = {};
    for (const r of rows) obj[r.key] = r.value ?? "";
    return obj;
  } catch { return {}; }
}

async function getAdmins() {
  try {
    const res = await fetch(
      `${BASE}/users?role=eq.ADMIN&select=id,name,email,createdAt&order=createdAt.asc`,
      { headers: HEADERS, cache: "no-store" }
    );
    const rows: { id: string; name: string; email: string; createdAt: string }[] = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows.map(a => ({
      ...a,
      createdAt: new Date(a.createdAt).toLocaleDateString("pt-BR"),
    }));
  } catch { return []; }
}

export default async function AdminConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { aba } = await searchParams;
  const [settings, admins] = await Promise.all([getSettings(), getAdmins()]);

  return (
    <>
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Configurações
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">
        Gerencie o site, integrações, e-mail e acesso administrativo.
      </p>
      <div className="bg-[#141d2c] h-px mb-6" />
      <ConfiguracoesClient initialTab={aba ?? "integracoes"} settings={settings} admins={admins} />
    </>
  );
}
