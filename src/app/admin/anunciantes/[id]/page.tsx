import Link from "next/link";
import { notFound } from "next/navigation";
import CompanyEditForm from "./_CompanyEditForm";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  apikey:         SERVICE,
  Authorization:  `Bearer ${SERVICE}`,
  "Content-Type": "application/json",
};

const PIPELINE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  REGISTERED:     { bg: "bg-[#141d2c]", text: "text-[#7a9ab5]", label: "Cadastrado"      },
  EMAIL_VERIFIED: { bg: "bg-[#0f2438]", text: "text-[#60a5fa]", label: "E-mail Validado" },
  COMPLETE:       { bg: "bg-[#1a1f0f]", text: "text-[#a3e635]", label: "Completo"         },
  ACTIVE:         { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "Ativo"            },
  SUSPENDED:      { bg: "bg-[#380f0f]", text: "text-[#f87171]", label: "Suspenso"         },
};

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface UserRow { id: string; name: string; email: string; }
interface Company {
  id: string;
  userId: string | null;
  tradeName: string;
  email: string | null;
  phone: string | null;
  segment: string | null;
  pipelineStatus: string;
  listingType: string;
  cnpj: string | null;
  razaoSocial: string | null;
  legalName: string | null;
  website: string | null;
  instagram: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  notes: string | null;
  createdAt: string;
  users: UserRow | null;
}

export default async function AdminAnuncianteEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(
    `${BASE}/companies?id=eq.${id}&select=*,users(id,name,email)`,
    { headers: HEADERS, cache: "no-store" }
  );
  const data: Company[] = await res.json().catch(() => []);
  const company = data[0];
  if (!company) notFound();

  const ps = PIPELINE_STYLE[company.pipelineStatus] ?? PIPELINE_STYLE.REGISTERED;

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/anunciantes" className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors">
          ← Anunciantes
        </Link>
        <div className="bg-[#141d2c] w-px h-4" />
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">
          {company.tradeName}
        </h1>
        <span className={`inline-flex items-center h-[22px] px-3 rounded-full text-[10px] font-bold ${ps.bg} ${ps.text}`}>
          {ps.label}
        </span>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Formulário principal */}
        <CompanyEditForm company={company} />

        {/* Sidebar de info */}
        <div className="flex flex-col gap-4">
          {/* Dono */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4">
            <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-3">
              Proprietário
            </p>
            {company.users ? (
              <div>
                <p className="text-[#d4d4da] text-[13px] font-medium">{company.users.name}</p>
                <p className="text-[#526888] text-[11px] mb-2">{company.users.email}</p>
                <Link
                  href={`/admin/usuarios/${company.users.id}`}
                  className="text-[#7a9ab5] hover:text-white text-[12px] transition-colors"
                >
                  Ver perfil →
                </Link>
              </div>
            ) : (
              <p className="text-[#526888] text-[13px]">Sem proprietário vinculado.</p>
            )}
          </div>

          {/* Histórico pipeline */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4">
            <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-3">
              Pipeline
            </p>
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-[#526888] text-[10px] uppercase font-semibold tracking-[0.8px] mb-0.5">
                  Status atual
                </p>
                <span className={`inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold ${ps.bg} ${ps.text}`}>
                  {ps.label}
                </span>
              </div>
              <div>
                <p className="text-[#526888] text-[10px] uppercase font-semibold tracking-[0.8px] mb-0.5">
                  Cadastrado em
                </p>
                <p className="text-[#d4d4da] text-[13px]">{fmtDate(company.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* ID / referência */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4">
            <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-3">
              Referência
            </p>
            <p className="text-[#526888] text-[10px] uppercase font-semibold tracking-[0.8px] mb-0.5">ID</p>
            <p className="text-[#7a9ab5] text-[11px] font-mono break-all">{company.id}</p>
          </div>
        </div>
      </div>
    </>
  );
}
