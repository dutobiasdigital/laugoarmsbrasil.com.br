import Link from "next/link";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edições — Revista Magnum",
  description: "Todas as edições da Revista Magnum disponíveis para assinantes.",
};

export default async function EdicoesPublicaPage() {
  let editions: { id: string; title: string; number: number | null; slug: string; coverImageUrl: string | null; publishedAt: Date | null; type: string; pageCount: number | null; editorial: string | null }[] = [];

  try {
    editions = await prisma.edition.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        number: true,
        slug: true,
        coverImageUrl: true,
        publishedAt: true,
        type: true,
        pageCount: true,
        editorial: true,
      },
    });
  } catch {
    // DB unavailable
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Page header */}
          <div className="mb-10">
            <p className="text-xs text-[#ff1f1f] font-semibold uppercase tracking-widest mb-2">
              Acervo
            </p>
            <h1 className="text-3xl font-bold text-white font-['Barlow_Condensed'] tracking-wide mb-2">
              TODAS AS EDIÇÕES
            </h1>
            <p className="text-zinc-400 text-sm">
              {editions.length} edição{editions.length !== 1 ? "ões" : ""} publicada{editions.length !== 1 ? "s" : ""} —{" "}
              <Link href="/assine" className="text-[#ff1f1f] hover:underline">
                assine para acessar
              </Link>
            </p>
          </div>

          {editions.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-zinc-500">Nenhuma edição publicada ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {editions.map((edition) => (
                <Link key={edition.id} href="/assine" className="group block">
                  <div className="aspect-[3/4] bg-zinc-800 rounded overflow-hidden mb-3 relative">
                    {edition.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={edition.coverImageUrl}
                        alt={edition.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 p-4">
                        <div className="w-0.5 h-8 bg-[#ff1f1f] mb-3" />
                        <div className="text-[9px] font-bold tracking-widest text-zinc-500 text-center mb-2">
                          REVISTA MAGNUM
                        </div>
                        {edition.number && (
                          <div className="text-3xl font-bold text-zinc-600">
                            {edition.number}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Lock overlay */}
                    <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-[#ff1f1f] text-white text-xs font-bold px-4 py-2 rounded">
                        Assinar para ler
                      </span>
                    </div>

                    {edition.type === "SPECIAL" && (
                      <div className="absolute top-2 left-2 bg-[#ff1f1f] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Especial
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-300 line-clamp-2 leading-snug">
                      {edition.number ? `Nº ${edition.number} · ` : ""}
                      {edition.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {edition.publishedAt && (
                        <p className="text-[11px] text-zinc-600">
                          {edition.publishedAt.toLocaleDateString("pt-BR", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                      {edition.pageCount && (
                        <p className="text-[11px] text-zinc-700">
                          · {edition.pageCount}p
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
