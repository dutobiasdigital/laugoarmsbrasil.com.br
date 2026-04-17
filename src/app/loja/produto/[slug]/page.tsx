import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoriteButton from "@/components/FavoriteButton";
import ProductGallery from "@/components/loja/ProductGallery";
import AddToCartButton from "@/components/loja/AddToCartButton";
import ProductContentTabs from "@/components/loja/ProductContentTabs";
import ViewTracker from "@/components/ViewTracker";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface Variation {
  id: string; name: string;
  attributes: { tamanho?: string; cor?: string } | null;
  price: number | null; stock: number; sku: string | null;
  isActive: boolean; sortOrder: number;
}

interface ProductImage {
  id: string; imageUrl: string; imageAlt: string | null; sortOrder: number; isMain: boolean;
}

interface ContentTab { id: string; title: string; content: string }
interface ProductPdf { id: string; title: string; fileUrl: string; sortOrder: number }

interface ShopProduct {
  id: string; name: string; slug: string; basePrice: number;
  mainImageUrl: string | null; mainImageAlt: string | null;
  description: string | null; technicalSpecs: string | null;
  contentTabs: ContentTab[];
  isFeatured: boolean; hasVariations: boolean;
  stock: number | null; sku: string | null;
  weight: number | null;
  dimensionWidth: number | null; dimensionHeight: number | null; dimensionLength: number | null;
  metaTitle: string | null; metaDescription: string | null;
  categoryId: string | null;
  category: { id: string; title: string; slug: string } | null;
  variations: Variation[];
}

interface RelatedProduct {
  id: string; name: string; slug: string; basePrice: number;
  mainImageUrl: string | null;
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product: ShopProduct | null = null;
  let extraImages: ProductImage[] = [];
  let productPdfs: ProductPdf[]   = [];
  let related: RelatedProduct[]   = [];
  let isLoggedIn = false;
  let isFavorited = false;

  try {
    const res = await fetch(
      `${BASE}/shop_products?slug=eq.${encodeURIComponent(slug)}&isActive=eq.true&select=id,name,slug,basePrice,mainImageUrl,mainImageAlt,description,technicalSpecs,contentTabs,isFeatured,hasVariations,stock,sku,weight,dimensionWidth,dimensionHeight,dimensionLength,metaTitle,metaDescription,categoryId,category:shop_categories(id,title,slug),variations:shop_product_variations(id,name,attributes,price,stock,sku,isActive,sortOrder)&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) product = data[0];
    }
  } catch { /* DB unavailable */ }

  if (!product) notFound();

  // Verifica auth e favorito
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && product) {
      isLoggedIn = true;
      const userRes = await fetch(
        `${BASE}/users?authId=eq.${user.id}&select=id&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      );
      const users = await userRes.json();
      const dbUser = Array.isArray(users) ? users[0] : null;
      if (dbUser) {
        const favRes = await fetch(
          `${BASE}/user_favorites?userId=eq.${dbUser.id}&contentType=eq.product&contentId=eq.${product.id}&select=id&limit=1`,
          { headers: HEADERS, cache: "no-store" }
        );
        const favData = await favRes.json();
        isFavorited = Array.isArray(favData) && favData.length > 0;
      }
    }
  } catch { /* ignore */ }

  // Fetch extra images + PDFs in parallel
  try {
    const [imgRes, pdfRes] = await Promise.all([
      fetch(`${BASE}/shop_product_images?productId=eq.${product.id}&select=id,imageUrl,imageAlt,sortOrder,isMain&order=sortOrder.asc`, { headers: HEADERS, cache: "no-store" }),
      fetch(`${BASE}/shop_product_pdfs?productId=eq.${product.id}&select=id,title,fileUrl,sortOrder&order=sortOrder.asc`, { headers: HEADERS, cache: "no-store" }),
    ]);
    if (imgRes.ok) { const d = await imgRes.json(); if (Array.isArray(d)) extraImages = d; }
    if (pdfRes.ok) { const d = await pdfRes.json(); if (Array.isArray(d)) productPdfs = d; }
  } catch { /* ignore */ }

  // Fetch related products (same category)
  if (product.categoryId) {
    try {
      const relRes = await fetch(
        `${BASE}/shop_products?categoryId=eq.${product.categoryId}&isActive=eq.true&id=neq.${product.id}&select=id,name,slug,basePrice,mainImageUrl&limit=4&order=isFeatured.desc`,
        { headers: HEADERS, cache: "no-store" }
      );
      if (relRes.ok) {
        const d = await relRes.json();
        if (Array.isArray(d)) related = d;
      }
    } catch { /* ignore */ }
  }

  // Build images array: extra gallery images first, fallback to mainImageUrl
  const galleryImages: string[] = extraImages.length > 0
    ? extraImages.map(i => i.imageUrl)
    : product.mainImageUrl ? [product.mainImageUrl] : [];

  const activeVariations = product.variations
    ?.filter(v => v.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder) ?? [];

  // Build all content tabs: description first (if present), then dynamic tabs, then legacy technicalSpecs
  const allContentTabs: { id: string; title: string; content: string }[] = [];
  if (product.description) allContentTabs.push({ id: "description", title: "Descrição", content: product.description });
  if (product.contentTabs?.length) allContentTabs.push(...product.contentTabs.filter(t => t.content));
  else if (product.technicalSpecs) allContentTabs.push({ id: "specs", title: "Especificações Técnicas", content: product.technicalSpecs });

  const hasSpecs = !!(product.weight || product.sku || product.dimensionWidth);

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      {/* View tracking — dispara silenciosamente no client */}
      <ViewTracker endpoint={`/api/loja/produto/${product.slug}/view`} />

      <div className="mt-16 flex-1">
        {/* Breadcrumb */}
        <div className="px-5 lg:px-20 py-4 border-b border-[#0e1520]">
          <nav className="flex items-center gap-2 text-[12px] text-[#526888]">
            <Link href="/loja" className="hover:text-[#7a9ab5] transition-colors">Loja</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link href={`/loja/produtos?categoria=${product.category.slug}`} className="hover:text-[#7a9ab5] transition-colors">
                  {product.category.title}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-[#7a9ab5] line-clamp-1">{product.name}</span>
          </nav>
        </div>

        {/* Produto */}
        <div className="px-5 lg:px-20 py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

            {/* Galeria */}
            <div className="w-full lg:w-[480px] shrink-0">
              <ProductGallery images={galleryImages} alt={product.name} />

              {/* PDFs */}
              {productPdfs.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {productPdfs.map((pdf) => (
                    <a key={pdf.id} href={pdf.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="w-full h-[44px] flex items-center gap-3 px-4 rounded-[8px] border border-[#1c2a3e] hover:border-[#526888] text-[#7a9ab5] hover:text-white text-[13px] font-semibold transition-colors">
                      <svg width="14" height="16" viewBox="0 0 14 16" fill="none" className="shrink-0">
                        <path d="M2 1h7l3 3v11H2V1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        <path d="M9 1v3h3" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M4 8h6M4 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span className="flex-1 truncate">{pdf.title || "Baixar PDF"}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-50">
                        <path d="M6 1v7M3 5l3 3 3-3M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Info + Compra */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Categoria + SKU */}
              <div className="flex items-center gap-3 flex-wrap">
                {product.category && (
                  <Link href={`/loja/produtos?categoria=${product.category.slug}`}
                    className="text-[#ff1f1f] text-[11px] font-bold tracking-[1.2px] uppercase hover:text-white transition-colors">
                    {product.category.title}
                  </Link>
                )}
                {product.sku && <span className="text-[#526888] text-[11px] font-mono">SKU: {product.sku}</span>}
                {product.isFeatured && (
                  <span className="bg-[#ff1f1f] text-white text-[9px] font-bold px-2 py-[3px] rounded-[4px] tracking-[0.8px] uppercase">
                    Destaque
                  </span>
                )}
              </div>

              {/* Nome */}
              <h1 className="font-['Barlow_Condensed'] font-extrabold text-[#dce8ff] text-[40px] lg:text-[52px] leading-[1.0]">
                {product.name}
              </h1>

              {/* Favoritar */}
              <div className="-mt-2">
                <FavoriteButton
                  contentType="product"
                  contentId={product.id}
                  isLoggedIn={isLoggedIn}
                  initialIsFavorited={isFavorited}
                  size="sm"
                  label={isFavorited ? "Favoritado" : "Favoritar"}
                />
              </div>

              {/* Widget interativo (AddToCartButton contém preço, variações, qty, botão) */}
              <AddToCartButton
                productId={product.id}
                slug={product.slug}
                name={product.name}
                basePrice={product.basePrice}
                imageUrl={galleryImages[0] ?? null}
                hasVariations={product.hasVariations}
                stock={product.stock}
                variations={activeVariations}
              />

              {/* Dimensões / peso */}
              {(product.weight || product.dimensionWidth) && (
                <div className="flex flex-wrap gap-5 pt-3 border-t border-[#0e1520]">
                  {product.weight && (
                    <div>
                      <p className="text-[#526888] text-[10px] uppercase tracking-[0.8px] font-semibold">Peso</p>
                      <p className="text-[#7a9ab5] text-[13px] font-mono mt-0.5">{product.weight}g</p>
                    </div>
                  )}
                  {product.dimensionWidth && product.dimensionHeight && product.dimensionLength && (
                    <div>
                      <p className="text-[#526888] text-[10px] uppercase tracking-[0.8px] font-semibold">Dimensões</p>
                      <p className="text-[#7a9ab5] text-[13px] font-mono mt-0.5">
                        {product.dimensionWidth}×{product.dimensionHeight}×{product.dimensionLength} cm
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo estendido — tabs dinâmicas + specs técnicas */}
          {(allContentTabs.length > 0 || hasSpecs) && (
            <div className="mt-16 border-t border-[#0e1520] pt-12">
              {/* Specs table (always shown if data present) */}
              {hasSpecs && (
                <div className="mb-10">
                  <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] overflow-hidden">
                    {[
                      product.sku && { label: "SKU", value: product.sku },
                      product.weight && { label: "Peso", value: `${product.weight}g` },
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
                </div>
              )}

              {/* Content tabs */}
              {allContentTabs.length > 0 && (
                <div>
                  {allContentTabs.length === 1 ? (
                    /* Single tab — show without tab bar */
                    <div>
                      <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px] mb-5">{allContentTabs[0].title}</h2>
                      <div className="prose prose-invert prose-sm max-w-none text-[#7a9ab5] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: allContentTabs[0].content }} />
                    </div>
                  ) : (
                    /* Multiple tabs — show tab bar */
                    <ProductContentTabs tabs={allContentTabs} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Produtos relacionados */}
          {related.length > 0 && (
            <div className="mt-14 border-t border-[#0e1520] pt-10">
              <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px] mb-6">
                Mais de {product.category?.title ?? "esta categoria"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {related.map(r => (
                  <Link key={r.id} href={`/loja/produto/${r.slug}`}
                    className="group flex flex-col bg-[#0a0f1a] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[12px] overflow-hidden transition-all">
                    <div className="aspect-square bg-[#0e1520] overflow-hidden">
                      {r.mainImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.mainImageUrl} alt={r.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#1c2a3e]">
                          <svg width="32" height="32" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="2"/><circle cx="15" cy="17" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M4 28l9-7 7 6 5-4 11 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[15px] line-clamp-2 group-hover:text-white transition-colors">{r.name}</p>
                      <p className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[18px] mt-1">{formatCurrency(r.basePrice)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Voltar */}
          <div className="mt-12 pt-8 border-t border-[#0e1520]">
            <Link href={product.category ? `/loja/produtos?categoria=${product.category.slug}` : "/loja/produtos"}
              className="inline-flex items-center gap-2 text-[#526888] hover:text-[#7a9ab5] text-[13px] font-semibold transition-colors">
              ← Voltar para {product.category ? product.category.title : "todos os produtos"}
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
