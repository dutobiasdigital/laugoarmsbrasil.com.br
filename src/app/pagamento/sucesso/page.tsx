import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPaymentIntentByRef } from "@/lib/payment/shared";

export const metadata: Metadata = { title: "Pagamento Confirmado — Revista Magnum" };
export const dynamic = "force-dynamic";

export default async function PagamentoSucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const intent  = ref ? await getPaymentIntentByRef(ref) : null;

  const isGuia         = intent?.product_type === "guia_plan";
  const isSubscription = intent?.product_type === "magazine_subscription";
  const isEdition      = intent?.product_type === "edition_purchase";
  const slug    = (intent?.metadata as { slug?: string } | null)?.slug;
  const plan    = (intent?.metadata as { plan?: string } | null)?.plan;
  const editionSlug = (intent?.metadata as { edition_slug?: string } | null)?.edition_slug;
  const label   = intent?.product_label ?? "seu produto";
  const isPending = intent?.status === "PENDING";

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <main className="flex-1 pt-16 flex items-center justify-center px-5">
        <div className="max-w-[480px] w-full text-center py-16">

          <div className="w-[80px] h-[80px] bg-[#0f381f] border border-[#22c55e]/30 rounded-full flex items-center justify-center text-[40px] mx-auto mb-6">
            ✅
          </div>

          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] leading-none mb-3">
            Pagamento realizado!
          </h1>

          <p className="text-[#7a9ab5] text-[16px] leading-[26px] mb-2">
            {isPending
              ? "Seu pagamento está sendo processado e será ativado em instantes."
              : isSubscription
                ? `Sua assinatura ${plan ?? ""} foi ativada. Boas-vindas!`
                : isEdition
                  ? "Seu acesso à edição foi liberado por 30 dias."
                  : `O plano ${plan ?? label} foi ativado com sucesso.`
            }
          </p>

          {isPending && (
            <p className="text-white text-[13px] mb-6">
              Se o status ainda não aparecer atualizado, aguarde alguns minutos e atualize a página.
            </p>
          )}

          {intent && (
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5 mb-8 text-left flex flex-col gap-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#526888]">Produto</span>
                <span className="text-[#d4d4da] font-semibold">{label}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#526888]">Valor</span>
                <span className="text-[#d4d4da] font-semibold">
                  {(intent.amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#526888]">Gateway</span>
                <span className="text-[#d4d4da] capitalize">{intent.gateway}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#526888]">Status</span>
                <span className={intent.status === "APPROVED" ? "text-[#22c55e] font-semibold" : "text-[#facc15]"}>
                  {intent.status === "APPROVED" ? "Aprovado" : "Processando..."}
                </span>
              </div>
              {ref && (
                <div className="flex justify-between text-[12px] pt-1 border-t border-[#141d2c]">
                  <span className="text-white">Referência</span>
                  <span className="text-white font-mono text-[10px]">{ref.slice(0, 8)}...</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {/* Assinatura de revista */}
            {isSubscription && (
              <Link href="/minha-conta"
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[48px] px-8 flex items-center justify-center rounded-[6px] transition-colors">
                Ir para Minha Conta →
              </Link>
            )}

            {/* Compra de edição */}
            {isEdition && editionSlug && (
              <Link href={`/edicoes/${editionSlug}`}
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[48px] px-8 flex items-center justify-center rounded-[6px] transition-colors">
                Ler a edição agora →
              </Link>
            )}

            {/* Guia Comercial */}
            {isGuia && slug && (
              <Link href={`/guia/empresa/${slug}`}
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[48px] px-8 flex items-center justify-center rounded-[6px] transition-colors">
                Ver meu perfil no Guia →
              </Link>
            )}

            {/* Link secundário */}
            {isSubscription || isEdition ? (
              <Link href="/edicoes"
                className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-600 text-[#d4d4da] text-[14px] h-[44px] flex items-center justify-center rounded-[6px] transition-colors">
                Ver edições
              </Link>
            ) : (
              <Link href="/guia"
                className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-600 text-[#d4d4da] text-[14px] h-[44px] flex items-center justify-center rounded-[6px] transition-colors">
                Ir para o Guia Comercial
              </Link>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
