import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoriteButton from "@/components/FavoriteButton";
import { PLAN_LABELS, categoryBySegment } from "@/lib/guia";
import { createClient } from "@/lib/supabase/server";
import GuiaViewTracker from "./GuiaViewTracker";
import WhatsAppModal from "./_WhatsAppModal";
import PhoneReveal from "./_PhoneReveal";
import ContactForm from "./_ContactForm";
import DirectionsButton from "./_DirectionsButton";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const H        = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface Company {
  id: string;
  tradeName: string;
  legalName: string | null;
  segment: string;
  listingType: string;
  pipelineStatus: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  featured: boolean;
  viewsCount: number;
  whatsappCount: number;
  formCount: number;
  phoneCount: number;
  directionsCount: number;
}

async function getCompany(id: string): Promise<Company | null> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/companies?id=eq.${id}&pipelineStatus=eq.ACTIVE&select=*&limit=1`,
      { headers: H, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) && d.length > 0 ? d[0] : null;
  } catch { return null; }
}

async function getRelated(segment: string, excludeId: string): Promise<Company[]> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/companies?pipelineStatus=eq.ACTIVE&segment=eq.${segment}&id=neq.${excludeId}&select=id,tradeName,segment,listingType,city,state,logoUrl,description,featured,viewsCount&order=featured.desc,listingType.desc&limit=4`,
      { headers: H, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

async function getMapsKey(): Promise<string> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?key=eq.googleMapsApiKey&select=value&limit=1`,
      { headers: H, cache: "no-store" }
    );
    const d = await res.json();
    return Array.isArray(d) && d[0]?.value ? d[0].value : "";
  } catch { return ""; }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) return { title: "Empresa — Guia" };
  const cat = categoryBySegment(company.segment);
  return {
    title: `${company.tradeName} — ${cat?.label ?? "Guia"} em ${company.city ?? ""}, ${company.state ?? ""} | Guia`,
    description: company.description?.slice(0, 160) ??
      `${company.tradeName} é uma empresa de ${cat?.label ?? company.segment} localizada em ${company.city}, ${company.state}.`,
  };
}

export default async function EmpresaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const [{ data: { user } }, company, mapsKey] = await Promise.all([
    supabase.auth.getUser(),
    getCompany(slug),
    getMapsKey(),
  ]);
  if (!company) notFound();

  // Verifica favorito
  let isLoggedIn = false;
  let isFavorited = false;
  if (user) {
    isLoggedIn = true;
    try {
      const userRes = await fetch(
        `https://${PROJECT}.supabase.co/rest/v1/users?authId=eq.${user.id}&select=id&limit=1`,
        { headers: H, cache: "no-store" }
      );
      const users = await userRes.json();
      const dbUser = Array.isArray(users) ? users[0] : null;
      if (dbUser) {
        const favRes = await fetch(
          `https://${PROJECT}.supabase.co/rest/v1/user_favorites?userId=eq.${dbUser.id}&contentType=eq.guide_listing&contentId=eq.${company.id}&select=id&limit=1`,
          { headers: H, cache: "no-store" }
        );
        const favData = await favRes.json();
        isFavorited = Array.isArray(favData) && favData.length > 0;
      }
    } catch { /* noop */ }
  }

  const cat        = categoryBySegment(company.segment);
  const pl         = PLAN_LABELS[company.listingType] ?? PLAN_LABELS["FREE"];
  const isPaid     = company.listingType === "PREMIUM" || company.listingType === "DESTAQUE";
  const mapQuery   = [company.address, company.city, company.state, company.zip].filter(Boolean).join(", ");
  const mapsUrl    = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`;
  const mapsEmbed  = mapQuery
    ? mapsKey
      ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(mapQuery)}&zoom=15`
      : `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : null;
  const whatsappNum = company.whatsappNumber?.replace(/\D/g, "");
  const igHandle    = company.instagram?.replace(/^@/, "");
  const related     = await getRelated(company.segment, company.id);

  const totalInteractions =
    (company.whatsappCount ?? 0) +
    (company.formCount ?? 0) +
    (company.phoneCount ?? 0) +
    (company.directionsCount ?? 0);

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <GuiaViewTracker id={company.id} />
      <main className="flex-1 pt-16">

        {/* Cover image */}
        {company.coverImageUrl && (
          <div className="w-full h-[200px] lg:h-[280px] overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={company.coverImageUrl} alt={`${company.tradeName} — capa`}
              className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/40 to-transparent" />
          </div>
        )}

        {/* Breadcrumb */}
        <div className="px-5 lg:px-20 py-3 border-b border-[#141d2c] bg-[#0a0e18] flex items-center gap-2 text-[13px] flex-wrap">
          <Link href="/guia" className="text-[#526888] hover:text-white transition-colors">Guia Comercial</Link>
          <span className="text-[#526888]">/</span>
          {cat && (
            <>
              <Link href={`/guia/${cat.slug}`} className="text-[#526888] hover:text-white transition-colors">{cat.label}</Link>
              <span className="text-[#526888]">/</span>
            </>
          )}
          <span className="text-[#d4d4da] truncate max-w-[200px]">{company.tradeName}</span>
        </div>

        {/* ── Hero ── */}
        <section className="px-5 lg:px-20 py-10 bg-[#0a0e18] border-b border-[#141d2c]">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Left: identity */}
            <div className="flex-1">
              <div className="flex items-start gap-5 mb-5">

                {/* Logo */}
                <div className={`shrink-0 rounded-[16px] overflow-hidden flex items-center justify-center bg-[#141d2c] ${isPaid ? "w-[96px] h-[96px]" : "w-[72px] h-[72px]"}`}>
                  {company.logoUrl && isPaid ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logoUrl} alt={company.tradeName}
                      className="w-full h-full object-contain p-2" />
                  ) : company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logoUrl} alt={company.tradeName}
                      className="w-full h-full object-contain p-2 opacity-70" />
                  ) : (
                    <span className={isPaid ? "text-[44px]" : "text-[34px]"}>{cat?.icon ?? "🏢"}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {company.featured && (
                      <span className="bg-[#260a0a] border border-[#ff1f1f]/30 text-[#ff1f1f] text-[10px] font-bold px-2 py-0.5 rounded-[4px] tracking-wider">
                        ★ DESTAQUE
                      </span>
                    )}
                    {company.listingType !== "FREE" && company.listingType !== "NONE" && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${pl.color}`}>{pl.label}</span>
                    )}
                    {cat && (
                      <Link href={`/guia/${cat.slug}`}
                        className="flex items-center gap-1 text-[#526888] text-[11px] hover:text-[#ff1f1f] transition-colors bg-[#141d2c] px-2 py-0.5 rounded-[4px]">
                        {cat.icon} {cat.label}
                      </Link>
                    )}
                  </div>

                  <h1 className="font-['Barlow_Condensed'] font-bold text-white leading-none mb-2"
                    style={{ fontSize: isPaid ? "clamp(28px,5vw,52px)" : "clamp(24px,4vw,40px)" }}>
                    {company.tradeName}
                  </h1>

                  {/* Location + stats */}
                  <div className="flex items-center gap-3 text-[13px] text-[#526888] flex-wrap">
                    {(company.city || company.state) && (
                      <span className="flex items-center gap-1">
                        📍 {[company.city, company.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {company.viewsCount > 0 && (
                      <>
                        <span className="text-[#1c2a3e]">·</span>
                        <span className="flex items-center gap-1">
                          👁 {company.viewsCount.toLocaleString("pt-BR")} visualizaç{company.viewsCount !== 1 ? "ões" : "ão"}
                        </span>
                      </>
                    )}
                    {totalInteractions > 0 && (
                      <>
                        <span className="text-[#1c2a3e]">·</span>
                        <span className="flex items-center gap-1">
                          ⚡ {totalInteractions.toLocaleString("pt-BR")} interaç{totalInteractions !== 1 ? "ões" : "ão"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {company.description && (
                <p className="text-[#7a9ab5] text-[16px] leading-[26px] max-w-[660px]">
                  {company.description}
                </p>
              )}

              <div className="mt-4">
                <FavoriteButton
                  contentType="guide_listing"
                  contentId={company.id}
                  isLoggedIn={isLoggedIn}
                  initialIsFavorited={isFavorited}
                  size="md"
                  label={isFavorited ? "Empresa favoritada" : "Favoritar empresa"}
                />
              </div>
            </div>

            {/* Right: contact panel */}
            <div className="flex flex-col gap-2 min-w-[240px] w-full lg:w-[260px] shrink-0">
              <p className="text-[#526888] text-[11px] font-semibold uppercase tracking-[1px] mb-1">
                Fale com a empresa
              </p>

              {/* Phone (masked) */}
              {company.phone && (
                <PhoneReveal phone={company.phone} companyId={company.id} />
              )}

              {/* WhatsApp modal */}
              {whatsappNum && (
                <WhatsAppModal
                  companyId={company.id}
                  companyName={company.tradeName}
                  logoUrl={company.logoUrl}
                  whatsappNumber={whatsappNum}
                  defaultMessage={company.whatsappMessage}
                />
              )}

              {/* Website */}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#141d2c] border border-[#1c2a3e] hover:border-[#526888] rounded-[10px] px-4 h-[52px] text-[14px] text-[#d4d4da] hover:text-white transition-all">
                  <span className="text-[18px]">🌐</span>
                  <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
                  <svg className="w-3.5 h-3.5 ml-auto opacity-40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}

              {/* Instagram */}
              {igHandle && (
                <a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#1a0f2e] border border-[#2e1a4a] hover:border-[#818cf8] rounded-[10px] px-4 h-[52px] text-[14px] text-[#818cf8] hover:text-white transition-all">
                  <span className="text-[18px]">📸</span>
                  <span>@{igHandle}</span>
                </a>
              )}

              {/* Interaction stats (small, for social proof) */}
              {(company.whatsappCount > 0 || company.formCount > 0) && (
                <div className="mt-1 px-1 flex gap-4 text-[11px] text-[#526888]">
                  {company.whatsappCount > 0 && (
                    <span>{company.whatsappCount} contato{company.whatsappCount !== 1 ? "s" : ""} via WhatsApp</span>
                  )}
                  {company.formCount > 0 && (
                    <span>{company.formCount} mensagem{company.formCount !== 1 ? "s" : ""}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Body ── */}
        <section className="px-5 lg:px-20 py-10">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Main content */}
            <div className="flex-1 flex flex-col gap-8">

              {/* Map section */}
              {mapQuery && (
                <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] overflow-hidden">
                  {/* Map embed */}
                  <div className="relative">
                    <iframe
                      src={mapsEmbed!}
                      width="100%"
                      height="320"
                      style={{ border: 0, display: "block", filter: "invert(90%) hue-rotate(180deg) saturate(0.8)" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Localização de ${company.tradeName}`}
                    />
                    {/* Overlay to prevent map stealing clicks until user interacts */}
                    <div className="absolute inset-0 pointer-events-none" />
                  </div>

                  {/* Address + Como Chegar */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="text-[#ff1f1f] text-[11px] font-semibold uppercase tracking-[1px] mb-1">Endereço</p>
                      <p className="text-[#d4d4da] text-[15px] leading-[22px]">
                        {company.address && <span>{company.address}, </span>}
                        {company.city && company.state
                          ? <>{company.city} — {company.state}</>
                          : (company.city || company.state)}
                        {company.zip && <span className="text-[#526888]">, CEP {company.zip}</span>}
                      </p>
                    </div>

                    <DirectionsButton
                      companyId={company.id}
                      mapsUrl={mapsUrl}
                      label="Como Chegar"
                    />
                  </div>
                </div>
              )}

              {/* Contact form */}
              <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] overflow-hidden">
                <div className="bg-[#141d2c] px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-[15px] font-semibold">Envie uma mensagem</p>
                    <p className="text-[#526888] text-[12px]">Resposta direta para {company.tradeName}</p>
                  </div>
                  <span className="text-[22px]">✉️</span>
                </div>
                <div className="p-5">
                  <ContactForm companyId={company.id} companyName={company.tradeName} />
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div className="lg:w-[280px] shrink-0 flex flex-col gap-6">

              {/* Interaction stats card */}
              {isPaid && (
                <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
                  <p className="text-[#526888] text-[11px] font-semibold uppercase tracking-[1px] mb-4">Atividade</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Visualizações",    value: company.viewsCount        ?? 0, icon: "👁" },
                      { label: "WhatsApp",         value: company.whatsappCount     ?? 0, icon: "💬" },
                      { label: "Mensagens",        value: company.formCount         ?? 0, icon: "✉️" },
                      { label: "Rotas",            value: company.directionsCount   ?? 0, icon: "📍" },
                      { label: "Tel. revelados",   value: company.phoneCount        ?? 0, icon: "📞" },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#141d2c] rounded-[8px] p-3 flex flex-col gap-1">
                        <span className="text-[16px]">{s.icon}</span>
                        <p className="font-['Barlow_Condensed'] font-bold text-white text-[22px] leading-none">
                          {s.value.toLocaleString("pt-BR")}
                        </p>
                        <p className="text-[#526888] text-[11px]">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related companies */}
              {related.length > 0 && (
                <div>
                  <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-3">
                    Mais em {cat?.label ?? company.segment}
                  </p>
                  <div className="flex flex-col gap-2">
                    {related.map((r) => <RelatedCard key={r.id} company={r} />)}
                  </div>
                  {cat && (
                    <Link href={`/guia/${cat.slug}`}
                      className="mt-4 flex items-center justify-center gap-2 text-[#526888] text-[13px] hover:text-white transition-colors py-2">
                      Ver todas em {cat.label} →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Upgrade CTA — plano FREE */}
        {(company.listingType === "FREE" || company.listingType === "NONE") && (
          <section className="px-5 lg:px-20 pb-6">
            <div className="bg-[#0e1520] border border-[#ff1f1f]/20 rounded-[12px] p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-1">Plano Gratuito</p>
                <p className="text-white text-[16px] font-bold mb-1">É o proprietário? Aumente sua visibilidade</p>
                <p className="text-[#526888] text-[13px]">
                  Com Premium ou Destaque: logo em destaque, mapa e posição privilegiada na categoria.
                </p>
              </div>
              <Link href={`/guia/upgrade?id=${company.id}&plano=PREMIUM`}
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-6 flex items-center rounded-[6px] transition-colors whitespace-nowrap shrink-0">
                Fazer upgrade →
              </Link>
            </div>
          </section>
        )}

        {/* Bottom CTA */}
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

function RelatedCard({ company }: {
  company: Pick<Company, "id" | "tradeName" | "segment" | "listingType" | "city" | "state" | "logoUrl" | "description" | "featured">
}) {
  const cat = categoryBySegment(company.segment);
  const pl  = PLAN_LABELS[company.listingType] ?? PLAN_LABELS["FREE"];
  return (
    <Link href={`/guia/empresa/${company.id}`}
      className="group bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/30 rounded-[10px] p-3.5 flex items-center gap-3 transition-all">
      <div className="w-[40px] h-[40px] bg-[#141d2c] rounded-[8px] flex items-center justify-center text-[18px] shrink-0 overflow-hidden">
        {company.logoUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={company.logoUrl} alt={company.tradeName} className="w-full h-full object-contain p-1" />
          : (cat?.icon ?? "🏢")
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#d4d4da] text-[13px] font-semibold truncate group-hover:text-white transition-colors">{company.tradeName}</p>
        <p className="text-[#526888] text-[11px]">{company.city} · {company.state}</p>
      </div>
      {company.listingType !== "FREE" && company.listingType !== "NONE" && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] shrink-0 ${pl.color}`}>{pl.label}</span>
      )}
    </Link>
  );
}
