import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoriteButton from "@/components/FavoriteButton";
import EditorialExpandable from "./_EditorialExpandable";
import EditionMediaModal from "./_EditionMediaModal";
import MarkedPagesViewer from "./_MarkedPagesViewer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface Edition {
  id: string; title: string; number: number | null; slug: string;
  coverImageUrl: string | null; publishedAt: string | null;
  type: string; pageCount: number | null; editorial: string | null;
  teaser: string | null; summary: string | null;
  video_url: string | null; gallery_images: string | null;
  editorialPageFiles: string[] | null; indexPageFiles: string[] | null;
  pageFlipUrl: string | null; tableOfContents: string | null;
}
interface RelatedEdition {
  id: string; title: string; number: number | null; slug: string;
  coverImageUrl: string | null; type: string;
}
interface NeighborEdition {
  id: string; title: string; number: number | null; slug: string;
  coverImageUrl: string | null; publishedAt: string | null;
}

export default async function EdicaoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let edition: Edition | null = null;
  let related: RelatedEdition[] = [];
  let prevEdition: NeighborEdition | null = null;
  let nextEdition: NeighborEdition | null = null;
  let isSubscriber = false;
  let hasSingleAccess = false;
  let userEmail: string | null = null;
  let isLoggedIn = false;
  let isFavorited = false;
  let dbUserId: string | null = null;

  try {
    // Busca edição e auth em paralelo
    const supabase = await createClient();
    const [editionRes, { data: { user } }] = await Promise.all([
      fetch(`${BASE}/editions?slug=eq.${slug}&isPublished=eq.true&select=id,title,number,slug,coverImageUrl,publishedAt,type,pageCount,editorial,teaser,summary,video_url,gallery_images,editorialPageFiles,indexPageFiles,pageFlipUrl,tableOfContents&limit=1`,
        { headers: HEADERS, cache: "no-store" }),
      supabase.auth.getUser(),
    ]);

    const editionsData = await editionRes.json();
    edition = Array.isArray(editionsData) && editionsData.length > 0 ? editionsData[0] : null;

    // Verifica acesso do usuário
    if (user) {
      isLoggedIn = true;
      userEmail = user.email ?? null;

      const userRes = await fetch(
        `${BASE}/users?authId=eq.${user.id}&select=id,role,subscriptions(status)&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      );
      const users  = await userRes.json();
      const dbUser = Array.isArray(users) ? users[0] : null;
      dbUserId = dbUser?.id ?? null;

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

    // Verifica favorito
    if (dbUserId && edition) {
      const favRes = await fetch(
        `${BASE}/user_favorites?userId=eq.${dbUserId}&contentType=eq.edition&contentId=eq.${edition.id}&select=id&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      );
      const favData = await favRes.json();
      isFavorited = Array.isArray(favData) && favData.length > 0;
    }

    // Edições relacionadas + anterior/próxima do mesmo tipo
    if (edition) {
      const neighborSelect = "id,title,number,slug,coverImageUrl,publishedAt";
      const [relRes, prevRes, nextRes] = await Promise.all([
        fetch(
          `${BASE}/editions?isPublished=eq.true&id=neq.${edition.id}&order=publishedAt.desc&select=id,title,number,slug,coverImageUrl,type&limit=5`,
          { headers: HEADERS, cache: "no-store" }
        ),
        edition.number != null
          ? fetch(
              `${BASE}/editions?isPublished=eq.true&type=eq.${edition.type}&number=lt.${edition.number}&order=number.desc&select=${neighborSelect}&limit=1`,
              { headers: HEADERS, cache: "no-store" }
            )
          : Promise.resolve(null),
        edition.number != null
          ? fetch(
              `${BASE}/editions?isPublished=eq.true&type=eq.${edition.type}&number=gt.${edition.number}&order=number.asc&select=${neighborSelect}&limit=1`,
              { headers: HEADERS, cache: "no-store" }
            )
          : Promise.resolve(null),
      ]);

      const relData = await relRes.json();
      related = Array.isArray(relData) ? relData : [];

      if (prevRes) {
        const pd = await prevRes.json();
        prevEdition = Array.isArray(pd) && pd.length > 0 ? pd[0] : null;
      }
      if (nextRes) {
        const nd = await nextRes.json();
        nextEdition = Array.isArray(nd) && nd.length > 0 ? nd[0] : null;
      }
    }
  } catch {
    // DB unavailable
  }

  if (!edition) notFound();

  const canRead  = isSubscriber || hasSingleAccess;

  let galleryImages: { url: string; storage_path: string; order: number }[] = [];
  try { galleryImages = JSON.parse(edition.gallery_images ?? "[]"); } catch { galleryImages = []; }
  galleryImages = galleryImages.filter(img => img.url).sort((a, b) => a.order - b.order);

  // Signed URLs para páginas marcadas (bucket privado)
  let indexSignedUrls: string[] = [];
  const indexFiles = edition.indexPageFiles ?? [];
  if (indexFiles.length > 0) {
    try {
      const admin = createAdminClient();
      const paths = indexFiles.map((f: string) => `${slug}/${f}`);
      const { data } = await admin.storage.from("edition-pages").createSignedUrls(paths, 3600);
      indexSignedUrls = (data ?? []).filter(d => d.signedUrl).map(d => d.signedUrl!);
    } catch { indexSignedUrls = []; }
  }
  const isSpecial = edition.type === "SPECIAL";
  const publishMeta = edition.publishedAt
    ? new Date(edition.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      <Header />

      <main className="flex-1 pt-16">
        {/* ── Hero — estilo GUIA ─────────────────────────────────── */}
        <section className="hero-metal px-5 lg:px-20 pt-10 pb-12 border-b border-[#141d2c]">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/edicoes" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
              ← Edições
            </Link>
          </div>

          {/* Cover + Info */}
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Cover */}
            <div className="w-full max-w-[260px] mx-auto lg:mx-0 shrink-0 shadow-2xl shadow-black/70">
              {edition.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={edition.coverImageUrl}
                  alt={edition.title}
                  className="w-full h-auto block rounded-[8px]"
                  style={{ border: "1px solid var(--border-mid)" }}
                />
              ) : (
                <div className={`aspect-[3/4] flex items-center justify-center rounded-[8px] ${isSpecial ? "bg-[#cc0000]/20" : "bg-[#141d2c]"}`}
                  style={{ border: "1px solid var(--border-mid)" }}>
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
              <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[52px] lg:text-[64px] leading-[0.95]">
                {edition.title}
              </h1>

              {/* Meta */}
              {(publishMeta || edition.pageCount) && (
                <p className="text-[#7a9ab5] text-[15px]">
                  {publishMeta}{edition.pageCount ? ` · ${edition.pageCount} páginas` : ""}
                </p>
              )}

              <div className="bg-[#1c2a3e] h-px w-full" />

              {/* CTAs + Favoritar — mesma linha, mesmo tamanho */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {canRead ? (
                  (() => {
                    const isExternalUrl =
                      edition.pageFlipUrl?.startsWith("http://") ||
                      edition.pageFlipUrl?.startsWith("https://");

                    if (isExternalUrl) {
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
                <FavoriteButton
                  contentType="edition"
                  contentId={edition.id}
                  isLoggedIn={isLoggedIn}
                  initialIsFavorited={isFavorited}
                  size="lg"
                  label={isFavorited ? "Favoritado" : "Favoritar"}
                />
                <EditionMediaModal
                  videoUrl={edition.video_url ?? null}
                  galleryImages={galleryImages}
                />
              </div>

              {!canRead && (
                <p className="text-white/50 text-[12px]">
                  🔒 Assinatura ou acesso avulso por 30 dias
                </p>
              )}

              {/* Chamada da Edição — abaixo dos botões */}
              {(edition.summary || edition.teaser) && (
                <p className="text-[#7a9ab5] text-[14px] leading-[24px] pt-1">
                  {edition.summary ?? edition.teaser}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Editorial + Índice (páginas marcadas) */}
        {(edition.editorial || indexSignedUrls.length > 0) && (
          <div className="px-5 lg:px-20 py-10 border-b border-[#141d2c]">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {edition.editorial && (
                <div className="flex-1 min-w-0">
                  <EditorialExpandable html={edition.editorial} />
                </div>
              )}
              <MarkedPagesViewer indexUrls={indexSignedUrls} />
            </div>
          </div>
        )}

        {/* Table of Contents */}
        <div className="px-5 lg:px-20 pt-10 pb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-[#1c2a3e]/50" />
            <span className="text-[#ff1f1f] text-[9px] font-bold tracking-[2.5px] uppercase shrink-0">Índice da Edição</span>
            <div className="h-px flex-1 bg-[#1c2a3e]/50" />
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            {(() => {
              let toc: { page: string; title: string; category: string; author?: string; description?: string }[] = [];
              try { toc = JSON.parse(edition.tableOfContents ?? "[]"); } catch { toc = []; }
              if (toc.length === 0) {
                return (
                  <p className="text-white text-[13px] text-center py-8">
                    Índice não disponível para esta edição.
                  </p>
                );
              }
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0" style={{ borderColor: "var(--border)" }}>
                  {toc.map((item, i) => {
                    const pageNum = parseInt(item.page, 10);
                    const href = canRead && !isNaN(pageNum)
                      ? `/ler/${slug}?page=${pageNum}`
                      : null;

                    const inner = (
                      <>
                        <span className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f]/70 text-[24px] w-[40px] shrink-0 leading-none pt-1 text-right tabular-nums">
                          {item.page}
                        </span>
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <span className="text-[16px] font-semibold leading-snug transition-colors" style={{ color: "var(--text-heading)" }}>
                            {item.title}
                          </span>
                          {item.category && (
                            <span className="text-[#ff1f1f]/70 text-[10px] font-bold tracking-[1.5px] uppercase">{item.category}</span>
                          )}
                          {(item.author || item.description) && (
                            <div className="flex flex-col gap-0.5 mt-1 pt-1" style={{ borderTop: "1px solid var(--border)" }}>
                              {item.author && (
                                <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>Por {item.author}</span>
                              )}
                              {item.description && (
                                <span className="text-[12px] leading-snug" style={{ color: "var(--text-subtle)" }}>{item.description}</span>
                              )}
                            </div>
                          )}
                        </div>
                        {href && (
                          <span className="text-[#ff1f1f]/0 group-hover:text-[#ff1f1f]/60 text-[11px] shrink-0 transition-colors self-center">
                            →
                          </span>
                        )}
                      </>
                    );

                    const cls = `group flex items-start gap-5 px-6 py-5 ${
                      i % 2 === 0 ? "lg:border-r" : ""
                    } border-b ${
                      href
                        ? "cursor-pointer hover:bg-white/[0.02] transition-colors"
                        : ""
                    }`;

                    const borderStyle = { borderColor: "var(--border)" };
                    return href ? (
                      <Link key={i} href={href} className={cls} style={borderStyle}>
                        {inner}
                      </Link>
                    ) : (
                      <div key={i} className={cls} style={borderStyle}>
                        {inner}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Navegação anterior / próxima — mesmo tipo */}
        {(prevEdition || nextEdition) && (
          <div className="px-5 lg:px-20 py-10 border-t border-b border-[#141d2c]">
            <div className="flex items-stretch gap-4">

              {/* Esquerda — Próxima edição (mais recente) */}
              <div className="flex-1 flex">
                {nextEdition ? (
                  <Link
                    href={`/edicoes/${nextEdition.slug}`}
                    className="group flex-1 flex items-center gap-4 rounded-[10px] px-5 py-4 border transition-colors hover:border-[#ff1f1f]/40"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-[#ff1f1f] text-[9px] font-bold tracking-[2px] uppercase flex items-center gap-1">
                        <span>←</span> Próxima edição
                      </span>
                      <p className="font-['Barlow_Condensed'] font-bold text-[18px] leading-snug line-clamp-2 group-hover:text-[#ff1f1f] transition-colors" style={{ color: "var(--text-heading)" }}>
                        {nextEdition.number ? `Nº ${nextEdition.number}` : nextEdition.title}
                      </p>
                      {nextEdition.publishedAt && (
                        <p className="text-[12px] font-mono" style={{ color: "var(--text-subtle)" }}>
                          {new Date(nextEdition.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    {nextEdition.coverImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={nextEdition.coverImageUrl}
                        alt={nextEdition.title}
                        className="w-[56px] h-[75px] object-cover rounded-[4px] shrink-0 shadow-md"
                        style={{ border: "1px solid var(--border-mid)" }}
                      />
                    )}
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
              </div>

              {/* Divider vertical */}
              <div className="w-px bg-[#1c2a3e] shrink-0 self-stretch" />

              {/* Direita — Edição anterior (mais antiga) */}
              <div className="flex-1 flex">
                {prevEdition ? (
                  <Link
                    href={`/edicoes/${prevEdition.slug}`}
                    className="group flex-1 flex items-center gap-4 rounded-[10px] px-5 py-4 border transition-colors hover:border-[#ff1f1f]/40"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    {prevEdition.coverImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={prevEdition.coverImageUrl}
                        alt={prevEdition.title}
                        className="w-[56px] h-[75px] object-cover rounded-[4px] shrink-0 shadow-md"
                        style={{ border: "1px solid var(--border-mid)" }}
                      />
                    )}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-[#7a9ab5] text-[9px] font-bold tracking-[2px] uppercase flex items-center gap-1 justify-end">
                        Edição anterior <span>→</span>
                      </span>
                      <p className="font-['Barlow_Condensed'] font-bold text-[18px] leading-snug line-clamp-2 text-right group-hover:text-[#ff1f1f] transition-colors" style={{ color: "var(--text-heading)" }}>
                        {prevEdition.number ? `Nº ${prevEdition.number}` : prevEdition.title}
                      </p>
                      {prevEdition.publishedAt && (
                        <p className="text-[12px] font-mono text-right" style={{ color: "var(--text-subtle)" }}>
                          {new Date(prevEdition.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
              </div>

            </div>
          </div>
        )}

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
