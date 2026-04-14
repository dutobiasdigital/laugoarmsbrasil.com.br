import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EdicaoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let edition: {
    id: string; title: string; number: number | null; slug: string;
    coverImageUrl: string | null; publishedAt: Date | null;
    type: string; pageCount: number | null; editorial: string | null;
    pageFlipUrl: string | null; tableOfContents: string | null;
  } | null = null;

  let related: {
    id: string; title: string; number: number | null; slug: string;
    coverImageUrl: string | null; type: string;
  }[] = [];

  let isSubscriber = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const profile = await prisma.user.findUnique({
        where: { authId: user.id },
        select: { role: true, subscription: { select: { status: true } } },
      });
      isSubscriber = profile?.role === "ADMIN" || profile?.subscription?.status === "ACTIVE";
    }

    edition = await prisma.edition.findUnique({
      where: { slug, isPublished: true },
      select: {
        id: true, title: true, number: true, slug: true,
        coverImageUrl: true, publishedAt: true, type: true,
        pageCount: true, editorial: true, pageFlipUrl: true,
        tableOfContents: true,
      },
    });

    if (edition) {
      related = await prisma.edition.findMany({
        where: { isPublished: true, id: { not: edition.id } },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: { id: true, title: true, number: true, slug: true, coverImageUrl: true, type: true },
      });
    }
  } catch {
    // DB unavailable
  }

  if (!edition) notFound();

  const isSpecial = edition.type === "SPECIAL";
  const publishMeta = edition.publishedAt
    ? edition.publishedAt.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Breadcrumb */}
        <div className="px-5 lg:px-20 pt-7 pb-2">
          <Link href="/edicoes" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
            ← Edições
          </Link>
        </div>

        {/* Hero */}
        <div className="px-5 lg:px-20 py-8 flex flex-col lg:flex-row gap-10">
          {/* Cover */}
          <div className="w-full max-w-[300px] mx-auto lg:mx-0 shrink-0 aspect-[3/4] relative rounded-[6px] overflow-hidden border border-[#1c2a3e] shadow-2xl shadow-black/60">
            {edition.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={edition.coverImageUrl}
                alt={edition.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className={`absolute inset-0 flex items-center justify-center ${isSpecial ? "bg-[#cc0000]/20" : "bg-[#141d2c]"}`}>
                <p className={`font-['Barlow_Condensed'] font-bold text-[28px] ${isSpecial ? "text-[#ff1f1f]/40" : "text-[#1c2a3e]"}`}>
                  {edition.number ? `Nº ${edition.number}` : "—"}
                </p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 flex-1">
            {/* Badges */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold tracking-[1px] px-2 py-[3px] rounded-[2px] ${
                isSpecial ? "bg-[#ff1f1f] text-white" : "bg-[#141d2c] text-[#7a9ab5]"
              }`}>
                {isSpecial ? "ESPECIAL" : "REGULAR"}
              </span>
              {edition.number && !isSpecial && (
                <span className="text-[10px] font-bold bg-[#ff1f1f] text-white px-2 py-[3px] rounded-[2px]">
                  Nº {edition.number}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[56px] leading-[60px]">
              {edition.title}
            </h1>

            {/* Meta */}
            {(publishMeta || edition.pageCount) && (
              <p className="text-[#7a9ab5] text-[14px]">
                {publishMeta}{edition.pageCount ? ` · ${edition.pageCount} páginas` : ""}
              </p>
            )}

            <div className="bg-[#141d2c] h-px w-full" />

            {/* Editorial */}
            {edition.editorial && (
              <div className="border-l-2 border-[#ff1f1f]/60 pl-4 py-1 rounded-r-sm" style={{ background: "linear-gradient(90deg, rgba(255,31,31,0.04) 0%, transparent 60%)" }}>
                <p className="text-[#ff1f1f] text-[9px] font-bold tracking-[2px] uppercase mb-2">Editorial</p>
                <div
                  className="text-[#7a9ab5] text-[13px] leading-[21px] max-w-[540px] prose-sm prose-invert"
                  dangerouslySetInnerHTML={{ __html: edition.editorial }}
                />
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {isSubscriber ? (
                edition.pageFlipUrl ? (
                  <a
                    href={edition.pageFlipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[48px] px-8 flex items-center justify-center rounded-[4px] transition-colors gap-2"
                  >
                    <span>📖</span> Ler Edição
                  </a>
                ) : (
                  <span className="bg-[#141d2c] text-[#253750] text-[14px] h-[48px] px-8 flex items-center justify-center rounded-[4px] cursor-default">
                    Leitura em breve
                  </span>
                )
              ) : (
                <Link
                  href="/assine"
                  className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[48px] px-8 flex items-center justify-center rounded-[4px] transition-colors"
                >
                  Assine para Ler
                </Link>
              )}
            </div>

            <p className="text-[#253750] text-[12px]">
              🔒 Acesso exclusivo para assinantes ativos
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="px-5 lg:px-20 pb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-[#1c2a3e]/50" />
            <span className="text-[#ff1f1f] text-[9px] font-bold tracking-[2.5px] uppercase shrink-0">Índice da Edição</span>
            <div className="h-px flex-1 bg-[#1c2a3e]/50" />
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(160deg, #0d1422 0%, #080c14 100%)", border: "1px solid rgba(255,255,255,0.04)" }}>
            {(() => {
              let toc: { page: string; title: string; category: string }[] = [];
              try { toc = JSON.parse(edition.tableOfContents ?? "[]"); } catch { toc = []; }
              if (toc.length === 0) {
                return (
                  <p className="text-[#253750] text-[13px] text-center py-8">
                    Índice não disponível para esta edição.
                  </p>
                );
              }
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y divide-[#1c2a3e]/30 lg:divide-y-0">
                  {toc.map((item, i) => (
                    <div key={i} className={`flex items-start gap-4 px-6 py-3.5 ${i % 2 === 0 ? "lg:border-r border-[#1c2a3e]/30" : ""} border-b border-[#1c2a3e]/20`}>
                      <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f]/70 text-[18px] w-[32px] shrink-0 leading-none pt-0.5 text-right tabular-nums">
                        {item.page}
                      </span>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[#b0c4d8] text-[13px] font-medium leading-snug">
                          {item.title}
                        </span>
                        {item.category && (
                          <span className="text-[#526888] text-[10px] tracking-wide">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* CTA Banner */}
        {!isSubscriber && (
          <div className="px-5 lg:px-20 pb-12">
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-xl p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
              <div className="w-1 h-[80px] bg-[#ff1f1f] rounded shrink-0 hidden lg:block" />
              <div className="flex flex-col gap-2 flex-1">
                <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none">
                  Não é assinante ainda?
                </h2>
                <p className="text-[#d4d4da] text-[15px] leading-[24px]">
                  Acesse esta e outras 206 edições com uma assinatura Magnum.<br />
                  Planos a partir de R$ 29,90/trimestre. Cancele quando quiser.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  href="/assine"
                  className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[48px] px-6 flex items-center justify-center rounded-[4px] transition-colors whitespace-nowrap"
                >
                  Ver Planos de Assinatura
                </Link>
                <Link
                  href="/auth/login"
                  className="bg-[#070a12] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] font-medium h-[48px] px-6 flex items-center justify-center rounded-[4px] transition-colors whitespace-nowrap"
                >
                  Entrar na conta
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Related Editions */}
        {related.length > 0 && (
          <div className="px-5 lg:px-20 pb-16">
            <p className="text-[#526888] text-[9px] font-bold tracking-[2.5px] uppercase mb-1">
              Outras Edições
            </p>
            <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[30px] mb-6">
              Continue explorando o acervo
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {related.map((rel) => {
                const relSpecial = rel.type === "SPECIAL";
                return (
                  <Link
                    key={rel.id}
                    href={`/edicoes/${rel.slug}`}
                    className="group relative rounded-xl overflow-hidden flex flex-col border border-white/5 hover:border-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/60"
                    style={{ background: "linear-gradient(145deg, #0f1420 0%, #0a0e18 100%)" }}
                  >
                    {/* Cover com aspect-ratio correto */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {rel.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rel.coverImageUrl}
                          alt={rel.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`absolute inset-0 flex items-center justify-center ${relSpecial ? "bg-[#cc0000]/20" : "bg-white/5"}`}>
                          <p className={`font-['Barlow_Condensed'] font-extrabold text-[18px] ${relSpecial ? "text-[#ff1f1f]/40" : "text-white/10"}`}>
                            {rel.number ? `Nº ${rel.number}` : "—"}
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0a0e18] to-transparent" />
                      {relSpecial && (
                        <div className="absolute top-2 left-2">
                          <span className="text-[8px] font-bold uppercase px-1.5 py-[2px] rounded-[3px] bg-[#ff1f1f]/20 text-[#ff6b6b] border border-[#ff1f1f]/30">
                            Especial
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="px-3 py-2.5">
                      <p className="text-white/75 text-[11px] font-semibold leading-snug line-clamp-2 group-hover:text-white transition-colors">
                        {rel.number ? `Edição ${rel.number}` : rel.title}
                      </p>
                    </div>
                    {relSpecial && (
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ boxShadow: "inset 0 0 25px rgba(255,31,31,0.06)" }} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
