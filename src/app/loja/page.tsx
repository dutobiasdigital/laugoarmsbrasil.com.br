import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

export const metadata = {
  title: "Loja — Revista Magnum",
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
  mainImageAlt: string | null;
  isFeatured: boolean;
  hasVariations: boolean;
  stock: number | null;
  categoryId: string | null;
  category: { id: string; title: string; slug: string } | null;
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StockBadge({ product }: { product: ShopProduct }) {
  if (product.hasVariations) return null;
  const qty = product.stock ?? 0;
  if (qty === 0)
    return (
      <span className="text-[10px] font-bold tracking-[0.6px] uppercase px-2 py-[3px] rounded-[4px] bg-[#1a0808] border border-[#ff1f1f]/20 text-[#ff6b6b]">
        Esgotado
      </span>
    );
  if (qty <= 5)
    return (
      <span className="text-[10px] font-bold tracking-[0.6px] uppercase px-2 py-[3px] rounded-[4px] bg-[#1a1200] border border-[#f59e0b]/20 text-[#f59e0b]">
        Últimas unidades
      </span>
    );
  return (
    <span className="text-[10px] font-bold tracking-[0.6px] uppercase px-2 py-[3px] rounded-[4px] bg-[#071a10] border border-[#22c55e]/20 text-[#22c55e]">
      Em estoque
    </span>
  );
}

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  let categories: ShopCategory[] = [];
  let products: ShopProduct[] = [];

  try {
    const [catRes, prodRes] = await Promise.all([
      fetch(
        `${BASE}/shop_categories?isActive=eq.true&select=id,title,slug,description,sortOrder&order=sortOrder.asc`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/shop_products?isActive=eq.true&select=id,name,slug,basePrice,mainImageUrl,mainImageAlt,isFeatured,hasVariations,stock,categoryId,category:shop_categories(id,title,slug)&order=isFeatured.desc,name.asc`,
        { headers: HEADERS, cache: "no-store" }
      ),
    ]);
    if (catRes.ok) {
      const data = await catRes.json();
      if (Array.isArray(data)) categories = data;
    }
    if (prodRes.ok) {
      const data = await prodRes.json();
      if (Array.isArray(data)) products = data;
    }
  } catch { /* DB unavailable */ }

  // Filter by category slug
  const activeCategory = categories.find(c => c.slug === categoria) ?? null;
  const visible = activeCategory
    ? products.filter(p => p.categoryId === activeCategory.id)
    : products;

  const featured = visible.filter(p => p.isFeatured);
  const rest     = visible.filter(p => !p.isFeatured);
  const sorted   = [...featured, ...rest];

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="mt-16">
        <section className="relative overflow-hidden px-5 lg:px-20 py-14 lg:py-20">
          {/* Grade decorativa */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,#7a9ab5 0,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#7a9ab5 0,transparent 1px,transparent 60px)",
            }}
          />
          {/* Glows */}
          <div className="absolute -top-32 right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.07] pointer-events-none"
            style={{ background: "radial-gradient(circle,#ff1f1f 0%,transparent 70%)" }} />
          <div className="absolute bottom-0 left-[20%] w-[400px] h-[300px] rounded-full opacity-[0.04] pointer-events-none"
            style={{ background: "radial-gradient(circle,#7a9ab5 0%,transparent 70%)" }} />

          <div className="relative z-10 flex flex-col gap-4 max-w-[680px]">
            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff1f1f] animate-pulse" />
              <span className="text-[#ff1f1f] text-[10px] font-bold tracking-[2.5px] uppercase">
                Loja Oficial
              </span>
            </div>

            <h1 className="font-['Barlow_Condensed'] font-extrabold leading-[1.0]">
              <span className="text-[#dce8ff] text-[52px] lg:text-[72px] block">Loja</span>
              <span className="text-[#ff1f1f] text-[52px] lg:text-[72px] block">Magnum</span>
            </h1>

            <p className="text-[#7a9ab5] text-[15px] leading-relaxed max-w-lg">
              Livros técnicos, equipamentos e acessórios selecionados para o atirador profissional e o entusiasta de armas.
            </p>

            {products.length > 0 && (
              <p className="text-[#526888] text-[12px] font-mono">
                {products.length} {products.length === 1 ? "produto disponível" : "produtos disponíveis"}
                {categories.length > 0 && ` · ${categories.length} categorias`}
              </p>
            )}
          </div>

          {/* Stripe vertical decorativa */}
          <div className="hidden lg:block absolute right-[15%] top-[15%] bottom-[15%] w-[1px] opacity-10"
            style={{ background: "linear-gradient(180deg,transparent,#ff1f1f 30%,#ff1f1f 70%,transparent)" }} />
        </section>

        {/* ── Filtro de categorias ──────────────────────────────── */}
        {categories.length > 0 && (
          <div className="border-b border-[#141d2c] bg-[#070a12] sticky top-16 z-20">
            <div className="px-5 lg:px-20 flex items-center gap-0 overflow-x-auto hide-scrollbar">
              <Link
                href="/loja"
                className={`shrink-0 h-[48px] px-5 flex items-center text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  !categoria
                    ? "border-[#ff1f1f] text-white"
                    : "border-transparent text-[#526888] hover:text-[#7a9ab5]"
                }`}
              >
                Tudo
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/loja?categoria=${cat.slug}`}
                  className={`shrink-0 h-[48px] px-5 flex items-center text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    categoria === cat.slug
                      ? "border-[#ff1f1f] text-white"
                      : "border-transparent text-[#526888] hover:text-[#7a9ab5]"
                  }`}
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Grade de produtos ─────────────────────────────────── */}
        <div className="px-5 lg:px-20 py-12">

          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-[64px] h-[64px] rounded-full bg-[#0e1520] border border-[#141d2c] flex items-center justify-center text-[28px]">
                🏪
              </div>
              <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[24px]">
                {categoria ? "Nenhum produto nesta categoria" : "Loja em breve"}
              </p>
              <p className="text-[#526888] text-[14px] text-center max-w-xs">
                {categoria
                  ? "Tente outra categoria ou veja todos os produtos."
                  : "Estamos preparando produtos especiais para você."}
              </p>
              {categoria && (
                <Link href="/loja"
                  className="mt-2 text-[#ff1f1f] text-[13px] font-semibold hover:text-white transition-colors">
                  ← Ver todos os produtos
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Cabeçalho da grade */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px] leading-none">
                    {activeCategory ? activeCategory.title : "Todos os Produtos"}
                  </h2>
                  {activeCategory?.description && (
                    <p className="text-[#526888] text-[13px] mt-1">{activeCategory.description}</p>
                  )}
                </div>
                <span className="text-[#526888] text-[13px] font-mono">
                  {sorted.length} {sorted.length === 1 ? "produto" : "produtos"}
                </span>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {sorted.map(product => {
                  const inStock = product.hasVariations || (product.stock ?? 0) > 0;
                  return (
                    <Link
                      key={product.id}
                      href={`/loja/produto/${product.slug}`}
                      className="group flex flex-col bg-[#0a0f1a] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[14px] overflow-hidden transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,31,31,0.06)]"
                    >
                      {/* Imagem */}
                      <div className="relative aspect-square bg-[#0e1520] overflow-hidden">
                        {product.mainImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.mainImageUrl}
                            alt={product.mainImageAlt ?? product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-[#1c2a3e]">
                              <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="15" cy="17" r="4" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M4 28l9-7 7 6 5-4 11 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}

                        {/* Badge destaque */}
                        {product.isFeatured && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-[#ff1f1f] text-white text-[9px] font-bold px-2 py-[3px] rounded-[4px] tracking-[0.8px] uppercase shadow-lg">
                              Destaque
                            </span>
                          </div>
                        )}

                        {/* Overlay esgotado */}
                        {!inStock && (
                          <div className="absolute inset-0 bg-[#070a12]/60 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="text-[#526888] text-[11px] font-bold tracking-[1px] uppercase">Esgotado</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col gap-2.5 p-4 flex-1">
                        {/* Categoria */}
                        {product.category && (
                          <span className="text-[#ff1f1f] text-[10px] font-bold tracking-[1px] uppercase">
                            {product.category.title}
                          </span>
                        )}

                        {/* Nome */}
                        <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[16px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                          {product.name}
                        </p>

                        {/* Rodapé do card */}
                        <div className="flex items-end justify-between gap-2 mt-auto pt-1">
                          <div>
                            {product.hasVariations ? (
                              <p className="text-[#526888] text-[11px] mb-0.5">a partir de</p>
                            ) : null}
                            <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[20px] leading-none">
                              {formatCurrency(product.basePrice)}
                            </p>
                          </div>
                          <StockBadge product={product} />
                        </div>
                      </div>

                      {/* CTA hover */}
                      <div className="h-[40px] mx-4 mb-4 rounded-[6px] bg-[#ff1f1f]/0 group-hover:bg-[#ff1f1f] border border-[#1c2a3e] group-hover:border-[#ff1f1f] flex items-center justify-center transition-all duration-200">
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
