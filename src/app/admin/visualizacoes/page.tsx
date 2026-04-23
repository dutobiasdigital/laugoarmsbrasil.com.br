import ViewsDashboard, { type ViewItem, type SectionData } from "./_components/ViewsDashboard";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const H        = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

async function get<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, { headers: H, cache: "no-store" });
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

function inList(slugs: string[]) {
  return `(${slugs.map((s) => `"${s}"`).join(",")})`;
}

export default async function AdminVisualizacoesPage() {
  /* ── Wave 1: buscar stats em paralelo ─────────────── */
  const [editionStats, articleStats, productStats, guiaStats] = await Promise.all([
    get<{ edition_slug: string; total_views: number; unique_views: number; last_viewed_at: string }>(
      `${BASE}/edition_view_stats?order=total_views.desc&limit=100&select=edition_slug,total_views,unique_views,last_viewed_at`
    ),
    get<{ article_slug: string; total_views: number; last_viewed_at: string }>(
      `${BASE}/article_view_stats?order=total_views.desc&limit=100&select=article_slug,total_views,last_viewed_at`
    ),
    get<{ product_slug: string; total_views: number; last_viewed_at: string }>(
      `${BASE}/product_view_stats?order=total_views.desc&limit=100&select=product_slug,total_views,last_viewed_at`
    ),
    get<{ category_slug: string; total_views: number }>(
      `${BASE}/guia_category_view_stats?order=total_views.desc&limit=100&select=category_slug,total_views`
    ),
  ]);

  /* ── Wave 2: buscar títulos em paralelo ───────────── */
  const editionSlugs = editionStats.map((s) => s.edition_slug).slice(0, 100);
  const articleSlugs = articleStats.map((s) => s.article_slug).slice(0, 100);
  const productSlugs = productStats.map((s) => s.product_slug).slice(0, 100);

  const [editions, articles, products] = await Promise.all([
    editionSlugs.length
      ? get<{ slug: string; title: string; number: number | null; type: string }>(
          `${BASE}/editions?slug=in.${inList(editionSlugs)}&select=slug,title,number,type`
        )
      : Promise.resolve([]),
    articleSlugs.length
      ? get<{ slug: string; title: string; status: string }>(
          `${BASE}/articles?slug=in.${inList(articleSlugs)}&select=slug,title,status`
        )
      : Promise.resolve([]),
    productSlugs.length
      ? get<{ slug: string; name: string }>(
          `${BASE}/shop_products?slug=in.${inList(productSlugs)}&select=slug,name`
        )
      : Promise.resolve([]),
  ]);

  /* ── Mapas de lookup ─────────────────────────────── */
  const edMap = Object.fromEntries(editions.map((e) => [e.slug, e]));
  const arMap = Object.fromEntries(articles.map((a) => [a.slug, a]));
  const prMap = Object.fromEntries(products.map((p) => [p.slug, p]));

  /* ── Montar itens por seção ───────────────────────── */
  const edItems: ViewItem[] = editionStats.map((s) => {
    const ed = edMap[s.edition_slug];
    const label = ed
      ? `${ed.number ? `Nº ${ed.number} — ` : ""}${ed.title}`
      : s.edition_slug;
    return {
      slug:          s.edition_slug,
      title:         label,
      total_views:   Number(s.total_views),
      unique_views:  Number(s.unique_views),
      last_viewed_at: s.last_viewed_at,
      extra:         ed ? (ed.type === "SPECIAL" ? "Especial" : "Regular") : undefined,
    };
  });

  const arItems: ViewItem[] = articleStats.map((s) => {
    const ar = arMap[s.article_slug];
    return {
      slug:           s.article_slug,
      title:          ar?.title ?? s.article_slug,
      total_views:    Number(s.total_views),
      last_viewed_at: s.last_viewed_at,
      extra:          ar?.status === "PUBLISHED" ? undefined : ar?.status,
    };
  });

  const prItems: ViewItem[] = productStats.map((s) => {
    const pr = prMap[s.product_slug];
    return {
      slug:           s.product_slug,
      title:          pr?.name ?? s.product_slug,
      total_views:    Number(s.total_views),
      last_viewed_at: s.last_viewed_at,
    };
  });

  const guiaItems: ViewItem[] = guiaStats.map((s) => ({
    slug:           s.category_slug,
    title:          s.category_slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    total_views:    Number(s.total_views),
    last_viewed_at: null,
  }));

  /* ── Totais ──────────────────────────────────────── */
  const sum = (items: ViewItem[]) => items.reduce((acc, it) => acc + it.total_views, 0);

  const sections = {
    edicoes: {
      label:      "Edições",
      icon:       "📰",
      color:      "#ff1f1f",
      linkBase:   "/edicoes",
      items:      edItems,
      totalViews: sum(edItems),
    } satisfies SectionData,
    blog: {
      label:      "Blog",
      icon:       "✍️",
      color:      "#3b82f6",
      linkBase:   "/blog",
      items:      arItems,
      totalViews: sum(arItems),
    } satisfies SectionData,
    loja: {
      label:      "Loja",
      icon:       "🛒",
      color:      "#22c55e",
      linkBase:   "/loja",
      items:      prItems,
      totalViews: sum(prItems),
    } satisfies SectionData,
    guia: {
      label:      "Guia Comercial",
      icon:       "📍",
      color:      "#f59e0b",
      linkBase:   undefined,
      items:      guiaItems,
      totalViews: sum(guiaItems),
    } satisfies SectionData,
  };

  const grandTotal = sum(edItems) + sum(arItems) + sum(prItems) + sum(guiaItems);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Visualizações
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {grandTotal.toLocaleString("pt-BR")} views registradas no total
          </p>
        </div>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      <ViewsDashboard sections={sections} />
    </>
  );
}
