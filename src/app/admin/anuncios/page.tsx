import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const POSITION_LABELS: Record<string, string> = {
  HOME_TOP: "Home — Topo",
  HOME_SIDEBAR: "Home — Sidebar",
  ARTICLE_INLINE: "Artigo — Inline",
  ARTICLE_SIDEBAR: "Artigo — Sidebar",
  EDITIONS_TOP: "Edições — Topo",
};

export default async function AdminAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string }>;
}) {
  const { q, pagina } = await searchParams;
  const page = Math.max(1, parseInt(pagina ?? "1", 10));
  const PER_PAGE = 12;

  let ads: {
    id: string;
    name: string;
    advertiser: string;
    imageUrl: string;
    targetUrl: string;
    position: string;
    active: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    _count: { impressions: number };
  }[] = [];
  let total = 0;

  try {
    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { advertiser: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

    [ads, total] = await Promise.all([
      prisma.advertisement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        select: {
          id: true,
          name: true,
          advertiser: true,
          imageUrl: true,
          targetUrl: true,
          position: true,
          active: true,
          startsAt: true,
          endsAt: true,
          _count: { select: { impressions: true } },
        },
      }),
      prisma.advertisement.count({ where }),
    ]);
  } catch {
    // DB unavailable
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Anúncios
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {total.toLocaleString("pt-BR")} banners cadastrados
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

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="🔍 Buscar por nome ou anunciante..."
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-[300px]"
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
          <p className="text-[#253750] text-[13px]">Nenhum anúncio cadastrado.</p>
          <Link
            href="/admin/anuncios/novo"
            className="inline-flex mt-4 bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[38px] px-5 items-center rounded-[6px] transition-colors"
          >
            Criar primeiro anúncio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {ads.map((ad) => {
            const isActive = ad.active;
            const now = new Date();
            const expired = ad.endsAt && ad.endsAt < now;
            return (
              <div
                key={ad.id}
                className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden"
              >
                <div className="h-[120px] bg-[#141d2c] flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ad.imageUrl}
                    alt={ad.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-[2px] rounded-[2px] ${
                        expired
                          ? "bg-[#141d2c] text-[#253750]"
                          : isActive
                          ? "bg-[#0f381f] text-[#22c55e]"
                          : "bg-[#141d2c] text-[#253750]"
                      }`}
                    >
                      {expired ? "EXPIRADO" : isActive ? "ATIVO" : "INATIVO"}
                    </span>
                    <span className="bg-[#141d2c] text-[#7a9ab5] text-[10px] px-2 py-[2px] rounded-[2px]">
                      {POSITION_LABELS[ad.position] ?? ad.position}
                    </span>
                  </div>
                  <p className="text-[#d4d4da] text-[14px] font-semibold mb-0.5 truncate">
                    {ad.name}
                  </p>
                  <p className="text-[#7a9ab5] text-[12px] mb-3">{ad.advertiser}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[#253750] text-[11px]">
                      {ad._count.impressions.toLocaleString("pt-BR")} impressões
                    </p>
                    <Link
                      href={`/admin/anuncios/${ad.id}`}
                      className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/anuncios?${q ? `q=${encodeURIComponent(q)}&` : ""}pagina=${p}`}
              className={`w-[30px] h-[30px] flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-colors ${
                p === page
                  ? "bg-[#ff1f1f] text-white"
                  : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
