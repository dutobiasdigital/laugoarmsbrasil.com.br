import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nas Bancas — Revista Magnum",
  description: "Confira a edição atual da Revista Magnum disponível nas bancas.",
};

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface Edition {
  id: string; title: string; number: number | null; slug: string;
  coverImageUrl: string | null; publishedAt: string | null;
  type: string; pageCount: number | null; editorial: string | null;
  tableOfContents: string | null;
}

interface TocItem { page: string; title: string; category: string; }

function parseToc(raw: string | null): TocItem[] {
  try { return JSON.parse(raw ?? "[]"); } catch { return []; }
}

export default async function NasBancasPage() {
  let edition: Edition | null = null;

  try {
    const res = await fetch(
      `${BASE}/editions?isOnNewstand=eq.true&isPublished=eq.true&select=id,title,number,slug,coverImageUrl,publishedAt,type,pageCount,editorial,tableOfContents&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    edition = Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    // DB unavailable
  }

  const toc = parseToc(edition?.tableOfContents ?? null);
  const isSpecial = edition?.type === "SPECIAL";

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero strip */}
        <div className="hero-metal border-b border-[#141d2c]">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-20 py-14">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full animate-pulse" />
              <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">
                Edição Atual
              </span>
            </div>
            <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[48px] lg:text-[64px] leading-[0.95] mb-3">
              Nas Bancas
            </h1>
            <p className="text-[#7a9ab5] text-[16px] max-w-[560px]">
              A edição mais recente da Revista Magnum, disponível nas bancas e na plataforma digital.
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-w-[1200px] mx-auto px-5 lg:px-20 py-14">
          {!edition ? (
            /* Nenhuma edição na banca */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-[56px] mb-6">📰</div>
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] mb-3">
                Nenhuma edição na banca no momento
              </h2>
              <p className="text-[#7a9ab5] text-[16px] mb-8 max-w-[480px]">
                Em breve a nova edição estará disponível. Enquanto isso, explore nosso acervo completo.
              </p>
              <Link href="/edicoes"
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[52px] px-8 flex items-center rounded-[6px] transition-colors">
                Ver todas as edições →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

              {/* Capa */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  {/* Badge Na Banca */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[#ff1f1f] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <span className="w-[6px] h-[6px] bg-white rounded-full animate-pulse" />
                    NA BANCA AGORA
                  </div>

                  <div className="card-metal-border rounded-[16px]">
                    <div className="rounded-[15px] overflow-hidden aspect-[3/4] bg-[#0a0f1a]">
                      {edition.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={edition.coverImageUrl}
                          alt={edition.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isSpecial ? "bg-[#cc0000]/20" : "bg-white/5"}`}>
                          <p className="font-['Barlow_Condensed'] font-extrabold text-[48px] text-white/20">
                            {edition.number ? `Nº ${edition.number}` : "MAGNUM"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-3">
                  <Link href={`/edicoes/${edition.slug}`}
                    className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[52px] flex items-center justify-center rounded-[8px] transition-colors">
                    Ler esta edição →
                  </Link>
                  <Link href="/assine"
                    className="bg-[#0e1520] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[15px] font-semibold h-[52px] flex items-center justify-center rounded-[8px] transition-colors">
                    Assine e acesse o acervo completo
                  </Link>
                </div>
              </div>

              {/* Detalhes */}
              <div className="flex flex-col gap-6">
                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold tracking-[0.8px] uppercase px-2.5 py-1 rounded-[4px] ${
                    isSpecial
                      ? "bg-[#ff1f1f]/20 text-[#ff6b6b] border border-[#ff1f1f]/30"
                      : "bg-white/5 text-white/40 border border-white/10"
                  }`}>
                    {isSpecial ? "Edição Especial" : "Edição Regular"}
                  </span>
                  {edition.number && !isSpecial && (
                    <span className="text-[10px] font-semibold text-white/30 bg-white/5 border border-white/10 px-2.5 py-1 rounded-[4px]">
                      #{edition.number}
                    </span>
                  )}
                  {edition.publishedAt && (
                    <span className="text-[10px] font-semibold text-[#526888] bg-[#141d2c] px-2.5 py-1 rounded-[4px]">
                      {new Date(edition.publishedAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </span>
                  )}
                  {edition.pageCount && (
                    <span className="text-[10px] font-semibold text-[#526888] bg-[#141d2c] px-2.5 py-1 rounded-[4px]">
                      {edition.pageCount} páginas
                    </span>
                  )}
                </div>

                {/* Título */}
                <div>
                  <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] lg:text-[48px] leading-[1] mb-3">
                    {edition.number ? `Edição ${edition.number}` : edition.title}
                  </h2>
                  {edition.title && edition.number && (
                    <p className="text-[#7a9ab5] text-[16px]">{edition.title}</p>
                  )}
                </div>

                {/* Editorial */}
                {edition.editorial && (
                  <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
                    <p className="text-[#ff1f1f] text-[10px] font-semibold tracking-[1.5px] uppercase mb-3">
                      Editorial
                    </p>
                    <div
                      className="text-[#d4d4da] text-[14px] leading-[24px] line-clamp-6 prose-sm"
                      dangerouslySetInnerHTML={{ __html: edition.editorial }}
                    />
                  </div>
                )}

                {/* Índice */}
                {toc.length > 0 && (
                  <div>
                    <p className="text-[#ff1f1f] text-[10px] font-semibold tracking-[1.5px] uppercase mb-4">
                      Nesta Edição
                    </p>
                    <div className="flex flex-col gap-0">
                      {toc.slice(0, 10).map((item, i) => (
                        <div key={i} className={`flex items-start gap-4 py-2.5 ${i > 0 ? "border-t border-[#141d2c]" : ""}`}>
                          {item.page && (
                            <span className="font-['Barlow_Condensed'] font-bold text-[#526888] text-[16px] w-[32px] shrink-0 pt-0.5">
                              {item.page}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[#d4d4da] text-[14px] leading-snug">{item.title}</p>
                            {item.category && (
                              <p className="text-[#526888] text-[11px] mt-0.5">{item.category}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {toc.length > 10 && (
                        <p className="text-[#526888] text-[12px] pt-3 text-center">
                          + {toc.length - 10} matérias — <Link href={`/edicoes/${edition.slug}`} className="text-[#ff1f1f] hover:underline">ver índice completo</Link>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider + link para acervo */}
        <div className="border-t border-[#141d2c] bg-[#0e1520]">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-20 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#526888] text-[14px]">
              Acesse nosso acervo completo com mais de 200 edições.
            </p>
            <Link href="/edicoes"
              className="border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[14px] font-semibold h-[40px] px-6 flex items-center rounded-[6px] transition-colors whitespace-nowrap">
              Ver todas as edições →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
