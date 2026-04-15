import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Edições — Minha Conta · Revista Magnum",
};
export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface Edition {
  id: string;
  title: string;
  number: number | null;
  slug: string;
  coverImageUrl: string | null;
  pageFlipUrl: string | null;
  pdfStoragePath: string | null;
  publishedAt: string | null;
  pageCount: number | null;
  type: string | null;
}

export default async function EdicoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const email = user.email ?? "";

  // Busca usuário e assinatura em paralelo com edições
  const [userRes, editionsRes] = await Promise.all([
    fetch(`${BASE}/users?authId=eq.${user.id}&select=id,subscriptions(status)&limit=1`,
      { headers: HEADERS, cache: "no-store" }),
    fetch(`${BASE}/editions?isPublished=eq.true&order=publishedAt.desc&select=id,title,number,slug,coverImageUrl,pageFlipUrl,pdfStoragePath,publishedAt,pageCount,type`,
      { headers: HEADERS, cache: "no-store" }),
  ]);

  const users   = await userRes.json();
  const dbUser  = Array.isArray(users) ? users[0] : null;
  const subs    = dbUser?.subscriptions ?? [];
  const isActive = Array.isArray(subs) && subs.some((s: { status: string }) => s.status === "ACTIVE");

  const editionsRaw = await editionsRes.json();
  const editions: Edition[] = Array.isArray(editionsRaw) ? editionsRaw : [];

  // Verifica edições avulsas compradas (product_type = edition_purchase, status = APPROVED)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const purchasedRes = await fetch(
    `${BASE}/payment_intents?payer_email=eq.${encodeURIComponent(email)}&product_type=eq.edition_purchase&status=eq.APPROVED&createdAt=gte.${thirtyDaysAgo}&select=metadata`,
    { headers: HEADERS, cache: "no-store" }
  );
  const purchasedRaw = await purchasedRes.json();
  const purchasedSlugs = new Set<string>(
    Array.isArray(purchasedRaw)
      ? purchasedRaw
          .map((p: { metadata: { edition_slug?: string } }) => p.metadata?.edition_slug)
          .filter((s): s is string => typeof s === "string")
      : []
  );

  return (
    <div className="max-w-[1100px] py-7">
      <div className="mb-8">
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-1">
          Edições
        </h1>
        <p className="text-[#7a9ab5] text-[16px]">
          {isActive
            ? `${editions.length} edição${editions.length !== 1 ? "ões" : ""} disponíve${editions.length !== 1 ? "is" : "l"}`
            : "Assine para acessar todas as edições"}
        </p>
      </div>

      {!isActive && (
        <div className="bg-[#ff1f1f]/10 border border-[#ff1f1f]/20 rounded-[10px] p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[14px] text-[#d4d4da]">
            Sua assinatura está inativa. Renove para acessar o acervo completo.
          </p>
          <Link href="/assine"
            className="shrink-0 bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold px-5 h-[40px] flex items-center justify-center rounded-[6px] transition-colors">
            Assinar agora
          </Link>
        </div>
      )}

      {editions.length === 0 ? (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-12 text-center">
          <p className="text-[#253750] text-[14px]">Nenhuma edição publicada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {editions.map((edition) => {
            const hasSingleAccess = purchasedSlugs.has(edition.slug);
            const canRead         = isActive || hasSingleAccess;

            return (
              <div key={edition.id} className="group">
                <div className="aspect-[3/4] bg-[#141d2c] rounded-[8px] overflow-hidden mb-3 relative border border-[#1c2a3e] group-hover:border-[#526888] transition-colors">
                  {edition.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={edition.coverImageUrl}
                      alt={edition.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <div className="w-px h-8 bg-[#ff1f1f] mb-3" />
                      <div className="text-[9px] font-bold tracking-widest text-[#253750] text-center mb-2">
                        REVISTA MAGNUM
                      </div>
                      {edition.number && (
                        <div className="text-3xl font-bold text-[#1c2a3e]">{edition.number}</div>
                      )}
                    </div>
                  )}

                  {/* Hover overlay */}
                  {canRead ? (
                    <div className="absolute inset-0 bg-[#070a12]/0 group-hover:bg-[#070a12]/70 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex flex-col gap-2">
                        {edition.pageFlipUrl && (
                          <a href={edition.pageFlipUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-[#ff1f1f] text-white text-[12px] font-semibold px-3 py-1.5 rounded-[4px] hover:bg-[#cc0000] transition-colors">
                            📖 Ler online
                          </a>
                        )}
                        {edition.pdfStoragePath && (
                          <a href={`/api/edicoes/${edition.slug}/pdf`}
                            className="flex items-center gap-1.5 bg-[#141d2c] border border-[#526888] text-[#d4d4da] text-[12px] font-semibold px-3 py-1.5 rounded-[4px] hover:bg-[#1c2a3e] transition-colors">
                            ⬇ PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-[#070a12]/60 flex flex-col items-center justify-center gap-2">
                      <p className="text-[#253750] text-[20px]">🔒</p>
                      <Link href={`/edicoes/${edition.slug}`}
                        className="text-[#ff1f1f] text-[10px] font-semibold hover:text-white transition-colors">
                        Comprar
                      </Link>
                    </div>
                  )}
                </div>

                <div>
                  {edition.type === "SPECIAL" && (
                    <span className="inline-block text-[9px] font-bold tracking-widest text-[#ff1f1f] uppercase mb-1">
                      Ed. Especial
                    </span>
                  )}
                  <p className="text-[13px] font-medium text-[#d4d4da] line-clamp-2 leading-snug">
                    {edition.number ? `Nº ${edition.number} · ` : ""}{edition.title}
                  </p>
                  {edition.publishedAt && (
                    <p className="text-[11px] text-[#253750] mt-0.5">
                      {new Date(edition.publishedAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
