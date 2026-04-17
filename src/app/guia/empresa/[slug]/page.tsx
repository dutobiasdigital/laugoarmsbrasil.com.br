import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PLAN_LABELS, categoryBySegment } from "@/lib/guia";
import GuiaViewTracker from "./GuiaViewTracker";

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
      `https://${PROJECT}.supabase.co/rest/v1/companies?pipelineStatus=eq.ACTIVE&segment=eq.${segment}&id=neq.${excludeId}&select=id,tradeName,segment,listingType,city,state,logoUrl,description,featured,viewsCount&order=featured.desc,listingType.desc&limit=3`,
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
  if (!company) return { title: "Empresa — Guia Magnum" };
  const cat = categoryBySegment(company.segment);
  return {
    title: `${company.tradeName} — ${cat?.label ?? "Guia"} em ${company.city ?? ""}, ${company.state ?? ""} | Guia Magnum`,
    description: company.description?.slice(0, 160) ?? `${company.tradeName} é uma empresa de ${cat?.label ?? company.segment} localizada em ${company.city}, ${company.state}.`,
  };
}

export default async function EmpresaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [company, mapsKey] = await Promise.all([getCompany(slug), getMapsKey()]);
  if (!company) notFound();

  const cat         = categoryBySegment(company.segment);
  const pl          = PLAN_LABELS[company.listingType] ?? PLAN_LABELS["FREE"];
  const isPaid      = company.listingType === "PREMIUM" || company.listingType === "DESTAQUE";
  const showMap     = isPaid && !!company.address;
  const mapQuery    = [company.address, company.city, company.state, company.zip].filter(Boolean).join(", ");
  const whatsappNum = company.whatsappNumber?.replace(/\D/g, "");
  const igHandle    = company.instagram?.replace("@", "");
  const related     = await getRelated(company.segment, company.id);

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <GuiaViewTracker id={company.id} />
      <main className="flex-1 pt-16">

        {/* Breadcrumb */}
        <div className="px-5 lg:px-20 py-4 border-b border-[#141d2c] bg-[#0a0e18] flex items-center gap-2 text-[13px] flex-wrap">
          <Link href="/guia" className="text-[#526888] hover:text-white transition-colors">Guia Comercial</Link>
          <span className="text-white">/</span>
          {cat && (
            <>
              <Link href={`/guia/${cat.slug}`} className="text-[#526888] hover:text-white transition-colors">{cat.label}</Link>
              <span className="text-white">/</span>
            </>
          )}
          <span className="text-[#d4d4da] truncate max-w-[200px]">{company.tradeName}</span>
        </div>

        {/* Cover image (if available) */}
        {company.coverImageUrl && (
          <div className="w-full h-[220px] lg:h-[300px] overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={company.coverImageUrl} alt={`${company.tradeName} — foto`}
              className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-transparent to-transparent" />
          </div>
        )}

        {/* Hero */}
        <section className="px-5 lg:px-20 py-10 bg-[#0a0e18] border-b border-[#141d2c]">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Left: identity */}
            <div className="flex-1">
              <div className="flex items-start gap-5 mb-5">
                <div className="w-[80px] h-[80px] bg-[#141d2c] rounded-[16px] flex items-center justify-center shrink-0 overflow-hidden">
                  {company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logoUrl} alt={company.tradeName} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-[40px]">{cat?.icon ?? "🏢"}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {company.featured && (
                      <span className="bg-[#260a0a] border border-[#ff1f1f]/30 text-[#ff1f1f] text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                        ★ DESTAQUE
                      </span>
                    )}
                    {company.listingType !== "FREE" && company.listingType !== "NONE" && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${pl.color}`}>{pl.label}</span>
                    )}
                  </div>
                  <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[38px] lg:text-[48px] leading-none mb-1">
                    {company.tradeName}
                  </h1>
                  <div className="flex items-center gap-3 text-[14px] text-[#526888] flex-wrap">
                    {cat && (
                      <Link href={`/guia/${cat.slug}`} className="flex items-center gap-1.5 hover:text-[#ff1f1f] transition-colors">
                        <span>{cat.icon}</span> {cat.label}
                      </Link>
                    )}
                    {(company.city || company.state) && (
                      <>
                        <span>·</span>
                        <span>📍 {[company.city, company.state].filter(Boolean).join(", ")}</span>
                      </>
                    )}
                    {company.viewsCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{company.viewsCount} visualizaç{company.viewsCount !== 1 ? "ões" : "ão"}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {company.description && (
                <p className="text-[#7a9ab5] text-[16px] leading-[26px] max-w-[620px]">
                  {company.description}
                </p>
              )}
            </div>

            {/* Right: contact buttons */}
            <div className="flex flex-col gap-2 min-w-[220px] w-full lg:w-auto">
              {company.phone && (
                <a href={`tel:${company.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 bg-[#141d2c] border border-[#1c2a3e] hover:border-[#526888] rounded-[8px] px-4 h-[48px] text-[14px] text-[#d4d4da] hover:text-white transition-all">
                  <span className="text-[18px]">📞</span>
                  <span className="flex-1">{company.phone}</span>
                </a>
              )}
              {whatsappNum && (
                <a href={`https://wa.me/${whatsappNum}${company.whatsappMessage ? `?text=${encodeURIComponent(company.whatsappMessage)}` : ""}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#0f2b1a] border border-[#1a4a2e] hover:border-[#22c55e] rounded-[8px] px-4 h-[48px] text-[14px] text-[#22c55e] hover:text-white transition-all">
                  <span className="text-[18px]">💬</span>
                  <span>WhatsApp</span>
                </a>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#141d2c] border border-[#1c2a3e] hover:border-[#526888] rounded-[8px] px-4 h-[48px] text-[14px] text-[#d4d4da] hover:text-white transition-all">
                  <span className="text-[18px]">🌐</span>
                  <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`}
                  className="flex items-center gap-3 bg-[#141d2c] border border-[#1c2a3e] hover:border-[#526888] rounded-[8px] px-4 h-[48px] text-[14px] text-[#d4d4da] hover:text-white transition-all">
                  <span className="text-[18px]">✉️</span>
                  <span className="truncate">{company.email}</span>
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

              {/* Endereço + Mapa */}
              {company.address && (
                <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5">
                  <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-3">Endereço</p>
                  <p className="text-[#d4d4da] text-[15px] mb-4">
                    📍 {company.address}, {company.city} — {company.state}{company.zip ? `, CEP ${company.zip}` : ""}
                  </p>

                  {showMap && (
                    <div className="rounded-[8px] overflow-hidden border border-[#141d2c]">
                      {mapsKey ? (
                        <iframe
                          src={`https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(mapQuery)}&zoom=15`}
                          width="100%" height="300"
                          style={{ border: 0, display: "block" }}
                          allowFullScreen loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Localização de ${company.tradeName}`}
                        />
                      ) : (
                        <a href={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 bg-[#141d2c] hover:bg-[#1c2a3e] h-[140px] rounded-[8px] transition-colors group">
                          <div className="text-center">
                            <p className="text-[32px] mb-2">🗺️</p>
                            <p className="text-[#7a9ab5] text-[14px] group-hover:text-white transition-colors font-semibold">
                              Ver no Google Maps →
                            </p>
                            <p className="text-white text-[12px] mt-1">{mapQuery}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  )}

                  {showMap && (
                    <a href={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-[#7a9ab5] text-[13px] hover:text-white transition-colors">
                      Abrir no Google Maps ↗
                    </a>
                  )}
                </div>
              )}

              {/* Sem endereço */}
              {!company.address && (
                <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col items-center text-center gap-3">
                  <p className="text-[28px]">📍</p>
                  <p className="text-white text-[15px] font-semibold">{[company.city, company.state].filter(Boolean).join(", ")}</p>
                  {!isPaid && (
                    <p className="text-white text-[12px]">
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
                  Outras empresas de {cat?.label ?? company.segment}
                </p>
                <div className="flex flex-col gap-3">
                  {related.map(r => <RelatedCard key={r.id} company={r} />)}
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

        {/* Upgrade CTA — só para plano FREE/NONE */}
        {(company.listingType === "FREE" || company.listingType === "NONE") && (
          <section className="px-5 lg:px-20 pb-6">
            <div className="bg-[#0e1520] border border-[#ff1f1f]/20 rounded-[12px] p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-1">Esta empresa está no plano gratuito</p>
                <p className="text-white text-[16px] font-bold mb-1">É o proprietário? Aumente sua visibilidade</p>
                <p className="text-[#526888] text-[13px]">
                  Com Premium ou Destaque: logo, mapa, WhatsApp e topo da categoria.
                </p>
              </div>
              <Link href={`/guia/upgrade?id=${company.id}&plano=PREMIUM`}
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-6 flex items-center rounded-[6px] transition-colors whitespace-nowrap shrink-0">
                Fazer upgrade →
              </Link>
            </div>
          </section>
        )}

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

function RelatedCard({ company }: { company: Pick<Company, "id" | "tradeName" | "segment" | "listingType" | "city" | "state" | "logoUrl" | "description" | "featured"> }) {
  const cat = categoryBySegment(company.segment);
  const pl  = PLAN_LABELS[company.listingType] ?? PLAN_LABELS["FREE"];
  return (
    <Link href={`/guia/empresa/${company.id}`}
      className="group bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/30 rounded-[10px] p-3.5 flex items-center gap-3 transition-all">
      <div className="w-[40px] h-[40px] bg-[#141d2c] rounded-[8px] flex items-center justify-center text-[18px] shrink-0 overflow-hidden">
        {company.logoUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={company.logoUrl} alt={company.tradeName} className="w-full h-full object-contain p-1" />
          : cat?.icon ?? "🏢"
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
