import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryViewTracker from "@/components/CategoryViewTracker";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

export const metadata = {
  title: "Todos os Produtos — Loja Magnum",
  description: "Catálogo completo da Loja Magnum.",
};

interface ShopCategory { id: string; title: string; slug: string; sortOrder: number; }
interface ShopProduct {
  id: string; name: string; slug: string; basePrice: number;
  mainImageUrl: string | null; mainImageAlt: string | null;
  isFeatured: boolean; hasVariations: boolean; stock: number | null;
  categoryId: string | null;
  category: { id: string; title: string; slug: string } | null;
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StockBadge({ product }: { product: ShopProduct }) {
  if (product.hasVariations) return null;
  const qty = product.stock ?? 0;
  if (qty === 0) return <span className="text-[10px] font-bold tracking-[0.6px] uppercase px-2 py-[3px] rounded-[4px] bg-[#1a0808] border border-[#ff1f1f]/20 text-[#ff6b6b]">Esgotado</span>;
  if (qty <= 5)  return <span className="text-[10px] font-bold tracking-[0.6px] uppercase px-2 py-[3px] rounded-[4px] bg-[#1a1200] border border-[#f59e0b]/20 text-[#f59e0b]">Últimas unid.</span>;
  return <span className="text-[10px] font-bold tracking-[0.6px] uppercase px-2 py-[3px] rounded-[4px] bg-[#071a10] border border-[#22c55e]/20 text-[#22c55e]">Em estoque</span>;
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; destaque?: string }>;
}) {
  const { categoria, destaque } = await searchParams;

  let categories: ShopCategory[] = [];
  let products: ShopProduct[]    = [];

  try {
    const [catRes, prodRes] = await Promise.all([
      fetch(`${BASE}/shop_categories?isActive=eq.true&select=id,title,slug,sortOrder&order=sortOrder.asc`, { headers: HEADERS, cache: "no-store" }),
      fetch(`${BASE}/shop_products?isActive=eq.true&select=id,name,slug,basePrice,mainImageUrl,mainImageAlt,isFeatured,hasVariations,stock,categoryId,category:shop_categories(id,title,slug)&order=isFeatured.desc,name.asc`, { headers: HEADERS, cache: "no-store" }),
    ]);
    if (catRes.ok)  { const d = await catRes.json(); if (Array.isArray(d)) categories = d; }
    if (prodRes.ok) { const d = await prodRes.json(); if (Array.isArray(d)) products   = d; }
  } catch { /* DB unavailable */ }

  const activeCategory = categories.find(c => c.slug === categoria) ?? null;
  let visible = activeCategory ? products.filter(p => p.categoryId === activeCategory.id) : products;
  if (destaque === "1") visible = visible.filter(p => p.isFeatured);
  const sorted = [...visible.filter(p => p.isFeatured), ...visible.filter(p => !p.isFeatured)];

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      {/* Rastreia clique em categoria de produto */}
      {categoria && (
        <CategoryViewTracker
          category={categoria}
          endpoint="/api/loja/categoria/view"
        />
      )}

      <div className="mt-16">
        {/* Breadcrumb */}
        <div className="px-5 lg:px-20 py-4 border-b border-[#0e1520]">
          <nav className="flex items-center gap-2 text-[12px] text-[#526888]">
            <Link href="/loja" className="hover:text-[#7a9ab5] transition-colors">Loja</Link>
            <span>/</span>
            <span className="text-[#7a9ab5]">{activeCategory ? activeCategory.title : destaque === "1" ? "Em Destaque" : "Todos os Produtos"}</span>
          </nav>
        </div>

        {/* Filtro de categorias */}
        {categories.length > 0 && (
          <div className="border-b border-[#141d2c] bg-[#070a12] sticky top-16 z-20">
            <div className="px-5 lg:px-20 flex items-center gap-0 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <Link href="/loja/produtos"
                className={`shrink-0 h-[48px] px-5 flex items-center text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap ${!categoria && !destaque ? "border-[#ff1f1f] text-white" : "border-transparent text-[#526888] hover:text-[#7a9ab5]"}`}>
                Tudo
              </Link>
              {categories.map(cat => (
                <Link key={cat.id} href={`/loja/produtos?categoria=${cat.slug}`}
                  className={`shrink-0 h-[48px] px-5 flex items-center text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap ${categoria === cat.slug ? "border-[#ff1f1f] text-white" : "border-transparent text-[#526888] hover:text-[#7a9ab5]"}`}>
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grid de produtos */}
        <div className="px-5 lg:px-20 py-10">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#0e1520] border border-[#141d2c] flex items-center justify-center text-3xl">🏪</div>
              <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[24px]">
                {categoria ? "Nenhum produto nesta categoria" : "Loja em breve"}
              </p>
              <Link href="/loja/produtos" className="text-[#ff1f1f] text-[13px] font-semibold hover:text-white transition-colors">
                ← Ver todos os produtos
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px] leading-none">
                    {activeCategory ? activeCategory.title : destaque === "1" ? "Em Destaque" : "Todos os Produtos"}
                  </h1>
                </div>
                <span className="text-[#526888] text-[13px] font-mono">{sorted.length} {sorted.length === 1 ? "produto" : "produtos"}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {sorted.map(product => {
                  const inStock = product.hasVariations || (product.stock ?? 0) > 0;
                  return (
                    <Link key={product.id} href={`/loja/produto/${product.slug}`}
                      className="group flex flex-col bg-[#0a0f1a] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[14px] overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(255,31,31,0.06)]">
                      <div className="relative aspect-square bg-[#0e1520] overflow-hidden">
                        {product.mainImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.mainImageUrl} alt={product.mainImageAlt ?? product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#1c2a3e]">
                            <svg width="36" height="36" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="2"/><circle cx="15" cy="17" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M4 28l9-7 7 6 5-4 11 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                          </div>
                        )}
                        {product.isFeatured && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-[#ff1f1f] text-white text-[9px] font-bold px-2 py-[3px] rounded-[4px] tracking-[0.8px] uppercase shadow-lg">Destaque</span>
                          </div>
                        )}
                        {!inStock && (
                          <div className="absolute inset-0 bg-[#070a12]/60 flex items-center justify-center">
                            <span className="text-[#526888] text-[11px] font-bold tracking-wider uppercase">Esgotado</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2.5 p-4 flex-1">
                        {product.category && <span className="text-[#ff1f1f] text-[10px] font-bold tracking-[1px] uppercase">{product.category.title}</span>}
                        <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[16px] leading-snug line-clamp-2 group-hover:text-white transition-colors">{product.name}</p>
                        <div className="flex items-end justify-between gap-2 mt-auto pt-1">
                          <div>
                            {product.hasVariations && <p className="text-[#526888] text-[10px] mb-0.5">a partir de</p>}
                            <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[20px] leading-none">{formatCurrency(product.basePrice)}</p>
                          </div>
                          <StockBadge product={product} />
                        </div>
                      </div>
                      <div className="h-[40px] mx-4 mb-4 rounded-[6px] bg-[#ff1f1f]/0 group-hover:bg-[#ff1f1f] border border-[#1c2a3e] group-hover:border-[#ff1f1f] flex items-center justify-center transition-all">
                        <span className="text-[#526888] group-hover:text-white text-[12px] font-semibold transition-colors">
                          {inStock ? "Ver produto →" : "Ver detalhes →"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
