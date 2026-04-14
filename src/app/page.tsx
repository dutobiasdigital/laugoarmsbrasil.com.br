import Link from "next/link";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Revista Magnum — O Mundo das Armas em Suas Mãos",
  description:
    "O maior acervo de publicações especializadas em armas, munições e legislação do Brasil. Assine e acesse todas as edições.",
};

export default async function HomePage() {
  let latestEditions: {
    id: string; title: string; number: number | null; slug: string;
    coverImageUrl: string | null; publishedAt: Date | null; type: string;
    pageCount: number | null;
  }[] = [];

  let latestArticles: {
    id: string; title: string; slug: string; categoryId: string;
    featureImageUrl: string | null; publishedAt: Date | null;
    isExclusive: boolean;
    category: { name: string; slug: string };
  }[] = [];

  let featuredEdition: typeof latestEditions[0] | null = null;

  try {
    [latestEditions, latestArticles] = await Promise.all([
      prisma.edition.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
          id: true, title: true, number: true, slug: true,
          coverImageUrl: true, publishedAt: true, type: true, pageCount: true,
        },
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
          id: true, title: true, slug: true, categoryId: true,
          featureImageUrl: true, publishedAt: true, isExclusive: true,
          category: { select: { name: true, slug: true } },
        },
      }),
    ]);
    featuredEdition = latestEditions[0] ?? null;
  } catch {
    // DB unavailable
  }

  const mostRead = [
    "Glock 17 Gen 5: Análise Completa",
    "Legislação CAC 2026: Novas regras",
    "Recarga para .308 Winchester",
    "Pistolas de serviço policial 2026",
    "Balística terminal: fundamentos",
  ];

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      {/* Ad — HOME_TOP */}
      <div className="bg-[#0e1520] flex flex-col items-center justify-center h-[110px] mt-16 shrink-0">
        <p className="text-[9px] font-semibold text-[#253750] tracking-[1.5px] uppercase mb-2">
          Publicidade
        </p>
        <div className="bg-[#141d2c] border border-[#141d2c] rounded h-[90px] w-full max-w-[728px] flex items-center justify-center">
          <p className="font-mono text-[#253750] text-[12px]">728 × 90 — Leaderboard</p>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#070a12] flex items-center px-5 lg:px-20 py-16 lg:py-0 lg:h-[580px] gap-6">
        {/* Red stripe */}
        <div className="hidden lg:block w-[3px] h-[520px] bg-[#ff1f1f] rounded-[2px] shrink-0" />
        <div className="hidden lg:block w-6 shrink-0" />

        {/* Text */}
        <div className="flex flex-col gap-5 flex-1 max-w-[760px]">
          <div className="bg-[#ff1f1f] inline-flex px-2 py-1 rounded-[2px] self-start">
            <span className="text-white text-[10px] font-semibold tracking-[0.5px]">
              ÚLTIMA EDIÇÃO
            </span>
          </div>

          <div className="font-['Barlow_Condensed'] font-extrabold text-[#dce8ff] text-5xl lg:text-[64px] leading-tight">
            <p>{featuredEdition ? `Revista Magnum` : "Revista Magnum"}</p>
            <p>{featuredEdition?.number ? `Edição ${featuredEdition.number}` : "Acervo Digital"}</p>
          </div>

          <p className="text-[#253750] text-[14px]">
            {featuredEdition?.publishedAt
              ? `${featuredEdition.publishedAt.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}  ·  ${featuredEdition.pageCount ? `${featuredEdition.pageCount} páginas` : ""}  ·  ${featuredEdition.type === "SPECIAL" ? "Edição Especial" : "Edição Regular"}`
              : "O maior acervo especializado do Brasil"}
          </p>

          <p className="text-[#7a9ab5] text-[16px] max-w-2xl leading-relaxed">
            Nesta edição: teste completo da Beretta APX-A1, guia de recarga para .308 Win, legislação CAC 2026 e cobertura dos principais lançamentos do mercado nacional e internacional.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={featuredEdition ? `/minha-conta/edicoes` : "/assine"}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold px-7 py-3 rounded transition-colors"
            >
              {featuredEdition?.number ? `Ler Edição ${featuredEdition.number}` : "Assinar agora"}
            </Link>
            <Link
              href="/edicoes"
              className="border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[15px] font-semibold px-6 py-3 rounded transition-colors"
            >
              Ver Todas as Edições
            </Link>
          </div>
        </div>

        <div className="flex-1 hidden lg:block" />

        {/* Cover */}
        <div className="hidden lg:flex w-[340px] h-[480px] bg-[#141d2c] rounded-lg items-center justify-center shrink-0">
          {featuredEdition?.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featuredEdition.coverImageUrl}
              alt={featuredEdition.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="font-['Barlow_Condensed'] font-bold text-[#1c2a3e] text-[18px] text-center leading-snug">
              <p>CAPA</p>
              <p>{featuredEdition?.number ? `EDIÇÃO ${featuredEdition.number}` : "MAGNUM"}</p>
            </div>
          )}
        </div>
      </section>

      {/* Content row */}
      <div className="bg-[#070a12] flex gap-10 px-5 lg:px-20 py-16 items-start">

        {/* Main column */}
        <div className="flex flex-col gap-14 flex-1 min-w-0">

          {/* Últimas Edições */}
          <section>
            <div className="flex items-center mb-6">
              <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[30px]">
                Últimas Edições
              </h2>
              <div className="flex-1" />
              <Link href="/edicoes" className="text-[#ff1f1f] text-[13px] font-semibold hover:text-[#ff4444] transition-colors">
                Ver todas →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(latestEditions.length > 0 ? latestEditions : Array(3).fill(null)).map((edition, i) => (
                <div
                  key={edition?.id ?? i}
                  className="bg-[#0e1520] border border-[#141d2c] rounded-lg overflow-hidden flex flex-col"
                >
                  {/* Cover */}
                  <div className="bg-[#141d2c] h-[370px] flex items-center justify-center rounded-t-lg">
                    {edition?.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={edition.coverImageUrl}
                        alt={edition.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="font-['Barlow_Condensed'] font-bold text-[#253750] text-[13px]">
                        {edition?.number ? `CAPA ${edition.number}` : "CAPA"}
                      </p>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-2 px-4 pt-3.5 pb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[#141d2c] text-[#7a9ab5] text-[9px] font-semibold tracking-[0.5px] px-2 py-[3px] rounded-[2px]">
                        {edition?.type === "SPECIAL" ? "ESPECIAL" : "REGULAR"}
                      </span>
                      {edition?.number && (
                        <span className="bg-[#ff1f1f] text-white text-[9px] font-semibold px-2 py-[3px] rounded-[2px]">
                          Nº {edition.number}
                        </span>
                      )}
                    </div>

                    <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[17px] leading-snug">
                      {edition?.title ?? "Revista Magnum"}
                    </p>

                    <p className="text-[#253750] text-[12px]">
                      {edition?.publishedAt
                        ? `${edition.publishedAt.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}  ·  ${edition.pageCount ? `${edition.pageCount} págs` : ""}`
                        : "Em breve"}
                    </p>

                    {i === 0 ? (
                      <Link
                        href="/minha-conta/edicoes"
                        className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[38px] flex items-center justify-center rounded mt-1 transition-colors"
                      >
                        Ler Edição
                      </Link>
                    ) : (
                      <Link
                        href="/assine"
                        className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[13px] font-semibold h-[38px] flex items-center justify-center rounded mt-1 transition-colors"
                      >
                        Assine para Ler
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Artigos Recentes */}
          <section>
            <div className="flex items-center mb-6">
              <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[30px]">
                Artigos Recentes
              </h2>
              <div className="flex-1" />
              <Link href="/blog" className="text-[#ff1f1f] text-[13px] font-semibold hover:text-[#ff4444] transition-colors">
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(latestArticles.length > 0
                ? latestArticles
                : [
                    { id: "1", title: "Glock 17 Gen 5: Análise Completa em Campo", slug: "glock-17", category: { name: "AVALIAÇÕES", slug: "avaliacoes" }, featureImageUrl: null, publishedAt: new Date("2026-04-15"), isExclusive: false, categoryId: "1" },
                    { id: "2", title: "Guia de Recarga para .308 Winchester", slug: "recarga-308", category: { name: "MUNIÇÕES", slug: "municoes" }, featureImageUrl: null, publishedAt: new Date("2026-04-10"), isExclusive: true, categoryId: "2" },
                    { id: "3", title: "CAC 2026: Novas regras do SINARM", slug: "cac-2026", category: { name: "LEGISLAÇÃO", slug: "legislacao" }, featureImageUrl: null, publishedAt: new Date("2026-04-05"), isExclusive: false, categoryId: "3" },
                  ]
              ).map((article) => (
                <Link key={article.id} href={`/blog/${article.slug}`} className="group block bg-[#0e1520] border border-[#141d2c] rounded-lg overflow-hidden hover:border-[#1c2a3e] transition-colors">
                  {/* Image */}
                  <div className="bg-[#141d2c] h-[176px] relative rounded-t-lg overflow-hidden">
                    {article.featureImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={article.featureImageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : null}
                    {article.isExclusive && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#ff1f1f] text-white text-[9px] font-semibold px-2 py-1 rounded-[2px] tracking-[0.5px]">
                          EXCLUSIVO
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 px-3.5 pt-3.5 pb-4">
                    <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1px] uppercase">
                      {article.category.name}
                    </p>
                    <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[17px] leading-snug line-clamp-2">
                      {article.title}
                    </p>
                    <p className="text-[#253750] text-[12px]">
                      {article.publishedAt
                        ? article.publishedAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                        : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <section className="bg-[#120000] border border-[#3d0000] rounded-lg px-12 h-[180px] flex items-center gap-8">
            <div className="flex flex-col gap-2.5 flex-1">
              <p className="font-['Barlow_Condensed'] font-extrabold text-[#dce8ff] text-[32px] leading-tight">
                Acervo completo nas suas mãos
              </p>
              <p className="text-[#253750] text-[15px]">
                145 edições regulares + 62 especiais. Escolha seu plano.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link href="/assine" className="border border-[#1c2a3e] hover:border-zinc-500 text-white text-[13px] font-semibold px-4 py-2.5 rounded transition-colors">
                Trimestral
              </Link>
              <Link href="/assine" className="border border-[#1c2a3e] hover:border-zinc-500 text-white text-[13px] font-semibold px-4 py-2.5 rounded transition-colors">
                Semestral
              </Link>
              <Link href="/assine" className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold px-4 py-2.5 rounded transition-colors">
                Anual — Melhor custo
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-8 w-[300px] shrink-0">
          {/* Ad 300×250 */}
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[9px] font-semibold text-[#253750] tracking-[1.5px] uppercase">
              Publicidade
            </p>
            <div className="bg-[#0e1520] border border-[#141d2c] rounded w-[300px] h-[250px] flex items-center justify-center">
              <p className="font-mono text-[#253750] text-[12px]">300×250</p>
            </div>
          </div>

          {/* Mais Lidos */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-lg p-5 flex flex-col gap-3">
            <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[18px]">
              Mais Lidos
            </p>
            {mostRead.map((title, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="font-['Barlow_Condensed'] font-extrabold text-[#141d2c] text-[20px] leading-none shrink-0 w-7">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[#7a9ab5] text-[13px] leading-snug">{title}</p>
              </div>
            ))}
          </div>

          {/* Ad 300×600 */}
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[9px] font-semibold text-[#253750] tracking-[1.5px] uppercase">
              Publicidade
            </p>
            <div className="bg-[#0e1520] border border-[#141d2c] rounded w-[300px] h-[600px] flex items-center justify-center">
              <p className="font-mono text-[#253750] text-[12px]">300×600</p>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
