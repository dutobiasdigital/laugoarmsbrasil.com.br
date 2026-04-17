import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface Edition {
  id: string; title: string; number: number | null; slug: string;
  coverImageUrl: string | null; publishedAt: string | null;
  type: string; pageCount: number | null; editorial: string | null;
  pageFlipUrl: string | null; tableOfContents: string | null;
}
interface RelatedEdition {
  id: string; title: string; number: number | null; slug: string;
  coverImageUrl: string | null; type: string;
}

export default async function EdicaoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let edition: Edition | null = null;
  let related: RelatedEdition[] = [];
  let isSubscriber = false;
  let hasSingleAccess = false;
  let userEmail: string | null = null;

  try {
    // Busca edição e auth em paralelo
    const supabase = await createClient();
    const [editionRes, { data: { user } }] = await Promise.all([
      fetch(`${BASE}/editions?slug=eq.${slug}&isPublished=eq.true&select=id,title,number,slug,coverImageUrl,publishedAt,type,pageCount,editorial,pageFlipUrl,tableOfContents&limit=1`,
        { headers: HEADERS, cache: "no-store" }),
      supabase.auth.getUser(),
    ]);

    const editionsData = await editionRes.json();
    edition = Array.isArray(editionsData) && editionsData.length > 0 ? editionsData[0] : null;

    // Verifica acesso do usuário
    if (user) {
      userEmail = user.email ?? null;

      const userRes = await fetch(
        `${BASE}/users?authId=eq.${user.id}&select=role,subscriptions(status)&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      );
      const users  = await userRes.json();
      const dbUser = Array.isArray(users) ? users[0] : null;

      const isAdmin    = dbUser?.role === "ADMIN";
      const activeSub  = Array.isArray(dbUser?.subscriptions) && dbUser.subscriptions.some((s: { status: string }) => s.status === "ACTIVE");
      isSubscriber = isAdmin || activeSub;

      // Verifica compra avulsa desta edição (últimos 30 dias)
      if (!isSubscriber && edition && userEmail) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
        const purchasedRes  = await fetch(
          `${BASE}/payment_intents?payer_email=eq.${encodeURIComponent(userEmail)}&product_type=eq.edition_purchase&status=eq.APPROVED&createdAt=gte.${thirtyDaysAgo}&select=metadata`,
          { headers: HEADERS, cache: "no-store" }
        );
        const purchased = await purchasedRes.json();
        hasSingleAccess = Array.isArray(purchased) && purchased.some(
          (p: { metadata?: { edition_slug?: string } }) => p.metadata?.edition_slug === slug
        );
      }
    }

    // Edições relacionadas
    if (edition) {
      const relRes = await fetch(
        `${BASE}/editions?isPublished=eq.true&id=neq.${edition.id}&order=publishedAt.desc&select=id,title,number,slug,coverImageUrl,type&limit=5`,
        { headers: HEADERS, cache: "no-store" }
      );
      const relData = await relRes.json();
      related = Array.isArray(relData) ? relData : [];
    }
  } catch {
    // DB unavailable
  }

  if (!edition) notFound();

  const canRead  = isSubscriber || hasSingleAccess;
  const isSpecial = edition.type === "SPECIAL";
  const publishMeta = edition.publishedAt
    ? new Date(edition.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
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
          <div className="w-full max-w-[280px] mx-auto lg:mx-0 shrink-0 rounded-[8px] overflow-hidden border border-[#1c2a3e] shadow-2xl shadow-black/70 bg-[#0a0e18]">
            {edition.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={edition.coverImageUrl}
                alt={edition.title}
                className="w-full h-auto block"
              />
            ) : (
              <div className={`aspect-[3/4] flex items-center justify-center ${isSpecial ? "bg-[#cc0000]/20" : "bg-[#141d2c]"}`}>
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
              {hasSingleAccess && !isSubscriber && (
                <span className="text-[10px] font-bold bg-[#0f381f] text-[#22c55e] px-2 py-[3px] rounded-[2px]">
                  ACESSO ATIVO 30 DIAS
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
              <div className="border-l-2 border-[#ff1f1f]/60 pl-5 py-2 rounded-r-sm"
                style={{ background: "linear-gradient(90deg, rgba(255,31,31,0.05) 0%, transparent 70%)" }}>
                <p className="text-[#ff1f1f] text-[9px] font-bold tracking-[2px] uppercase mb-3">Editorial</p>
                <div
                  className="text-[#8fb8d4] text-[15px] leading-[28px]"
                  dangerouslySetInnerHTML={{ __html: edition.editorial }}
                />
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {canRead ? (
                (() => {
                  // Leitor nativo: /ler/{slug} (novo sistema)
                  // URL externa (legado): pageFlipUrl que começa com http
                  const isExternalUrl =
                    edition.pageFlipUrl?.startsWith("http://") ||
                    edition.pageFlipUrl?.startsWith("https://");

                  if (isExternalUrl) {
                    // Edição com viewer legado externo — mantém comportamento original
                    return (
                      <a
                        href={edition.pageFlipUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[48px] px-8 flex items-center justify-center rounded-[4px] transition-colors gap-2"
                      >
                        <span>📖</span> Ler Edição
                      </a>
                    );
                  }
                  // Leitor nativo integrado (rota /ler/[slug])
                  return (
                    <Link
                      href={`/ler/${slug}`}
                      className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[48px] px-8 flex items-center justify-center rounded-[4px] transition-colors gap-2"
                    >
                      <span>📖</span> Ler Edição
                    </Link>
                  );
                })()
              ) : (
                <>
                  <Link
                    href="/assine"
                    className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[48px] px-8 flex items-center justify-center rounded-[4px] transition-colors"
                  >
                    Assine para Ler
                  </Link>
                  <Link
                    href={`/checkout?edicao=${slug}`}
                    className="bg-[#0e1520] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] font-medium h-[48px] px-6 flex items-center justify-center rounded-[4px] transition-colors"
                  >
                    Comprar esta edição
                  </Link>
                </>
              )}
            </div>

            {!canRead && (
              <p className="text-white text-[12px]">
                🔒 Assinatura ou acesso avulso por 30 dias
              </p>
            )}
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
                  <p className="text-white text-[13px] text-center py-8">
                    Índice não disponível para esta edição.
                  </p>
                );
              }
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y divide-[#1c2a3e]/30 lg:divide-y-0">
                  {toc.map((item, i) => {
                    const pageNum = parseInt(item.page, 10);
                    const href = canRead && !isNaN(pageNum)
                      ? `/ler/${slug}?page=${pageNum}`
                      : null;

                    const inner = (
                      <>
                        <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f]/70 text-[18px] w-[32px] shrink-0 leading-none pt-0.5 text-right tabular-nums">
                          {item.page}
                        </span>
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="text-[#b0c4d8] text-[13px] font-medium leading-snug group-hover:text-white transition-colors">
                            {item.title}
                          </span>
                          {item.category && (
                            <span className="text-[#526888] text-[10px] tracking-wide">{item.category}</span>
                          )}
                        </div>
                        {href && (
                          <span className="text-[#ff1f1f]/0 group-hover:text-[#ff1f1f]/60 text-[11px] shrink-0 transition-colors self-center">
                            →
                          </span>
                        )}
                      </>
                    );

                    const cls = `group flex items-start gap-4 px-6 py-3.5 ${
                      i % 2 === 0 ? "lg:border-r border-[#1c2a3e]/30" : ""
                    } border-b border-[#1c2a3e]/20 ${
                      href
                        ? "cursor-pointer hover:bg-white/[0.02] transition-colors"
                        : ""
                    }`;

                    return href ? (
                      <Link key={i} href={href} className={cls}>
                        {inner}
                      </Link>
                    ) : (
                      <div key={i} className={cls}>
                        {inner}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* CTA Banner (para não assinantes) */}
        {!isSubscriber && !hasSingleAccess && (
          <div className="px-5 lg:px-20 pb-12">
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-xl p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
              <div className="w-1 h-[80px] bg-[#ff1f1f] rounded shrink-0 hidden lg:block" />
              <div className="flex flex-col gap-2 flex-1">
                <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none">
                  Acesse esta edição
                </h2>
                <p className="text-[#d4d4da] text-[15px] leading-[24px]">
                  Assine e acesse esta e outras 206 edições. Ou compre apenas esta edição por 30 dias.
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
                  href={`/checkout?edicao=${slug}`}
                  className="bg-[#070a12] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] font-medium h-[48px] px-6 flex items-center justify-center rounded-[4px] transition-colors whitespace-nowrap"
                >
                  Comprar só esta edição
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Related Editions */}
        {related.length > 0 && (
          <div className="px-5 lg:px-20 pb-16">
            <p className="text-[#526888] text-[9px] font-bold tracking-[2.5px] uppercase mb-1">Outras Edições</p>
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
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {rel.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rel.coverImageUrl} alt={rel.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className={`absolute inset-0 flex items-center justify-center ${relSpecial ? "bg-[#cc0000]/20" : "bg-white/5"}`}>
                          <p className={`font-['Barlow_Condensed'] font-extrabold text-[18px] ${relSpecial ? "text-[#ff1f1f]/40" : "text-white/10"}`}>
                            {rel.number ? `Nº ${rel.number}` : "—"}
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0a0e18] to-transparent" />
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-white/75 text-[11px] font-semibold leading-snug line-clamp-2 group-hover:text-white transition-colors">
                        {rel.number ? `Edição ${rel.number}` : rel.title}
                      </p>
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
