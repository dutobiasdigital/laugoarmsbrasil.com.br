"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls, areaCls } from "./_ConfiguracoesClient";

interface Props { settings: Record<string, string>; }

/* ─── Conteúdo padrão — exibido enquanto não há dados salvos ─── */

const DEFAULT_TERMOS = `<h1>Termos de Uso</h1>
<p><strong>Última atualização:</strong> 17 de abril de 2026</p>

<h2>1. Identificação da Empresa</h2>
<p>A <strong>Revista Magnum</strong>, publicação especializada em armas de fogo, munições e legislação, com sede à <strong>Rua Barão de Suruí, 164 — CEP 04612-120 — São Paulo/SP</strong>, telefone (11) 5044-3924, e-mail contato@revistamagnum.com.br ("Empresa", "Nós").</p>

<h2>2. Aceitação dos Termos</h2>
<p>Ao acessar ou utilizar o site <strong>revistamagnum.com.br</strong> ("Site"), cadastrar-se como usuário, adquirir uma assinatura digital ou realizar qualquer compra em nossa loja, você ("Usuário") declara ter lido, compreendido e aceito integralmente estes Termos de Uso, bem como nossa Política de Privacidade.</p>
<p>Caso não concorde com qualquer disposição destes Termos, pedimos que não utilize nossos serviços.</p>

<h2>3. Serviços Oferecidos</h2>
<p>O Site disponibiliza os seguintes serviços:</p>
<ul>
  <li><strong>Acervo Digital:</strong> acesso ao arquivo completo de edições da Revista Magnum, com mais de 207 edições regulares e especiais, mediante assinatura ativa;</li>
  <li><strong>Loja Online:</strong> comercialização de produtos físicos (coleções, back issues, produtos editoriais);</li>
  <li><strong>Guia Comercial Magnum:</strong> diretório de empresas do setor de armas, munições e acessórios;</li>
  <li><strong>Blog e Conteúdo:</strong> artigos, notícias e análises sobre armas, legislação, tiro esportivo e colecionismo.</li>
</ul>

<h2>4. Cadastro e Conta de Usuário</h2>
<p>Para acessar o acervo digital e realizar compras, é necessário criar uma conta. O Usuário declara que:</p>
<ul>
  <li>As informações fornecidas no cadastro são verdadeiras, completas e atualizadas;</li>
  <li>Possui capacidade civil plena (ser maior de 18 anos) para contratar serviços;</li>
  <li>É responsável pela guarda e sigilo de sua senha de acesso;</li>
  <li>Notificará imediatamente a Empresa em caso de uso não autorizado de sua conta.</li>
</ul>
<p>A Empresa reserva-se o direito de suspender ou cancelar contas que violem estes Termos, contenham informações falsas ou façam uso inadequado dos serviços.</p>

<h2>5. Assinatura Digital</h2>
<h3>5.1 Planos e Preços</h3>
<p>Os planos de assinatura, valores, períodos e formas de pagamento estão descritos na página de assinatura do Site, podendo ser alterados mediante aviso prévio de 30 dias.</p>
<h3>5.2 Acesso ao Conteúdo</h3>
<p>O acesso ao acervo digital está condicionado à existência de assinatura ativa e devidamente paga. O conteúdo é fornecido para uso pessoal e intransferível, vedada qualquer forma de redistribuição, compartilhamento de credenciais ou reprodução não autorizada.</p>
<h3>5.3 Cancelamento</h3>
<p>O Usuário pode cancelar sua assinatura a qualquer momento através de sua conta no Site. O acesso permanece disponível até o final do período já pago. Não há reembolso proporcional, exceto nos casos previstos no Código de Defesa do Consumidor (Lei nº 8.078/1990).</p>
<h3>5.4 Direito de Arrependimento</h3>
<p>Em conformidade com o art. 49 do Código de Defesa do Consumidor, o Usuário que contratar a assinatura por meio eletrônico tem o direito de desistir do contrato no prazo de 7 (sete) dias corridos, contados da data da contratação, com reembolso integral dos valores pagos.</p>

<h2>6. Loja Online</h2>
<p>As compras realizadas na Loja Online estão sujeitas à disponibilidade de estoque, prazos de entrega informados no ato da compra e às condições gerais do Código de Defesa do Consumidor. O prazo para exercício do direito de arrependimento em produtos físicos é de 7 dias corridos após o recebimento.</p>

<h2>7. Propriedade Intelectual</h2>
<p>Todo o conteúdo disponível no Site — incluindo textos, fotografias, ilustrações, logotipos, marcas, layouts, vídeos e edições digitais — é de propriedade exclusiva da Empresa ou de seus licenciantes e está protegido pelas leis de direitos autorais (Lei nº 9.610/1998) e demais normas de propriedade intelectual aplicáveis.</p>
<p>É expressamente vedado ao Usuário:</p>
<ul>
  <li>Reproduzir, copiar, distribuir, publicar ou sublicenciar qualquer conteúdo sem autorização prévia e expressa por escrito;</li>
  <li>Utilizar o conteúdo para fins comerciais;</li>
  <li>Remover avisos de direitos autorais ou outras marcações de propriedade.</li>
</ul>

<h2>8. Conteúdo sobre Armas de Fogo e Legislação</h2>
<p>A Revista Magnum é uma publicação especializada voltada exclusivamente ao público legalmente habilitado: Colecionadores, Atiradores Desportivos e Caçadores (CAC), militares, policiais e demais profissionais autorizados.</p>
<p>Todo o conteúdo do Site é produzido com finalidade informativa, educacional e cultural, em conformidade com a legislação brasileira vigente (Lei nº 10.826/2003 — Estatuto do Desarmamento, Decreto nº 9.847/2019 e regulamentações do Exército Brasileiro). A Empresa não incentiva, facilita ou orienta a aquisição ilegal de armas ou munições.</p>

<h2>9. Uso Proibido</h2>
<p>O Usuário compromete-se a não utilizar o Site para:</p>
<ul>
  <li>Qualquer finalidade ilegal ou não autorizada;</li>
  <li>Tentar obter acesso não autorizado a sistemas ou redes conectados ao Site;</li>
  <li>Transmitir vírus, malware ou qualquer código malicioso;</li>
  <li>Praticar atos que violem direitos de terceiros, incluindo privacidade e propriedade intelectual;</li>
  <li>Coletar dados de outros usuários sem consentimento.</li>
</ul>

<h2>10. Limitação de Responsabilidade</h2>
<p>A Empresa empenha-se em manter o Site disponível continuamente, porém não se responsabiliza por interrupções temporárias decorrentes de manutenção, falhas técnicas, ataques cibernéticos ou casos fortuitos e de força maior.</p>
<p>As informações publicadas no Site têm caráter meramente informativo e não constituem assessoria jurídica, técnica ou profissional. O Usuário assume total responsabilidade pelas decisões tomadas com base no conteúdo do Site.</p>

<h2>11. Alterações dos Termos</h2>
<p>A Empresa reserva-se o direito de modificar estes Termos a qualquer momento. As alterações entram em vigor na data de sua publicação no Site. O uso continuado dos serviços após a publicação das alterações implica na aceitação dos novos Termos. Alterações substanciais serão comunicadas por e-mail aos usuários cadastrados.</p>

<h2>12. Legislação Aplicável e Foro</h2>
<p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o Foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias decorrentes deste instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>

<h2>13. Contato</h2>
<p>Para dúvidas sobre estes Termos, entre em contato:</p>
<ul>
  <li><strong>E-mail:</strong> contato@revistamagnum.com.br</li>
  <li><strong>Telefone:</strong> (11) 5044-3924</li>
  <li><strong>Endereço:</strong> Rua Barão de Suruí, 164 — CEP 04612-120 — São Paulo/SP</li>
</ul>`;

const DEFAULT_PRIVACIDADE = `<h1>Política de Privacidade</h1>
<p><strong>Última atualização:</strong> 17 de abril de 2026</p>

<p>A <strong>Revista Magnum</strong> ("Empresa", "Nós") está comprometida com a proteção da privacidade e dos dados pessoais de seus usuários, em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais</strong> (Lei nº 13.709/2018 — LGPD) e demais normas aplicáveis.</p>

<h2>1. Controlador dos Dados</h2>
<p>
  <strong>Empresa:</strong> Revista Magnum<br>
  <strong>Endereço:</strong> Rua Barão de Suruí, 164 — CEP 04612-120 — São Paulo/SP<br>
  <strong>E-mail:</strong> privacidade@revistamagnum.com.br<br>
  <strong>Telefone:</strong> (11) 5044-3924<br>
  <strong>Site:</strong> https://revistamagnum.com.br
</p>

<h2>2. Dados Pessoais Coletados</h2>
<h3>2.1 Dados fornecidos pelo usuário:</h3>
<ul>
  <li><strong>Cadastro:</strong> nome completo, endereço de e-mail e senha (armazenada com hash seguro);</li>
  <li><strong>Assinatura:</strong> dados de pagamento processados pelo gateway (não armazenamos dados de cartão de crédito);</li>
  <li><strong>Loja:</strong> endereço de entrega, CPF para emissão de nota fiscal;</li>
  <li><strong>Formulários de contato:</strong> nome, e-mail, telefone e mensagem.</li>
</ul>
<h3>2.2 Dados coletados automaticamente:</h3>
<ul>
  <li>Endereço IP, tipo de navegador, dispositivo e sistema operacional;</li>
  <li>Páginas visitadas, tempo de permanência e interações no Site;</li>
  <li>Cookies e tecnologias similares (veja a seção de Cookies).</li>
</ul>

<h2>3. Finalidade e Base Legal do Tratamento (LGPD)</h2>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;border-color:#1c2a3e">
  <thead>
    <tr style="background:#141d2c">
      <th style="text-align:left">Finalidade</th>
      <th style="text-align:left">Base Legal</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Criação e gestão de conta de usuário</td><td>Execução de contrato (art. 7º, V)</td></tr>
    <tr><td>Processamento de pagamentos e assinaturas</td><td>Execução de contrato (art. 7º, V)</td></tr>
    <tr><td>Entrega de produtos físicos</td><td>Execução de contrato (art. 7º, V)</td></tr>
    <tr><td>E-mails transacionais (confirmações, redefinição de senha)</td><td>Execução de contrato (art. 7º, V)</td></tr>
    <tr><td>Comunicações de marketing e novidades</td><td>Consentimento (art. 7º, I)</td></tr>
    <tr><td>Análise e melhoria do Site</td><td>Interesse legítimo (art. 7º, IX)</td></tr>
    <tr><td>Cumprimento de obrigações legais e fiscais</td><td>Obrigação legal (art. 7º, II)</td></tr>
    <tr><td>Prevenção a fraudes e segurança</td><td>Interesse legítimo (art. 7º, IX)</td></tr>
  </tbody>
</table>

<h2>4. Compartilhamento de Dados</h2>
<p>Não vendemos dados pessoais a terceiros. Podemos compartilhar dados com:</p>
<ul>
  <li><strong>Processadores de pagamento</strong> (ex.: Mercado Pago, Stripe) — para processamento seguro de transações;</li>
  <li><strong>Serviços de infraestrutura</strong> (Supabase, Hostinger) — para armazenamento e hospedagem;</li>
  <li><strong>Serviços de e-mail</strong> — para envio de comunicações transacionais;</li>
  <li><strong>Autoridades públicas</strong> — quando exigido por lei, ordem judicial ou regulação aplicável.</li>
</ul>
<p>Todos os nossos parceiros são contratualmente obrigados a tratar os dados com devida segurança e confidencialidade.</p>

<h2>5. Transferência Internacional de Dados</h2>
<p>Alguns de nossos fornecedores de infraestrutura podem processar dados fora do território nacional. Quando isso ocorrer, garantimos que a transferência seja realizada em conformidade com a LGPD e com salvaguardas adequadas.</p>

<h2>6. Segurança dos Dados</h2>
<p>Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais, incluindo:</p>
<ul>
  <li>Criptografia HTTPS em todas as comunicações;</li>
  <li>Armazenamento de senhas com hash seguro (bcrypt);</li>
  <li>Controle de acesso restrito a dados pessoais;</li>
  <li>Monitoramento contínuo de vulnerabilidades e incidentes de segurança.</li>
</ul>
<p>Em caso de incidente de segurança, notificaremos a ANPD e os usuários afetados dentro dos prazos legais.</p>

<h2>7. Retenção de Dados</h2>
<ul>
  <li><strong>Dados de conta:</strong> enquanto ativa, mais 5 anos após o encerramento;</li>
  <li><strong>Dados de transações:</strong> 5 anos (obrigação fiscal);</li>
  <li><strong>Logs de acesso:</strong> 6 meses (Marco Civil da Internet — Lei nº 12.965/2014);</li>
  <li><strong>Dados de marketing:</strong> até o cancelamento do consentimento.</li>
</ul>

<h2>8. Seus Direitos (LGPD — art. 18)</h2>
<p>Você tem direito a, a qualquer momento:</p>
<ul>
  <li><strong>Confirmar</strong> a existência de tratamento de seus dados;</li>
  <li><strong>Acessar</strong> os dados que temos sobre você;</li>
  <li><strong>Corrigir</strong> dados incompletos, inexatos ou desatualizados;</li>
  <li><strong>Solicitar a anonimização, bloqueio ou eliminação</strong> de dados desnecessários;</li>
  <li><strong>Revogar o consentimento</strong> para tratamentos baseados em consentimento;</li>
  <li><strong>Solicitar a portabilidade</strong> dos seus dados para outro fornecedor;</li>
  <li><strong>Opor-se</strong> a tratamento realizado com base em interesse legítimo.</li>
</ul>
<p>Para exercer seus direitos, entre em contato: <strong>privacidade@revistamagnum.com.br</strong> — resposta em até 15 dias úteis.</p>

<h2>9. Cookies e Tecnologias de Rastreamento</h2>
<ul>
  <li><strong>Cookies essenciais:</strong> mantêm sua sessão autenticada (necessários para funcionamento);</li>
  <li><strong>Cookies analíticos:</strong> entendem como os usuários navegam (Google Analytics 4, dados anonimizados);</li>
  <li><strong>Cookies de publicidade:</strong> exibem anúncios relevantes (Google Ads, Meta Pixel), mediante consentimento.</li>
</ul>
<p>Você pode gerenciar suas preferências nas configurações do seu navegador.</p>

<h2>10. Menores de Idade</h2>
<p>Nossos serviços são destinados exclusivamente a maiores de 18 anos. Não coletamos intencionalmente dados de menores. Caso identifique tal situação, entre em contato imediatamente.</p>

<h2>11. Alterações desta Política</h2>
<p>Esta Política pode ser atualizada periodicamente. Notificaremos você sobre alterações significativas por e-mail ou mediante aviso destacado no Site.</p>

<h2>12. Contato e Encarregado (DPO)</h2>
<ul>
  <li><strong>E-mail:</strong> privacidade@revistamagnum.com.br</li>
  <li><strong>Endereço:</strong> Rua Barão de Suruí, 164 — CEP 04612-120 — São Paulo/SP</li>
  <li><strong>Telefone:</strong> (11) 5044-3924</li>
</ul>
<p>Você também pode registrar reclamações junto à <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener">www.gov.br/anpd</a></p>`;

/* ─── PaginaSection ─────────────────────────────────────────────── */
function PaginaSection({
  icon,
  title,
  desc,
  keyPrefix,
  defaultTitle,
  defaultSlug,
  defaultContent,
  settings,
}: {
  icon: string;
  title: string;
  desc: string;
  keyPrefix: string;
  defaultTitle: string;
  defaultSlug: string;
  defaultContent: string;
  settings: Record<string, string>;
}) {
  const [titulo,   setTitulo]   = useState(settings[`${keyPrefix}.title`]   ?? defaultTitle);
  const [slug,     setSlug]     = useState(settings[`${keyPrefix}.slug`]    ?? defaultSlug);
  const [conteudo, setConteudo] = useState(settings[`${keyPrefix}.content`] ?? defaultContent);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [preview,  setPreview]  = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const result = await saveSettings({
      [`${keyPrefix}.title`]:   titulo,
      [`${keyPrefix}.slug`]:    slug,
      [`${keyPrefix}.content`]: conteudo,
    });
    if (result.error) setError(result.error);
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave}>
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] overflow-hidden">
        {/* Header */}
        <div className="bg-[#141d2c] px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[22px]">{icon}</span>
            <div>
              <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] leading-none">{title}</h3>
              <p className="text-[#526888] text-[12px] mt-0.5">{desc}</p>
            </div>
          </div>
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener"
            className="text-[#7a9ab5] hover:text-white text-[12px] transition-colors flex items-center gap-1 shrink-0"
          >
            Ver página ↗
          </a>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Título da página</label>
              <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder={title} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Slug (URL)</label>
              <div className="flex items-center">
                <span className="bg-[#0e1520] border border-r-0 border-[#1c2a3e] rounded-l-[6px] h-[40px] px-3 flex items-center text-[#526888] text-[13px] whitespace-nowrap">/</span>
                <input
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="bg-[#070a12] border border-[#1c2a3e] rounded-r-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] flex-1 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls} style={{ marginBottom: 0 }}>Conteúdo HTML</label>
              <button
                type="button"
                onClick={() => setPreview(v => !v)}
                className="text-[#7a9ab5] hover:text-white text-[12px] transition-colors"
              >
                {preview ? "✏️ Editar" : "👁 Pré-visualizar"}
              </button>
            </div>

            {preview ? (
              <div
                className="bg-[#070a12] border border-[#1c2a3e] rounded-[6px] p-5 min-h-[300px] prose prose-invert prose-sm max-w-none text-[#d4d4da] text-[14px] leading-relaxed
                  [&_h1]:text-white [&_h1]:font-bold [&_h1]:text-[28px] [&_h1]:mb-4 [&_h1]:font-\[\'Barlow_Condensed\'\]
                  [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-[20px] [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-\[\#141d2c\] [&_h2]:pb-2
                  [&_h3]:text-\[\#d4d4da\] [&_h3]:font-semibold [&_h3]:text-[16px] [&_h3]:mt-4 [&_h3]:mb-2
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                  [&_li]:text-\[\#7a9ab5\]
                  [&_p]:mb-3
                  [&_strong]:text-white
                  [&_a]:text-\[\#ff1f1f\] [&_a]:underline
                  [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-\[\#1c2a3e\] [&_td]:px-3 [&_td]:py-2 [&_td]:text-[13px]
                  [&_th]:border [&_th]:border-\[\#1c2a3e\] [&_th]:px-3 [&_th]:py-2 [&_th]:text-[13px] [&_th]:text-\[\#7a9ab5\] [&_th]:bg-\[\#141d2c\]"
                dangerouslySetInnerHTML={{ __html: conteudo }}
              />
            ) : (
              <textarea
                value={conteudo}
                onChange={e => setConteudo(e.target.value)}
                rows={18}
                className={`${areaCls} font-mono text-[12px] leading-[1.6]`}
              />
            )}
            <p className="text-[#526888] text-[11px] mt-1.5">
              Suporta HTML completo: &lt;h1&gt;–&lt;h6&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;table&gt;, &lt;strong&gt;, &lt;a&gt;, etc.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-[#141d2c]">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[40px] px-6 rounded-[6px] transition-colors"
            >
              {saving ? "Salvando..." : `Salvar ${title}`}
            </button>
            {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo com sucesso!</p>}
          </div>
        </div>
      </section>
    </form>
  );
}

/* ─── Componente principal ────────────────────────────────────── */
export default function TabPaginas({ settings }: Props) {
  return (
    <div className="flex flex-col gap-6 max-w-[780px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">
          Páginas Institucionais
        </h2>
        <p className="text-[#526888] text-[13px]">
          Conteúdo das páginas legais do site. Edite o HTML diretamente ou use o modo pré-visualização.
        </p>
      </div>

      <PaginaSection
        icon="⚖️"
        title="Termos de Uso"
        desc="Condições de uso do site e dos serviços oferecidos"
        keyPrefix="page.termos"
        defaultTitle="Termos de Uso"
        defaultSlug="termos-de-uso"
        defaultContent={DEFAULT_TERMOS}
        settings={settings}
      />

      <PaginaSection
        icon="🔒"
        title="Política de Privacidade"
        desc="Como tratamos os dados pessoais dos usuários — LGPD"
        keyPrefix="page.privacidade"
        defaultTitle="Política de Privacidade"
        defaultSlug="politica-de-privacidade"
        defaultContent={DEFAULT_PRIVACIDADE}
        settings={settings}
      />
    </div>
  );
}
