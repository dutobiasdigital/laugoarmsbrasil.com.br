import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES, PLAN_LABELS, categoryByValue } from "@/lib/guia";
import GuiaViewTracker from "./GuiaViewTracker";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

interface Listing {
  id: string; slug: string; name: string; category: string;
  plan: string; status: string;
  description: string | null; logoUrl: string | null;
  phone: string | null; whatsapp: string | null; email: string | null;
  website: string | null; instagram: string | null;
  address: string | null; city: string; state: string; zip: string | null;
  hours: string | null; featured: boolean; viewsCount: number;
}

async function getListing(slug: string): Promise<Listing | null> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/guide_listings?slug=eq.${slug}&status=eq.ACTIVE&select=*&limit=1`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) && d.length > 0 ? d[0] : null;
  } catch { return null; }
}

async function getRelated(category: string, excludeSlug: string): Promise<Listing[]> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/guide_listings?status=eq.ACTIVE&category=eq.${category}&slug=neq.${excludeSlug}&select=id,slug,name,category,plan,city,state,logoUrl,description,featured,viewsCount&order=featured.desc,plan.desc&limit=3`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

async function getMapsKey(): Promise<string> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?key=eq.googleMapsApiKey&select=value&limit=1`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) && d[0]?.value ? d[0].value : "";
  } catch { return ""; }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "Empresa — Guia Magnum" };
  const cat = categoryByValue(listing.category);
  return {
    title: `${listing.name} — ${cat?.label ?? "Guia"} em ${listing.city}, ${listing.state} | Guia Magnum`,
    description: listing.description?.slice(0, 160) ?? `${listing.name} é uma empresa de ${cat?.label} localizada em ${listing.city}, ${listing.state}.`,
  };
}

export default async function EmpresaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [listing, mapsKey] = await Promise.all([getListing(slug), getMapsKey()]);
  if (!listing) notFound();

  const cat        = categoryByValue(listing.category);
  const pl         = PLAN_LABELS[listing.plan];
  const isPaid     = listing.plan === "PREMIUM" || listing.plan === "DESTAQUE";
  const showMap    = isPaid && !!listing.address;
  const mapQuery   = [listing.address, listing.city, listing.state, listing.zip].filter(Boolean).join(", ");

  const whatsappNum = listing.whatsapp?.replace(/\D/g, "");
  const igHandle    = listing.instagram?.replace("@", "");

  const related = await getRelated(listing.category, listing.slug);

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <GuiaViewTracker slug={listing.slug} />
      <main className="flex-1 pt-16">

        {/* Breadcrumb */}
        <div className="px-5 lg:px-20 py-4 border-b border-[#141d2c] bg-[#0a0e18] flex items-center gap-2 text-[13px] flex-wrap">
          <Link href="/guia" className="text-[#526888] hover:text-white transition-colors">Guia Comercial</Link>
          <span className="text-[#253750]">/</span>
          {cat && (
            <>
              <Link href={`/guia/${cat.slug}`} className="text-[#526888] hover:text-white transition-colors">{cat.label}</Link>
              <span className="text-[#253750]">/</span>
            </>
          )}
          <span className="text-[#d4d4da] truncate max-w-[200px]">{listing.name}</span>
        </div>

        {/* Hero */}
        <section className="px-5 lg:px-20 py-10 bg-[#0a0e18] border-b border-[#141d2c]">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Left: identity */}
            <div className="flex-1">
              <div className="flex items-start gap-5 mb-5">
                {/* Logo / icon */}
                <div className="w-[80px] h-[80px] bg-[#141d2c] rounded-[16px] flex items-center justify-center shrink-0 overflow-hidden">
                  {listing.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.logoUrl} alt={listing.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-[40px]">{cat?.icon ?? "🏢"}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {listing.featured && (
                      <span className="bg-[#260a0a] border border-[#ff1f1f]/30 text-[#ff1f1f] text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                        ★ DESTAQUE
                      </span>
                    )}
                    {listing.plan !== "FREE" && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${pl.color}`}>{pl.label}</span>
                    )}
                  </div>
                  <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[38px] lg:text-[48px] leading-none mb-1">
                    {listing.name}
                  </h1>
                  <div className="flex items-center gap-3 text-[14px] text-[#526888] flex-wrap">
                    {cat && (
                      <Link href={`/guia/${cat.slug}`} className="flex items-center gap-1.5 hover:text-[#ff1f1f] transition-colors">
                        <span>{cat.icon}</span> {cat.label}
                      </Link>
                    )}
                    <span>·</span>
                    <span>📍 {listing.city}, {listing.state}</span>
                    {listing.viewsCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{listing.viewsCount} visualizaç{listing.viewsCount !== 1 ? "ões" : "ão"}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {listing.description && (
                <p className="text-[#7a9ab5] text-[16px] leading-[26px] max-w-[620px]">
                  {listing.description}
                </p>
              )}
            </div>

            {/* Right: contact buttons */}
            <div className="flex flex-col gap-2 min-w-[220px] w-full lg:w-auto">
              {listing.phone && (
                <a href={`tel:${listing.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 bg-[#141d2c] border border-[#1c2a3e] hover:border-[#526888] rounded-[8px] px-4 h-[48px] text-[14px] text-[#d4d4da] hover:text-white transition-all group">
                  <span className="text-[18px]">📞</span>
                  <span className="flex-1">{listing.phone}</span>
                </a>
              )}
              {whatsappNum && (
                <a href={`https://wa.me/55${whatsappNum}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#0f2b1a] border border-[#1a4a2e] hover:border-[#22c55e] rounded-[8px] px-4 h-[48px] text-[14px] text-[#22c55e] hover:text-white transition-all">
                  <span className="text-[18px]">💬</span>
                  <span>WhatsApp</span>
                </a>
              )}
              {listing.website && (
                <a href={listing.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#141d2c] border border-[#1c2a3e] hover:border-[#526888] rounded-[8px] px-4 h-[48px] text-[14px] text-[#d4d4da] hover:text-white transition-all">
                  <span className="text-[18px]">🌐</span>
                  <span className="truncate">{listing.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
              {listing.email && (
                <a href={`mailto:${listing.email}`}
                  className="flex items-center gap-3 bg-[#141d2c] border border-[#1c2a3e] hover:border-[#526888] rounded-[8px] px-4 h-[48px] text-[14px] text-[#d4d4da] hover:text-white transition-all">
                  <span className="text-[18px]">✉️</span>
                  <span className="truncate">{listing.email}</span>
                </a>
              )}
              {igHandle && (
                <a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#1a0f2e] border border-[#2e1a4a] hover:border-[#818cf8] rounded-[8px] px-4 h-[48px] text-[14px] text-[#818cf8] hover:text-white transition-all">
                  <span className="text-[18px]">📸</span>
                  <span>@{igHandle}</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="px-5 lg:px-20 py-10">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Main content */}
            <div className="flex-1 flex flex-col gap-8">

              {/* Horário */}
              {listing.hours && (
                <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
                  <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-2">Horário de Funcionamento</p>
                  <p className="text-[#d4d4da] text-[15px]">🕐 {listing.hours}</p>
                </div>
              )}

              {/* Endereço + Mapa */}
              {listing.address && (
                <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
                  <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-3">Endereço</p>
                  <p className="text-[#d4d4da] text-[15px] mb-4">
                    📍 {listing.address}, {listing.city} — {listing.state}{listing.zip ? `, CEP ${listing.zip}` : ""}
                  </p>

                  {/* Google Maps — apenas planos pagos */}
                  {showMap && (
                    <div className="rounded-[8px] overflow-hidden border border-[#141d2c]">
                      {mapsKey ? (
                        <iframe
                          src={`https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(mapQuery)}&zoom=15`}
                          width="100%"
                          height="300"
                          style={{ border: 0, display: "block" }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Localização de ${listing.name}`}
                        />
                      ) : (
                        <a
                          href={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 bg-[#141d2c] hover:bg-[#1c2a3e] h-[140px] rounded-[8px] transition-colors group"
                        >
                          <div className="text-center">
                            <p className="text-[32px] mb-2">🗺️</p>
                            <p className="text-[#7a9ab5] text-[14px] group-hover:text-white transition-colors font-semibold">
                              Ver no Google Maps →
                            </p>
                            <p className="text-[#253750] text-[12px] mt-1">{mapQuery}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Link externo para o mapa (complementa o embed) */}
                  {showMap && (
                    <a
                      href={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-[#7a9ab5] text-[13px] hover:text-white transition-colors"
                    >
                      Abrir no Google Maps ↗
                    </a>
                  )}
                </div>
              )}

              {/* Plano FREE sem mapa — mostra endereço simples */}
              {!listing.address && !listing.hours && (
                <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col items-center text-center gap-3">
                  <p className="text-[28px]">📍</p>
                  <p className="text-white text-[15px] font-semibold">{listing.city}, {listing.state}</p>
                  {!isPaid && (
                    <p className="text-[#253750] text-[12px]">
                      Endereço completo e mapa disponíveis nos planos Premium e Destaque
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar — empresas relacionadas */}
            {related.length > 0 && (
              <div className="lg:w-[300px] shrink-0">
                <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-3">
                  Outras empresas de {cat?.label}
                </p>
                <div className="flex flex-col gap-3">
                  {related.map(r => <RelatedCard key={r.id} listing={r} />)}
                </div>
                {cat && (
                  <Link href={`/guia/${cat.slug}`}
                    className="mt-4 flex items-center justify-center gap-2 text-[#526888] text-[13px] hover:text-white transition-colors">
                    Ver todas → {cat.label}
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 lg:px-20 pb-14">
          <div className="bg-[#0a0e18] border border-[#141d2c] rounded-[12px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-white text-[18px] font-bold mb-1">Sua empresa também pode estar aqui</p>
              <p className="text-[#526888] text-[14px]">Cadastre-se gratuitamente. Upgrade para Premium ou Destaque a qualquer momento.</p>
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

/* ── Related card (mini) ──────────────────────────────────────── */
function RelatedCard({ listing }: { listing: Pick<Listing, "id" | "slug" | "name" | "category" | "plan" | "city" | "state" | "logoUrl" | "description" | "featured"> }) {
  const cat = CATEGORIES.find(c => c.value === listing.category);
  const pl  = PLAN_LABELS[listing.plan];
  return (
    <Link href={`/guia/empresa/${listing.slug}`}
      className="group bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/30 rounded-[10px] p-3.5 flex items-center gap-3 transition-all">
      <div className="w-[40px] h-[40px] bg-[#141d2c] rounded-[8px] flex items-center justify-center text-[18px] shrink-0 overflow-hidden">
        {listing.logoUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={listing.logoUrl} alt={listing.name} className="w-full h-full object-contain p-1" />
          : cat?.icon ?? "🏢"
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#d4d4da] text-[13px] font-semibold truncate group-hover:text-white transition-colors">{listing.name}</p>
        <p className="text-[#526888] text-[11px]">{listing.city} · {listing.state}</p>
      </div>
      {listing.plan !== "FREE" && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] shrink-0 ${pl.color}`}>{pl.label}</span>
      )}
    </Link>
  );
}
