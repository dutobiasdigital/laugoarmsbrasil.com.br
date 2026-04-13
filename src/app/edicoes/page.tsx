import Link from "next/link";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import FooterMinimal from "@/components/FooterMinimal";

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
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <Header />

      {/* Page hero */}
      <div className="bg-[#18181b] border-b border-[#27272a] h-[100px] flex items-center px-5 lg:px-20 mt-16">
        <div className="flex flex-col gap-1">
          <h1 className="font-['Barlow_Condensed'] font-extrabold text-[#fafafa] text-[36px] leading-none">
            Edições
          </h1>
          <p className="text-[#71717a] text-[13px]">
            {totalRegular} edições regulares · {totalSpecial} edições especiais · {totalAll || totalRegular + totalSpecial} no total
          </p>
        </div>
        <div className="flex-1" />
        <div className="bg-[#27272a] border border-[#3f3f46] flex items-center gap-2 px-3.5 py-2.5 rounded-md text-[#52525b] text-[14px]">
          <span>🔍</span>
          <span>Buscar edição...</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#09090b] border-b border-[#27272a] h-[52px] flex items-center px-5 lg:px-20">
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
                  : "border-transparent text-[#71717a] hover:text-[#a1a1aa]"
              }`}
            >
              <span className="text-[14px] font-semibold">{tab.label}</span>
              <span
                className={`text-[11px] font-semibold px-1.5 py-[2px] rounded-full ${
                  tab.active
                    ? "bg-[#cc0000] text-white"
                    : "bg-[#27272a] text-[#71717a]"
                }`}
              >
                {tab.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Ad leaderboard */}
      <div className="bg-[#09090b] flex flex-col items-center justify-center h-[110px]">
        <p className="text-[9px] font-semibold text-[#52525b] tracking-[1.5px] uppercase mb-2">
          Publicidade
        </p>
        <div className="bg-[#27272a] border border-[#3f3f46] rounded h-[90px] w-full max-w-[728px] flex items-center justify-center">
          <p className="font-mono text-[#52525b] text-[11px]">728 × 90 — Leaderboard</p>
        </div>
      </div>

      {/* Content row */}
      <div className="flex gap-10 px-5 lg:px-20 pt-12 pb-16 items-start">

        {/* Main */}
        <div className="flex flex-col gap-8 flex-1 min-w-0">
          {years.length === 0 ? (
            <p className="text-[#52525b] text-sm py-12 text-center">Nenhuma edição encontrada.</p>
          ) : (
            years.map((year) => (
              <div key={year} className="flex flex-col gap-4">
                <p className="text-[#52525b] text-[13px] font-semibold tracking-[1px]">{year}</p>
                <div className="bg-[#27272a] h-px w-full" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {byYear[year].map((edition, i) => {
                    const isSpecial = edition.type === "SPECIAL";
                    const isFirst = !tipo && page === 1 && years[0] === year && i === 0;
                    return (
                      <div
                        key={edition.id}
                        className="bg-[#18181b] border border-[#27272a] rounded-lg overflow-hidden flex flex-col"
                      >
                        {/* Cover */}
                        <div
                          className={`h-[285px] flex items-center justify-center rounded-t-lg ${
                            isSpecial ? "bg-[#cc0000]" : "bg-[#27272a]"
                          }`}
                        >
                          {edition.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={edition.coverImageUrl}
                              alt={edition.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <p
                              className={`font-['Barlow_Condensed'] font-extrabold text-[24px] ${
                                isSpecial ? "text-[#7a0000]" : "text-[#3f3f46]"
                              }`}
                            >
                              {isSpecial ? `ESP ${edition.slug?.toUpperCase().slice(0, 6)}` : edition.number ? `Nº ${edition.number}` : "—"}
                            </p>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col gap-1.5 px-3 pt-2.5 pb-3.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-semibold tracking-[0.5px] px-1.5 py-[2px] rounded-[2px] ${
                                isSpecial
                                  ? "bg-[#ff1f1f] text-white"
                                  : "bg-[#27272a] text-[#a1a1aa]"
                              }`}
                            >
                              {isSpecial ? "ESPECIAL" : "REGULAR"}
                            </span>
                            {edition.number && !isSpecial && (
                              <span className="text-[9px] font-semibold text-[#a1a1aa] border border-[#3f3f46] px-1.5 py-[2px] rounded-[2px] bg-[#27272a]">
                                Nº {edition.number}
                              </span>
                            )}
                          </div>

                          <p className="font-['Barlow_Condensed'] font-bold text-[#fafafa] text-[15px] leading-snug">
                            {edition.number ? `Edição ${edition.number}` : edition.title}
                          </p>

                          <p className="text-[#71717a] text-[11px]">
                            {edition.publishedAt
                              ? `${edition.publishedAt.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}  ·  ${edition.pageCount ? `${edition.pageCount}p` : ""}`
                              : "Em breve"}
                          </p>

                          <Link
                            href={`/edicoes/${edition.slug}`}
                            className={`text-[12px] font-semibold h-[34px] flex items-center justify-center rounded mt-1 transition-colors ${
                              isFirst
                                ? "bg-[#ff1f1f] hover:bg-[#cc0000] text-white"
                                : "bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 text-[#a1a1aa] hover:text-white"
                            }`}
                          >
                            {isFirst ? "Ler Edição" : "Ver Detalhes"}
                          </Link>
                        </div>
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
                  className="border border-[#3f3f46] text-[#a1a1aa] hover:text-white text-[13px] font-semibold px-3 py-2 rounded transition-colors"
                >
                  ‹
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 12) }, (_, i) => i + 1).map((p) => {
                if (p > 3 && p < totalPages - 1 && Math.abs(p - page) > 1) {
                  if (p === 4) return <span key={p} className="text-[#3f3f46] px-1">...</span>;
                  return null;
                }
                return (
                  <Link
                    key={p}
                    href={`/edicoes?${tipo ? `tipo=${tipo}&` : ""}pagina=${p}`}
                    className={`text-[13px] font-semibold px-3 py-2 rounded transition-colors ${
                      p === page
                        ? "bg-[#ff1f1f] text-white"
                        : "border border-[#3f3f46] text-[#a1a1aa] hover:text-white"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
              {page < totalPages && (
                <Link
                  href={`/edicoes?${tipo ? `tipo=${tipo}&` : ""}pagina=${page + 1}`}
                  className="border border-[#3f3f46] text-[#a1a1aa] hover:text-white text-[13px] font-semibold px-3 py-2 rounded transition-colors"
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
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[9px] font-semibold text-[#52525b] tracking-[1.5px] uppercase">Publicidade</p>
            <div className="bg-[#27272a] border border-[#3f3f46] rounded w-[300px] h-[250px] flex items-center justify-center">
              <p className="font-mono text-[#52525b] text-[11px]">300×250</p>
            </div>
          </div>

          {/* Edições Especiais widget */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-5 flex flex-col gap-3">
            <p className="font-['Barlow_Condensed'] font-bold text-[#fafafa] text-[18px]">
              Edições Especiais
            </p>
            <p className="text-[#71717a] text-[12px] leading-relaxed">
              62 edições temáticas sobre armas, munições, caça e legislação.
            </p>
            <Link
              href="/edicoes?tipo=especiais"
              className="bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 text-[#d4d4d8] hover:text-white text-[13px] font-semibold h-[36px] flex items-center justify-center rounded transition-colors"
            >
              Ver Edições Especiais →
            </Link>
          </div>

          {/* Ad 300×600 */}
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[9px] font-semibold text-[#52525b] tracking-[1.5px] uppercase">Publicidade</p>
            <div className="bg-[#27272a] border border-[#3f3f46] rounded w-[300px] h-[600px] flex items-center justify-center">
              <p className="font-mono text-[#52525b] text-[11px]">300×600</p>
            </div>
          </div>
        </aside>
      </div>

      <FooterMinimal />
    </div>
  );
}
