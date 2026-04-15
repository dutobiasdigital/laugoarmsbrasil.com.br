import Link from "next/link";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const CATEGORY_LABELS: Record<string, string> = {
  ARMAREIRO:   "Armareiro", CLUBE_TIRO: "Clube de Tiro", MUNICOES: "Munições",
  CACA:        "Caça e Pesca", JURIDICO: "Jurídico", TREINAMENTO: "Treinamento",
  MANUTENCAO:  "Manutenção", IMPORTACAO: "Importação", TRANSPORTE: "Transporte",
  SEGURO:      "Seguros", OUTROS: "Outros",
};

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  FREE:      { label: "Gratuito",  color: "bg-[#141d2c] text-[#526888]" },
  PREMIUM:   { label: "Premium",   color: "bg-[#1a1a40] text-[#818cf8]" },
  DESTAQUE:  { label: "Destaque",  color: "bg-[#260a0a] text-[#ff1f1f]" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pendente",  color: "bg-[#1a1a0a] text-[#facc15]" },
  ACTIVE:    { label: "Ativo",     color: "bg-[#0f381f] text-[#22c55e]" },
  SUSPENDED: { label: "Suspenso",  color: "bg-[#141d2c] text-[#526888]" },
};

interface Listing {
  id: string; slug: string; name: string; category: string;
  plan: string; status: string; city: string; state: string;
  phone: string | null; email: string | null; featured: boolean;
  viewsCount: number; createdAt: string;
}

async function getListings(status?: string): Promise<Listing[]> {
  try {
    let url = `https://${PROJECT}.supabase.co/rest/v1/guide_listings?select=id,slug,name,category,plan,status,city,state,phone,email,featured,viewsCount,createdAt&order=createdAt.desc`;
    if (status) url += `&status=eq.${status}`;
    const res = await fetch(url, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" });
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

async function getStats() {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/guide_listings?select=status`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: "count=exact" }, cache: "no-store" }
    );
    const d: { status: string }[] = await res.json();
    if (!Array.isArray(d)) return { total: 0, pending: 0, active: 0, suspended: 0 };
    return {
      total:     d.length,
      pending:   d.filter(r => r.status === "PENDING").length,
      active:    d.filter(r => r.status === "ACTIVE").length,
      suspended: d.filter(r => r.status === "SUSPENDED").length,
    };
  } catch { return { total: 0, pending: 0, active: 0, suspended: 0 }; }
}

export default async function AdminGuiaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const [listings, stats] = await Promise.all([getListings(status), getStats()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none">Guia Comercial</h1>
          <p className="text-[#526888] text-[14px] mt-1">Gerencie os cadastros do diretório</p>
        </div>
        <div className="flex gap-3">
          <Link href="/guia" target="_blank"
            className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-600 text-[#d4d4da] text-[13px] h-[36px] px-4 flex items-center rounded-[6px] transition-colors gap-2">
            ↗ Ver Guia
          </Link>
          <Link href="/admin/guia/nova"
            className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[36px] px-4 flex items-center rounded-[6px] transition-colors gap-2">
            + Nova empresa
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total",     value: stats.total,     color: "text-white" },
          { label: "Pendentes", value: stats.pending,   color: "text-[#facc15]" },
          { label: "Ativos",    value: stats.active,    color: "text-[#22c55e]" },
          { label: "Suspensos", value: stats.suspended, color: "text-[#526888]" },
        ].map(s => (
          <div key={s.label} className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4">
            <p className={`font-['Barlow_Condensed'] font-bold text-[32px] leading-none ${s.color}`}>{s.value}</p>
            <p className="text-[#526888] text-[12px] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { label: "Todos", value: undefined },
          { label: "Pendentes", value: "PENDING" },
          { label: "Ativos", value: "ACTIVE" },
          { label: "Suspensos", value: "SUSPENDED" },
        ].map(f => (
          <Link
            key={f.label}
            href={f.value ? `/admin/guia?status=${f.value}` : "/admin/guia"}
            className={`px-4 h-[34px] flex items-center rounded-[6px] text-[13px] font-semibold border transition-colors ${
              status === f.value || (!status && !f.value)
                ? "bg-[#260a0a] border-[#ff1f1f] text-white"
                : "bg-[#0e1520] border-[#141d2c] text-[#526888] hover:text-white"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] overflow-hidden">
        <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-[1fr_130px_90px_100px_100px_120px] gap-3">
          {["Empresa", "Categoria", "Plano", "Status", "Localização", "Ações"].map(h => (
            <p key={h} className="text-[#253750] text-[11px] font-semibold tracking-[0.5px] uppercase">{h}</p>
          ))}
        </div>

        {listings.length === 0 ? (
          <p className="text-[#253750] text-[14px] p-10 text-center">Nenhum cadastro encontrado.</p>
        ) : (
          listings.map((l, i) => {
            const pl = PLAN_LABELS[l.plan] ?? PLAN_LABELS.FREE;
            const sl = STATUS_LABELS[l.status] ?? STATUS_LABELS.PENDING;
            return (
              <div key={l.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                <div className="px-5 py-3.5 grid grid-cols-[1fr_130px_90px_100px_100px_120px] gap-3 items-center">
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[14px] font-semibold truncate">{l.name}</p>
                    <p className="text-[#253750] text-[11px]">
                      {l.viewsCount} views · {new Date(l.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <p className="text-[#526888] text-[12px]">{CATEGORY_LABELS[l.category] ?? l.category}</p>
                  <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] w-fit ${pl.color}`}>{pl.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] w-fit ${sl.color}`}>{sl.label}</span>
                  <p className="text-[#526888] text-[12px]">{l.city}, {l.state}</p>
                  <div className="flex gap-1">
                    <Link href={`/admin/guia/${l.id}`}
                      className="bg-[#141d2c] hover:bg-[#1c2a3e] text-[#d4d4da] text-[11px] h-[28px] px-2.5 rounded-[4px] flex items-center transition-colors">
                      Editar
                    </Link>
                    <Link href={`/guia/empresa/${l.slug}`} target="_blank"
                      className="bg-[#141d2c] hover:bg-[#1c2a3e] text-[#526888] text-[11px] h-[28px] px-2 rounded-[4px] flex items-center transition-colors">
                      ↗
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
