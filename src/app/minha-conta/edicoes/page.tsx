import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Edições — Minha Conta · Revista Magnum",
};

export default async function EdicoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [profile, editions] = await Promise.all([
    prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true, subscription: { select: { status: true } } },
    }),
    prisma.edition.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: "desc" }],
    }),
  ]);

  if (!profile) redirect("/auth/login");

  const isActive = profile.subscription?.status === "ACTIVE";

  return (
    <div className="pt-14 lg:pt-0 pb-20 lg:pb-0 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Edições</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {isActive
            ? `${editions.length} edição${editions.length !== 1 ? "ões" : ""} disponível${editions.length !== 1 ? "is" : ""}`
            : "Assine para acessar todas as edições"}
        </p>
      </div>

      {!isActive && (
        <div className="bg-[#ff1f1f]/10 border border-[#ff1f1f]/20 rounded-lg p-4 mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-300">
            Sua assinatura está inativa. Renove para acessar o acervo completo.
          </p>
          <Link
            href="/assine"
            className="flex-shrink-0 bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
          >
            Assinar
          </Link>
        </div>
      )}

      {editions.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-500">Nenhuma edição publicada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {editions.map((edition) => (
            <div key={edition.id} className="group">
              <div className="aspect-[3/4] bg-zinc-800 rounded overflow-hidden mb-3 relative">
                {edition.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={edition.coverImageUrl}
                    alt={edition.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <div className="w-0.5 h-8 bg-[#ff1f1f] mb-3" />
                    <div className="text-[9px] font-bold tracking-widest text-zinc-400 text-center mb-2">
                      REVISTA MAGNUM
                    </div>
                    {edition.number && (
                      <div className="text-3xl font-bold text-zinc-600">
                        {edition.number}
                      </div>
                    )}
                  </div>
                )}

                {/* Hover overlay */}
                {isActive ? (
                  <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/60 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex flex-col gap-2">
                      {edition.pageFlipUrl && (
                        <a
                          href={edition.pageFlipUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-[#ff1f1f] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors hover:bg-[#cc0000]"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Ler online
                        </a>
                      )}
                      {edition.pdfStoragePath && (
                        <a
                          href={`/api/edicoes/${edition.slug}/pdf`}
                          className="flex items-center gap-1.5 bg-zinc-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors hover:bg-zinc-600"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Baixar PDF
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center">
                    <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </div>

              <div>
                {edition.type === "SPECIAL" && (
                  <span className="inline-block text-[9px] font-bold tracking-widest text-[#ff1f1f] uppercase mb-1">
                    Edição especial
                  </span>
                )}
                <p className="text-sm font-medium text-zinc-300 line-clamp-2 leading-snug">
                  {edition.number ? `Nº ${edition.number} · ` : ""}{edition.title}
                </p>
                {edition.publishedAt && (
                  <p className="text-[11px] text-zinc-600 mt-1">
                    {edition.publishedAt.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </p>
                )}
                {edition.pageCount && (
                  <p className="text-[11px] text-zinc-600">{edition.pageCount} páginas</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
