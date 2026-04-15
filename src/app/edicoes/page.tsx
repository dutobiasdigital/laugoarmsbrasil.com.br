import Link from "next/link";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import FooterMinimal from "@/components/FooterMinimal";
import AdBanner from "@/components/AdBanner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edições — Revista Magnum",
  description: "145 edições regulares · 62 edições especiais · 207 no total",
};

const ITEMS_PER_PAGE = 16;

export default async function EdicoesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; pagina?: string }>;
}) {
  const { tipo, pagina } = await searchParams;
  const page = Math.max(1, parseInt(pagina ?? "1", 10));

  let editions: {
    id: string; title: string; number: number | null; slug: string;
    coverImageUrl: string | null; publishedAt: Date | null;
    type: string; pageCount: number | null;
  }[] = [];

  let total = 0;
  let totalRegular = 0;
  let totalSpecial = 0;

  try {
    const filter = tipo === "normais"
      ? { type: "REGULAR" as const }
      : tipo === "especiais"
      ? { type: "SPECIAL" as const }
      : undefined;

    [editions, total, totalRegular, totalSpecial] = await Promise.all([
      prisma.edition.findMany({
        where: { isPublished: true, ...(filter ?? {}) },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        select: {
          id: true, title: true, number: true, slug: true,
          coverImageUrl: true, publishedAt: true, type: true, pageCount: true,
        },
      }),
      prisma.edition.count({ where: { isPublished: true, ...(filter ?? {}) } }),
      prisma.edition.count({ where: { isPublished: true, type: "REGULAR" } }),
      prisma.edition.count({ where: { isPublished: true, type: "SPECIAL" } }),
    ]);
  } catch {
    // DB unavailable
  }

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const totalAll = totalRegular + totalSpecial;

  // Group by year
  const byYear: Record<string, typeof editions> = {};
  for (const ed of editions) {
    const year = ed.publishedAt
      ? String(ed.publishedAt.getFullYear())
      : "Sem data";
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(ed);
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  const tabHref = (t?: string) =>
    t ? `/edicoes?tipo=${t}` : "/edicoes";

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      {/* Page hero */}
      <div className="bg-[#0e1520] border-b border-[#141d2c] h-[100px] flex items-center px-5 lg:px-20 mt-16">
        <div className="flex flex-col gap-1">
          <h1 className="font-['Barlow_Condensed'] font-extrabold text-[#dce8ff] text-[36px] leading-none">
            Edições
          </h1>
          <p className="text-[#526888] text-[13px]">
            {totalRegular} edições regulares · {totalSpecial} edições especiais · {totalAll || totalRegular + totalSpecial} no total
          </p>
        </div>
        <div className="flex-1" />
        <div className="bg-[#141d2c] border border-[#1c2a3e] flex items-center gap-2 px-3.5 py-2.5 rounded-md text-[#253750] text-[14px]">
          <span>🔍</span>
          <span>Buscar edição...</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#070a12] border-b border-[#141d2c] h-[52px] flex items-center px-5 lg:px-20">
        <div className="flex items-center">
          {[
            { label: "Todas", count: totalAll, href: tabHref(), active: !tipo },
            { label: "Normais", count: totalRegular, href: tabHref("normais"), active: tipo === "normais" },
            { label: "Especiais", count: totalSpecial, href: tabHref("especiais"), active: tipo === "especiais" },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex items-center gap-1.5 px-5 h-[52px] border-b-2 transition-colors ${
                tab.active
                  ? "border-[#ff1f1f] text-[#ff1f1f]"
                  : "border-transparent text-[#526888] hover:text-[#7a9ab5]"
              }`}
            >
              <span className="text-[14px] font-semibold">{tab.label}</span>
              <span
                className={`text-[11px] font-semibold px-1.5 py-[2px] rounded-full ${
                  tab.active
                    ? "bg-[#cc0000] text-white"
                    : "bg-[#141d2c] text-[#526888]"
                }`}
              >
                {tab.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Ad leaderboard */}
      <div className="bg-[#070a12] flex items-center justify-center py-3">
        <AdBanner position="EDITIONS_TOP" bannerSize="LEADERBOARD" />
      </div>

      {/* Content row */}
      <div className="flex gap-10 px-5 lg:px-20 pt-12 pb-16 items-start">

        {/* Main */}
        <div className="flex flex-col gap-8 flex-1 min-w-0">
          {years.length === 0 ? (
            <p className="text-[#253750] text-sm py-12 text-center">Nenhuma edição encontrada.</p>
          ) : (
            years.map((year) => (
              <div key={year} className="flex flex-col gap-4">
                <p className="text-[#253750] text-[13px] font-semibold tracking-[1px]">{year}</p>
                <div className="bg-[#141d2c] h-px w-full" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {byYear[year].map((edition) => {
                    const isSpecial = edition.type === "SPECIAL";
                    return (
                      <div key={edition.id} className="card-metal-border hover:scale-[1.02] transition-transform duration-300">
                      <Link
                        href={`/edicoes/${edition.slug}`}
                        className="group relative rounded-[13px] overflow-hidden flex flex-col bg-[#0a0f1a] h-full"
                      >
                        {/* Cover — aspect-ratio fixo de revista (3:4) */}
                        <div className="relative aspect-[3/4] overflow-hidden">
                          {edition.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={edition.coverImageUrl}
                              alt={edition.title}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div
                              className={`absolute inset-0 flex items-center justify-center ${
                                isSpecial ? "bg-[#cc0000]/20" : "bg-white/5"
                              }`}
                            >
                              <p
                                className={`font-['Barlow_Condensed'] font-extrabold text-[24px] ${
                                  isSpecial ? "text-[#ff1f1f]/40" : "text-white/10"
                                }`}
                              >
                                {isSpecial ? `ESP` : edition.number ? `Nº ${edition.number}` : "—"}
                              </p>
                            </div>
                          )}
                          {/* Gradient overlay at bottom of cover */}
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#141416] to-transparent" />
                        </div>

                        {/* Info — glass panel */}
                        <div
                          className="flex flex-col gap-1 px-3.5 pt-2 pb-4"
                          style={{
                            background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
                            backdropFilter: "blur(0px)",
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-bold tracking-[0.8px] uppercase px-1.5 py-[2px] rounded-[3px] ${
                                isSpecial
                                  ? "bg-[#ff1f1f]/20 text-[#ff6b6b] border border-[#ff1f1f]/30"
                                  : "bg-white/5 text-white/40 border border-white/10"
                              }`}
                            >
                              {isSpecial ? "Especial" : "Regular"}
                            </span>
                            {edition.number && !isSpecial && (
                              <span className="text-[9px] font-semibold text-white/30">
                                #{edition.number}
                              </span>
                            )}
                          </div>

                          <p className="font-['Barlow_Condensed'] font-bold text-white text-[15px] leading-snug line-clamp-2 group-hover:text-white/90 transition-colors">
                            {edition.number ? `Edição ${edition.number}` : edition.title}
                          </p>

                          {edition.publishedAt && (
                            <p className="text-white/25 text-[10px]">
                              {edition.publishedAt.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                              {edition.pageCount ? ` · ${edition.pageCount}p` : ""}
                            </p>
                          )}
                        </div>

                        {/* Hover glow */}
                        {isSpecial && (
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{ boxShadow: "inset 0 0 30px rgba(255,31,31,0.06)" }}
                          />
                        )}
                      </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 mt-4">
              {page > 1 && (
                <Link
                  href={`/edicoes?${tipo ? `tipo=${tipo}&` : ""}pagina=${page - 1}`}
                  className="border border-[#1c2a3e] text-[#7a9ab5] hover:text-white text-[13px] font-semibold px-3 py-2 rounded transition-colors"
                >
                  ‹
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 12) }, (_, i) => i + 1).map((p) => {
                if (p > 3 && p < totalPages - 1 && Math.abs(p - page) > 1) {
                  if (p === 4) return <span key={p} className="text-[#1c2a3e] px-1">...</span>;
                  return null;
                }
                return (
                  <Link
                    key={p}
                    href={`/edicoes?${tipo ? `tipo=${tipo}&` : ""}pagina=${p}`}
                    className={`text-[13px] font-semibold px-3 py-2 rounded transition-colors ${
                      p === page
                        ? "bg-[#ff1f1f] text-white"
                        : "border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
              {page < totalPages && (
                <Link
                  href={`/edicoes?${tipo ? `tipo=${tipo}&` : ""}pagina=${page + 1}`}
                  className="border border-[#1c2a3e] text-[#7a9ab5] hover:text-white text-[13px] font-semibold px-3 py-2 rounded transition-colors"
                >
                  ›
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-8 w-[300px] shrink-0">
          {/* Ad 300×250 */}
          <AdBanner position="EDITIONS_SIDEBAR" bannerSize="MED_RECT" />

          {/* Edições Especiais widget */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-lg p-5 flex flex-col gap-3">
            <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[18px]">
              Edições Especiais
            </p>
            <p className="text-[#526888] text-[12px] leading-relaxed">
              62 edições temáticas sobre armas, munições, caça e legislação.
            </p>
            <Link
              href="/edicoes?tipo=especiais"
              className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#b0c4d8] hover:text-white text-[13px] font-semibold h-[36px] flex items-center justify-center rounded transition-colors"
            >
              Ver Edições Especiais →
            </Link>
          </div>

          {/* Ad 300×600 */}
          <AdBanner position="EDITIONS_SIDEBAR" bannerSize="HALF_PAGE" />
        </aside>
      </div>

      <FooterMinimal />
    </div>
  );
}
