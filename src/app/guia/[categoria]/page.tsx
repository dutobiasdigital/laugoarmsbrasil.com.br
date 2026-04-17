import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryViewTracker from "@/components/CategoryViewTracker";
import { CATEGORIES, STATES, PLAN_LABELS, categoryBySlug, categoryBySegment, slugToSegments } from "@/lib/guia";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const H        = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface Company {
  id: string;
  tradeName: string;
  segment: string;
  listingType: string;
  city: string | null;
  state: string | null;
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  website: string | null;
  featured: boolean;
  viewsCount: number;
}

async function getCompanies(segments: string[], state?: string): Promise<Company[]> {
  try {
    const segList = segments.map(s => `"${s}"`).join(",");
    let url = `https://${PROJECT}.supabase.co/rest/v1/companies?pipelineStatus=eq.ACTIVE&segment=in.(${segList})&select=id,tradeName,segment,listingType,city,state,logoUrl,description,phone,whatsappNumber,website,featured,viewsCount&order=featured.desc,listingType.desc,createdAt.desc`;
    if (state) url += `&state=eq.${encodeURIComponent(state)}`;
    const res = await fetch(url, { headers: H, cache: "no-store" });
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
  const segments    = slugToSegments(categoria);
  const companies   = await getCompanies(segments, estadoUpper);

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <CategoryViewTracker category={categoria} endpoint="/api/guia/categoria/view" />
      <main className="flex-1 pt-16">

        {/* Breadcrumb */}
        <div className="px-5 lg:px-20 py-4 border-b border-[#141d2c] bg-[#0a0e18] flex items-center gap-2 text-[13px]">
          <Link href="/guia" className="text-[#526888] hover:text-white transition-colors">Guia Comercial</Link>
          <span className="text-white">/</span>
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
          {companies.length === 0 ? (
            <EmptyState catLabel={cat.label} />
          ) : (
            <>
              <p className="text-[#526888] text-[13px] mb-6">
                {companies.length} empresa{companies.length !== 1 ? "s" : ""} encontrada{companies.length !== 1 ? "s" : ""}
                {estadoUpper ? ` em ${estadoUpper}` : " no Brasil"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map(co => <CompanyCard key={co.id} company={co} />)}
              </div>
            </>
          )}
        </section>

        {/* CTA */}
        <section className="px-5 lg:px-20 pb-14">
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
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

function EmptyState({ catLabel }: { catLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-[48px] mb-4">🔍</p>
      <p className="font-['Barlow_Condensed'] font-bold text-white text-[28px] mb-2">
        Nenhuma empresa em {catLabel}
      </p>
      <p className="text-[#526888] text-[14px] mb-8 max-w-[400px]">
        Seja o primeiro a cadastrar sua empresa nesta categoria.
      </p>
      <Link href="/guia/cadastrar"
        className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
        Cadastrar gratuitamente →
      </Link>
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const cat = categoryBySegment(company.segment);
  const pl  = PLAN_LABELS[company.listingType] ?? PLAN_LABELS["FREE"];
  return (
    <Link href={`/guia/empresa/${company.id}`}
      className="group bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/30 rounded-[12px] overflow-hidden flex flex-col transition-all">
      <div className="h-[80px] bg-[#141d2c] flex items-center px-5 gap-4">
        {company.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.logoUrl} alt={company.tradeName}
            className="w-[48px] h-[48px] object-contain rounded-[6px] bg-[#0e1520] shrink-0" />
        ) : (
          <div className="w-[48px] h-[48px] bg-[#0e1520] rounded-[6px] flex items-center justify-center text-[22px] shrink-0">
            {cat?.icon ?? "🏢"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-[15px] font-bold truncate group-hover:text-[#ff1f1f] transition-colors">{company.tradeName}</p>
          <p className="text-[#526888] text-[12px]">{company.city} · {company.state}</p>
        </div>
        {company.listingType !== "FREE" && company.listingType !== "NONE" && (
          <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] shrink-0 ${pl.color}`}>{pl.label}</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        {company.description && (
          <p className="text-[#7a9ab5] text-[13px] leading-[20px] line-clamp-2">{company.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="flex items-center gap-1.5 text-[#526888] text-[11px]">
            <span>{cat?.icon}</span> {cat?.label ?? company.segment}
          </span>
          <span className="text-[#ff1f1f] text-[12px] font-semibold group-hover:translate-x-1 transition-transform">
            Ver perfil →
          </span>
        </div>
      </div>
    </Link>
  );
}
