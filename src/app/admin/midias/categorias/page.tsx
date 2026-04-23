import Link from "next/link";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const FOLDERS = ["geral", "artigos", "edicoes", "loja", "banners", "hero"];

interface FolderStat {
  folder: string;
  count: bigint | number;
}

async function fetchStats(): Promise<FolderStat[]> {
  try {
    const res = await fetch(
      `${BASE}/media_files?select=folder&order=folder.asc`,
      { headers: HEADERS, cache: "no-store" }
    );
    const rows: { folder: string }[] = await res.json();
    const counts: Record<string, number> = {};
    rows.forEach((r) => { counts[r.folder] = (counts[r.folder] ?? 0) + 1; });
    return Object.entries(counts).map(([folder, count]) => ({ folder, count }));
  } catch {
    return [];
  }
}

export default async function AdminMidiasCategoraisPage() {
  const stats = await fetchStats();
  const statMap = Object.fromEntries(stats.map((s) => [s.folder, Number(s.count)]));

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Pastas de Mídias
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            Organização dos arquivos por categoria
          </p>
        </div>
        <Link
          href="/admin/midias"
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-[#526888] text-[#7a9ab5] hover:text-white text-[13px] h-[38px] px-4 flex items-center rounded-[6px] transition-colors"
        >
          ← Biblioteca
        </Link>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {FOLDERS.map((folder) => {
          const count = statMap[folder] ?? 0;
          return (
            <Link
              key={folder}
              href={`/admin/midias?folder=${folder}`}
              className="bg-[#0e1520] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[10px] p-5 flex flex-col gap-3 transition-colors group"
            >
              <div className="w-10 h-10 bg-[#141d2c] rounded-[8px] flex items-center justify-center group-hover:bg-[#1c2a3e] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="#7a9ab5" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
                  className="w-5 h-5">
                  <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
              <div>
                <p className="text-[#d4d4da] text-[14px] font-semibold capitalize">{folder}</p>
                <p className="text-[#526888] text-[12px] mt-0.5">
                  {count.toLocaleString("pt-BR")} arquivo(s)
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Orphaned folders */}
      {stats.filter((s) => !FOLDERS.includes(s.folder)).length > 0 && (
        <>
          <div className="bg-[#141d2c] h-px my-6" />
          <p className="text-[#7a9ab5] text-[13px] mb-3">Pastas adicionais</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {stats
              .filter((s) => !FOLDERS.includes(s.folder))
              .map((s) => (
                <Link
                  key={s.folder}
                  href={`/admin/midias?folder=${s.folder}`}
                  className="bg-[#0e1520] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[10px] p-5 flex flex-col gap-3 transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#141d2c] rounded-[8px] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                      stroke="#526888" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
                      className="w-5 h-5">
                      <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#d4d4da] text-[14px] font-semibold">{s.folder}</p>
                    <p className="text-[#526888] text-[12px] mt-0.5">
                      {Number(s.count).toLocaleString("pt-BR")} arquivo(s)
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </>
      )}
    </>
  );
}
