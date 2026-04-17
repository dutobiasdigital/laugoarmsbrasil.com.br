import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Política de Privacidade — Revista Magnum",
  description: "Saiba como a Revista Magnum coleta, usa e protege seus dados pessoais em conformidade com a LGPD.",
};

async function getPageContent() {
  const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
  const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?key=in.(page.privacidade.title,page.privacidade.content)&select=key,value`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, next: { revalidate: 300 } }
    );
    const rows: { key: string; value: string }[] = await res.json();
    const map: Record<string, string> = {};
    if (Array.isArray(rows)) rows.forEach(r => { map[r.key] = r.value; });
    return map;
  } catch { return {}; }
}

export default async function PoliticaPrivacidadePage() {
  const data    = await getPageContent();
  const titulo  = data["page.privacidade.title"]   || "Política de Privacidade";
  const content = data["page.privacidade.content"] || null;

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <main className="flex-1 mt-16">
        <section className="hero-metal px-5 lg:px-20 pt-14 pb-12 border-b border-[#141d2c]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
            <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">Legal · LGPD</span>
          </div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[52px] lg:text-[64px] leading-[0.95] mb-3">{titulo}</h1>
          <p className="text-[#526888] text-[14px]">Última atualização: 17 de abril de 2026 · Lei nº 13.709/2018 — LGPD</p>
        </section>
        <section className="px-5 lg:px-20 py-12 lg:py-16">
          <div className="max-w-[820px]">
            {content ? (
              <div className="text-[#d4d4da] text-[15px] leading-[1.8] [&_h1]:hidden [&_h2]:font-bold [&_h2]:text-white [&_h2]:text-[22px] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-[#141d2c] [&_h3]:text-white [&_h3]:font-semibold [&_h3]:text-[17px] [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1 [&_li]:text-[#7a9ab5] [&_strong]:text-white [&_a]:text-[#ff1f1f] [&_a]:underline [&_table]:w-full [&_table]:border-collapse [&_table]:mb-6 [&_td]:border [&_td]:border-[#1c2a3e] [&_td]:px-3 [&_td]:py-2 [&_td]:text-[14px] [&_td]:text-[#7a9ab5] [&_th]:border [&_th]:border-[#1c2a3e] [&_th]:px-3 [&_th]:py-2 [&_th]:text-[13px] [&_th]:text-[#7a9ab5] [&_th]:bg-[#141d2c] [&_th]:text-left"
                dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <PrivacidadeContent />
            )}
            <div className="mt-12 pt-6 border-t border-[#141d2c] flex flex-wrap gap-5 text-[13px]">
              <Link href="/termos-de-uso" className="text-[#7a9ab5] hover:text-white transition-colors">Termos de Uso →</Link>
              <Link href="/contato" className="text-[#7a9ab5] hover:text-white transition-colors">Exercer direitos LGPD →</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function PrivacidadeContent() {
  return (
    <div className="flex flex-col">
      {[
        {
          title: "1. Controlador dos Dados",
          body: "Empresa: Revista Magnum — Endereço: Rua Barão de Suruí, 164 — CEP 04612-120 — São Paulo/SP — E-mail: privacidade@revistamagnum.com.br — Telefone: (11) 5044-3924 — Site: https://revistamagnum.com.br",
        },
        {
          title: "2. Dados Pessoais Coletados",
          items: [
            "Cadastro: nome completo, e-mail e senha (armazenada com hash seguro);",
            "Assinatura: dados de pagamento processados pelo gateway (não armazenamos dados de cartão);",
            "Loja: endereço de entrega e CPF para emissão de nota fiscal;",
            "Formulários: nome, e-mail, telefone e mensagem;",
            "Automáticos: IP, navegador, dispositivo, páginas visitadas e tempo de permanência.",
          ],
        },
        {
          title: "3. Finalidade e Base Legal (LGPD)",
          items: [
            "Criação e gestão de conta: execução de contrato (art. 7º, V);",
            "Processamento de pagamentos: execução de contrato (art. 7º, V);",
            "E-mails transacionais (confirmações, redefinição de senha): execução de contrato (art. 7º, V);",
            "Comunicações de marketing e novidades: consentimento (art. 7º, I);",
            "Análise e melhoria do Site: interesse legítimo (art. 7º, IX);",
            "Cumprimento de obrigações fiscais: obrigação legal (art. 7º, II);",
            "Prevenção a fraudes e segurança: interesse legítimo (art. 7º, IX).",
          ],
        },
        {
          title: "4. Compartilhamento de Dados",
          items: [
            "Processadores de pagamento (Mercado Pago, Stripe) — para processamento seguro de transações;",
            "Serviços de infraestrutura (Supabase, Hostinger) — para armazenamento e hospedagem;",
            "Serviços de e-mail — para envio de comunicações transacionais;",
            "Autoridades públicas — quando exigido por lei, ordem judicial ou regulação aplicável.",
          ],
        },
        {
          title: "5. Segurança dos Dados",
          items: [
            "Criptografia HTTPS em todas as comunicações;",
            "Senhas armazenadas com hash seguro (bcrypt);",
            "Controle de acesso restrito a dados pessoais;",
            "Monitoramento contínuo de vulnerabilidades e incidentes.",
          ],
        },
        {
          title: "6. Retenção de Dados",
          items: [
            "Dados de conta: enquanto ativa, mais 5 anos após encerramento (fins fiscais);",
            "Dados de transações: 5 anos (obrigação fiscal);",
            "Logs de acesso: 6 meses (Marco Civil da Internet — Lei nº 12.965/2014);",
            "Dados de marketing: até o cancelamento do consentimento.",
          ],
        },
        {
          title: "7. Seus Direitos (LGPD — art. 18)",
          items: [
            "Confirmar a existência de tratamento de seus dados;",
            "Acessar os dados que temos sobre você;",
            "Corrigir dados incompletos, inexatos ou desatualizados;",
            "Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;",
            "Revogar o consentimento para tratamentos baseados em consentimento;",
            "Solicitar a portabilidade dos seus dados para outro fornecedor.",
          ],
        },
        {
          title: "8. Cookies e Rastreamento",
          items: [
            "Cookies essenciais: mantêm sua sessão autenticada (necessários para funcionamento);",
            "Cookies analíticos: entendem como os usuários navegam — Google Analytics 4 (dados anonimizados);",
            "Cookies de publicidade: Google Ads, Meta Pixel — mediante consentimento.",
          ],
        },
        {
          title: "9. Menores de Idade",
          body: "Nossos serviços destinam-se exclusivamente a maiores de 18 anos. Não coletamos intencionalmente dados de menores. Caso identifique tal situação, entre em contato imediatamente em privacidade@revistamagnum.com.br.",
        },
        {
          title: "10. Alterações desta Política",
          body: "Esta Política pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou na legislação. Notificaremos você sobre alterações significativas por e-mail ou mediante aviso destacado no Site.",
        },
        {
          title: "11. Contato e Encarregado (DPO)",
          items: [
            "E-mail: privacidade@revistamagnum.com.br",
            "Endereço: Rua Barão de Suruí, 164 — CEP 04612-120 — São Paulo/SP",
            "Telefone: (11) 5044-3924",
            "ANPD: www.gov.br/anpd — para registrar reclamações junto ao órgão regulador.",
          ],
        },
      ].map((s, i) => (
        <div key={i} className="py-6 border-b border-[#141d2c] last:border-0">
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] mb-3">{s.title}</h2>
          {s.body && <p className="text-[#7a9ab5] text-[14px] leading-[26px]">{s.body}</p>}
          {s.items && <ul className="list-disc pl-5 space-y-1.5">{s.items.map((item, j) => <li key={j} className="text-[#7a9ab5] text-[14px] leading-[24px]">{item}</li>)}</ul>}
        </div>
      ))}
    </div>
  );
}
