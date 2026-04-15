import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Política de Privacidade — Revista Magnum",
  description: "Saiba como a Revista Magnum coleta, usa e protege seus dados pessoais.",
};

const LAST_UPDATED = "15 de abril de 2025";

const sections = [
  {
    title: "1. Quem Somos",
    content: `A Revista Magnum é uma publicação digital especializada em armamento civil, operada no Brasil. Este documento descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).`,
  },
  {
    title: "2. Dados que Coletamos",
    content: `Coletamos apenas os dados necessários para fornecer nossos serviços:\n\n• Dados de cadastro: nome, e-mail e telefone (opcional)\n• Dados de pagamento: processados por gateways certificados (Mercado Pago, Stripe, PagSeguro, PayPal) — não armazenamos dados de cartão\n• Dados de acesso: endereço IP, tipo de navegador, páginas visitadas (para fins de segurança e melhoria do serviço)\n• Dados de comunicação: mensagens enviadas ao suporte`,
  },
  {
    title: "3. Como Usamos seus Dados",
    content: `Seus dados são utilizados para:\n\n• Criar e gerenciar sua conta de acesso\n• Processar pagamentos e gerenciar assinaturas\n• Enviar e-mails transacionais (confirmação de pagamento, renovação, etc.)\n• Comunicar alterações importantes nos serviços\n• Cumprir obrigações legais e regulatórias`,
  },
  {
    title: "4. Base Legal para o Tratamento",
    content: `O tratamento dos seus dados se baseia nas seguintes hipóteses legais previstas na LGPD:\n\n• Execução de contrato: dados necessários para prestar os serviços contratados\n• Cumprimento de obrigação legal: retenção de dados fiscais e contábeis\n• Legítimo interesse: segurança da plataforma e prevenção a fraudes\n• Consentimento: quando aplicável, solicitado explicitamente`,
  },
  {
    title: "5. Compartilhamento de Dados",
    content: `Não vendemos seus dados pessoais. Podemos compartilhá-los apenas com:\n\n• Gateways de pagamento (Mercado Pago, Stripe, PagSeguro, PayPal) — para processar transações\n• Supabase — infraestrutura de banco de dados e autenticação\n• Autoridades públicas — quando exigido por lei`,
  },
  {
    title: "6. Retenção de Dados",
    content: `Mantemos seus dados pelo tempo necessário para prestar os serviços e cumprir obrigações legais:\n\n• Dados de conta: enquanto a conta estiver ativa + 5 anos após encerramento\n• Dados de transações: 5 anos (obrigação fiscal)\n• Dados de acesso/logs: 6 meses\n\nApós esses prazos, os dados são excluídos ou anonimizados.`,
  },
  {
    title: "7. Seus Direitos (LGPD)",
    content: `Você tem os seguintes direitos em relação aos seus dados pessoais:\n\n• Confirmação de tratamento e acesso aos dados\n• Correção de dados incompletos ou incorretos\n• Anonimização, bloqueio ou eliminação de dados desnecessários\n• Portabilidade dos dados\n• Eliminação dos dados tratados com consentimento\n• Informação sobre compartilhamento\n• Revogação do consentimento\n\nPara exercer qualquer direito, envie solicitação para publicidade@revistamagnum.com.br.`,
  },
  {
    title: "8. Segurança",
    content: `Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:\n\n• Criptografia em trânsito (HTTPS/TLS)\n• Autenticação segura gerenciada pelo Supabase\n• Acesso restrito por função (RBAC)\n• Gateways de pagamento certificados PCI-DSS`,
  },
  {
    title: "9. Cookies e Rastreamento",
    content: `Utilizamos cookies estritamente necessários para o funcionamento da plataforma (autenticação e sessão). Não utilizamos cookies de rastreamento publicitário de terceiros. Você pode configurar seu navegador para bloquear cookies, mas isso pode afetar o funcionamento do site.`,
  },
  {
    title: "10. Menores de Idade",
    content: `Nossos serviços são destinados a maiores de 18 anos. Não coletamos intencionalmente dados de menores. Se identificarmos que um menor cadastrou-se em nossa plataforma, excluiremos os dados imediatamente.`,
  },
  {
    title: "11. Alterações nesta Política",
    content: `Podemos atualizar esta Política periodicamente. Alterações significativas serão comunicadas por e-mail com antecedência mínima de 15 dias. A data da última atualização é sempre indicada no topo deste documento.`,
  },
  {
    title: "12. Encarregado de Dados (DPO)",
    content: `O responsável pelo tratamento de dados pessoais pode ser contatado pelo e-mail publicidade@revistamagnum.com.br. Responderemos às solicitações em até 15 dias úteis.`,
  },
];

export default function PoliticaDePrivacidadePage() {
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
              Política de Privacidade
            </h1>
            <p className="text-[#526888] text-[13px]">Última atualização: {LAST_UPDATED}</p>
          </div>

          {/* LGPD badge */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-[#141d2c] w-[44px] h-[44px] rounded-[8px] flex items-center justify-center shrink-0 text-[20px]">
                🔒
              </div>
              <div>
                <p className="text-white text-[14px] font-semibold mb-1">Conformidade com a LGPD</p>
                <p className="text-[#7a9ab5] text-[13px] leading-[22px]">
                  Esta política está em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei 13.709/2018).
                  Seus dados são tratados com responsabilidade e transparência.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-6">
            {sections.map((s) => (
              <div key={s.title} className="border-b border-[#141d2c] pb-6 last:border-0">
                <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[20px] mb-3">
                  {s.title}
                </h2>
                <p className="text-[#7a9ab5] text-[14px] leading-[24px] whitespace-pre-line">
                  {s.content}
                </p>
              </div>
            ))}
          </div>

          {/* Footer links */}
          <div className="mt-10 pt-8 border-t border-[#141d2c] flex flex-wrap gap-4 text-[13px]">
            <Link href="/termos-de-uso" className="text-[#526888] hover:text-white transition-colors">
              Termos de Uso →
            </Link>
            <a href="mailto:publicidade@revistamagnum.com.br" className="text-[#526888] hover:text-white transition-colors">
              Contato: publicidade@revistamagnum.com.br
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
