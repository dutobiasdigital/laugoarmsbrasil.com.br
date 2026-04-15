import Link from "next/link";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const POSITION_LABELS: Record<string, string> = {
  HOME_TOP:          "Home — Topo",
  HOME_SIDEBAR:      "Home — Sidebar",
  ARTICLE_INLINE:    "Artigo — Inline",
  ARTICLE_SIDEBAR:   "Artigo — Sidebar",
  EDITIONS_TOP:      "Edições — Topo",
  EDITIONS_SIDEBAR:  "Edições — Sidebar",
  BLOG_TOP:          "Blog — Topo",
  GLOBAL_FOOTER:     "Rodapé global",
};

const BANNER_LABELS: Record<string, string> = {
  BILLBOARD:    "Billboard 970×250",
  LEADERBOARD:  "Leaderboard 728×90",
  MED_RECT:     "Med. Rect 300×250",
  HALF_PAGE:    "Half Page 300×600",
  LARGE_MOBILE: "Mobile 320×100",
};

interface Ad {
  id: string;
  name: string;
  advertiser: string;
  imageUrl: string;
  targetUrl: string;
  position: string;
  bannerSize: string | null;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  clicks: number;
  ad_impressions: [{ count: number }] | null;
}

async function getAds(q?: string): Promise<Ad[]> {
  try {
    const filter = q
      ? `&or=(name.ilike.*${encodeURIComponent(q)}*,advertiser.ilike.*${encodeURIComponent(q)}*)`
      : "";
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/advertisements?select=*,ad_impressions(count)&order=createdAt.desc${filter}`,
      {
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
        cache: "no-store",
      }
    );
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function AdminAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const ads = await getAds(q);
  const now = new Date();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Anúncios
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {ads.length} banner{ads.length !== 1 ? "s" : ""} cadastrado{ads.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/anuncios/novo"
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 flex items-center rounded-[6px] transition-colors"
        >
          + Novo Anúncio
        </Link>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Filtro */}
      <form method="GET" className="flex gap-2 mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="🔍 Buscar por nome ou anunciante..."
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-[320px]"
        />
        <button
          type="submit"
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[38px] px-4 rounded-[6px] transition-colors"
        >
          Filtrar
        </button>
        {q && (
          <Link
            href="/admin/anuncios"
            className="text-[#7a9ab5] hover:text-white text-[13px] h-[38px] flex items-center px-2 transition-colors"
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Grid */}
      {ads.length === 0 ? (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-12 text-center">
          <p className="text-[#253750] text-[13px] mb-4">Nenhum anúncio cadastrado.</p>
          <Link
            href="/admin/anuncios/novo"
            className="inline-flex bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[38px] px-5 items-center rounded-[6px] transition-colors"
          >
            Criar primeiro anúncio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {ads.map((ad) => {
            const expired = ad.endsAt && new Date(ad.endsAt) < now;
            const impressions = ad.ad_impressions?.[0]?.count ?? 0;

            return (
              <div
                key={ad.id}
                className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden flex flex-col"
              >
                {/* Thumbnail */}
                <div className="h-[110px] bg-[#141d2c] flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ad.imageUrl}
                    alt={ad.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 flex flex-col flex-1">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-[2px] rounded-[2px] shrink-0 ${
                        expired
                          ? "bg-[#1a0808] text-[#526888]"
                          : ad.active
                          ? "bg-[#0f381f] text-[#22c55e]"
                          : "bg-[#141d2c] text-[#526888]"
                      }`}
                    >
                      {expired ? "EXPIRADO" : ad.active ? "ATIVO" : "INATIVO"}
                    </span>
                    {ad.bannerSize && (
                      <span className="bg-[#141d2c] text-[#7a9ab5] text-[10px] px-2 py-[2px] rounded-[2px] shrink-0">
                        {BANNER_LABELS[ad.bannerSize] ?? ad.bannerSize}
                      </span>
                    )}
                    <span className="bg-[#0a1018] border border-[#141d2c] text-[#526888] text-[10px] px-2 py-[2px] rounded-[2px] shrink-0">
                      {POSITION_LABELS[ad.position] ?? ad.position}
                    </span>
                  </div>

                  {/* Name / Advertiser */}
                  <p className="text-[#d4d4da] text-[14px] font-semibold mb-0.5 truncate">
                    {ad.name}
                  </p>
                  <p className="text-[#7a9ab5] text-[12px] mb-3 truncate">{ad.advertiser}</p>

                  {/* Stats + Edit */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#141d2c]">
                    <div className="flex gap-3">
                      <span className="text-[#526888] text-[11px]">
                        👁 {impressions.toLocaleString("pt-BR")} views
                      </span>
                      <span className="text-[#526888] text-[11px]">
                        🖱 {(ad.clicks ?? 0).toLocaleString("pt-BR")} cliques
                      </span>
                    </div>
                    <Link
                      href={`/admin/anuncios/${ad.id}`}
                      className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors shrink-0"
                    >
                      Editar →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
