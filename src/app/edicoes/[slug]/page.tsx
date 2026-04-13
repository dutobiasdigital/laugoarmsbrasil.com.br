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
        pageCount: true, editorial: true,
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
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Breadcrumb */}
        <div className="px-5 lg:px-20 pt-7 pb-2">
          <Link href="/edicoes" className="text-[#a1a1aa] hover:text-white text-[14px] transition-colors">
            ← Edições
          </Link>
        </div>

        {/* Hero */}
        <div className="px-5 lg:px-20 py-8 flex flex-col lg:flex-row gap-10">
          {/* Cover */}
          <div
            className={`w-full max-w-[320px] mx-auto lg:mx-0 h-[428px] flex items-center justify-center rounded-[4px] shrink-0 ${
              isSpecial ? "bg-[#cc0000]" : "bg-[#27272a]"
            } border border-[#3f3f46]`}
          >
            {edition.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={edition.coverImageUrl}
                alt={edition.title}
                className="w-full h-full object-cover rounded-[4px]"
              />
            ) : (
              <p className={`font-['Barlow_Condensed'] font-bold text-[28px] ${isSpecial ? "text-[#7a0000]" : "text-[#3f3f46]"}`}>
                {edition.number ? `Nº ${edition.number}` : "—"}
              </p>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 flex-1">
            {/* Badges */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold tracking-[1px] px-2 py-[3px] rounded-[2px] ${
                isSpecial ? "bg-[#ff1f1f] text-white" : "bg-[#27272a] text-[#a1a1aa]"
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
              <p className="text-[#a1a1aa] text-[14px]">
                {publishMeta}{edition.pageCount ? ` · ${edition.pageCount} páginas` : ""}
              </p>
            )}

            <div className="bg-[#27272a] h-px w-full" />

            {/* Editorial */}
            {edition.editorial && (
              <>
                <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">Editorial</p>
                <p className="text-[#d4d4da] text-[14px] leading-[22px] max-w-[560px]">
                  {edition.editorial}
                </p>
              </>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {isSubscriber ? (
                <>
                  <Link
                    href="/minha-conta/edicoes"
                    className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[48px] px-8 flex items-center justify-center rounded-[4px] transition-colors"
                  >
                    Ler Edição
                  </Link>
                  <Link
                    href="/minha-conta/edicoes"
                    className="bg-[#09090b] border border-[#3f3f46] hover:border-zinc-500 text-[#d4d4da] text-[15px] font-medium h-[48px] px-8 flex items-center justify-center rounded-[4px] transition-colors"
                  >
                    Baixar PDF
                  </Link>
                </>
              ) : (
                <Link
                  href="/assine"
                  className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[48px] px-8 flex items-center justify-center rounded-[4px] transition-colors"
                >
                  Assine para Ler
                </Link>
              )}
            </div>

            <p className="text-[#52525b] text-[12px]">
              🔒 Acesso exclusivo para assinantes ativos
            </p>
          </div>
        </div>

        {/* Table of Contents placeholder */}
        <div className="px-5 lg:px-20 pb-12">
          <div className="bg-[#27272a] h-px w-full mb-8" />
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">
            Índice da Edição
          </p>
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
              {[
                { page: 4, title: "Editorial", category: "Abertura" },
                { page: 8, title: "Legislação e regulamentação", category: "Legislação" },
                { page: 18, title: "Avaliação de armas de fogo", category: "Avaliações" },
                { page: 32, title: "Munições — Guia de performance", category: "Munições" },
                { page: 44, title: "Técnicas de recarga manual", category: "Recarga" },
                { page: 58, title: "Equipamentos táticos", category: "Avaliações" },
                { page: 70, title: "Mercado de armas usadas", category: "Defesa" },
                { page: 82, title: "Facas táticas", category: "Facas" },
                { page: 96, title: "Retrospectiva", category: "Legislação" },
                { page: 112, title: "Anúncios e classificados", category: "Informativo" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[#27272a] last:border-0">
                  <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[22px] w-[36px] shrink-0">
                    {item.page}
                  </span>
                  <span className="text-[#d4d4da] text-[13px] flex-1">{item.title}</span>
                  <span className="text-[10px] text-[#52525b] bg-[#27272a] px-1.5 py-[2px] rounded-[2px] shrink-0">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        {!isSubscriber && (
          <div className="px-5 lg:px-20 pb-12">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
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
                  className="bg-[#09090b] border border-[#3f3f46] hover:border-zinc-500 text-[#d4d4da] text-[14px] font-medium h-[48px] px-6 flex items-center justify-center rounded-[4px] transition-colors whitespace-nowrap"
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
            <p className="text-[#a1a1aa] text-[11px] font-semibold tracking-[1.5px] uppercase mb-2">
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
                    className="bg-[#18181b] border border-[#27272a] rounded-[6px] overflow-hidden hover:border-zinc-600 transition-colors"
                  >
                    <div className={`h-[160px] flex items-center justify-center ${relSpecial ? "bg-[#cc0000]" : "bg-[#27272a]"}`}>
                      {rel.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rel.coverImageUrl} alt={rel.title} className="w-full h-full object-cover" />
                      ) : (
                        <p className={`font-['Barlow_Condensed'] font-semibold text-[18px] ${relSpecial ? "text-[#7a0000]" : "text-[#3f3f46]"}`}>
                          {rel.number ? `Nº ${rel.number}` : "—"}
                        </p>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[#d4d4da] text-[14px] font-semibold leading-snug mb-2">
                        {rel.number ? `Edição ${rel.number}` : rel.title}
                      </p>
                      <div className="bg-[#09090b] border border-[#3f3f46] h-[36px] flex items-center justify-center rounded-[4px] text-[#a1a1aa] text-[13px]">
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
