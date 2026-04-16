import Link from "next/link";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

const SEGMENT_LABELS: Record<string, string> = {
  ARMAS:          "Armas",
  MUNICOES:       "Munições",
  ACESSORIOS:     "Acessórios",
  CACA:           "Caça",
  TIRO_ESPORTIVO: "Tiro Esportivo",
  OUTROS:         "Outros",
};

const PIPELINE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  REGISTERED:     { bg: "bg-[#141d2c]", text: "text-[#7a9ab5]", label: "Cadastrado"      },
  EMAIL_VERIFIED: { bg: "bg-[#0f2438]", text: "text-[#60a5fa]", label: "E-mail Validado" },
  COMPLETE:       { bg: "bg-[#1a1f0f]", text: "text-[#a3e635]", label: "Completo"         },
  ACTIVE:         { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "Ativo"            },
  SUSPENDED:      { bg: "bg-[#380f0f]", text: "text-[#f87171]", label: "Suspenso"         },
};

interface UserRow { name: string | null; email: string | null; }
interface Company {
  id: string;
  tradeName: string;
  email: string | null;
  segment: string | null;
  pipelineStatus: string;
  listingType: string;
  createdAt: string;
  users: UserRow | null;
}

export default async function AdminEmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let companies: Company[] = [];

  try {
    let url = `${BASE}/companies?select=id,tradeName,email,segment,pipelineStatus,listingType,createdAt,users(name,email)&order=tradeName.asc`;
    if (q) url += `&tradeName=ilike.*${encodeURIComponent(q)}*`;

    const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
    const data = await res.json();
    companies = Array.isArray(data) ? data : [];
  } catch {
    // DB unavailable
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Empresas Anunciantes
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {companies.length} empresa{companies.length !== 1 ? "s" : ""} cadastrada{companies.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/anunciantes/nova"
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
          placeholder="Buscar empresa..."
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
        <div className="bg-[#141d2c] px-5 py-3 hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-3">
          {["Empresa", "Dono", "Segmento", "Tipo", "Status", ""].map((h) => (
            <p key={h} className="text-white text-[11px] font-semibold tracking-[0.5px] uppercase">{h}</p>
          ))}
        </div>

        {companies.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-[#7a9ab5] text-[13px] mb-4">Nenhuma empresa cadastrada.</p>
            <Link href="/admin/anunciantes/nova" className="inline-flex bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[38px] px-5 items-center rounded-[6px] transition-colors">
              Cadastrar primeira empresa
            </Link>
          </div>
        ) : (
          companies.map((c, i) => {
            const ps = PIPELINE_STYLE[c.pipelineStatus] ?? PIPELINE_STYLE.REGISTERED;
            return (
              <div key={c.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                <div className="px-5 py-3.5 hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-3 items-center">
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[14px] font-semibold truncate">{c.tradeName}</p>
                    {c.email && <p className="text-[#526888] text-[11px] truncate">{c.email}</p>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#7a9ab5] text-[13px] truncate">{c.users?.name ?? "—"}</p>
                    {c.users?.email && <p className="text-[#526888] text-[11px] truncate">{c.users.email}</p>}
                  </div>
                  <p className="text-[#7a9ab5] text-[13px]">
                    {SEGMENT_LABELS[c.segment ?? ""] ?? c.segment ?? "—"}
                  </p>
                  <span className="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold bg-[#141d2c] text-[#7a9ab5] w-fit">
                    {c.listingType}
                  </span>
                  <span className={`inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold w-fit ${ps.bg} ${ps.text}`}>
                    {ps.label}
                  </span>
                  <Link href={`/admin/anunciantes/${c.id}`} className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors text-right">
                    Editar →
                  </Link>
                </div>

                {/* Mobile */}
                <div className="px-4 py-3.5 flex items-center justify-between gap-3 sm:hidden">
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[13px] font-semibold truncate">{c.tradeName}</p>
                    <p className="text-[#526888] text-[11px] truncate">{c.users?.name ?? "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold ${ps.bg} ${ps.text}`}>
                      {ps.label}
                    </span>
                    <Link href={`/admin/anunciantes/${c.id}`} className="text-[#526888] hover:text-white text-[12px] transition-colors">
                      Editar →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
