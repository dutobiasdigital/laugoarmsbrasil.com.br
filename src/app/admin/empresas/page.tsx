import Link from "next/link";

export const dynamic = "force-dynamic";

const SEGMENT_LABELS: Record<string, string> = {
  ARMAS:         "Armas",
  MUNICOES:      "Munições",
  ACESSORIOS:    "Acessórios",
  CACA:          "Caça",
  TIRO_ESPORTIVO:"Tiro Esportivo",
  OUTROS:        "Outros",
};

interface Advertiser {
  id: string;
  tradeName: string;
  legalName: string | null;
  contact: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  segment: string;
  logoUrl: string | null;
  createdAt: string;
}

async function getAdvertisers(q?: string): Promise<{ data: Advertiser[]; error?: string }> {
  try {
    const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
    const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    const filter   = q ? `&tradeName=ilike.*${encodeURIComponent(q)}*` : "";
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/advertisers?select=*&order=tradeName.asc${filter}`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const data = await res.json();
    return { data: Array.isArray(data) ? data : [] };
  } catch (e: unknown) {
    return { data: [], error: (e as Error).message };
  }
}

export default async function AdminEmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { data: empresas } = await getAdvertisers(q);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Empresas Anunciantes
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {empresas.length} empresa{empresas.length !== 1 ? "s" : ""} cadastrada{empresas.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/empresas/nova"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 flex items-center rounded-[6px] transition-colors"
        >
          + Nova Empresa
        </Link>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Filtro */}
      <form method="GET" className="flex gap-2 mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="🔍 Buscar empresa..."
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-[280px]"
        />
        <button type="submit" className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[38px] px-4 rounded-[6px] transition-colors">
          Filtrar
        </button>
        {q && (
          <Link href="/admin/empresas" className="text-[#7a9ab5] hover:text-white text-[13px] h-[38px] flex items-center px-2 transition-colors">
            Limpar
          </Link>
        )}
      </form>

      {/* Tabela */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
        <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-[2fr_2fr_1fr_1fr_1fr_80px] gap-3">
          {["Empresa", "Contato", "Segmento", "Email", "Telefone", ""].map((h) => (
            <p key={h} className="text-white text-[11px] font-semibold tracking-[0.5px] uppercase">{h}</p>
          ))}
        </div>

        {empresas.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-white text-[13px] mb-4">Nenhuma empresa cadastrada.</p>
            <Link href="/admin/empresas/nova" className="inline-flex bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[38px] px-5 items-center rounded-[6px] transition-colors">
              Cadastrar primeira empresa
            </Link>
          </div>
        ) : (
          empresas.map((em, i) => (
            <div key={em.id}>
              {i > 0 && <div className="bg-[#141d2c] h-px" />}
              <div className="px-5 py-3.5 grid grid-cols-[2fr_2fr_1fr_1fr_1fr_80px] gap-3 items-center">
                <div className="flex items-center gap-3 min-w-0">
                  {em.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={em.logoUrl} alt={em.tradeName} className="w-[32px] h-[32px] object-contain rounded-[4px] bg-[#141d2c] shrink-0" />
                  ) : (
                    <div className="w-[32px] h-[32px] bg-[#141d2c] rounded-[4px] flex items-center justify-center shrink-0">
                      <span className="text-white text-[14px]">🏢</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[14px] font-semibold truncate">{em.tradeName}</p>
                    {em.legalName && <p className="text-[#526888] text-[11px] truncate">{em.legalName}</p>}
                  </div>
                </div>
                <p className="text-[#7a9ab5] text-[13px] truncate">{em.contact ?? "—"}</p>
                <span className="inline-flex items-center h-[20px] px-2 rounded-[2px] text-[10px] font-bold bg-[#141d2c] text-[#7a9ab5] w-fit">
                  {SEGMENT_LABELS[em.segment] ?? em.segment}
                </span>
                <p className="text-[#7a9ab5] text-[12px] truncate">{em.email ?? "—"}</p>
                <p className="text-[#7a9ab5] text-[12px]">{em.phone ?? "—"}</p>
                <Link href={`/admin/empresas/${em.id}`} className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors text-right">
                  Editar →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
