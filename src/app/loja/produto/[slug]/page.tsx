import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface Variation {
  id: string;
  name: string;
  attributes: { tamanho?: string; cor?: string } | null;
  price: number | null;
  stock: number;
  sku: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  mainImageUrl: string | null;
  mainImageAlt: string | null;
  description: string | null;
  technicalSpecs: string | null;
  isFeatured: boolean;
  hasVariations: boolean;
  stock: number | null;
  sku: string | null;
  weight: number | null;
  dimensionWidth: number | null;
  dimensionHeight: number | null;
  dimensionLength: number | null;
  pdfFileUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  categoryId: string | null;
  category: { id: string; title: string; slug: string } | null;
  variations: Variation[];
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product: ShopProduct | null = null;

  try {
    const res = await fetch(
      `${BASE}/shop_products?slug=eq.${encodeURIComponent(slug)}&isActive=eq.true&select=id,name,slug,basePrice,mainImageUrl,mainImageAlt,description,technicalSpecs,isFeatured,hasVariations,stock,sku,weight,dimensionWidth,dimensionHeight,dimensionLength,pdfFileUrl,metaTitle,metaDescription,categoryId,category:shop_categories(id,title,slug),variations:shop_product_variations(id,name,attributes,price,stock,sku,isActive,sortOrder)&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) product = data[0];
    }
  } catch { /* DB unavailable */ }

  if (!product) notFound();

  const activeVariations = product.variations
    ?.filter(v => v.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder) ?? [];

  const inStock = product.hasVariations
    ? activeVariations.some(v => v.stock > 0)
    : (product.stock ?? 0) > 0;

  const minPrice = product.hasVariations && activeVariations.length > 0
    ? Math.min(...activeVariations.map(v => v.price ?? product!.basePrice))
    : product.basePrice;

  const hasSpecs = !!(
    product.technicalSpecs ||
    product.weight ||
    product.sku ||
    product.dimensionWidth
  );

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      <div className="mt-16 flex-1">
        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <div className="px-5 lg:px-20 py-4 border-b border-[#0e1520]">
          <nav className="flex items-center gap-2 text-[12px] text-[#526888]">
            <Link href="/" className="hover:text-[#7a9ab5] transition-colors">Início</Link>
            <span>/</span>
            <Link href="/loja" className="hover:text-[#7a9ab5] transition-colors">Loja</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link href={`/loja?categoria=${product.category.slug}`} className="hover:text-[#7a9ab5] transition-colors">
                  {product.category.title}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-[#7a9ab5] line-clamp-1">{product.name}</span>
          </nav>
        </div>

        {/* ── Layout principal ───────────────────────────────────── */}
        <div className="px-5 lg:px-20 py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

            {/* Imagem do produto */}
            <div className="w-full lg:w-[460px] shrink-0">
              <div className="relative aspect-square bg-[#0e1520] border border-[#141d2c] rounded-[16px] overflow-hidden">
                {product.mainImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.mainImageUrl}
                    alt={product.mainImageAlt ?? product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <svg width="64" height="64" viewBox="0 0 40 40" fill="none" className="text-[#1c2a3e]">
                      <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="15" cy="17" r="4" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M4 28l9-7 7 6 5-4 11 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-[#1c2a3e] text-[12px] font-semibold">Sem imagem</p>
                  </div>
                )}

                {product.isFeatured && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#ff1f1f] text-white text-[10px] font-bold px-3 py-1 rounded-[6px] tracking-[0.8px] uppercase shadow-lg">
                      Destaque
                    </span>
                  </div>
                )}
              </div>

              {/* PDF datasheet */}
              {product.pdfFileUrl && (
                <a
                  href={product.pdfFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full h-[44px] flex items-center justify-center gap-2 rounded-[8px] border border-[#1c2a3e] hover:border-[#526888] text-[#7a9ab5] hover:text-white text-[13px] font-semibold transition-colors"
                >
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                    <path d="M2 1h7l3 3v11H2V1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M9 1v3h3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 8h6M4 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Ficha técnica (PDF)
                </a>
              )}
            </div>

            {/* Dados do produto */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Categoria + SKU */}
              <div className="flex items-center gap-3 flex-wrap">
                {product.category && (
                  <Link
                    href={`/loja?categoria=${product.category.slug}`}
                    className="text-[#ff1f1f] text-[11px] font-bold tracking-[1.2px] uppercase hover:text-white transition-colors"
                  >
                    {product.category.title}
                  </Link>
                )}
                {product.sku && (
                  <span className="text-[#1c2a3e] text-[10px] font-mono">|</span>
                )}
                {product.sku && (
                  <span className="text-[#526888] text-[11px] font-mono">SKU: {product.sku}</span>
                )}
              </div>

              {/* Nome */}
              <h1 className="font-['Barlow_Condensed'] font-extrabold text-[#dce8ff] text-[38px] lg:text-[48px] leading-[1.0]">
                {product.name}
              </h1>

              {/* Preço */}
              <div className="flex items-end gap-3">
                {product.hasVariations && activeVariations.length > 0 && (
                  <p className="text-[#526888] text-[13px] mb-1.5">a partir de</p>
                )}
                <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[42px] leading-none">
                  {formatCurrency(minPrice)}
                </p>
              </div>

              {/* Status de estoque */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${inStock ? "bg-[#22c55e]" : "bg-[#ff1f1f]"}`} />
                <span className={`text-[13px] font-semibold ${inStock ? "text-[#22c55e]" : "text-[#ff6b6b]"}`}>
                  {product.hasVariations
                    ? (inStock ? "Disponível" : "Esgotado")
                    : (inStock
                        ? `Em estoque${product.stock && product.stock <= 5 ? ` — últimas ${product.stock} unid.` : ""}`
                        : "Esgotado")}
                </span>
              </div>

              {/* Variações */}
              {product.hasVariations && activeVariations.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[#7a9ab5] text-[12px] font-semibold uppercase tracking-[0.8px]">
                    Opções disponíveis
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeVariations.map(v => (
                      <div
                        key={v.id}
                        className={`flex flex-col gap-0.5 px-4 py-2.5 rounded-[8px] border text-sm transition-colors ${
                          v.stock > 0
                            ? "border-[#1c2a3e] bg-[#0a0f1a] hover:border-[#526888] cursor-pointer"
                            : "border-[#0e1520] bg-[#070a12] opacity-40 cursor-not-allowed"
                        }`}
                      >
                        <span className="text-[#dce8ff] text-[13px] font-semibold">{v.name}</span>
                        {v.price !== null && v.price !== product.basePrice && (
                          <span className="text-[#ff1f1f] text-[12px] font-bold">{formatCurrency(v.price)}</span>
                        )}
                        {v.stock <= 0 && (
                          <span className="text-[#526888] text-[10px]">Esgotado</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão comprar */}
              <div className="flex gap-3 flex-wrap pt-2">
                <button
                  disabled={!inStock}
                  className="h-[52px] px-10 rounded-[8px] font-semibold text-[15px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#ff1f1f] hover:bg-[#cc0000] text-white"
                >
                  {inStock ? "Adicionar ao carrinho" : "Indisponível"}
                </button>
              </div>

              {/* Dimensões / peso (se houver) */}
              {(product.weight || product.dimensionWidth) && (
                <div className="flex flex-wrap gap-4 pt-1 border-t border-[#0e1520]">
                  {product.weight && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[#526888] text-[10px] uppercase tracking-[0.8px] font-semibold">Peso</span>
                      <span className="text-[#7a9ab5] text-[13px] font-mono">{product.weight}g</span>
                    </div>
                  )}
                  {product.dimensionWidth && product.dimensionHeight && product.dimensionLength && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[#526888] text-[10px] uppercase tracking-[0.8px] font-semibold">Dimensões</span>
                      <span className="text-[#7a9ab5] text-[13px] font-mono">
                        {product.dimensionWidth}×{product.dimensionHeight}×{product.dimensionLength} cm
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Abas de conteúdo ─────────────────────────────────── */}
          {(product.description || hasSpecs) && (
            <div className="mt-14 border-t border-[#0e1520] pt-10">
              <div className="flex flex-col gap-10">

                {/* Descrição */}
                {product.description && (
                  <div>
                    <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[26px] mb-5">
                      Descrição
                    </h2>
                    <div
                      className="prose prose-invert prose-sm max-w-none text-[#7a9ab5] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </div>
                )}

                {/* Especificações técnicas */}
                {(product.technicalSpecs || product.weight || product.sku || product.dimensionWidth) && (
                  <div>
                    <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[26px] mb-5">
                      Especificações Técnicas
                    </h2>

                    {/* Tabela de atributos fixos */}
                    {(product.sku || product.weight || product.dimensionWidth) && (
                      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] overflow-hidden mb-6">
                        {[
                          product.sku          && { label: "SKU",         value: product.sku },
                          product.weight       && { label: "Peso",         value: `${product.weight}g` },
                          product.dimensionWidth && product.dimensionHeight && product.dimensionLength
                            && { label: "Dimensões", value: `${product.dimensionWidth} × ${product.dimensionHeight} × ${product.dimensionLength} cm` },
                        ].filter(Boolean).map((row, i, arr) => {
                          const r = row as { label: string; value: string };
                          return (
                            <div key={r.label} className={`flex items-center gap-4 px-5 py-3 ${i < arr.length - 1 ? "border-b border-[#0a0f1a]" : ""}`}>
                              <span className="text-[#526888] text-[12px] font-semibold uppercase tracking-[0.6px] w-[120px] shrink-0">{r.label}</span>
                              <span className="text-[#d4d4da] text-[13px] font-mono">{r.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {product.technicalSpecs && (
                      <div
                        className="prose prose-invert prose-sm max-w-none text-[#7a9ab5] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: product.technicalSpecs }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Voltar ─────────────────────────────────────────────── */}
          <div className="mt-14 pt-8 border-t border-[#0e1520]">
            <Link
              href={product.category ? `/loja?categoria=${product.category.slug}` : "/loja"}
              className="inline-flex items-center gap-2 text-[#526888] hover:text-[#7a9ab5] text-[13px] font-semibold transition-colors"
            >
              ← Voltar para {product.category ? product.category.title : "a loja"}
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
