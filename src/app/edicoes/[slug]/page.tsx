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
        take: 4,
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
          <div
            className={`w-full max-w-[320px] mx-auto lg:mx-0 h-[428px] flex items-center justify-center rounded-[4px] shrink-0 ${
              isSpecial ? "bg-[#cc0000]" : "bg-[#141d2c]"
            } border border-[#1c2a3e]`}
          >
            {edition.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={edition.coverImageUrl}
                alt={edition.title}
                className="w-full h-full object-cover rounded-[4px]"
              />
            ) : (
              <p className={`font-['Barlow_Condensed'] font-bold text-[28px] ${isSpecial ? "text-[#7a0000]" : "text-[#1c2a3e]"}`}>
                {edition.number ? `Nº ${edition.number}` : "—"}
              </p>
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
              <>
                <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">Editorial</p>
                <div
                  className="text-[#d4d4da] text-[14px] leading-[22px] max-w-[560px] prose-sm prose-invert"
                  dangerouslySetInnerHTML={{ __html: edition.editorial }}
                />
              </>
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
          <div className="bg-[#141d2c] h-px w-full mb-8" />
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">
            Índice da Edição
          </p>
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-lg p-6 lg:p-8">
            {(() => {
              let toc: { page: string; title: string; category: string }[] = [];
              try { toc = JSON.parse(edition.tableOfContents ?? "[]"); } catch { toc = []; }
              if (toc.length === 0) {
                return (
                  <p className="text-[#253750] text-[13px] text-center py-4">
                    Índice não disponível para esta edição.
                  </p>
                );
              }
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-0">
                  {toc.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-3 border-b border-[#141d2c] last:border-0">
                      <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[22px] w-[40px] shrink-0 leading-none pt-0.5">
                        {item.page}
                      </span>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[#d4d4da] text-[13px] font-medium leading-snug">
                          {item.title}
                        </span>
                        {item.category && (
                          <span className="inline-block text-[#6f6f77] text-[10px] bg-[#141d2c] px-1.5 py-[2px] rounded-[2px] self-start">
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
            <p className="text-[#7a9ab5] text-[11px] font-semibold tracking-[1.5px] uppercase mb-2">
              Outras Edições
            </p>
            <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] mb-6">
              Continue explorando o acervo
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((rel) => {
                const relSpecial = rel.type === "SPECIAL";
                return (
                  <Link
                    key={rel.id}
                    href={`/edicoes/${rel.slug}`}
                    className="bg-[#0e1520] border border-[#141d2c] rounded-[6px] overflow-hidden hover:border-zinc-600 transition-colors"
                  >
                    <div className={`h-[160px] flex items-center justify-center ${relSpecial ? "bg-[#cc0000]" : "bg-[#141d2c]"}`}>
                      {rel.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rel.coverImageUrl} alt={rel.title} className="w-full h-full object-cover" />
                      ) : (
                        <p className={`font-['Barlow_Condensed'] font-semibold text-[18px] ${relSpecial ? "text-[#7a0000]" : "text-[#1c2a3e]"}`}>
                          {rel.number ? `Nº ${rel.number}` : "—"}
                        </p>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[#d4d4da] text-[14px] font-semibold leading-snug mb-2">
                        {rel.number ? `Edição ${rel.number}` : rel.title}
                      </p>
                      <div className="bg-[#070a12] border border-[#1c2a3e] h-[36px] flex items-center justify-center rounded-[4px] text-[#7a9ab5] text-[13px]">
                        Assine para Ler
                      </div>
                    </div>
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
