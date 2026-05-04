import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo — Laúgo Arms Brasil",
  description: "Catálogo completo de armas, acessórios e equipamentos da Laúgo Arms Brasil.",
};

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface ShopCategory {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
}

interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  mainImageUrl: string | null;
  isFeatured: boolean;
  category: { title: string; slug: string } | null;
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;

  let categories: ShopCategory[] = [];
  let products: ShopProduct[]    = [];
  let currentCategory: ShopCategory | null = null;

  try {
    const catRes = await fetch(
      `${BASE}/shop_categories?isActive=eq.true&select=id,title,slug,imageUrl,sortOrder&order=sortOrder.asc`,
      { headers: HEADERS, cache: "no-store" }
    );
    if (catRes.ok) {
      const d = await catRes.json();
      if (Array.isArray(d)) categories = d;
    }

    if (categoria) {
      currentCategory = categories.find((c) => c.slug === categoria) ?? null;
    }

    const prodUrl = currentCategory
      ? `${BASE}/shop_products?isActive=eq.true&categoryId=eq.${currentCategory.id}&select=id,name,slug,basePrice,mainImageUrl,isFeatured,category:shop_categories(title,slug)&order=isFeatured.desc,name.asc&limit=60`
      : `${BASE}/shop_products?isActive=eq.true&select=id,name,slug,basePrice,mainImageUrl,isFeatured,category:shop_categories(title,slug)&order=isFeatured.desc,name.asc&limit=60`;

    const prodRes = await fetch(prodUrl, { headers: HEADERS, cache: "no-store" });
    if (prodRes.ok) {
      const d = await prodRes.json();
      if (Array.isArray(d)) products = d;
    }
  } catch { /* DB unavailable */ }

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      <div className="mt-16 flex-1">
        {/* Page header */}
        <div className="px-5 lg:px-20 py-8 border-b border-[#0e1520]">
          <nav className="flex items-center gap-2 text-[12px] text-[#526888] mb-3">
            <Link href="/" className="hover:text-[#7a9ab5] transition-colors">Home</Link>
            <span>/</span>
            {currentCategory ? (
              <>
                <Link href="/catalogo" className="hover:text-[#7a9ab5] transition-colors">Catálogo</Link>
                <span>/</span>
                <span className="text-[#7a9ab5]">{currentCategory.title}</span>
              </>
            ) : (
              <span className="text-[#7a9ab5]">Catálogo</span>
            )}
          </nav>
          <h1 className="font-['Barlow_Condensed'] font-extrabold text-[#dce8ff] text-[42px] leading-none">
            {currentCategory ? currentCategory.title : "Catálogo"}
          </h1>
          <p className="text-[#526888] text-[14px] mt-2">
            {products.length} produto{products.length !== 1 ? "s" : ""} disponíve{products.length !== 1 ? "is" : "l"}
          </p>
        </div>

        <div className="px-5 lg:px-20 py-10 flex gap-10 items-start">
          {/* Sidebar — desktop */}
          {categories.length > 0 && (
            <aside className="hidden lg:flex flex-col w-[200px] shrink-0 sticky top-20">
              <p className="text-[10px] font-semibold text-[#526888] uppercase tracking-[1.8px] mb-3">
                Categorias
              </p>
              <ul className="flex flex-col gap-1">
                <li>
                  <Link
                    href="/catalogo"
                    className={`flex items-center px-3 py-2 rounded-[6px] text-[13px] font-semibold transition-colors ${
                      !categoria
                        ? "bg-[#ff1f1f]/10 text-[#ff1f1f]"
                        : "text-[#7a9ab5] hover:text-white hover:bg-[#0e1520]"
                    }`}
                  >
                    Todos
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/catalogo?categoria=${cat.slug}`}
                      className={`flex items-center px-3 py-2 rounded-[6px] text-[13px] font-semibold transition-colors ${
                        categoria === cat.slug
                          ? "bg-[#ff1f1f]/10 text-[#ff1f1f]"
                          : "text-[#7a9ab5] hover:text-white hover:bg-[#0e1520]"
                      }`}
                    >
                      {cat.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Category chips — mobile */}
            {categories.length > 0 && (
              <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto pb-1">
                <Link
                  href="/catalogo"
                  className={`shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    !categoria
                      ? "bg-[#ff1f1f] border-[#ff1f1f] text-white"
                      : "border-[#1c2a3e] text-[#7a9ab5]"
                  }`}
                >
                  Todos
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/catalogo?categoria=${cat.slug}`}
                    className={`shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      categoria === cat.slug
                        ? "bg-[#ff1f1f] border-[#ff1f1f] text-white"
                        : "border-[#1c2a3e] text-[#7a9ab5]"
                    }`}
                  >
                    {cat.title}
                  </Link>
                ))}
              </div>
            )}

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg width="48" height="48" viewBox="0 0 40 40" fill="none" className="mb-4 opacity-20">
                  <rect x="4" y="8" width="32" height="24" rx="3" stroke="#dce8ff" strokeWidth="2"/>
                  <circle cx="15" cy="17" r="4" stroke="#dce8ff" strokeWidth="1.5"/>
                  <path d="M4 28l9-7 7 6 5-4 11 9" stroke="#dce8ff" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <p className="font-['Barlow_Condensed'] font-bold text-[#526888] text-[22px]">
                  {categoria ? "Nenhum produto nesta categoria" : "Catálogo vazio"}
                </p>
                {categoria && (
                  <Link href="/catalogo" className="mt-4 text-[#ff1f1f] text-[13px] font-semibold hover:text-[#ff4444] transition-colors">
                    ← Ver todos os produtos
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/catalogo/produto/${product.slug}`}
                    className="group flex flex-col bg-[#0a0f1a] border border-[#141d2c] hover:border-[#ff1f1f]/30 rounded-[10px] overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(255,31,31,0.06)]"
                  >
                    <div className="relative w-full aspect-square bg-[#0e1520] overflow-hidden">
                      {product.mainImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.mainImageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                            <rect x="4" y="8" width="32" height="24" rx="3" stroke="#1c2a3e" strokeWidth="2"/>
                            <circle cx="15" cy="17" r="4" stroke="#1c2a3e" strokeWidth="1.5"/>
                            <path d="M4 28l9-7 7 6 5-4 11 9" stroke="#1c2a3e" strokeWidth="1.5" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                      {product.isFeatured && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-[#ff1f1f] text-white text-[9px] font-bold px-1.5 py-[2px] rounded-[3px] tracking-[0.5px] uppercase">
                            Destaque
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
                    </div>
                    <div className="flex flex-col gap-1.5 p-3">
                      {product.category && (
                        <span className="text-[#ff1f1f] text-[9px] font-bold tracking-[0.8px] uppercase">
                          {product.category.title}
                        </span>
                      )}
                      <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[14px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                        {product.name}
                      </p>
                      {product.basePrice > 0 && (
                        <p className="text-[#7a9ab5] text-[12px] font-semibold">
                          {formatCurrency(product.basePrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
