import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import HeroSlider from "@/components/HeroSlider";

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

export default async function HomePage() {
  let latestEditions: {
    id: string; title: string; number: number | null; slug: string;
    coverImageUrl: string | null; publishedAt: string | null; type: string;
    pageCount: number | null;
  }[] = [];

  let latestArticles: {
    id: string; title: string; slug: string; categoryId: string;
    featureImageUrl: string | null; publishedAt: string | null;
    isExclusive: boolean; authorName: string;
    category: { name: string; slug: string };
  }[] = [];

  let featuredEdition: typeof latestEditions[0] | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let heroSlides: any[] = [];

  try {
    const [editionsRes, articlesRes, settingsRes] = await Promise.all([
      fetch(
        `${BASE}/editions?isPublished=eq.true&order=publishedAt.desc&limit=3&select=id,title,number,slug,coverImageUrl,publishedAt,type,pageCount`,
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
    ]);

    if (editionsRes.ok) {
      latestEditions = await editionsRes.json();
    }
    if (articlesRes.ok) {
      latestArticles = await articlesRes.json();
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

      {/* Hero — slider ou estático */}
      <div className="mt-16">
        {heroSlides.length > 0 ? (
          <HeroSlider slides={heroSlides} />
        ) : (
      <section className="hero-metal relative flex items-center px-5 lg:px-20 py-16 lg:py-0 lg:h-[600px] gap-6 overflow-hidden">
        {/* Grade decorativa de fundo */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, #7a9ab5 0px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #7a9ab5 0px, transparent 1px, transparent 60px)",
        }} />
        {/* Glow vermelho diagonal */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #ff1f1f 0%, transparent 70%)" }} />
        {/* Glow azul-aço */}
        <div className="absolute -bottom-20 left-[30%] w-[500px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #7a9ab5 0%, transparent 70%)" }} />

        {/* Stripe vermelha */}
        <div className="hidden lg:block w-[3px] h-[500px] rounded-full shrink-0"
          style={{ background: "linear-gradient(180deg, transparent, #ff1f1f 30%, #ff1f1f 70%, transparent)" }} />
        <div className="hidden lg:block w-8 shrink-0" />

        {/* Texto */}
        <div className="flex flex-col gap-5 flex-1 max-w-[680px] relative z-10">
          <div className="inline-flex items-center gap-2 self-start">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff1f1f] animate-pulse" />
            <span className="text-[#ff1f1f] text-[10px] font-bold tracking-[2px] uppercase">
              Última Edição
            </span>
          </div>

          <div className="font-['Barlow_Condensed'] font-extrabold leading-[1.0]">
            <p className="text-[#dce8ff] text-5xl lg:text-[68px]">
              {featuredEdition ? "Revista Magnum" : "Revista Magnum"}
            </p>
            <p className="text-[#ff1f1f] text-5xl lg:text-[68px]">
              {featuredEdition?.number ? `Edição ${featuredEdition.number}` : "Acervo Digital"}
            </p>
          </div>

          <p className="text-[#526888] text-[12px] font-mono tracking-wide">
            {featuredEdition?.publishedAt
              ? `${new Date(featuredEdition.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })} · ${featuredEdition.pageCount ? `${featuredEdition.pageCount} páginas` : ""} · ${featuredEdition.type === "SPECIAL" ? "Edição Especial" : "Edição Regular"}`
              : "O maior acervo especializado do Brasil"}
          </p>

          <p className="text-[#7a9ab5] text-[15px] leading-relaxed max-w-xl">
            Nesta edição: teste completo da Beretta APX-A1, guia de recarga para .308 Win, legislação CAC 2026 e cobertura dos principais lançamentos do mercado nacional e internacional.
          </p>

          <div className="flex items-center gap-3 flex-wrap pt-1">
            <Link
              href={featuredEdition ? `/minha-conta/edicoes` : "/assine"}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold px-7 py-3 rounded transition-colors"
            >
              {featuredEdition?.number ? `Ler Edição ${featuredEdition.number}` : "Assinar agora"}
            </Link>
            <Link
              href="/edicoes"
              className="border border-[#1c2a3e] hover:border-[#7a9ab5]/50 text-[#7a9ab5] hover:text-white text-[14px] font-semibold px-6 py-3 rounded transition-colors"
            >
              Ver Todas as Edições
            </Link>
          </div>
        </div>

        <div className="flex-1 hidden lg:block" />

        {/* Cover com glow e sombra */}
        <div className="hidden lg:block relative shrink-0 w-[260px] z-10">
          {/* Glow atrás da capa */}
          <div className="absolute inset-0 scale-[1.15] blur-2xl opacity-30 rounded-xl"
            style={{ background: "linear-gradient(145deg, #ff1f1f20, #1c2a3e, #070a12)" }} />
          {/* Borda gradiente na capa hero */}
          <div className="card-metal-border relative">
            <div className="bg-[#0e1520] rounded-[13px] overflow-hidden aspect-[3/4]">
              {featuredEdition?.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredEdition.coverImageUrl}
                  alt={featuredEdition.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="font-['Barlow_Condensed'] font-bold text-[#1c2a3e] text-[18px]">
                    {featuredEdition?.number ? `EDIÇÃO ${featuredEdition.number}` : "MAGNUM"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
        )}
      </div>

      {/* Ad — HOME_TOP (abaixo do hero) */}
      <div className="bg-[#0e1520] flex items-center justify-center py-3 shrink-0">
        <AdBanner position="HOME_TOP" bannerSize="LEADERBOARD" />
      </div>

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
              {(latestEditions.length > 0 ? latestEditions : Array(3).fill(null)).map((edition, i) => {
                const ctaLabel = CTA_VARIANTS[(edition?.number ?? i + 2) % CTA_VARIANTS.length];
                const isSpecial = edition?.type === "SPECIAL";
                return (
                  <div key={edition?.id ?? i} className="card-metal-border">
                    <div className="bg-[#0a0f1a] rounded-[13px] overflow-hidden flex flex-col h-full">
                      {/* Cover — proporção correta de revista */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        {edition?.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={edition.coverImageUrl}
                            alt={edition.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#141d2c]">
                            <p className="font-['Barlow_Condensed'] font-bold text-[#1c2a3e] text-[13px]">
                              {edition?.number ? `CAPA ${edition.number}` : "CAPA"}
                            </p>
                          </div>
                        )}
                        {/* Fade inferior */}
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
                      </div>

                      {/* Info */}
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
                            ? `${new Date(edition.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })} · ${edition.pageCount ? `${edition.pageCount}p` : ""}`
                            : "Em breve"}
                        </p>

                        {i === 0 ? (
                          <Link
                            href="/minha-conta/edicoes"
                            className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[12px] font-semibold h-[36px] flex items-center justify-center rounded mt-1 transition-colors"
                          >
                            Ler Edição
                          </Link>
                        ) : (
                          <Link
                            href={edition ? `/edicoes/${edition.slug}` : "/assine"}
                            className="text-[12px] font-semibold h-[36px] flex items-center justify-center rounded mt-1 transition-colors text-[#7a9ab5] hover:text-white border border-white/8 hover:border-white/20"
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
                    { id: "1", title: "Glock 17 Gen 5: Análise Completa em Campo", slug: "glock-17", category: { name: "AVALIAÇÕES", slug: "avaliacoes" }, featureImageUrl: null, publishedAt: "2026-04-15", isExclusive: false, categoryId: "1", authorName: "" },
                    { id: "2", title: "Guia de Recarga para .308 Winchester", slug: "recarga-308", category: { name: "MUNIÇÕES", slug: "municoes" }, featureImageUrl: null, publishedAt: "2026-04-10", isExclusive: true, categoryId: "2", authorName: "" },
                    { id: "3", title: "CAC 2026: Novas regras do SINARM", slug: "cac-2026", category: { name: "LEGISLAÇÃO", slug: "legislacao" }, featureImageUrl: null, publishedAt: "2026-04-05", isExclusive: false, categoryId: "3", authorName: "" },
                  ]
              ).map((article) => (
                <div key={article.id} className="card-metal-border">
                <Link href={`/blog/${article.slug}`} className="group block bg-[#0a0f1a] rounded-[13px] overflow-hidden h-full">
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
          <AdBanner position="HOME_SIDEBAR" bannerSize="MED_RECT" />

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
          <AdBanner position="HOME_SIDEBAR" bannerSize="HALF_PAGE" />
        </aside>
      </div>

      <Footer />
    </div>
  );
}
