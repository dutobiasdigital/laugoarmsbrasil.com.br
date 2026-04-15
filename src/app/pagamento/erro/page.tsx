import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPaymentIntentByRef } from "@/lib/payment/shared";

export const metadata: Metadata = { title: "Pagamento não realizado — Revista Magnum" };
export const dynamic = "force-dynamic";

export default async function PagamentoErroPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref }  = await searchParams;
  const intent   = ref ? await getPaymentIntentByRef(ref) : null;
  const slug     = (intent?.metadata as { slug?: string } | null)?.slug;
  const plan     = (intent?.metadata as { plan?: string } | null)?.plan;
  const editionSlug = (intent?.metadata as { edition_slug?: string } | null)?.edition_slug;

  const isGuia         = intent?.product_type === "guia_plan";
  const isSubscription = intent?.product_type === "magazine_subscription";
  const isEdition      = intent?.product_type === "edition_purchase";

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <main className="flex-1 pt-16 flex items-center justify-center px-5">
        <div className="max-w-[460px] w-full text-center py-16">

          <div className="w-[80px] h-[80px] bg-[#2d0a0a] border border-[#ff1f1f]/30 rounded-full flex items-center justify-center text-[40px] mx-auto mb-6">
            ✕
          </div>

          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] leading-none mb-3">
            Pagamento não concluído
          </h1>
          <p className="text-[#7a9ab5] text-[15px] leading-[26px] mb-8">
            O pagamento foi cancelado ou não foi processado. Nenhum valor foi cobrado. Tente novamente ou escolha outro método de pagamento.
          </p>

          <div className="flex flex-col gap-3">
            {/* Retry — Assinatura de revista */}
            {isSubscription && plan && (
              <Link
                href={`/checkout?plano=${plan}`}
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[48px] flex items-center justify-center rounded-[6px] transition-colors"
              >
                Tentar novamente →
              </Link>
            )}

            {/* Retry — Edição avulsa */}
            {isEdition && editionSlug && (
              <Link
                href={`/edicoes/${editionSlug}`}
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[48px] flex items-center justify-center rounded-[6px] transition-colors"
              >
                Voltar à edição →
              </Link>
            )}

            {/* Retry — Guia Comercial */}
            {isGuia && slug && plan && (
              <Link
                href={`/guia/upgrade?slug=${slug}&plano=${plan}`}
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[48px] flex items-center justify-center rounded-[6px] transition-colors"
              >
                Tentar novamente →
              </Link>
            )}

            {/* Sem intent — botão genérico */}
            {!intent && (
              <Link
                href="/assine"
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[48px] flex items-center justify-center rounded-[6px] transition-colors"
              >
                Ver planos →
              </Link>
            )}

            {/* Links secundários */}
            {isSubscription ? (
              <Link href="/assine"
                className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-600 text-[#d4d4da] text-[14px] h-[44px] flex items-center justify-center rounded-[6px] transition-colors">
                Ver planos de assinatura
              </Link>
            ) : (
              <Link href="/guia"
                className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-600 text-[#d4d4da] text-[14px] h-[44px] flex items-center justify-center rounded-[6px] transition-colors">
                Voltar ao Guia
              </Link>
            )}

            <a href="mailto:publicidade@revistamagnum.com.br"
              className="text-[#526888] hover:text-white text-[13px] transition-colors">
              Precisa de ajuda? Entre em contato →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
