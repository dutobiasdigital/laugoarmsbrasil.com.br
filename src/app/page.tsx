import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import HeroSlider from "@/components/HeroSlider";
import EditionsFeaturedCarousel from "@/components/EditionsFeaturedCarousel";
import WelcomeBanner from "@/components/WelcomeBanner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Revista Magnum — O Mundo das Armas em Suas Mãos",
  description:
    "O maior acervo de publicações especializadas em armas, munições e legislação do Brasil. Assine e acesse todas as edições.",
};

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

type EditionCard = {
  id: string;
  title: string;
  number: number | null;
  slug: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  type: string;
  pageCount: number | null;
};

type ArticleCard = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  featureImageUrl: string | null;
  publishedAt: string | null;
  isExclusive: boolean;
  authorName: string;
  category: { name: string; slug: string };
};

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export default async function HomePage() {
  let latestEditions: EditionCard[]   = [];
  let specialEditions: EditionCard[]  = [];
  let regularEditions: EditionCard[]  = [];
  let featuredEditions: EditionCard[] = [];
  let latestArticles: ArticleCard[]   = [];
  let topEditions: (EditionCard & { totalViews: number })[] = [];
  let featuredEdition: EditionCard | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let heroSlides: any[] = [];

  try {
    /* ── Phase 1: parallel fetches ─────────────────────────────── */
    const [
      latestRes,
      specialPoolRes,
      regularRes,
      featuredRes,
      articlesRes,
      settingsRes,
      viewStatsRes,
    ] = await Promise.all([
      fetch(
        `${BASE}/editions?isPublished=eq.true&order=publishedAt.desc&limit=3&select=id,title,number,slug,coverImageUrl,publishedAt,type,pageCount`,
        { headers: HEADERS, cache: "no-store" }
      ),
      // Fetch a pool of 10 specials so we can randomise on the server
      fetch(
        `${BASE}/editions?isPublished=eq.true&type=eq.SPECIAL&order=publishedAt.desc&limit=10&select=id,title,number,slug,coverImageUrl,publishedAt,type,pageCount`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/editions?isPublished=eq.true&type=eq.REGULAR&order=publishedAt.desc&limit=3&select=id,title,number,slug,coverImageUrl,publishedAt,type,pageCount`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/editions?isPublished=eq.true&isFeatured=eq.true&order=publishedAt.desc&limit=20&select=id,title,number,slug,coverImageUrl,publishedAt,type,pageCount`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/articles?status=eq.PUBLISHED&order=publishedAt.desc&limit=3&select=id,title,slug,categoryId,featureImageUrl,publishedAt,isExclusive,authorName,category:article_categories(name,slug)`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/site_settings?key=eq.hero.slides&select=value&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/edition_view_stats?order=total_views.desc&limit=5&select=edition_slug,total_views`,
        { headers: HEADERS, cache: "no-store" }
      ),
    ]);

    if (latestRes.ok)       latestEditions   = await latestRes.json();
    if (regularRes.ok)      regularEditions  = await regularRes.json();
    if (featuredRes.ok)     featuredEditions = await featuredRes.json();
    if (articlesRes.ok)     latestArticles   = await articlesRes.json();

    if (specialPoolRes.ok) {
      const pool: EditionCard[] = await specialPoolRes.json();
      specialEditions = pickRandom(pool, 3);
    }

    if (settingsRes.ok) {
      const settingsData = await settingsRes.json();
      const raw = settingsData?.[0]?.value;
      if (raw) {
        const parsed = JSON.parse(raw);
        heroSlides = Array.isArray(parsed)
          ? parsed.filter((s: { active?: boolean }) => s.active).sort((a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0))
          : [];
      }
    }

    /* ── Phase 2: top editions (needs slugs from view stats) ──── */
    if (viewStatsRes.ok) {
      const stats: { edition_slug: string; total_views: number }[] = await viewStatsRes.json();
      if (stats.length > 0) {
        const slugList = stats.map((s) => s.edition_slug).join(",");
        const edRes = await fetch(
          `${BASE}/editions?slug=in.(${slugList})&select=id,title,number,slug,coverImageUrl,publishedAt,type,pageCount`,
          { headers: HEADERS, cache: "no-store" }
        );
        if (edRes.ok) {
          const edData: EditionCard[] = await edRes.json();
          topEditions = stats
            .map((s) => {
              const ed = edData.find((e) => e.slug === s.edition_slug);
              return ed ? { ...ed, totalViews: s.total_views } : null;
            })
            .filter(Boolean) as (EditionCard & { totalViews: number })[];
        }
      }
    }

    featuredEdition = latestEditions[0] ?? null;
  } catch {
    // DB unavailable
  }

  const CTA_VARIANTS = [
    "Espie esta edição",
    "Descubra o conteúdo",
    "Relembre essa época",
    "Mergulhe no acervo",
    "Viaje no tempo",
    "Folheie agora",
    "Reviva a história",
    "Acesse o arquivo",
  ];

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      {/* Hero — slider, welcome banner ou estático */}
      <div className="mt-16">
        {heroSlides.length > 0 ? (
          <HeroSlider slides={heroSlides} />
        ) : (
          <WelcomeBanner />
        )}
      </div>

      {/* Ad — HOME_TOP (abaixo do hero) */}
      <div className="bg-[#070a12] flex items-center justify-center py-3 shrink-0 border-y border-[#0e1520]">
        <AdBanner position="HOME_TOP" bannerSize="LEADERBOARD" />
      </div>

      {/* ── Edições em Destaque — carrossel full-width ───────────── */}
      {featuredEditions.length > 0 && (
        <section className="px-5 lg:px-20 py-10 border-b border-[#0e1520]">
          <div className="flex items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-6 bg-[#ff1f1f] rounded-full" />
              <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px] leading-none">
                Edições em Destaque
              </h2>
            </div>
            <div className="flex-1" />
            <Link href="/edicoes" className="text-[#ff1f1f] text-[13px] font-semibold hover:text-[#ff4444] transition-colors">
              Ver todas →
            </Link>
          </div>
          <EditionsFeaturedCarousel editions={featuredEditions} />
        </section>
      )}

      {/* ── Split container ──────────────────────────────────────── */}
      <div className="bg-[#070a12] flex gap-10 px-5 lg:px-20 py-16 items-start">

        {/* ── Main column ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-14 flex-1 min-w-0">

          {/* Últimas Edições (3) */}
          <section>
            <div className="flex items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-6 bg-[#ff1f1f] rounded-full" />
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px] leading-none">
                  Últimas Edições
                </h2>
              </div>
              <div className="flex-1" />
              <Link href="/edicoes" className="text-[#ff1f1f] text-[13px] font-semibold hover:text-[#ff4444] transition-colors">
                Ver todas →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(latestEditions.length > 0 ? latestEditions : Array(3).fill(null)).map((edition, i) => {
                const ctaLabel = CTA_VARIANTS[(edition?.number ?? i + 2) % CTA_VARIANTS.length];
                const isSpecial = edition?.type === "SPECIAL";
                return (
                  <div key={edition?.id ?? i} className="card-metal-border">
                    <div className="bg-[#0a0f1a] rounded-[13px] overflow-hidden flex flex-col h-full">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        {edition?.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={edition.coverImageUrl} alt={edition.title} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#141d2c]">
                            <p className="font-['Barlow_Condensed'] font-bold text-[#1c2a3e] text-[13px]">
                              {edition?.number ? `CAPA ${edition.number}` : "CAPA"}
                            </p>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
                      </div>
                      <div className="flex flex-col gap-2 px-4 pt-3 pb-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold tracking-[0.8px] uppercase px-1.5 py-[2px] rounded-[3px] ${
                            isSpecial ? "bg-[#ff1f1f]/20 text-[#ff6b6b] border border-[#ff1f1f]/30" : "bg-white/5 text-[#7a9ab5] border border-white/10"
                          }`}>
                            {isSpecial ? "Especial" : "Regular"}
                          </span>
                          {edition?.number && (
                            <span className="text-[9px] font-semibold text-[#526888]">#{edition.number}</span>
                          )}
                        </div>
                        <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[17px] leading-snug line-clamp-2">
                          {edition?.title ?? "Revista Magnum"}
                        </p>
                        <p className="text-[#526888] text-[11px] font-mono">
                          {edition?.publishedAt
                            ? `${new Date(edition.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}${edition.pageCount ? ` · ${edition.pageCount}p` : ""}`
                            : "Em breve"}
                        </p>
                        {i === 0 ? (
                          <Link href="/minha-conta/edicoes" className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[12px] font-semibold h-[36px] flex items-center justify-center rounded mt-1 transition-colors">
                            Ler Edição
                          </Link>
                        ) : (
                          <Link
                            href={edition ? `/edicoes/${edition.slug}` : "/assine"}
                            className="text-[12px] font-semibold h-[36px] flex items-center justify-center rounded mt-1 transition-colors text-[#7a9ab5] hover:text-white border border-white/[0.08] hover:border-white/20"
                            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}
                          >
                            {ctaLabel}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Edições Especiais (6 — 3 por linha) */}
          <section>
            <div className="flex items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-6 bg-[#ff1f1f] rounded-full" />
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px] leading-none">
                  Edições Especiais
                </h2>
              </div>
              <div className="flex-1" />
              <Link href="/edicoes?tipo=SPECIAL" className="text-[#ff1f1f] text-[13px] font-semibold hover:text-[#ff4444] transition-colors">
                Ver todas →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(specialEditions.length > 0 ? specialEditions : Array(3).fill(null)).map((edition, i) => (
                <Link
                  key={edition?.id ?? i}
                  href={edition ? `/edicoes/${edition.slug}` : "#"}
                  className="group flex flex-col bg-[#0a0f1a] border border-[#141d2c] hover:border-[#ff1f1f]/30 rounded-[10px] overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(255,31,31,0.06)]"
                >
                  <div className="relative w-full aspect-[3/4] bg-[#0e1520] overflow-hidden">
                    {edition?.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={edition.coverImageUrl} alt={edition.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="font-['Barlow_Condensed'] font-bold text-[#1c2a3e] text-[12px]">ESPECIAL</p>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    <span className="text-[9px] font-bold tracking-[0.8px] uppercase text-[#ff6b6b]">
                      Especial{edition?.number ? ` · Nº ${edition.number}` : ""}
                    </span>
                    <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[14px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                      {edition?.title ?? "Edição Especial"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Edições Regulares (3) */}
          <section>
            <div className="flex items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-6 bg-[#526888] rounded-full" />
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px] leading-none">
                  Edições Regulares
                </h2>
              </div>
              <div className="flex-1" />
              <Link href="/edicoes?tipo=REGULAR" className="text-[#ff1f1f] text-[13px] font-semibold hover:text-[#ff4444] transition-colors">
                Ver todas →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(regularEditions.length > 0 ? regularEditions : Array(3).fill(null)).map((edition, i) => (
                <Link
                  key={edition?.id ?? i}
                  href={edition ? `/edicoes/${edition.slug}` : "#"}
                  className="group flex flex-col bg-[#0a0f1a] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[10px] overflow-hidden transition-all"
                >
                  <div className="relative w-full aspect-[3/4] bg-[#0e1520] overflow-hidden">
                    {edition?.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={edition.coverImageUrl} alt={edition.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="font-['Barlow_Condensed'] font-bold text-[#1c2a3e] text-[12px]">MAGNUM</p>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    <span className="text-[9px] font-bold tracking-[0.8px] uppercase text-[#526888]">
                      Regular{edition?.number ? ` · Nº ${edition.number}` : ""}
                    </span>
                    <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[14px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                      {edition?.title ?? "Edição Regular"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Artigos Recentes */}
          <section>
            <div className="flex items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-6 bg-[#ff1f1f] rounded-full" />
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px] leading-none">
                  Artigos Recentes
                </h2>
              </div>
              <div className="flex-1" />
              <Link href="/blog" className="text-[#ff1f1f] text-[13px] font-semibold hover:text-[#ff4444] transition-colors">
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(latestArticles.length > 0
                ? latestArticles
                : [
                    { id: "1", title: "Glock 17 Gen 5: Análise Completa em Campo", slug: "glock-17-gen-5-analise-completa", category: { name: "Avaliações", slug: "avaliacoes" }, featureImageUrl: null, publishedAt: "2026-04-10", isExclusive: false, categoryId: "", authorName: "" },
                    { id: "2", title: "Guia de Recarga para .308 Winchester", slug: "guia-recarga-308-winchester", category: { name: "Recarga", slug: "recarga" }, featureImageUrl: null, publishedAt: "2026-04-06", isExclusive: false, categoryId: "", authorName: "" },
                    { id: "3", title: "Legislação CAC 2026: Novas Regras", slug: "legislacao-cac-2026-novas-regras", category: { name: "Legislação", slug: "legislacao" }, featureImageUrl: null, publishedAt: "2026-04-08", isExclusive: false, categoryId: "", authorName: "" },
                  ]
              ).map((article) => (
                <div key={article.id} className="card-metal-border">
                  <Link href={`/blog/${article.slug}`} className="group block bg-[#0a0f1a] rounded-[13px] overflow-hidden h-full">
                    <div className="bg-[#141d2c] h-[176px] relative rounded-t-lg overflow-hidden">
                      {article.featureImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={article.featureImageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : null}
                      {article.isExclusive && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-[#ff1f1f] text-white text-[9px] font-semibold px-2 py-1 rounded-[2px] tracking-[0.5px]">EXCLUSIVO</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 px-3.5 pt-3.5 pb-4">
                      <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1px] uppercase">
                        {article.category.name}
                      </p>
                      <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[17px] leading-snug line-clamp-2">
                        {article.title}
                      </p>
                      <p className="text-[#526888] text-[12px] font-mono">
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                          : ""}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <section className="bg-[#120000] border border-[#3d0000] rounded-lg px-8 lg:px-12 py-8 lg:h-[180px] flex flex-col lg:flex-row items-center gap-8">
            <div className="flex flex-col gap-2.5 flex-1">
              <p className="font-['Barlow_Condensed'] font-extrabold text-[#dce8ff] text-[32px] leading-tight">
                Acervo completo nas suas mãos
              </p>
              <p className="text-[#7a9ab5] text-[15px]">
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

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-8 w-[300px] shrink-0">
          {/* Ad 300×250 */}
          <AdBanner position="HOME_SIDEBAR" bannerSize="MED_RECT" />

          {/* Edições Mais Lidas */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-lg p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-1 border-b border-[#141d2c]">
              <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
              <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[18px] leading-none">
                Edições Mais Lidas
              </p>
            </div>
            {(topEditions.length > 0
              ? topEditions
              : [
                  { id: "1", title: "Glock 17 Gen 5: Análise Completa", slug: "glock-17", number: 145, coverImageUrl: null, publishedAt: null, type: "REGULAR", pageCount: null, totalViews: 0 },
                  { id: "2", title: "Legislação CAC 2026: Novas regras", slug: "cac-2026", number: 144, coverImageUrl: null, publishedAt: null, type: "REGULAR", pageCount: null, totalViews: 0 },
                  { id: "3", title: "Recarga para .308 Winchester", slug: "recarga-308", number: 143, coverImageUrl: null, publishedAt: null, type: "REGULAR", pageCount: null, totalViews: 0 },
                  { id: "4", title: "Pistolas de serviço policial 2026", slug: "pistolas-policiais", number: 142, coverImageUrl: null, publishedAt: null, type: "REGULAR", pageCount: null, totalViews: 0 },
                  { id: "5", title: "Balística terminal: fundamentos", slug: "balistica-terminal", number: 141, coverImageUrl: null, publishedAt: null, type: "REGULAR", pageCount: null, totalViews: 0 },
                ]
            ).map((edition, i) => (
              <Link key={edition.id} href={`/edicoes/${edition.slug}`} className="group flex items-start gap-3 hover:opacity-80 transition-opacity">
                <span className="font-['Barlow_Condensed'] font-extrabold text-[#ff1f1f] text-[22px] leading-none shrink-0 w-8 tabular-nums" style={{ color: "var(--brand, #ff1f1f)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-[#dce8ff] text-[13px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                    {edition.title}
                  </p>
                  {edition.number && (
                    <span className="text-[#526888] text-[11px] font-mono">Nº {edition.number}</span>
                  )}
                </div>
              </Link>
            ))}
            <Link href="/edicoes" className="text-[#ff1f1f] text-[12px] font-semibold hover:text-[#ff4444] transition-colors pt-1 border-t border-[#141d2c]">
              Ver todas as edições →
            </Link>
          </div>

          {/* Ad 300×600 */}
          <AdBanner position="HOME_SIDEBAR" bannerSize="HALF_PAGE" />
        </aside>
      </div>

      <Footer />
    </div>
  );
}
