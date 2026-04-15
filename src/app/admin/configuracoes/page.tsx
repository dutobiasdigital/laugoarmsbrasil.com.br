import ConfiguracoesClient from "./_ConfiguracoesClient";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function getSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?select=key,value`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const rows: { key: string; value: string | null }[] = await res.json();
    if (!Array.isArray(rows)) return {};
    const obj: Record<string, string> = {};
    for (const r of rows) obj[r.key] = r.value ?? "";
    return obj;
  } catch { return {}; }
}

export default async function AdminConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { aba } = await searchParams;
  const settings = await getSettings();

  let admins: { id: string; name: string; email: string; createdAt: string }[] = [];
  try {
    const raw = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    admins = raw.map(a => ({ ...a, createdAt: a.createdAt.toLocaleDateString("pt-BR") }));
  } catch { /* DB unavailable */ }

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
