import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES, STATES, PLAN_LABELS, categoryBySlug } from "@/lib/guia";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

interface Listing {
  id: string; slug: string; name: string; category: string;
  plan: string; city: string; state: string;
  logoUrl: string | null; description: string | null;
  phone: string | null; whatsapp: string | null; website: string | null;
  featured: boolean; viewsCount: number;
}

async function getListings(categoryValue: string, state?: string): Promise<Listing[]> {
  try {
    let url = `https://${PROJECT}.supabase.co/rest/v1/guide_listings?status=eq.ACTIVE&category=eq.${categoryValue}&select=id,slug,name,category,plan,city,state,logoUrl,description,phone,whatsapp,website,featured,viewsCount&order=featured.desc,plan.desc,createdAt.desc`;
    if (state) url += `&state=eq.${encodeURIComponent(state)}`;
    const res = await fetch(url, {
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
      cache: "no-store",
    });
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

export async function generateMetadata(
  { params }: { params: Promise<{ categoria: string }> }
): Promise<Metadata> {
  const { categoria } = await params;
  const cat = categoryBySlug(categoria);
  if (!cat) return { title: "Categoria — Guia Magnum" };
  return {
    title: `${cat.label} — Guia Comercial Magnum`,
    description: `${cat.desc}. Encontre as melhores empresas de ${cat.label} no Brasil no Guia Comercial da Revista Magnum.`,
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ estado?: string }>;
}) {
  const { categoria } = await params;
  const { estado } = await searchParams;

  const cat = categoryBySlug(categoria);
  if (!cat) notFound();

  const estadoUpper = estado?.toUpperCase();
  const listings = await getListings(cat.value, estadoUpper);

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">

        {/* Breadcrumb */}
        <div className="px-5 lg:px-20 py-4 border-b border-[#141d2c] bg-[#0a0e18] flex items-center gap-2 text-[13px]">
          <Link href="/guia" className="text-[#526888] hover:text-white transition-colors">Guia Comercial</Link>
          <span className="text-[#253750]">/</span>
          <span className="text-[#d4d4da]">{cat.label}</span>
        </div>

        {/* Category Header */}
        <section className="px-5 lg:px-20 pt-10 pb-8 bg-[#0a0e18] border-b border-[#141d2c]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-[60px] h-[60px] bg-[#141d2c] rounded-[12px] flex items-center justify-center text-[30px] shrink-0">
              {cat.icon}
            </div>
            <div>
              <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-0.5">{cat.desc}</p>
              <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[42px] leading-none">{cat.label}</h1>
            </div>
          </div>

          {/* State filter */}
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/guia/${cat.slug}`}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-semibold border transition-colors ${
                !estadoUpper
                  ? "bg-[#ff1f1f] border-[#ff1f1f] text-white"
                  : "bg-[#0e1520] border-[#1c2a3e] text-[#526888] hover:text-white hover:border-[#526888]"
              }`}
            >
              Todos
            </Link>
            {STATES.map(s => (
              <Link
                key={s}
                href={`/guia/${cat.slug}?estado=${s}`}
                className={`px-3 py-1.5 rounded-[6px] text-[12px] font-semibold border transition-colors ${
                  estadoUpper === s
                    ? "bg-[#ff1f1f] border-[#ff1f1f] text-white"
                    : "bg-[#0e1520] border-[#1c2a3e] text-[#526888] hover:text-white hover:border-[#526888]"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </section>

        {/* Listings grid */}
        <section className="px-5 lg:px-20 py-10">
          {listings.length === 0 ? (
            <EmptyState catLabel={cat.label} />
          ) : (
            <>
              <p className="text-[#526888] text-[13px] mb-6">
                {listings.length} empresa{listings.length !== 1 ? "s" : ""} encontrada{listings.length !== 1 ? "s" : ""}
                {estadoUpper ? ` em ${estadoUpper}` : " no Brasil"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
            </>
          )}
        </section>

        {/* CTA */}
        <section className="px-5 lg:px-20 pb-14">
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-white text-[18px] font-bold mb-1">Sua empresa não está aqui?</p>
              <p className="text-[#526888] text-[14px]">Cadastre-se gratuitamente e seja encontrado por 45 mil leitores.</p>
            </div>
            <Link href="/guia/cadastrar"
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[48px] px-7 flex items-center rounded-[6px] transition-colors whitespace-nowrap">
              Cadastrar minha empresa →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState({ catLabel }: { catLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-[48px] mb-4">🔍</p>
      <p className="font-['Barlow_Condensed'] font-bold text-white text-[28px] mb-2">Nenhuma empresa cadastrada</p>
      <p className="text-[#526888] text-[15px] mb-8 max-w-[400px]">
        Ainda não há empresas de {catLabel} cadastradas nesta região. Seja o primeiro!
      </p>
      <Link href="/guia/cadastrar"
        className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[48px] px-7 flex items-center rounded-[6px] transition-colors">
        Cadastrar minha empresa →
      </Link>
    </div>
  );
}

/* ── Listing Card ─────────────────────────────────────────────── */
function ListingCard({ listing }: { listing: Listing }) {
  const cat = CATEGORIES.find(c => c.value === listing.category);
  const pl  = PLAN_LABELS[listing.plan];
  return (
    <Link href={`/guia/empresa/${listing.slug}`}
      className="group bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/30 rounded-[12px] overflow-hidden flex flex-col transition-all">
      <div className="h-[80px] bg-[#141d2c] flex items-center px-5 gap-4">
        {listing.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.logoUrl} alt={listing.name}
            className="w-[48px] h-[48px] object-contain rounded-[6px] bg-[#0e1520] shrink-0" />
        ) : (
          <div className="w-[48px] h-[48px] bg-[#0e1520] rounded-[6px] flex items-center justify-center text-[22px] shrink-0">
            {cat?.icon ?? "🏢"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-[15px] font-bold truncate group-hover:text-[#ff1f1f] transition-colors">{listing.name}</p>
          <p className="text-[#526888] text-[12px]">{listing.city} · {listing.state}</p>
        </div>
        {listing.plan !== "FREE" && (
          <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] shrink-0 ${pl.color}`}>{pl.label}</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        {listing.description && (
          <p className="text-[#7a9ab5] text-[13px] leading-[20px] line-clamp-2">{listing.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="flex items-center gap-1.5 text-[#526888] text-[11px]">
            <span>{cat?.icon}</span> {cat?.label}
          </span>
          <span className="text-[#ff1f1f] text-[12px] font-semibold group-hover:translate-x-1 transition-transform">
            Ver perfil →
          </span>
        </div>
      </div>
    </Link>
  );
}
