import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Meus Favoritos — Minha Conta · Revista Magnum",
};
export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const H        = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

type Favorite = { id: string; contentType: string; contentId: string; createdAt: string };

type Edition = {
  id: string; title: string; number: number | null; slug: string;
  coverImageUrl: string | null; type: string; publishedAt: string | null;
};
type Product = {
  id: string; name: string; slug: string; basePrice: number; mainImageUrl: string | null;
};
type Company = {
  id: string; tradeName: string; segment: string; logoUrl: string | null;
  city: string | null; state: string | null; listingType: string;
};
type Article = {
  id: string; title: string; slug: string; excerpt: string | null;
  featureImageUrl: string | null; publishedAt: string | null;
  category: { name: string } | null;
};

function fmtCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function FavoritosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Busca userId interno
  const userRes = await fetch(
    `${BASE}/users?authId=eq.${user.id}&select=id&limit=1`,
    { headers: H, cache: "no-store" }
  );
  const users  = await userRes.json();
  const dbUser = Array.isArray(users) ? users[0] : null;
  if (!dbUser) redirect("/minha-conta");

  // Busca todos os favoritos
  const favRes = await fetch(
    `${BASE}/user_favorites?userId=eq.${dbUser.id}&select=id,contentType,contentId,createdAt&order=createdAt.desc`,
    { headers: H, cache: "no-store" }
  );
  const allFavorites: Favorite[] = await favRes.json().then(d => Array.isArray(d) ? d : []);

  const editionIds = allFavorites.filter(f => f.contentType === "edition").map(f => f.contentId);
  const productIds = allFavorites.filter(f => f.contentType === "product").map(f => f.contentId);
  const guideIds   = allFavorites.filter(f => f.contentType === "guide_listing").map(f => f.contentId);
  const articleIds = allFavorites.filter(f => f.contentType === "article").map(f => f.contentId);

  let editions: Edition[]  = [];
  let products: Product[]  = [];
  let companies: Company[] = [];
  let articles: Article[]  = [];

  await Promise.all([
    editionIds.length > 0 && fetch(
      `${BASE}/editions?id=in.(${editionIds.join(",")})&select=id,title,number,slug,coverImageUrl,type,publishedAt`,
      { headers: H, cache: "no-store" }
    ).then(r => r.json()).then(d => { editions = Array.isArray(d) ? d : []; }),

    productIds.length > 0 && fetch(
      `${BASE}/shop_products?id=in.(${productIds.join(",")})&select=id,name,slug,basePrice,mainImageUrl`,
      { headers: H, cache: "no-store" }
    ).then(r => r.json()).then(d => { products = Array.isArray(d) ? d : []; }),

    guideIds.length > 0 && fetch(
      `${BASE}/companies?id=in.(${guideIds.join(",")})&select=id,tradeName,segment,logoUrl,city,state,listingType`,
      { headers: H, cache: "no-store" }
    ).then(r => r.json()).then(d => { companies = Array.isArray(d) ? d : []; }),

    articleIds.length > 0 && fetch(
      `${BASE}/articles?id=in.(${articleIds.join(",")})&select=id,title,slug,excerpt,featureImageUrl,publishedAt,category:article_categories(name)`,
      { headers: H, cache: "no-store" }
    ).then(r => r.json()).then(d => { articles = Array.isArray(d) ? d : []; }),
  ]);

  const total = editions.length + products.length + companies.length + articles.length;

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-metal px-5 lg:px-10 pt-10 pb-8 border-b border-[#141d2c]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
          <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">Coleção</span>
        </div>
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[44px] lg:text-[52px] leading-[0.95] mb-2">
          Meus Favoritos
        </h1>
        <p className="text-[#7a9ab5] text-[15px]">
          {total > 0
            ? `${total} item${total !== 1 ? "s" : ""} salvo${total !== 1 ? "s" : ""} na sua coleção`
            : "Salve edições, artigos, produtos e empresas do guia para encontrar rápido depois."
          }
        </p>
      </section>

      <div className="px-5 lg:px-10 py-8 flex flex-col gap-10 max-w-[1000px]">

        {total === 0 && (
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[14px] p-12 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#141d2c] border border-[#1c2a3e] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff1f1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </div>
            <div>
              <p className="font-['Barlow_Condensed'] font-bold text-white text-[22px] mb-2">Nenhum favorito ainda</p>
              <p className="text-[#7a9ab5] text-[14px] max-w-[400px] mx-auto leading-relaxed">
                Explore o acervo e clique no ❤ para salvar edições, artigos, produtos e empresas que você queira acompanhar.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <Link href="/edicoes" className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[40px] px-5 rounded-[8px] transition-colors flex items-center justify-center">
                Navegar edições
              </Link>
              <Link href="/blog" className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] font-semibold h-[40px] px-5 rounded-[8px] transition-colors flex items-center justify-center">
                Ver blog
              </Link>
              <Link href="/loja" className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] font-semibold h-[40px] px-5 rounded-[8px] transition-colors flex items-center justify-center">
                Ver loja
              </Link>
              <Link href="/guia" className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] font-semibold h-[40px] px-5 rounded-[8px] transition-colors flex items-center justify-center">
                Guia Comercial
              </Link>
            </div>
          </div>
        )}

        {/* ── Edições ── */}
        {editions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[24px] leading-none">
                  Edições <span className="text-[#526888] text-[16px] font-normal">({editions.length})</span>
                </h2>
              </div>
              <Link href="/edicoes" className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors">
                Ver acervo →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {editions.map(ed => {
                const isSpecial = ed.type === "SPECIAL";
                const date = ed.publishedAt ? new Date(ed.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : null;
                return (
                  <Link key={ed.id} href={`/edicoes/${ed.slug}`}
                    className="group card-metal-border rounded-[13px] overflow-hidden flex flex-col bg-[#0a0f1a] hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {ed.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ed.coverImageUrl} alt={ed.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`absolute inset-0 flex items-center justify-center ${isSpecial ? "bg-[#cc0000]/20" : "bg-[#141d2c]"}`}>
                          <p className={`font-['Barlow_Condensed'] font-extrabold text-[22px] ${isSpecial ? "text-[#ff1f1f]/40" : "text-white/10"}`}>
                            {ed.number ? `Nº ${ed.number}` : "—"}
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#141416] to-transparent" />
                    </div>
                    <div className="flex flex-col gap-1 px-3 pt-2 pb-3">
                      <span className={`text-[9px] font-bold tracking-[0.8px] uppercase px-1.5 py-[2px] rounded-[3px] w-fit ${
                        isSpecial ? "bg-[#ff1f1f]/20 text-[#ff6b6b] border border-[#ff1f1f]/30" : "bg-white/5 text-white/40 border border-white/10"
                      }`}>{isSpecial ? "Especial" : "Regular"}</span>
                      <p className="font-['Barlow_Condensed'] font-bold text-white text-[14px] leading-snug line-clamp-2">
                        {ed.number ? `Edição ${ed.number}` : ed.title}
                      </p>
                      {date && <p className="text-white/25 text-[10px]">{date}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Artigos ── */}
        {articles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[24px] leading-none">
                  Artigos <span className="text-[#526888] text-[16px] font-normal">({articles.length})</span>
                </h2>
              </div>
              <Link href="/blog" className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors">
                Ver blog →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map(art => {
                const date = art.publishedAt
                  ? new Date(art.publishedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })
                  : null;
                return (
                  <Link key={art.id} href={`/blog/${art.slug}`}
                    className="group bg-[#0e1520] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[12px] overflow-hidden flex flex-col transition-all hover:shadow-lg hover:shadow-black/30"
                  >
                    <div className="aspect-[16/9] bg-[#141d2c] overflow-hidden">
                      {art.featureImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={art.featureImageUrl} alt={art.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1c2a3e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 p-4">
                      {art.category?.name && (
                        <span className="text-[10px] font-semibold text-[#ff1f1f] uppercase tracking-[0.8px]">
                          {art.category.name}
                        </span>
                      )}
                      <p className="text-white text-[14px] font-semibold leading-snug line-clamp-2 group-hover:text-white/90">
                        {art.title}
                      </p>
                      {art.excerpt && (
                        <p className="text-[#526888] text-[12px] line-clamp-2 leading-relaxed">{art.excerpt}</p>
                      )}
                      {date && <p className="text-[#526888] text-[11px] mt-auto pt-1">{date}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Produtos ── */}
        {products.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[24px] leading-none">
                  Produtos <span className="text-[#526888] text-[16px] font-normal">({products.length})</span>
                </h2>
              </div>
              <Link href="/loja" className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors">
                Ver loja →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(prod => (
                <Link key={prod.id} href={`/loja/produto/${prod.slug}`}
                  className="group bg-[#0e1520] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[12px] overflow-hidden flex flex-col transition-all hover:shadow-lg hover:shadow-black/30"
                >
                  <div className="aspect-square bg-[#141d2c] overflow-hidden">
                    {prod.mainImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prod.mainImageUrl} alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-[#1c2a3e] text-[11px] font-mono">Produto</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 p-3.5">
                    <p className="text-white text-[13px] font-semibold leading-snug line-clamp-2">{prod.name}</p>
                    <p className="text-[#ff1f1f] text-[14px] font-bold">{fmtCurrency(prod.basePrice)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Guia Comercial ── */}
        {companies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[24px] leading-none">
                  Guia Comercial <span className="text-[#526888] text-[16px] font-normal">({companies.length})</span>
                </h2>
              </div>
              <Link href="/guia" className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors">
                Ver guia →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map(co => (
                <Link key={co.id} href={`/guia/empresa/${co.id}`}
                  className="group bg-[#0e1520] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[12px] p-4 flex items-center gap-4 transition-all hover:shadow-lg hover:shadow-black/30"
                >
                  <div className="w-[56px] h-[56px] shrink-0 rounded-[8px] bg-[#141d2c] overflow-hidden flex items-center justify-center border border-[#1c2a3e]">
                    {co.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={co.logoUrl} alt={co.tradeName} className="w-full h-full object-cover" />
                    ) : (
                      <p className="font-['Barlow_Condensed'] font-bold text-[#526888] text-[14px]">
                        {co.tradeName.slice(0, 2).toUpperCase()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-white text-[14px] font-semibold truncate group-hover:text-white/90">{co.tradeName}</p>
                    <p className="text-[#7a9ab5] text-[12px]">{co.segment}</p>
                    {(co.city || co.state) && (
                      <p className="text-[#526888] text-[11px]">
                        {[co.city, co.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                  {co.listingType === "PREMIUM" && (
                    <span className="ml-auto shrink-0 bg-[#ff1f1f]/15 text-[#ff6b6b] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#ff1f1f]/30">
                      PREMIUM
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
