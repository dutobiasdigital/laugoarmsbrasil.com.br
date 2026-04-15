import Link from "next/link";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const SEGMENT_LABELS: Record<string, string> = {
  ARMAS: "Armas", MUNICOES: "Munições", ACESSORIOS: "Acessórios",
  CACA: "Caça", TIRO_ESPORTIVO: "Tiro Esportivo", OUTROS: "Outros",
};

const INTEREST_LABELS: Record<string, string> = {
  BILLBOARD: "Billboard 970×250", LEADERBOARD: "Leaderboard 728×90",
  MED_RECT: "Med. Rect 300×250", HALF_PAGE: "Half Page 300×600",
  LARGE_MOBILE: "Mobile 320×100", PACOTE: "Pacote completo",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-[#1a1a0a] text-[#facc15]",
  CONTACTED: "bg-[#0a1a2e] text-[#60a5fa]",
  CONVERTED: "bg-[#0f381f] text-[#22c55e]",
  DECLINED:  "bg-[#141d2c] text-[#526888]",
};

interface AdRequest {
  id: string;
  tradeName: string;
  legalName: string | null;
  contact: string;
  phone: string;
  email: string;
  website: string | null;
  instagram: string | null;
  segment: string;
  address: string | null;
  interests: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

async function getRequests(): Promise<AdRequest[]> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/ad_requests?select=*&order=createdAt.desc`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export default async function SolicitacoesPage() {
  const requests = await getRequests();

  const pending   = requests.filter(r => r.status === "PENDING").length;
  const contacted = requests.filter(r => r.status === "CONTACTED").length;
  const converted = requests.filter(r => r.status === "CONVERTED").length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Solicitações de Anúncio
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {requests.length} solicitaç{requests.length !== 1 ? "ões" : "ão"} recebida{requests.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a href="/anuncie" target="_blank"
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[13px] h-[38px] px-4 flex items-center rounded-[6px] transition-colors">
          Ver /anuncie →
        </a>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Aguardando",  value: pending,   color: "text-[#facc15]" },
          { label: "Contactados", value: contacted,  color: "text-[#60a5fa]" },
          { label: "Convertidos", value: converted,  color: "text-[#22c55e]" },
        ].map(s => (
          <div key={s.label} className="bg-[#0e1520] border border-[#141d2c] rounded-[8px] px-4 py-3">
            <p className={`font-['Barlow_Condensed'] font-bold text-[28px] leading-none ${s.color}`}>{s.value}</p>
            <p className="text-[#526888] text-[12px]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {requests.length === 0 ? (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-12 text-center">
          <p className="text-white text-[13px]">Nenhuma solicitação ainda.</p>
          <p className="text-[#1c2a3e] text-[12px] mt-1">As solicitações aparecem aqui quando alguém preencher o formulário em /anuncie.</p>
        </div>
      ) : (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
          {/* Header */}
          <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_100px] gap-3">
            {["Empresa", "Contato", "Segmento", "Interesse", "Data", "Status"].map(h => (
              <p key={h} className="text-white text-[11px] font-semibold tracking-[0.5px] uppercase">{h}</p>
            ))}
          </div>

          {requests.map((req, i) => (
            <div key={req.id}>
              {i > 0 && <div className="bg-[#141d2c] h-px" />}
              <div className="px-5 py-4 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_100px] gap-3 items-start">

                {/* Empresa */}
                <div className="min-w-0">
                  <p className="text-[#d4d4da] text-[14px] font-semibold truncate">{req.tradeName}</p>
                  {req.legalName && <p className="text-[#526888] text-[11px] truncate">{req.legalName}</p>}
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <a href={`mailto:${req.email}`} className="text-[#7a9ab5] hover:text-white text-[11px] transition-colors">{req.email}</a>
                    {req.website && (
                      <a href={req.website} target="_blank" rel="noopener" className="text-[#526888] hover:text-white text-[11px] transition-colors truncate max-w-[120px]">{req.website.replace(/^https?:\/\//, "")}</a>
                    )}
                  </div>
                  {req.message && (
                    <p className="text-white text-[11px] mt-1.5 leading-[16px] line-clamp-2">{req.message}</p>
                  )}
                </div>

                {/* Contato */}
                <div>
                  <p className="text-[#7a9ab5] text-[13px]">{req.contact}</p>
                  <p className="text-[#526888] text-[12px]">{req.phone}</p>
                  {req.instagram && <p className="text-[#526888] text-[11px]">{req.instagram}</p>}
                </div>

                {/* Segmento */}
                <span className="inline-flex items-center h-[20px] px-2 rounded-[2px] text-[10px] font-bold bg-[#141d2c] text-[#7a9ab5] w-fit">
                  {SEGMENT_LABELS[req.segment] ?? req.segment}
                </span>

                {/* Interesse */}
                <p className="text-[#526888] text-[12px]">
                  {req.interests ? (INTEREST_LABELS[req.interests] ?? req.interests) : "—"}
                </p>

                {/* Data */}
                <p className="text-[#526888] text-[12px]">
                  {new Date(req.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                </p>

                {/* Status */}
                <span className={`inline-flex items-center h-[20px] px-2 rounded-[2px] text-[10px] font-bold w-fit ${STATUS_STYLES[req.status] ?? STATUS_STYLES.PENDING}`}>
                  {req.status}
                </span>
              </div>

              {/* Ações rápidas */}
              <div className="px-5 pb-3 flex gap-2">
                <a href={`mailto:${req.email}?subject=Proposta de Publicidade — Revista Magnum`}
                  className="text-[#ff1f1f] hover:text-white text-[11px] font-semibold transition-colors">
                  Responder por e-mail →
                </a>
                {req.phone && (
                  <a href={`https://wa.me/55${req.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener"
                    className="text-[#526888] hover:text-white text-[11px] transition-colors">
                    WhatsApp
                  </a>
                )}
                <Link href={`/admin/empresas/nova?prefill=${encodeURIComponent(JSON.stringify({ tradeName: req.tradeName, legalName: req.legalName, contact: req.contact, phone: req.phone, email: req.email, website: req.website, instagram: req.instagram, segment: req.segment, address: req.address }))}`}
                  className="text-[#526888] hover:text-[#7a9ab5] text-[11px] transition-colors">
                  Criar empresa no admin →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
