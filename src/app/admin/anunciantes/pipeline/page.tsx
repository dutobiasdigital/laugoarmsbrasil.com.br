import Link from "next/link";
import PipelineCard from "./_PipelineCard";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  apikey:        SERVICE,
  Authorization: `Bearer ${SERVICE}`,
  "Content-Type": "application/json",
};

const STAGES: Array<{ key: string; label: string; next?: string }> = [
  { key: "REGISTERED",     label: "Cadastrado",       next: "EMAIL_VERIFIED" },
  { key: "EMAIL_VERIFIED", label: "E-mail Validado",  next: "COMPLETE"       },
  { key: "COMPLETE",       label: "Dados Completos",  next: "ACTIVE"         },
  { key: "ACTIVE",         label: "Ativo",            next: "SUSPENDED"      },
  { key: "SUSPENDED",      label: "Suspenso"                                  },
];

const STAGE_HEADER_STYLE: Record<string, string> = {
  REGISTERED:     "border-[#526888] text-[#526888]",
  EMAIL_VERIFIED: "border-[#60a5fa] text-[#60a5fa]",
  COMPLETE:       "border-[#a3e635] text-[#a3e635]",
  ACTIVE:         "border-[#22c55e] text-[#22c55e]",
  SUSPENDED:      "border-[#f87171] text-[#f87171]",
};

const LISTING_STYLE: Record<string, { bg: string; text: string }> = {
  NONE:     { bg: "bg-[#141d2c]", text: "text-[#526888]" },
  FREE:     { bg: "bg-[#141d2c]", text: "text-[#7a9ab5]" },
  PREMIUM:  { bg: "bg-[#1a1438]", text: "text-[#c084fc]" },
  DESTAQUE: { bg: "bg-[#38280f]", text: "text-[#fbbf24]" },
};

const SEGMENT_LABELS: Record<string, string> = {
  ARMAS:          "Armas",
  MUNICOES:       "Munições",
  ACESSORIOS:     "Acessórios",
  CACA:           "Caça",
  TIRO_ESPORTIVO: "Tiro Esportivo",
  OUTROS:         "Outros",
};

interface Company {
  id: string;
  tradeName: string;
  segment: string | null;
  listingType: string;
  pipelineStatus: string;
  createdAt: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export default async function AdminPipelinePage() {
  let companies: Company[] = [];

  try {
    const res = await fetch(
      `${BASE}/companies?select=id,tradeName,segment,listingType,pipelineStatus,createdAt&order=createdAt.desc`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    companies = Array.isArray(data) ? data : [];
  } catch {
    // DB unavailable
  }

  const byStage = STAGES.reduce<Record<string, Company[]>>((acc, s) => {
    acc[s.key] = companies.filter((c) => c.pipelineStatus === s.key);
    return acc;
  }, {});

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Pipeline de Anunciantes
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">{companies.length} empresa{companies.length !== 1 ? "s" : ""} no pipeline</p>
        </div>
        <Link
          href="/admin/anunciantes"
          className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors"
        >
          ← Voltar à lista
        </Link>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {STAGES.map((stage) => {
          const stageCompanies = byStage[stage.key] ?? [];
          const headerCls = STAGE_HEADER_STYLE[stage.key] ?? "border-[#526888] text-[#526888]";

          return (
            <div key={stage.key} className="flex flex-col gap-3">
              {/* Cabeçalho da coluna */}
              <div className={`border-t-2 pt-2 ${headerCls}`}>
                <p className="text-[11px] font-bold tracking-[1px] uppercase">{stage.label}</p>
                <p className="text-[#526888] text-[11px] mt-0.5">{stageCompanies.length} empresa{stageCompanies.length !== 1 ? "s" : ""}</p>
              </div>

              {/* Cards */}
              {stageCompanies.length === 0 ? (
                <div className="bg-[#0e1520] border border-dashed border-[#1c2a3e] rounded-[8px] p-4 text-center">
                  <p className="text-[#526888] text-[12px]">Nenhuma</p>
                </div>
              ) : (
                stageCompanies.map((c) => {
                  const ls = LISTING_STYLE[c.listingType] ?? LISTING_STYLE.NONE;
                  return (
                    <PipelineCard
                      key={c.id}
                      companyId={c.id}
                      tradeName={c.tradeName}
                      segment={SEGMENT_LABELS[c.segment ?? ""] ?? c.segment ?? "—"}
                      createdAt={fmtDate(c.createdAt)}
                      listingType={c.listingType}
                      listingBg={ls.bg}
                      listingText={ls.text}
                      nextStatus={stage.next}
                    />
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
