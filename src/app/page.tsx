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
  let latestEditions: { id: string; title: string; number: number | null; slug: string; coverImageUrl: string | null; publishedAt: Date | null; type: string }[] = [];
  let totalEditions = 0;

  try {
    [latestEditions, totalEditions] = await Promise.all([
      prisma.edition.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          number: true,
          slug: true,
          coverImageUrl: true,
          publishedAt: true,
          type: true,
        },
      }),
      prisma.edition.count({ where: { isPublished: true } }),
    ]);
  } catch {
    // DB unavailable — renders page with empty data
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Red accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-[#ff1f1f]" />

        <div className="relative max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-[#ff1f1f]/10 border border-[#ff1f1f]/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff1f1f] animate-pulse" />
            <span className="text-xs text-[#ff1f1f] font-medium tracking-widest uppercase">
              Acervo digital disponível
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-6 font-['Barlow_Condensed']">
            O MUNDO DAS ARMAS
            <br />
            <span className="text-[#ff1f1f]">EM SUAS MÃOS</span>
          </h1>

          <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Acesse o maior acervo de publicações especializadas em armas,
            munições e legislação do Brasil. Mais de{" "}
            <span className="text-white font-medium">{totalEditions > 0 ? totalEditions : "300"}+ edições</span>{" "}
            disponíveis para assinantes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/assine"
              className="inline-flex items-center justify-center gap-2 bg-[#ff1f1f] hover:bg-[#cc0000] text-white font-bold px-8 py-4 rounded text-sm tracking-wide transition-colors"
            >
              Assinar agora
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/edicoes"
              className="inline-flex items-center justify-center gap-2 bg-transparent border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold px-8 py-4 rounded text-sm tracking-wide transition-colors"
            >
              Ver edições
            </Link>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </section>

      {/* Stats */}
      <section className="border-y border-zinc-800 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: "38+", label: "Anos de história" },
            { value: "300+", label: "Edições publicadas" },
            { value: "1985", label: "Fundada em" },
            { value: "100%", label: "Conteúdo especializado" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white font-['Barlow_Condensed'] mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest editions */}
      {latestEditions.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-16 w-full">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs text-[#ff1f1f] font-semibold uppercase tracking-widest mb-2">
                Acervo
              </p>
              <h2 className="text-2xl font-bold text-white font-['Barlow_Condensed'] tracking-wide">
                ÚLTIMAS EDIÇÕES
              </h2>
            </div>
            <Link
              href="/edicoes"
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              Ver todas →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {latestEditions.map((edition) => (
              <Link key={edition.id} href="/assine" className="group block">
                <div className="aspect-[3/4] bg-zinc-800 rounded overflow-hidden mb-2 relative">
                  {edition.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={edition.coverImageUrl}
                      alt={edition.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 p-3">
                      <div className="w-0.5 h-6 bg-[#ff1f1f] mb-2" />
                      <div className="text-[8px] font-bold tracking-widest text-zinc-500 text-center mb-1">
                        REVISTA MAGNUM
                      </div>
                      {edition.number && (
                        <div className="text-2xl font-bold text-zinc-600">
                          {edition.number}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-white text-xs font-semibold bg-[#ff1f1f] px-3 py-1.5 rounded">
                      Assinar
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {edition.number ? `Nº ${edition.number}` : edition.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="border-t border-zinc-800 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs text-[#ff1f1f] font-semibold uppercase tracking-widest mb-2">
              Por que assinar
            </p>
            <h2 className="text-2xl font-bold text-white font-['Barlow_Condensed'] tracking-wide">
              TUDO QUE VOCÊ PRECISA
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: "Acervo completo",
                desc: "Acesso a todas as edições publicadas desde a fundação da revista.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Leitura online",
                desc: "Folheie as revistas digitalmente, como se estivesse com o exemplar impresso.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                ),
                title: "Download em PDF",
                desc: "Baixe as edições em PDF e leia offline quando quiser.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Acesso mobile",
                desc: "Leia em qualquer dispositivo — celular, tablet ou computador.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Conteúdo verificado",
                desc: "Informações técnicas precisas com o rigor editorial de 38 anos.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Novas edições",
                desc: "Acesso imediato a cada nova edição assim que publicada.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded bg-[#ff1f1f]/10 border border-[#ff1f1f]/20 flex items-center justify-center text-[#ff1f1f]">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900 border border-zinc-800 rounded-xl p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-[#ff1f1f]" />
          <div className="relative">
            <p className="text-xs text-[#ff1f1f] font-semibold uppercase tracking-widest mb-3">
              Comece hoje
            </p>
            <h2 className="text-3xl font-bold text-white font-['Barlow_Condensed'] tracking-wide mb-4">
              ACESSO ILIMITADO AO ACERVO
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8">
              Assine agora e tenha acesso imediato a todas as edições da Revista Magnum.
            </p>
            <Link
              href="/assine"
              className="inline-flex items-center gap-2 bg-[#ff1f1f] hover:bg-[#cc0000] text-white font-bold px-10 py-4 rounded text-sm tracking-wide transition-colors"
            >
              Ver planos e assinar
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
