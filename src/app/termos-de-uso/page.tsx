import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Termos de Uso — Revista Magnum",
  description: "Leia os Termos de Uso da Revista Magnum antes de utilizar nossos serviços.",
};

const LAST_UPDATED = "15 de abril de 2025";

const sections = [
  {
    title: "1. Aceitação dos Termos",
    content: `Ao acessar e utilizar o site da Revista Magnum (revistamagnum.com.br), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, por favor não utilize nossos serviços.`,
  },
  {
    title: "2. Descrição dos Serviços",
    content: `A Revista Magnum oferece acesso digital ao acervo de edições da revista, incluindo conteúdo sobre armamento civil, legislação, produtos e serviços relacionados. Os serviços são disponibilizados mediante assinatura paga ou compra avulsa de edições.`,
  },
  {
    title: "3. Cadastro e Conta",
    content: `Para acessar nossos conteúdos, você deve criar uma conta com informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de seus dados de acesso e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.`,
  },
  {
    title: "4. Assinaturas e Pagamentos",
    content: `As assinaturas são cobradas nos períodos escolhidos (trimestral, semestral ou anual). Os preços vigentes são os exibidos no momento da contratação. A renovação automática será notificada por e-mail com antecedência mínima de 3 dias. O cancelamento pode ser solicitado a qualquer momento, com manutenção do acesso até o fim do período pago.`,
  },
  {
    title: "5. Acesso Avulso",
    content: `É possível adquirir acesso a uma edição específica pelo período de 30 (trinta) dias corridos a partir da data da compra. Após este período, o acesso expira automaticamente sem necessidade de cancelamento.`,
  },
  {
    title: "6. Propriedade Intelectual",
    content: `Todo o conteúdo disponível na plataforma — incluindo textos, imagens, fotografias, gráficos e logotipos — é de propriedade exclusiva da Revista Magnum ou de seus licenciadores e está protegido pelas leis de direitos autorais. É vedada a reprodução, distribuição ou uso comercial sem autorização expressa por escrito.`,
  },
  {
    title: "7. Uso Permitido",
    content: `O acesso ao conteúdo é exclusivamente para uso pessoal e não comercial do assinante. É expressamente proibido: compartilhar credenciais de acesso, reproduzir ou redistribuir conteúdo, fazer engenharia reversa do sistema, ou utilizar robôs e scrapers automatizados.`,
  },
  {
    title: "8. Limitação de Responsabilidade",
    content: `A Revista Magnum não se responsabiliza por danos indiretos, incidentais ou consequentes decorrentes do uso ou impossibilidade de uso dos serviços. Não garantimos disponibilidade ininterrupta do serviço, mas nos comprometemos a restabelecer o acesso o mais rapidamente possível em caso de falhas.`,
  },
  {
    title: "9. Cancelamento e Reembolso",
    content: `Cancelamentos podem ser solicitados por e-mail a publicidade@revistamagnum.com.br. Reembolsos são analisados caso a caso, conforme o Código de Defesa do Consumidor (Lei 8.078/90). Compras realizadas há menos de 7 dias e não acessadas podem ser reembolsadas integralmente.`,
  },
  {
    title: "10. Alterações nos Termos",
    content: `Reservamo-nos o direito de alterar estes Termos a qualquer momento. Alterações significativas serão comunicadas por e-mail com antecedência mínima de 15 dias. O uso continuado dos serviços após notificação constitui aceitação dos novos termos.`,
  },
  {
    title: "11. Lei Aplicável e Foro",
    content: `Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias oriundas deste instrumento.`,
  },
  {
    title: "12. Contato",
    content: `Dúvidas sobre estes Termos podem ser enviadas para publicidade@revistamagnum.com.br.`,
  },
];

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="h-[4px] bg-[#ff1f1f] w-full" />

        <div className="max-w-[860px] mx-auto px-5 py-14">

          {/* Header */}
          <div className="mb-10">
            <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-3">Legal</p>
            <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[44px] leading-none mb-4">
              Termos de Uso
            </h1>
            <p className="text-[#526888] text-[13px]">Última atualização: {LAST_UPDATED}</p>
          </div>

          {/* Intro */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5 mb-8">
            <p className="text-[#d4d4da] text-[14px] leading-[24px]">
              Este documento estabelece os Termos de Uso da plataforma digital da Revista Magnum.
              Leia atentamente antes de utilizar nossos serviços. Em caso de dúvidas, entre em contato
              pelo e-mail{" "}
              <a href="mailto:publicidade@revistamagnum.com.br"
                className="text-[#ff1f1f] hover:underline">
                publicidade@revistamagnum.com.br
              </a>.
            </p>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-6">
            {sections.map((s) => (
              <div key={s.title} className="border-b border-[#141d2c] pb-6 last:border-0">
                <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[20px] mb-3">
                  {s.title}
                </h2>
                <p className="text-[#7a9ab5] text-[14px] leading-[24px]">{s.content}</p>
              </div>
            ))}
          </div>

          {/* Footer links */}
          <div className="mt-10 pt-8 border-t border-[#141d2c] flex flex-wrap gap-4 text-[13px]">
            <Link href="/politica-de-privacidade" className="text-[#526888] hover:text-white transition-colors">
              Política de Privacidade →
            </Link>
            <Link href="/assine" className="text-[#526888] hover:text-white transition-colors">
              Ver planos de assinatura →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
