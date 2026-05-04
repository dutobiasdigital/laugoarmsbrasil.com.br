import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlider, { DEFAULT_HERO_CONFIG, type HeroConfig } from "@/components/HeroSlider";
import WelcomeBanner from "@/components/WelcomeBanner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laúgo Arms Brasil — Catálogo de Armas e Acessórios",
  description:
    "Conheça o catálogo completo da Laúgo Arms Brasil. Armas, acessórios e equipamentos com qualidade e segurança.",
};

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface ShopCategory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
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

export default async function HomePage() {
  let categories: ShopCategory[]     = [];
  let featuredProducts: ShopProduct[] = [];
  let latestProducts: ShopProduct[]   = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let heroSlides: any[]               = [];
  let heroConfig: HeroConfig          = { ...DEFAULT_HERO_CONFIG };
  let homeContent                     = "";

  try {
    const [catRes, featuredRes, latestRes, settingsRes] = await Promise.all([
      fetch(
        `${BASE}/shop_categories?isActive=eq.true&select=id,title,slug,description,imageUrl,sortOrder&order=sortOrder.asc&limit=8`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/shop_products?isActive=eq.true&isFeatured=eq.true&select=id,name,slug,basePrice,mainImageUrl,isFeatured,category:shop_categories(title,slug)&order=name.asc&limit=8`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/shop_products?isActive=eq.true&select=id,name,slug,basePrice,mainImageUrl,isFeatured,category:shop_categories(title,slug)&order=createdAt.desc&limit=8`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/site_settings?key=in.(hero.slides,hero.config,home.content)&select=key,value`,
        { headers: HEADERS, cache: "no-store" }
      ),
    ]);

    if (catRes.ok)      { const d = await catRes.json();      if (Array.isArray(d)) categories       = d; }
    if (featuredRes.ok) { const d = await featuredRes.json(); if (Array.isArray(d)) featuredProducts  = d; }
    if (latestRes.ok)   { const d = await latestRes.json();   if (Array.isArray(d)) latestProducts    = d; }

    if (settingsRes.ok) {
      const settingsData: { key: string; value: string | null }[] = await settingsRes.json();
      const slidesRow  = Array.isArray(settingsData) ? settingsData.find((r) => r.key === "hero.slides")   : null;
      const configRow  = Array.isArray(settingsData) ? settingsData.find((r) => r.key === "hero.config")   : null;
      const contentRow = Array.isArray(settingsData) ? settingsData.find((r) => r.key === "home.content")  : null;
      if (slidesRow?.value) {
        const parsed = JSON.parse(slidesRow.value);
        heroSlides = Array.isArray(parsed)
          ? parsed.filter((s: { active?: boolean }) => s.active).sort((a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0))
          : [];
      }
      if (configRow?.value) {
        heroConfig = { ...DEFAULT_HERO_CONFIG, ...JSON.parse(configRow.value) };
      }
      if (contentRow?.value) {
        homeContent = contentRow.value;
      }
    }
  } catch {
    // DB unavailable
  }

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      {/* Hero */}
      <div className="mt-16">
        {heroSlides.length > 0 ? (
          <HeroSlider slides={heroSlides} config={heroConfig} />
        ) : (
          <WelcomeBanner />
        )}
      </div>

      {/* Conteúdo HTML da Home — sem padding: o HTML controla o próprio layout */}
      {homeContent && (
        <div
          className="overflow-hidden"
          dangerouslySetInnerHTML={{ __html: homeContent }}
        />
      )}

      {/* ── Categorias ──────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="px-5 lg:px-20 py-10 border-b border-[#0e1520]">
          <div className="flex items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-6 bg-[#ff1f1f] rounded-full" />
              <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px] leading-none">
                Categorias
              </h2>
            </div>
            <div className="flex-1" />
            <Link href="/catalogo" className="text-[#ff1f1f] text-[13px] font-semibold hover:text-[#ff4444] transition-colors">
              Ver catálogo →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalogo?categoria=${cat.slug}`}
                className="group flex flex-col bg-[#0a0f1a] border border-[#141d2c] hover:border-[#ff1f1f]/30 rounded-[10px] overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(255,31,31,0.06)]"
              >
                <div className="relative w-full aspect-video bg-[#0e1520] overflow-hidden">
                  {cat.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.imageUrl}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-['Barlow_Condensed'] font-bold text-[#1c2a3e] text-[12px] uppercase tracking-widest">
                        {cat.title}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[15px] leading-snug group-hover:text-white transition-colors">
                    {cat.title}
                  </p>
                  {cat.description && (
                    <p className="text-[#526888] text-[11px] line-clamp-1">{cat.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Split container ──────────────────────────────────────────── */}
      <div className="bg-[#070a12] flex gap-10 px-5 lg:px-20 py-16 items-start">

        {/* ── Coluna principal ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-14 flex-1 min-w-0">

          {/* Produtos em Destaque */}
          <section>
            <div className="flex items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-6 bg-[#ff1f1f] rounded-full" />
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px] leading-none">
                  Produtos em Destaque
                </h2>
              </div>
              <div className="flex-1" />
              <Link href="/catalogo" className="text-[#ff1f1f] text-[13px] font-semibold hover:text-[#ff4444] transition-colors">
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(featuredProducts.length > 0 ? featuredProducts : latestProducts).slice(0, 8).map((product) => (
                <Link
                  key={product.id}
                  href={`/loja/produto/${product.slug}`}
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
                        <span className="font-['Barlow_Condensed'] font-bold text-[#1c2a3e] text-[11px] uppercase tracking-widest px-3 text-center">
                          {product.name}
                        </span>
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
          </section>

          {/* Lançamentos */}
          {latestProducts.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-[3px] h-6 bg-[#526888] rounded-full" />
                  <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px] leading-none">
                    Lançamentos
                  </h2>
                </div>
                <div className="flex-1" />
                <Link href="/loja" className="text-[#ff1f1f] text-[13px] font-semibold hover:text-[#ff4444] transition-colors">
                  Ver todos →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {latestProducts.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    href={`/loja/produto/${product.slug}`}
                    className="group flex flex-col bg-[#0a0f1a] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[10px] overflow-hidden transition-all"
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
                          <span className="font-['Barlow_Condensed'] font-bold text-[#1c2a3e] text-[11px] uppercase tracking-widest px-3 text-center">
                            {product.name}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
                    </div>
                    <div className="flex flex-col gap-1.5 p-3">
                      {product.category && (
                        <span className="text-[#526888] text-[9px] font-bold tracking-[0.8px] uppercase">
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
            </section>
          )}

          {/* CTA Institucional */}
          <section className="bg-[#120000] border border-[#3d0000] rounded-lg px-8 lg:px-12 py-8 lg:h-[180px] flex flex-col lg:flex-row items-center gap-8">
            <div className="flex flex-col gap-2.5 flex-1">
              <p className="font-['Barlow_Condensed'] font-extrabold text-[#dce8ff] text-[32px] leading-tight">
                Conheça o catálogo completo
              </p>
              <p className="text-[#7a9ab5] text-[15px]">
                Armas, acessórios e equipamentos com qualidade e segurança.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link
                href="/contato"
                className="border border-[#1c2a3e] hover:border-zinc-500 text-white text-[13px] font-semibold px-4 py-2.5 rounded transition-colors"
              >
                Fale conosco
              </Link>
              <Link
                href="/catalogo"
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold px-4 py-2.5 rounded transition-colors"
              >
                Ver catálogo
              </Link>
            </div>
          </section>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-8 w-[300px] shrink-0">
          {/* Categorias rápidas */}
          {categories.length > 0 && (
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-lg p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-1 border-b border-[#141d2c]">
                <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
                <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[18px] leading-none">
                  Categorias
                </p>
              </div>
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogo?categoria=${cat.slug}`}
                  className="flex items-center gap-2 text-[#7a9ab5] hover:text-white text-[13px] transition-colors group"
                >
                  <span className="w-[4px] h-[4px] rounded-full bg-[#ff1f1f] shrink-0 group-hover:bg-white transition-colors" />
                  {cat.title}
                </Link>
              ))}
              <Link
                href="/catalogo"
                className="text-[#ff1f1f] text-[12px] font-semibold hover:text-[#ff4444] transition-colors pt-1 border-t border-[#141d2c]"
              >
                Ver catálogo completo →
              </Link>
            </div>
          )}
        </aside>
      </div>

      <Footer />
    </div>
  );
}
