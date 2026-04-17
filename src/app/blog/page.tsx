import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryViewTracker from "@/components/CategoryViewTracker";
import { getModuleConfig } from "@/lib/module-settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog — Revista Magnum",
  description: "Artigos, avaliações e análises sobre armas, munições e legislação.",
};

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; pagina?: string }>;
}) {
  const [{ categoria, pagina }, modConfig] = await Promise.all([
    searchParams,
    getModuleConfig("blog"),
  ]);
  const page = Math.max(1, parseInt(pagina ?? "1", 10));

  const ITEMS_PER_PAGE = modConfig.itemsPerPage;
  const infiniteScroll = modConfig.infiniteScroll;

  type ArticleItem = {
    id: string; title: string; slug: string; excerpt: string | null;
    featureImageUrl: string | null; publishedAt: string | null;
    isExclusive: boolean; authorName: string;
    category: { name: string };
  };

  let featured: ArticleItem | null = null;
  let articles: ArticleItem[] = [];
  let total = 0;
  let categories: string[] = [];

  try {
    const showFeatured = page === 1 && !categoria;
    // Infinite scroll: accumula a partir do offset base (1 se tem featured, 0 se não)
    const baseOffset = showFeatured ? 1 : 0;
    const limit  = infiniteScroll ? page * ITEMS_PER_PAGE : ITEMS_PER_PAGE;
    const offset = infiniteScroll ? baseOffset : (showFeatured ? 1 : (page - 1) * ITEMS_PER_PAGE);

    const catFilter = categoria
      ? `&article_categories.name=eq.${encodeURIComponent(categoria)}`
      : "";

    const articleSelect = "id,title,slug,excerpt,featureImageUrl,publishedAt,isExclusive,authorName,category:article_categories(name)";
    const embedSuffix = categoria ? "!inner" : "";

    const featuredUrl = showFeatured
      ? `${BASE}/articles?status=eq.PUBLISHED&order=publishedAt.desc&limit=1&select=${articleSelect}`
      : null;

    const articlesUrl = categoria
      ? `${BASE}/articles?status=eq.PUBLISHED${catFilter}&order=publishedAt.desc&limit=${limit}&offset=${offset}&select=id,title,slug,excerpt,featureImageUrl,publishedAt,isExclusive,authorName,category:article_categories${embedSuffix}(name)`
      : `${BASE}/articles?status=eq.PUBLISHED&order=publishedAt.desc&limit=${limit}&offset=${offset}&select=${articleSelect}`;

    const categoriesUrl = `${BASE}/article_categories?select=name&order=name.asc`;

    const fetches: Promise<Response>[] = [
      fetch(articlesUrl, {
        headers: { ...HEADERS, Prefer: "count=exact" },
        cache: "no-store",
      }),
      fetch(categoriesUrl, { headers: HEADERS, cache: "no-store" }),
    ];

    if (featuredUrl) {
      fetches.unshift(
        fetch(featuredUrl, { headers: HEADERS, cache: "no-store" })
      );
    }

    if (featuredUrl) {
      const [featuredRes, articlesRes, categoriesRes] = await Promise.all(fetches);

      if (featuredRes.ok) {
        const featuredData: ArticleItem[] = await featuredRes.json();
        featured = featuredData[0] ?? null;
      }
      if (articlesRes.ok) {
        articles = await articlesRes.json();
        const contentRange = articlesRes.headers.get("Content-Range");
        if (contentRange) {
          const match = contentRange.match(/\/(\d+)$/);
          if (match) total = parseInt(match[1], 10);
        }
      }
      if (categoriesRes.ok) {
        const catData: { name: string }[] = await categoriesRes.json();
        categories = catData.map((c) => c.name);
      }
    } else {
      const [articlesRes, categoriesRes] = await Promise.all(fetches);

      if (articlesRes.ok) {
        articles = await articlesRes.json();
        const contentRange = articlesRes.headers.get("Content-Range");
        if (contentRange) {
          const match = contentRange.match(/\/(\d+)$/);
          if (match) total = parseInt(match[1], 10);
        }
      }
      if (categoriesRes.ok) {
        const catData: { name: string }[] = await categoriesRes.json();
        categories = catData.map((c) => c.name);
      }
    }
  } catch {
    // DB unavailable
  }

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const hasMore    = infiniteScroll && (page * ITEMS_PER_PAGE + (featured ? 1 : 0)) < total;
  const allCategories = ["Todos", ...categories];

  const catHref = (cat: string) =>
    cat === "Todos" ? "/blog" : `/blog?categoria=${encodeURIComponent(cat)}`;

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      {/* Rastreia clique em categoria (só quando filtro está ativo) */}
      {categoria && (
        <CategoryViewTracker
          category={categoria}
          endpoint="/api/blog/categoria/view"
        />
      )}

      {/* ── Hero — estilo GUIA ─────────────────────────────────── */}
      <section className="hero-metal px-5 lg:px-20 pt-14 pb-10 border-b border-[#141d2c] mt-16">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
          <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">
            Conteúdo
          </span>
        </div>
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[52px] lg:text-[64px] leading-[0.95] mb-3">
          Blog
        </h1>
        <p className="text-[#7a9ab5] text-[16px]">
          Artigos, avaliações e análises sobre armas, munições e legislação
        </p>
      </section>

      <main className="flex-1">
        {/* Category Pills */}
        <div className="px-5 lg:px-20 pt-6 pb-4 flex flex-wrap gap-2">
          {allCategories.map((cat) => {
            const active = (cat === "Todos" && !categoria) || cat === categoria;
            return (
              <Link
                key={cat}
                href={catHref(cat)}
                className={`h-[34px] px-4 rounded-full text-[13px] font-semibold transition-colors flex items-center ${
                  active
                    ? "bg-[#ff1f1f] text-white"
                    : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        <div className="px-5 lg:px-20 pb-16 flex flex-col gap-10">
          {/* Featured Article */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="bg-[#0e1520] border border-[#141d2c] rounded-xl overflow-hidden flex flex-col lg:flex-row hover:border-zinc-600 transition-colors"
            >
              <div className="lg:w-[580px] h-[240px] lg:h-auto bg-[#141d2c] shrink-0 flex items-center justify-center order-first lg:order-last">
                {featured.featureImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.featureImageUrl} alt={featured.title} className="w-full h-full object-cover" />
                ) : (
                  <p className="text-[#1c2a3e] text-[13px] font-mono">Imagem</p>
                )}
              </div>
              <div className="flex flex-col gap-3 p-6 lg:p-8 flex-1 justify-center">
                <div className="flex items-center gap-2">
                  {featured.isExclusive && (
                    <span className="bg-[#ff1f1f] text-white text-[10px] font-semibold px-2.5 py-[3px] rounded-full uppercase">
                      Exclusivo
                    </span>
                  )}
                  <span className="bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] text-[11px] px-2.5 py-[3px] rounded-full">
                    {featured.category.name}
                  </span>
                </div>
                <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] leading-[44px]">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-[#d4d4da] text-[15px] leading-[24px] line-clamp-3">
                    {featured.excerpt}
                  </p>
                )}
                <p className="text-white text-[13px]">
                  {featured.authorName}
                  {featured.publishedAt && ` · ${new Date(featured.publishedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}`}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-5 flex items-center rounded-[6px] transition-colors">
                    Ler artigo →
                  </span>
                  {featured.isExclusive && (
                    <span className="text-white text-[12px]">🔒 Para assinantes</span>
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* Articles Grid */}
          {articles.length > 0 && (
            <div>
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] mb-6">
                Artigos recentes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {articles.map((art) => (
                  art && (
                    <Link
                      key={art.id}
                      href={`/blog/${art.slug}`}
                      className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden flex flex-col hover:border-zinc-600 transition-colors"
                    >
                      <div className="h-[180px] bg-[#141d2c] flex items-center justify-center">
                        {art.featureImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={art.featureImageUrl} alt={art.title} className="w-full h-full object-cover" />
                        ) : (
                          <p className="text-[#1c2a3e] text-[11px] font-mono">Imagem</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 p-4">
                        <div className="flex items-center gap-1.5">
                          {art.isExclusive && (
                            <span className="bg-[#ff1f1f] text-white text-[10px] font-semibold px-2 py-[2px] rounded-full uppercase">
                              Exclusivo
                            </span>
                          )}
                          <span className="bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] text-[10px] px-2 py-[2px] rounded-full">
                            {art.category.name}
                          </span>
                        </div>
                        <h3 className="text-white text-[16px] font-semibold leading-[22px] line-clamp-2">
                          {art.title}
                        </h3>
                        {art.excerpt && (
                          <p className="text-[#7a9ab5] text-[13px] leading-[20px] line-clamp-2">
                            {art.excerpt}
                          </p>
                        )}
                        <p className="text-white text-[12px] mt-auto pt-1">
                          {art.publishedAt
                            ? new Date(art.publishedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })
                            : ""}
                        </p>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            </div>
          )}

          {articles.length === 0 && !featured && (
            <p className="text-white text-sm py-12 text-center">Nenhum artigo encontrado.</p>
          )}

          {/* Pagination */}
          {infiniteScroll ? (
            /* ── Scroll infinito: botão "Carregar mais" ── */
            hasMore && (
              <div className="flex justify-center">
                <Link
                  href={`/blog?${categoria ? `categoria=${encodeURIComponent(categoria)}&` : ""}pagina=${page + 1}`}
                  className="bg-[#0e1520] border border-[#1c2a3e] hover:border-[#ff1f1f] text-[#7a9ab5] hover:text-white text-[14px] font-semibold h-[44px] px-8 rounded-[8px] transition-colors flex items-center gap-2"
                >
                  <span>Carregar mais artigos</span>
                  <span className="text-[#526888] text-[12px]">({total - page * ITEMS_PER_PAGE - (featured ? 1 : 0)} restantes)</span>
                </Link>
              </div>
            )
          ) : (
            /* ── Paginação numerada ── */
            totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/blog?${categoria ? `categoria=${encodeURIComponent(categoria)}&` : ""}pagina=${p}`}
                    className={`w-[36px] h-[36px] flex items-center justify-center rounded-[4px] text-[14px] font-semibold transition-colors ${
                      p === page
                        ? "bg-[#ff1f1f] text-white"
                        : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
