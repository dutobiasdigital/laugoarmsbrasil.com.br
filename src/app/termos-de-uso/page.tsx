import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Termos de Uso — Revista Magnum",
  description: "Condições de uso do site, assinatura digital, loja e serviços da Revista Magnum.",
};

async function getPageContent() {
  const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
  const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?key=in.(page.termos.title,page.termos.content)&select=key,value`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, next: { revalidate: 300 } }
    );
    const rows: { key: string; value: string }[] = await res.json();
    const map: Record<string, string> = {};
    if (Array.isArray(rows)) rows.forEach(r => { map[r.key] = r.value; });
    return map;
  } catch { return {}; }
}

export default async function TermosDeUsoPage() {
  const data    = await getPageContent();
  const titulo  = data["page.termos.title"]   || "Termos de Uso";
  const content = data["page.termos.content"] || null;

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <main className="flex-1 mt-16">
        <section className="hero-metal px-5 lg:px-20 pt-14 pb-12 border-b border-[#141d2c]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
            <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">Legal</span>
          </div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[52px] lg:text-[64px] leading-[0.95] mb-3">{titulo}</h1>
          <p className="text-[#526888] text-[14px]">Última atualização: 17 de abril de 2026</p>
        </section>
        <section className="px-5 lg:px-20 py-12 lg:py-16">
          <div className="max-w-[820px]">
            {content ? (
              <div className="text-[#d4d4da] text-[15px] leading-[1.8] [&_h1]:hidden [&_h2]:font-bold [&_h2]:text-white [&_h2]:text-[22px] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-[#141d2c] [&_h3]:text-white [&_h3]:font-semibold [&_h3]:text-[17px] [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1 [&_li]:text-[#7a9ab5] [&_strong]:text-white [&_a]:text-[#ff1f1f] [&_a]:underline [&_table]:w-full [&_table]:border-collapse [&_table]:mb-6 [&_td]:border [&_td]:border-[#1c2a3e] [&_td]:px-3 [&_td]:py-2 [&_td]:text-[14px] [&_td]:text-[#7a9ab5] [&_th]:border [&_th]:border-[#1c2a3e] [&_th]:px-3 [&_th]:py-2 [&_th]:text-[13px] [&_th]:text-[#7a9ab5] [&_th]:bg-[#141d2c] [&_th]:text-left"
                dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <TermosContent />
            )}
            <div className="mt-12 pt-6 border-t border-[#141d2c] flex flex-wrap gap-5 text-[13px]">
              <Link href="/politica-de-privacidade" className="text-[#7a9ab5] hover:text-white transition-colors">Política de Privacidade →</Link>
              <Link href="/assine" className="text-[#7a9ab5] hover:text-white transition-colors">Ver planos →</Link>
              <Link href="/contato" className="text-[#7a9ab5] hover:text-white transition-colors">Fale conosco →</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function TermosContent() {
  const sections: { title: string; body?: string; items?: string[] }[] = [
    { title: "1. Identificação da Empresa", body: "A Revista Magnum, publicação especializada em armas de fogo, munições e legislação desde 1997, com sede à Rua Barão de Suruí, 164 — CEP 04612-120 — São Paulo/SP, telefone (11) 5044-3924, e-mail contato@revistamagnum.com.br." },
    { title: "2. Aceitação dos Termos", body: "Ao acessar ou utilizar o site revistamagnum.com.br, cadastrar-se como usuário, adquirir uma assinatura digital ou realizar qualquer compra em nossa loja, você declara ter lido, compreendido e aceito integralmente estes Termos de Uso, bem como nossa Política de Privacidade." },
    { title: "3. Serviços Oferecidos", items: ["Acervo Digital: acesso às mais de 207 edições regulares e especiais mediante assinatura ativa;", "Loja Online: comercialização de produtos físicos (coleções, back issues e produtos editoriais);", "Guia Comercial Magnum: diretório de empresas do setor de armas, munições e acessórios;", "Blog e Conteúdo: artigos, notícias e análises sobre armas, legislação, tiro esportivo e colecionismo."] },
    { title: "4. Cadastro e Conta de Usuário", items: ["As informações fornecidas devem ser verdadeiras, completas e atualizadas;", "É necessário ter capacidade civil plena (maior de 18 anos) para contratar nossos serviços;", "O Usuário é responsável pela guarda e sigilo de sua senha;", "Em caso de uso não autorizado, notifique-nos imediatamente em contato@revistamagnum.com.br."] },
    { title: "5. Assinatura Digital", body: "O acesso ao acervo está condicionado à assinatura ativa e devidamente paga, de uso pessoal e intransferível. O cancelamento pode ser solicitado a qualquer momento pelo painel da conta, mantendo o acesso até o final do período pago. Contratos eletrônicos têm direito de arrependimento de 7 dias corridos a partir da contratação, com reembolso integral (CDC, art. 49)." },
    { title: "6. Loja Online", body: "Compras na Loja Online estão sujeitas à disponibilidade de estoque e prazos de entrega informados no ato da compra. O direito de arrependimento em produtos físicos é de 7 dias corridos após o recebimento, conforme o Código de Defesa do Consumidor (Lei nº 8.078/1990)." },
    { title: "7. Propriedade Intelectual", body: "Todo o conteúdo disponível — textos, fotografias, ilustrações, logotipos, layouts, vídeos e edições digitais — é de propriedade exclusiva da Empresa ou de seus licenciantes, protegido pela Lei nº 9.610/1998. É vedada reprodução, cópia, distribuição ou sublicenciamento sem autorização prévia e expressa por escrito." },
    { title: "8. Conteúdo sobre Armas de Fogo e Legislação", body: "A Revista Magnum destina-se exclusivamente ao público legalmente habilitado: Colecionadores, Atiradores Desportivos e Caçadores (CAC), militares, policiais e profissionais autorizados. Todo conteúdo é produzido com finalidade informativa, educacional e cultural, em conformidade com a Lei nº 10.826/2003 e o Decreto nº 9.847/2019." },
    { title: "9. Uso Proibido", items: ["Qualquer finalidade ilegal ou não autorizada;", "Acesso não autorizado a sistemas ou redes do Site;", "Transmissão de vírus, malware ou código malicioso;", "Violação de direitos de terceiros, incluindo privacidade e propriedade intelectual;", "Coleta de dados de outros usuários sem consentimento."] },
    { title: "10. Limitação de Responsabilidade", body: "A Empresa não se responsabiliza por interrupções temporárias decorrentes de manutenção, falhas técnicas, ataques cibernéticos ou força maior. As informações publicadas têm caráter meramente informativo e não constituem assessoria jurídica, técnica ou profissional." },
    { title: "11. Alterações dos Termos", body: "A Empresa pode modificar estes Termos a qualquer momento, com as alterações entrando em vigor na data de publicação no Site. Alterações substanciais serão comunicadas por e-mail aos usuários cadastrados com antecedência mínima de 15 dias." },
    { title: "12. Legislação Aplicável e Foro", body: "Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o Foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias decorrentes deste instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja." },
    { title: "13. Contato", items: ["E-mail: contato@revistamagnum.com.br", "Telefone: (11) 5044-3924", "Endereço: Rua Barão de Suruí, 164 — CEP 04612-120 — São Paulo/SP"] },
  ];
  return (
    <div className="flex flex-col">
      {sections.map((s, i) => (
        <div key={i} className="py-6 border-b border-[#141d2c] last:border-0">
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] mb-3">{s.title}</h2>
          {s.body && <p className="text-[#7a9ab5] text-[14px] leading-[26px]">{s.body}</p>}
          {s.items && <ul className="list-disc pl-5 space-y-1.5">{s.items.map((item, j) => <li key={j} className="text-[#7a9ab5] text-[14px] leading-[24px]">{item}</li>)}</ul>}
        </div>
      ))}
    </div>
  );
}
