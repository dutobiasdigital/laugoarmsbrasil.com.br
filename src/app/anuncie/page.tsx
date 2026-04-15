import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Anuncie na Revista Magnum — Mídia Kit",
  description:
    "Alcance 45 mil leitores qualificados por mês: atiradores CAC, colecionadores e profissionais de segurança. Confira nossos formatos e solicite uma proposta.",
};

/* ─── Dados do mídia kit ─────────────────────────────────────── */

const STATS = [
  { value: "45 mil",   label: "Visitantes únicos/mês",  note: "↑ 12% vs. semestre anterior" },
  { value: "180 mil",  label: "Pageviews mensais",       note: "Média 4 páginas por sessão" },
  { value: "1.200+",   label: "Assinantes ativos",       note: "Crescimento de 8% ao mês" },
  { value: "4m 32s",   label: "Tempo médio de sessão",   note: "Engajamento acima da média" },
];

const AUDIENCE_DEMOS = [
  { label: "Masculino",            pct: 78 },
  { label: "Feminino",             pct: 22 },
];

const AGE_BANDS = [
  { range: "35–44 anos", pct: 31, bar: "w-[31%]" },
  { range: "45–54 anos", pct: 27, bar: "w-[27%]" },
  { range: "25–34 anos", pct: 22, bar: "w-[22%]" },
  { range: "55–64 anos", pct: 13, bar: "w-[13%]" },
  { range: "Outros",     pct:  7, bar: "w-[7%]"  },
];

const SEGMENTS = [
  { label: "Atiradores CAC",         pct: 38, color: "bg-[#ff1f1f]" },
  { label: "Colecionadores",         pct: 22, color: "bg-[#e85d00]" },
  { label: "Segurança pública",      pct: 18, color: "bg-[#c4820d]" },
  { label: "Caçadores",              pct: 14, color: "bg-[#2d7d46]" },
  { label: "Outros entusiastas",     pct:  8, color: "bg-[#4a5568]" },
];

const FORMATS = [
  {
    code: "BILLBOARD",
    name: "Billboard",
    size: "970 × 250 px",
    position: "Home — Topo",
    desc: "Posição de máxima visibilidade logo abaixo do menu. Primeiro elemento que o leitor vê.",
    badge: "Alta visibilidade",
    badgeColor: "bg-[#0f381f] text-[#22c55e]",
    price: "R$ 2.800",
    w: "w-full",
    h: "h-[64px]",
  },
  {
    code: "HALF_PAGE",
    name: "Half Page",
    size: "300 × 600 px",
    position: "Sidebar fixa",
    desc: "Sidebar lateral fixa presente em todas as páginas de artigos e edições. Alto tempo de exposição.",
    badge: "Mais vendido",
    badgeColor: "bg-[#260a0a] text-[#ff1f1f]",
    price: "R$ 1.800",
    w: "w-[50px]",
    h: "h-[96px]",
  },
  {
    code: "MED_RECT",
    name: "Medium Rectangle",
    size: "300 × 250 px",
    position: "Sidebar / Inline",
    desc: "Formato versátil: sidebar ou inserido entre parágrafos dos artigos. Excelente CTR comprovado.",
    badge: "Versátil",
    badgeColor: "bg-[#1a1a40] text-[#818cf8]",
    price: "R$ 1.200",
    w: "w-[50px]",
    h: "h-[40px]",
  },
  {
    code: "LEADERBOARD",
    name: "Leaderboard",
    size: "728 × 90 px",
    position: "Topo de páginas internas",
    desc: "Aparece no topo de cada página interna (blog, edições). Ideal para campanhas de branding.",
    badge: "Branding",
    badgeColor: "bg-[#141d2c] text-[#7a9ab5]",
    price: "R$ 1.600",
    w: "w-[90%]",
    h: "h-[24px]",
  },
  {
    code: "LARGE_MOBILE",
    name: "Large Mobile Banner",
    size: "320 × 100 px",
    position: "Mobile — Topo",
    desc: "Exibido exclusivamente em smartphones. Mais de 60% do tráfego Magnum é mobile.",
    badge: "Mobile first",
    badgeColor: "bg-[#0a1e1e] text-[#22d3d3]",
    price: "R$ 800",
    w: "w-[80%]",
    h: "h-[24px]",
  },
];

const PACKAGES = [
  {
    name: "Starter",
    desc: "Ideal para marcas que querem testar o canal",
    price: "R$ 1.200",
    period: "/mês",
    items: ["1 banner Medium Rectangle", "Sidebar ou inline artigo", "Relatório mensal de cliques", "Prazo mínimo: 1 mês"],
    cta: "Solicitar",
    highlight: false,
  },
  {
    name: "Profissional",
    desc: "Máxima exposição e segmentação de público",
    price: "R$ 3.500",
    period: "/mês",
    items: [
      "1 Billboard no topo da home",
      "1 Half Page na sidebar",
      "Relatório semanal completo",
      "Destaque na newsletter mensal",
      "Prazo mínimo: 3 meses",
    ],
    cta: "Solicitar",
    highlight: true,
  },
  {
    name: "Anual",
    desc: "Parceria estratégica com economia de 20%",
    price: "R$ 28.000",
    period: "/ano",
    items: [
      "Todos os formatos incluídos",
      "Publi-reportagem exclusiva",
      "Presença na capa digital",
      "Dashboard de analytics ao vivo",
      "Gerente de conta dedicado",
    ],
    cta: "Falar com comercial",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Qual o prazo mínimo de veiculação?",
    a: "O prazo mínimo é de 30 dias. Oferecemos descontos progressivos de 10%, 15% e 20% para contratos de 3, 6 e 12 meses, respectivamente.",
  },
  {
    q: "Quais formatos de arquivo são aceitos?",
    a: "Aceitamos PNG, JPG e GIF animado com até 2 MB. Para vídeos (MP4 autoplay mudo) e formatos ricos, consulte nossa equipe comercial.",
  },
  {
    q: "Como funciona a medição de resultados?",
    a: "Você acessa um painel exclusivo com impressões únicas por sessão, cliques e CTR em tempo real. Relatórios mensais são enviados automaticamente por e-mail.",
  },
  {
    q: "Existe restrição de categoria?",
    a: "Aceitamos anunciantes do setor de armas, munições, equipamentos táticos, seguros, acessórios e serviços legalizados. Não veiculamos conteúdo ilegal ou categorias vedadas pela legislação brasileira.",
  },
  {
    q: "Como funciona a entrega do material?",
    a: "Após a assinatura do contrato, você envia os arquivos para publicidade@revistamagnum.com.br. O banner entra no ar em até 48 horas úteis.",
  },
];

/* ─── Componente ─────────────────────────────────────────────── */

export default function AnunciePage() {
  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="px-5 lg:px-20 pt-16 pb-14">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
            <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">
              Mídia Kit 2026
            </span>
          </div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[54px] lg:text-[76px] leading-[0.95] mb-6 max-w-[820px]">
            Anuncie para o maior público especializado do Brasil
          </h1>
          <p className="text-[#7a9ab5] text-[18px] lg:text-[20px] leading-[30px] max-w-[620px] mb-10">
            Conecte sua marca a <strong className="text-[#d4d4da]">45 mil leitores qualificados</strong> por mês:
            atiradores CAC, colecionadores, caçadores e profissionais de segurança pública.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:publicidade@revistamagnum.com.br"
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[52px] px-8 flex items-center justify-center rounded-[6px] transition-colors"
            >
              Solicitar proposta →
            </a>
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20publicidade%20na%20Revista%20Magnum."
              className="bg-[#0e1520] border border-[#1c2a3e] hover:border-zinc-600 text-[#d4d4da] text-[15px] font-medium h-[52px] px-8 flex items-center justify-center rounded-[6px] transition-colors gap-2"
            >
              <span>💬</span> WhatsApp comercial
            </a>
          </div>
        </section>

        {/* ── Números ──────────────────────────────────────────── */}
        <section className="px-5 lg:px-20 pb-16">
          <div className="bg-[#141d2c] h-px mb-12" />
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-2">
            Audiência verificada
          </p>
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[42px] leading-none mb-10">
            Números que comprovam o alcance
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6">
                <p className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[42px] leading-none mb-1">
                  {s.value}
                </p>
                <p className="text-[#d4d4da] text-[14px] font-semibold mb-1">{s.label}</p>
                <p className="text-[#526888] text-[12px]">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Perfil do leitor ─────────────────────────────────── */}
        <section className="px-5 lg:px-20 pb-16">
          <div className="bg-[#141d2c] h-px mb-12" />
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-2">
            Perfil do leitor
          </p>
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[42px] leading-none mb-10">
            Quem são os leitores da Magnum
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Gênero */}
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6">
              <p className="text-[#7a9ab5] text-[12px] font-semibold uppercase tracking-wide mb-4">Gênero</p>
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-[#141d2c] rounded-[6px] overflow-hidden h-[8px] self-center">
                  <div className="bg-[#ff1f1f] h-full" style={{ width: "78%" }} />
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none">78%</p>
                  <p className="text-[#526888] text-[12px]">Masculino</p>
                </div>
                <div className="text-right">
                  <p className="font-['Barlow_Condensed'] font-bold text-[#7a9ab5] text-[36px] leading-none">22%</p>
                  <p className="text-[#526888] text-[12px]">Feminino</p>
                </div>
              </div>
            </div>

            {/* Faixa etária */}
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6">
              <p className="text-[#7a9ab5] text-[12px] font-semibold uppercase tracking-wide mb-4">Faixa etária</p>
              <div className="flex flex-col gap-2.5">
                {AGE_BANDS.map((a) => (
                  <div key={a.range} className="flex items-center gap-3">
                    <p className="text-[#526888] text-[12px] w-[70px] shrink-0">{a.range}</p>
                    <div className="flex-1 bg-[#141d2c] rounded-full h-[6px] overflow-hidden">
                      <div className="bg-[#ff1f1f] h-full rounded-full" style={{ width: `${a.pct}%` }} />
                    </div>
                    <p className="text-[#d4d4da] text-[12px] font-semibold w-[28px] text-right shrink-0">{a.pct}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Segmentos */}
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6">
              <p className="text-[#7a9ab5] text-[12px] font-semibold uppercase tracking-wide mb-4">Segmento de interesse</p>
              <div className="flex flex-col gap-2.5">
                {SEGMENTS.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-3">
                    <div className={`w-[8px] h-[8px] rounded-full shrink-0 ${seg.color}`} />
                    <p className="text-[#7a9ab5] text-[13px] flex-1">{seg.label}</p>
                    <p className="text-[#d4d4da] text-[13px] font-bold">{seg.pct}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dados adicionais */}
          <div className="mt-5 bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="w-[4px] bg-[#ff1f1f] rounded-full shrink-0" />
                <div>
                  <p className="text-white text-[15px] font-semibold mb-1">74% Classe A/B</p>
                  <p className="text-[#526888] text-[13px] leading-[20px]">Público com alto poder aquisitivo, principal tomador de decisão de compra no segmento.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-[4px] bg-[#ff1f1f] rounded-full shrink-0" />
                <div>
                  <p className="text-white text-[15px] font-semibold mb-1">63% mobile</p>
                  <p className="text-[#526888] text-[13px] leading-[20px]">Mais da metade dos leitores acessa via smartphone — formatos mobile têm alta taxa de conversão.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-[4px] bg-[#ff1f1f] rounded-full shrink-0" />
                <div>
                  <p className="text-white text-[15px] font-semibold mb-1">SP · MG · RJ · RS</p>
                  <p className="text-[#526888] text-[13px] leading-[20px]">Concentração nos estados com maior base de registros CAC e CLDs cadastrados no Exército.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Formatos / Banners ───────────────────────────────── */}
        <section className="px-5 lg:px-20 pb-16">
          <div className="bg-[#141d2c] h-px mb-12" />
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-2">
            Formatos IAB
          </p>
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[42px] leading-none mb-10">
            Posicionamentos publicitários
          </h2>
          <div className="flex flex-col gap-4">
            {FORMATS.map((fmt) => (
              <div
                key={fmt.code}
                className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5 lg:p-6 flex flex-col lg:flex-row gap-5"
              >
                {/* Visual preview do banner */}
                <div className="w-full lg:w-[140px] h-[80px] lg:h-[auto] lg:min-h-[80px] bg-[#141d2c] rounded-[6px] flex items-center justify-center shrink-0 overflow-hidden">
                  <div className={`${fmt.w} ${fmt.h} bg-[#ff1f1f]/20 border border-[#ff1f1f]/30 rounded-[2px] flex items-center justify-center`}>
                    <span className="text-[#ff1f1f]/50 text-[10px] font-mono">{fmt.size}</span>
                  </div>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="text-white text-[17px] font-bold">{fmt.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-[2px] rounded-[2px] ${fmt.badgeColor}`}>
                      {fmt.badge}
                    </span>
                    <span className="text-[10px] text-[#526888] bg-[#141d2c] px-2 py-[2px] rounded-[2px] font-mono">
                      {fmt.size}
                    </span>
                  </div>
                  <p className="text-[#526888] text-[12px] mb-1">📍 {fmt.position}</p>
                  <p className="text-[#7a9ab5] text-[14px] leading-[22px]">{fmt.desc}</p>
                </div>
                {/* Price */}
                <div className="flex items-center lg:items-end justify-between lg:justify-end lg:flex-col gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-[#526888] text-[11px] mb-0.5">A partir de</p>
                    <p className="font-['Barlow_Condensed'] font-bold text-white text-[28px] leading-none">{fmt.price}</p>
                    <p className="text-[#526888] text-[11px]">/mês</p>
                  </div>
                  <a
                    href={`mailto:publicidade@revistamagnum.com.br?subject=Proposta ${fmt.name} — Revista Magnum`}
                    className="bg-[#141d2c] border border-[#1c2a3e] hover:border-[#ff1f1f]/50 hover:text-white text-[#7a9ab5] text-[13px] font-semibold h-[36px] px-4 flex items-center rounded-[6px] transition-colors whitespace-nowrap"
                  >
                    Solicitar →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pacotes ──────────────────────────────────────────── */}
        <section className="px-5 lg:px-20 pb-16">
          <div className="bg-[#141d2c] h-px mb-12" />
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-2">
            Pacotes
          </p>
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[42px] leading-none mb-10">
            Escolha o melhor plano
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`rounded-[12px] p-6 flex flex-col ${
                  pkg.highlight
                    ? "bg-[#ff1f1f] border-2 border-[#ff1f1f]"
                    : "bg-[#0e1520] border border-[#141d2c]"
                }`}
              >
                <p className={`text-[12px] font-semibold uppercase tracking-wide mb-1 ${pkg.highlight ? "text-[#ffb3b3]" : "text-[#7a9ab5]"}`}>
                  {pkg.name}
                </p>
                <p className={`text-[14px] mb-5 ${pkg.highlight ? "text-[#ffe4e4]" : "text-[#526888]"}`}>
                  {pkg.desc}
                </p>
                <div className="mb-6">
                  <span className={`font-['Barlow_Condensed'] font-bold text-[44px] leading-none ${pkg.highlight ? "text-white" : "text-white"}`}>
                    {pkg.price}
                  </span>
                  <span className={`text-[14px] ml-1 ${pkg.highlight ? "text-[#ffb3b3]" : "text-[#526888]"}`}>
                    {pkg.period}
                  </span>
                </div>
                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {pkg.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className={`mt-[2px] shrink-0 ${pkg.highlight ? "text-white" : "text-[#ff1f1f]"}`}>✓</span>
                      <span className={`text-[14px] ${pkg.highlight ? "text-white" : "text-[#7a9ab5]"}`}>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:publicidade@revistamagnum.com.br?subject=Proposta Pacote ${pkg.name} — Revista Magnum`}
                  className={`h-[44px] flex items-center justify-center rounded-[6px] text-[14px] font-semibold transition-colors ${
                    pkg.highlight
                      ? "bg-white text-[#ff1f1f] hover:bg-[#ffe4e4]"
                      : "bg-[#141d2c] border border-[#1c2a3e] hover:border-[#ff1f1f]/50 text-[#d4d4da]"
                  }`}
                >
                  {pkg.cta} →
                </a>
              </div>
            ))}
          </div>
          <p className="text-[#253750] text-[13px] mt-4 text-center">
            Valores para contratação direta. Agências têm comissão de 20%. Preços sem impostos.
          </p>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="px-5 lg:px-20 pb-16">
          <div className="bg-[#141d2c] h-px mb-12" />
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[42px] leading-none mb-8">
            Dúvidas frequentes
          </h2>
          <div className="flex flex-col gap-3 max-w-[780px]">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
                <p className="text-white text-[15px] font-semibold mb-2">{faq.q}</p>
                <p className="text-[#7a9ab5] text-[14px] leading-[22px]">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Final ────────────────────────────────────────── */}
        <section className="px-5 lg:px-20 pb-20">
          <div className="bg-[#0e1520] border-2 border-[#ff1f1f]/40 rounded-[16px] p-8 lg:p-14 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-3">Pronto para anunciar?</p>
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[48px] leading-[1] mb-4">
                Fale com nossa equipe comercial
              </h2>
              <p className="text-[#7a9ab5] text-[16px] leading-[26px] max-w-[480px]">
                Respondemos em até <strong className="text-[#d4d4da]">24 horas</strong> com uma proposta
                personalizada. Contratos flexíveis, sem fidelidade mínima no plano Starter.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0 min-w-[240px]">
              <a
                href="mailto:publicidade@revistamagnum.com.br"
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[52px] px-8 flex items-center justify-center rounded-[6px] transition-colors"
              >
                Enviar proposta →
              </a>
              <a
                href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20publicidade%20na%20Revista%20Magnum."
                className="bg-[#070a12] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[52px] px-8 flex items-center justify-center rounded-[6px] transition-colors gap-2"
              >
                <span>💬</span> WhatsApp
              </a>
              <div className="text-center">
                <p className="text-[#526888] text-[12px]">publicidade@revistamagnum.com.br</p>
                <p className="text-[#253750] text-[11px]">Seg–Sex, 9h às 18h (BRT)</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
