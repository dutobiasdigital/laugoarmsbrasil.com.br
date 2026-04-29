import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturedCarousel from "@/components/loja/FeaturedCarousel";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

export const metadata = {
  title: "Loja — Laúgo Arms Brasil",
  description: "Livros técnicos, acessórios e produtos especializados do mundo das armas.",
};

interface ShopCategory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  mainImageUrl: string | null;
  isFeatured: boolean;
  hasVariations: boolean;
  stock: number | null;
  categoryId: string | null;
  category: { title: string; slug: string } | null;
}

// Gradientes de fallback por posição de categoria
const CAT_GRADIENTS = [
  "from-[#1a0808] to-[#0e1520]",
  "from-[#080f1a] to-[#0a0f1a]",
  "from-[#0a0e08] to-[#0e1520]",
  "from-[#10080a] to-[#0e1520]",
  "from-[#08101a] to-[#070a12]",
  "from-[#121008] to-[#0e1520]",
];

type StatProduct = {
  product_slug: string; product_name: string;
  mainImageUrl: string | null; basePrice: number;
  total_views?: number; total_sold?: number;
};

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function LojaPage() {
  let categories: ShopCategory[] = [];
  let products: ShopProduct[]    = [];
  let mostViewed: StatProduct[]  = [];
  let mostSold: StatProduct[]    = [];

  try {
    const [catRes, prodRes, viewStatsRes, salesRes] = await Promise.all([
      fetch(`${BASE}/shop_categories?isActive=eq.true&select=id,title,slug,description,sortOrder&order=sortOrder.asc`, { headers: HEADERS, cache: "no-store" }),
      fetch(`${BASE}/shop_products?isActive=eq.true&select=id,name,slug,basePrice,mainImageUrl,isFeatured,hasVariations,stock,categoryId,category:shop_categories(title,slug)&order=isFeatured.desc,name.asc`, { headers: HEADERS, cache: "no-store" }),
      fetch(`${BASE}/product_view_stats?order=total_views.desc&limit=5&select=product_slug,total_views`, { headers: HEADERS, cache: "no-store" }),
      fetch(`${BASE}/product_sales_stats?order=total_sold.desc&limit=5&select=product_slug,product_name,mainImageUrl,basePrice,total_sold`, { headers: HEADERS, cache: "no-store" }),
    ]);
    if (catRes.ok)  { const d = await catRes.json();  if (Array.isArray(d)) categories = d; }
    if (prodRes.ok) { const d = await prodRes.json(); if (Array.isArray(d)) products   = d; }

    // Mais visualizados: busca slugs → detalhes dos produtos
    if (viewStatsRes.ok) {
      const stats: { product_slug: string; total_views: number }[] = await viewStatsRes.json();
      if (stats.length > 0) {
        const slugs = stats.map(s => s.product_slug).join(",");
        const detRes = await fetch(`${BASE}/shop_products?slug=in.(${slugs})&isActive=eq.true&select=slug,name,mainImageUrl,basePrice`, { headers: HEADERS, cache: "no-store" });
        if (detRes.ok) {
          const dets: { slug: string; name: string; mainImageUrl: string | null; basePrice: number }[] = await detRes.json();
          mostViewed = stats.map(s => {
            const d = dets.find(p => p.slug === s.product_slug);
            return d ? { product_slug: d.slug, product_name: d.name, mainImageUrl: d.mainImageUrl, basePrice: d.basePrice, total_views: s.total_views } : null;
          }).filter(Boolean) as StatProduct[];
        }
      }
    }

    // Mais vendidos: direto da view
    if (salesRes.ok) {
      const d = await salesRes.json();
      if (Array.isArray(d)) mostSold = d;
    }
  } catch { /* DB unavailable */ }

  // Map: categoryId → first product imageUrl
  const catImageMap: Record<string, string | null> = {};
  for (const p of products) {
    if (p.categoryId && !catImageMap[p.categoryId]) {
      catImageMap[p.categoryId] = p.mainImageUrl;
    }
  }

  // Map: categoryId → product count
  const catCountMap: Record<string, number> = {};
  for (const p of products) {
    if (p.categoryId) catCountMap[p.categoryId] = (catCountMap[p.categoryId] ?? 0) + 1;
  }

  const featured = products.filter(p => p.isFeatured);
  const totalCount = products.length;

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      <div className="mt-16">

        {/* ── Cabeçalho da loja ─────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-[#0e1520]">
          {/* Grade decorativa */}
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(0deg,#7a9ab5 0,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#7a9ab5 0,transparent 1px,transparent 60px)" }} />
          <div className="absolute -top-40 right-[5%] w-[600px] h-[600px] rounded-full opacity-[0.05] pointer-events-none"
            style={{ background: "radial-gradient(circle,#ff1f1f 0%,transparent 70%)" }} />

          <div className="relative z-10 px-5 lg:px-20 py-14 lg:py-20 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div className="flex flex-col gap-4 max-w-[600px]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff1f1f] animate-pulse" />
                <span className="text-[#ff1f1f] text-[10px] font-bold tracking-[2.5px] uppercase">Loja Oficial</span>
              </div>
              <h1 className="font-['Barlow_Condensed'] font-extrabold leading-[0.95]">
                <span className="text-[#dce8ff] text-[56px] lg:text-[80px] block">Loja</span>
                <span className="text-[#ff1f1f] text-[56px] lg:text-[80px] block">Laúgo</span>
              </h1>
              <p className="text-[#7a9ab5] text-[15px] leading-relaxed max-w-md">
                Equipamentos, livros técnicos e acessórios selecionados para o atirador profissional e o entusiasta de armas.
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 lg:gap-10 shrink-0">
              {[
                { n: totalCount, label: "Produtos" },
                { n: categories.length, label: "Categorias" },
                { n: featured.length, label: "Em Destaque" },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center">
                  <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[36px] leading-none">{s.n}</p>
                  <p className="text-[#526888] text-[11px] font-semibold uppercase tracking-[0.8px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Categorias ────────────────────────────────────────── */}
        {categories.length > 0 && (
          <section className="px-5 lg:px-20 py-14">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[2px] uppercase mb-1">Explorar</p>
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[36px] leading-none">
                  Categorias
                </h2>
              </div>
              <Link href="/loja/produtos" className="text-[#526888] hover:text-[#7a9ab5] text-[13px] font-semibold transition-colors">
                Ver todos os produtos →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categories.map((cat, i) => {
                const img    = catImageMap[cat.id];
                const count  = catCountMap[cat.id] ?? 0;
                const grad   = CAT_GRADIENTS[i % CAT_GRADIENTS.length];
                return (
                  <Link
                    key={cat.id}
                    href={`/loja/produtos?categoria=${cat.slug}`}
                    className="group relative aspect-[3/4] rounded-[16px] overflow-hidden bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/30 transition-all hover:shadow-[0_0_32px_rgba(255,31,31,0.1)]"
                  >
                    {/* Imagem de fundo */}
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={cat.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${grad}`} />
                    )}

                    {/* Overlay gradiente sempre ativo */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/60 to-transparent" />
                    {/* Overlay vermelho no hover */}
                    <div className="absolute inset-0 bg-[#ff1f1f]/0 group-hover:bg-[#ff1f1f]/10 transition-colors duration-500" />

                    {/* Grid de fundo decorativa */}
                    <div className="absolute inset-0 opacity-[0.04]"
                      style={{ backgroundImage: "repeating-linear-gradient(0deg,#7a9ab5 0,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#7a9ab5 0,transparent 1px,transparent 40px)" }} />

                    {/* Conteúdo */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      <p className="font-['Barlow_Condensed'] font-extrabold text-white text-[18px] leading-tight group-hover:text-[#ff9999] transition-colors">
                        {cat.title}
                      </p>
                      {cat.description && (
                        <p className="text-[#7a9ab5] text-[11px] mt-0.5 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {cat.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[#526888] text-[11px] font-semibold">
                          {count} {count === 1 ? "produto" : "produtos"}
                        </p>
                        <span className="text-[#ff1f1f] text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Card especial "Ver tudo" */}
              <Link
                href="/loja/produtos"
                className="group relative aspect-[3/4] rounded-[16px] overflow-hidden bg-[#070a12] border border-dashed border-[#141d2c] hover:border-[#ff1f1f]/40 transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-[#0e1520] border border-[#141d2c] group-hover:border-[#ff1f1f]/40 flex items-center justify-center transition-colors">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#526888" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M9 3v12M3 9h12"/>
                  </svg>
                </div>
                <div className="text-center px-3">
                  <p className="font-['Barlow_Condensed'] font-bold text-[#526888] group-hover:text-[#7a9ab5] text-[16px] transition-colors">
                    Ver todos
                  </p>
                  <p className="text-[#1c2a3e] text-[11px] mt-0.5">{totalCount} produtos</p>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* ── Produtos em destaque ──────────────────────────────── */}
        {featured.length > 0 && (
          <section className="px-5 lg:px-20 py-12 border-t border-[#0e1520]">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[2px] uppercase mb-1">Selecionados</p>
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[36px] leading-none">
                  Em Destaque
                </h2>
              </div>
              <Link href="/loja/produtos?destaque=1" className="text-[#526888] hover:text-[#7a9ab5] text-[13px] font-semibold transition-colors">
                Ver todos →
              </Link>
            </div>
            <FeaturedCarousel products={featured} />
          </section>
        )}

        {/* ── Todos os produtos (fallback se sem categorias) ───── */}
        {categories.length === 0 && products.length > 0 && (
          <section className="px-5 lg:px-20 py-14">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[36px]">Produtos</h2>
              <Link href="/loja/produtos" className="text-[#526888] hover:text-[#7a9ab5] text-[13px] font-semibold transition-colors">
                Ver todos →
              </Link>
            </div>
            <FeaturedCarousel products={products.slice(0, 8)} />
          </section>
        )}

        {/* ── Empty state ───────────────────────────────────────── */}
        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-16 h-16 rounded-full bg-[#0e1520] border border-[#141d2c] flex items-center justify-center text-3xl">🏪</div>
            <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px]">Em breve</p>
            <p className="text-[#526888] text-[14px] text-center max-w-xs">Estamos preparando produtos incríveis para você.</p>
          </div>
        )}

        {/* ── Mais Visualizados & Mais Vendidos ────────────────── */}
        {(mostViewed.length > 0 || mostSold.length > 0) && (
          <section className="px-5 lg:px-20 py-12 border-t border-[#0e1520]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-[3px] h-6 bg-[#ff1f1f] rounded-full" />
              <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[30px] leading-none">
                Tendências da Loja
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mais Visualizados */}
              {mostViewed.length > 0 && (
                <div className="bg-[#0a0f1a] border border-[#141d2c] rounded-[14px] p-5">
                  <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#141d2c]">
                    <span className="text-[14px]">👁</span>
                    <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[18px]">Mais Visualizados</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {mostViewed.map((p, i) => (
                      <Link key={p.product_slug} href={`/loja/produto/${p.product_slug}`}
                        className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <span className="font-['Barlow_Condensed'] font-extrabold text-[#ff1f1f] text-[20px] w-7 shrink-0 tabular-nums leading-none"
                          style={{ color: "var(--brand,#ff1f1f)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="w-10 h-10 rounded-[6px] bg-[#141d2c] shrink-0 overflow-hidden">
                          {p.mainImageUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={p.mainImageUrl} alt={p.product_name} className="w-full h-full object-cover" />
                            : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#dce8ff] text-[13px] leading-snug line-clamp-1 group-hover:text-white transition-colors">
                            {p.product_name}
                          </p>
                          <p className="text-[#526888] text-[11px] font-mono">{formatCurrency(p.basePrice)}</p>
                        </div>
                        <span className="text-[#526888] text-[11px] font-semibold shrink-0 group-hover:text-[#ff1f1f] transition-colors">
                          {p.total_views?.toLocaleString("pt-BR")} views
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Mais Vendidos */}
              {mostSold.length > 0 && (
                <div className="bg-[#0a0f1a] border border-[#141d2c] rounded-[14px] p-5">
                  <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#141d2c]">
                    <span className="text-[14px]">🏆</span>
                    <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[18px]">Mais Vendidos</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {mostSold.map((p, i) => (
                      <Link key={p.product_slug} href={`/loja/produto/${p.product_slug}`}
                        className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <span className="font-['Barlow_Condensed'] font-extrabold text-[20px] w-7 shrink-0 tabular-nums leading-none"
                          style={{ color: "var(--brand,#ff1f1f)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="w-10 h-10 rounded-[6px] bg-[#141d2c] shrink-0 overflow-hidden">
                          {p.mainImageUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={p.mainImageUrl} alt={p.product_name} className="w-full h-full object-cover" />
                            : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#dce8ff] text-[13px] leading-snug line-clamp-1 group-hover:text-white transition-colors">
                            {p.product_name}
                          </p>
                          <p className="text-[#526888] text-[11px] font-mono">{formatCurrency(p.basePrice)}</p>
                        </div>
                        <span className="text-[#526888] text-[11px] font-semibold shrink-0 group-hover:text-[#ff1f1f] transition-colors">
                          {p.total_sold?.toLocaleString("pt-BR")} vendas
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── CTA final ────────────────────────────────────────── */}
        {products.length > 0 && (
          <div className="px-5 lg:px-20 py-10 border-t border-[#0e1520]">
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-[16px] px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <p className="font-['Barlow_Condensed'] font-extrabold text-[#dce8ff] text-[28px] leading-tight">
                  Explorar catálogo completo
                </p>
                <p className="text-[#526888] text-[13px] mt-1">
                  {totalCount} produtos disponíveis em {categories.length} categorias
                </p>
              </div>
              <Link
                href="/loja/produtos"
                className="shrink-0 h-[48px] px-8 bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-bold rounded-[8px] flex items-center gap-2 transition-colors"
              >
                Ver todos os produtos →
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
