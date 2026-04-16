import Link from "next/link";
import PipelineAdvanceButton from "./_components/PipelineAdvanceButton";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  apikey:        SERVICE,
  Authorization: `Bearer ${SERVICE}`,
  "Content-Type": "application/json",
};

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

const LISTING_STYLE: Record<string, { bg: string; text: string }> = {
  NONE:     { bg: "bg-[#141d2c]", text: "text-[#526888]" },
  FREE:     { bg: "bg-[#141d2c]", text: "text-[#7a9ab5]" },
  PREMIUM:  { bg: "bg-[#1a1438]", text: "text-[#c084fc]" },
  DESTAQUE: { bg: "bg-[#38280f]", text: "text-[#fbbf24]" },
};

const PIPELINE_TABS = [
  { key: "",               label: "Todos" },
  { key: "REGISTERED",     label: "Cadastrados" },
  { key: "EMAIL_VERIFIED", label: "Validados" },
  { key: "COMPLETE",       label: "Completos" },
  { key: "ACTIVE",         label: "Ativos" },
  { key: "SUSPENDED",      label: "Suspensos" },
];

interface UserRow { name: string; email: string; }
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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function AdminAnunciantesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tipo?: string; q?: string }>;
}) {
  const { status, tipo, q } = await searchParams;

  let companies: Company[] = [];
  let totalAll       = 0;
  let totalActive    = 0;
  let totalPending   = 0;
  let totalDestaque  = 0;

  try {
    // KPIs — busca todos para contar
    const kpiRes = await fetch(
      `${BASE}/companies?select=pipelineStatus,listingType`,
      { headers: { ...HEADERS, Prefer: "count=exact" }, cache: "no-store" }
    );
    const kpiData: Array<{ pipelineStatus: string; listingType: string }> = await kpiRes.json().catch(() => []);
    totalAll      = kpiData.length;
    totalActive   = kpiData.filter((c) => c.pipelineStatus === "ACTIVE").length;
    totalPending  = kpiData.filter((c) => ["REGISTERED", "EMAIL_VERIFIED"].includes(c.pipelineStatus)).length;
    totalDestaque = kpiData.filter((c) => c.listingType === "DESTAQUE").length;

    // Lista filtrada
    let url = `${BASE}/companies?select=id,tradeName,email,segment,pipelineStatus,listingType,createdAt,users(name,email)&order=createdAt.desc&limit=50`;
    if (status) url += `&pipelineStatus=eq.${encodeURIComponent(status)}`;
    if (tipo)   url += `&listingType=eq.${encodeURIComponent(tipo)}`;
    if (q)      url += `&tradeName=ilike.*${encodeURIComponent(q)}*`;

    const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
    const data = await res.json();
    companies = Array.isArray(data) ? data : [];
  } catch {
    // DB unavailable
  }

  function buildHref(params: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, v); });
    return `/admin/anunciantes?${p}`;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Anunciantes
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {companies.length} empresa{companies.length !== 1 ? "s" : ""} exibida{companies.length !== 1 ? "s" : ""}
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

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total"    value={totalAll}     />
        <KpiCard label="Ativos"   value={totalActive}   color="text-[#22c55e]" />
        <KpiCard label="Pendentes" value={totalPending}  color="text-[#ef9f1b]" />
        <KpiCard label="Destaque" value={totalDestaque} color="text-[#fbbf24]" />
      </div>

      {/* Tabs pipeline */}
      <div className="flex flex-wrap gap-1 mb-4">
        {PIPELINE_TABS.map((t) => (
          <Link
            key={t.key}
            href={buildHref({ status: t.key || undefined, tipo, q })}
            className={`h-[34px] px-4 flex items-center rounded-[6px] text-[12px] font-semibold whitespace-nowrap transition-colors ${
              (status ?? "") === t.key
                ? "bg-[#ff1f1f] text-white"
                : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Filtros secundários */}
      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        {status && <input type="hidden" name="status" value={status} />}
        <select
          name="tipo"
          defaultValue={tipo ?? ""}
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f]"
        >
          <option value="">Todos os tipos</option>
          <option value="FREE">FREE</option>
          <option value="PREMIUM">PREMIUM</option>
          <option value="DESTAQUE">DESTAQUE</option>
        </select>
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar empresa..."
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-[250px]"
        />
        <button
          type="submit"
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[38px] px-4 rounded-[6px] transition-colors"
        >
          Filtrar
        </button>
        {(q || tipo) && (
          <Link
            href={buildHref({ status })}
            className="text-[#7a9ab5] hover:text-white text-[13px] h-[38px] flex items-center px-2 transition-colors"
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Tabela */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
        <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_100px] gap-3 hidden sm:grid">
          {["Empresa", "Dono", "Tipo", "Pipeline", "Segmento", "Ações"].map((h) => (
            <p key={h} className="text-white text-[11px] font-semibold tracking-[0.5px] uppercase">
              {h}
            </p>
          ))}
        </div>

        {companies.length === 0 ? (
          <p className="text-white text-[13px] p-8 text-center">Nenhuma empresa encontrada.</p>
        ) : (
          companies.map((c, i) => {
            const ps = PIPELINE_STYLE[c.pipelineStatus] ?? PIPELINE_STYLE.REGISTERED;
            const ls = LISTING_STYLE[c.listingType]     ?? LISTING_STYLE.NONE;

            // Status seguinte para avanço rápido
            const NEXT: Record<string, string> = {
              REGISTERED:     "EMAIL_VERIFIED",
              EMAIL_VERIFIED: "COMPLETE",
              COMPLETE:       "ACTIVE",
              ACTIVE:         "SUSPENDED",
            };
            const nextStatus = NEXT[c.pipelineStatus];

            return (
              <div key={c.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                <div className="px-5 py-3.5 grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_100px] gap-3 items-center hidden sm:grid">
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[13px] font-semibold truncate">{c.tradeName}</p>
                    {c.email && <p className="text-[#526888] text-[11px] truncate">{c.email}</p>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#7a9ab5] text-[13px] truncate">{c.users?.name ?? "—"}</p>
                    {c.users?.email && <p className="text-[#526888] text-[11px] truncate">{c.users.email}</p>}
                  </div>
                  <span className={`inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold w-fit ${ls.bg} ${ls.text}`}>
                    {c.listingType}
                  </span>
                  <span className={`inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold w-fit ${ps.bg} ${ps.text}`}>
                    {ps.label}
                  </span>
                  <p className="text-[#7a9ab5] text-[12px] truncate">
                    {SEGMENT_LABELS[c.segment ?? ""] ?? c.segment ?? "—"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/anunciantes/${c.id}`}
                      className="text-[#7a9ab5] hover:text-white text-[12px] transition-colors"
                    >
                      Editar
                    </Link>
                    {nextStatus && (
                      <PipelineAdvanceButton companyId={c.id} nextStatus={nextStatus} />
                    )}
                  </div>
                </div>

                {/* Mobile */}
                <div className="px-4 py-3.5 flex items-center justify-between gap-3 sm:hidden">
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[13px] font-semibold truncate">{c.tradeName}</p>
                    <p className="text-[#526888] text-[11px]">{c.users?.name ?? "—"}</p>
                    <p className="text-[#526888] text-[11px]">{fmtDate(c.createdAt)}</p>
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

function KpiCard({ label, value, color = "text-white" }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4">
      <p className="text-[#526888] text-[11px] font-semibold uppercase tracking-[0.8px] mb-1">{label}</p>
      <p className={`font-['Barlow_Condensed'] font-bold text-[28px] leading-none ${color}`}>{value}</p>
    </div>
  );
}

