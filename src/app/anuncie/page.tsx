import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Anuncie — Revista Magnum",
  description:
    "Alcance mais de 50 mil leitores qualificados interessados em armas, munições, equipamentos táticos e defesa pessoal.",
};

const FORMATS = [
  {
    name: "Banner Full Width",
    desc: "Topo da página inicial. Alta visibilidade.",
    size: "1200 × 200 px",
    badge: "Alta visibilidade",
    badgeColor: "bg-[#0f381f] text-[#22c55e]",
  },
  {
    name: "Sidebar Fixo",
    desc: "Ao lado dos artigos. Exibido durante toda a leitura.",
    size: "300 × 600 px",
    badge: "Mais vendido",
    badgeColor: "bg-[#260a0a] text-[#ff1f1f]",
  },
  {
    name: "Inline Artigo",
    desc: "Dentro do conteúdo dos artigos do blog.",
    size: "728 × 90 px",
    badge: "Econômico",
    badgeColor: "bg-[#141d2c] text-[#7a9ab5]",
  },
  {
    name: "Topo Edições",
    desc: "Página de edições e acervo da revista.",
    size: "1200 × 160 px",
    badge: "Segmentado",
    badgeColor: "bg-[#1a1a40] text-[#818cf8]",
  },
];

const AUDIENCE = [
  { value: "50k+", label: "Leitores mensais" },
  { value: "80%", label: "Público masculino" },
  { value: "35–55", label: "Faixa etária principal" },
  { value: "ABC", label: "Classe socioeconômica" },
];

const FAQS = [
  {
    q: "Qual o prazo mínimo de veiculação?",
    a: "O prazo mínimo é de 30 dias. Oferecemos descontos progressivos para contratos de 3, 6 e 12 meses.",
  },
  {
    q: "Quais formatos de arquivo são aceitos?",
    a: "Aceitamos imagens em PNG, JPG e GIF (estático ou animado) com no máximo 2 MB. Para vídeos, consulte nossa equipe comercial.",
  },
  {
    q: "Como é feita a medição de resultados?",
    a: "Você recebe um painel com impressões, cliques e CTR em tempo real. Relatórios mensais são enviados automaticamente.",
  },
  {
    q: "Existe restrição de categoria?",
    a: "Aceitamos anunciantes do setor de armas, munições, equipamentos táticos, seguros, acessórios e prestação de serviços legalizados. Não aceitamos conteúdo ilegal ou de categorias proibidas.",
  },
];

export default function AnunciePage() {
  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <div className="px-5 lg:px-20 pt-16 pb-12">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
            <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">
              Publicidade
            </span>
          </div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[56px] lg:text-[72px] leading-[1] mb-6 max-w-[800px]">
            Anuncie para o maior público especializado do Brasil
          </h1>
          <p className="text-[#7a9ab5] text-[18px] lg:text-[20px] leading-[30px] max-w-[620px] mb-8">
            Conecte sua marca a mais de 50 mil leitores qualificados: atiradores,
            colecionadores, CAC e profissionais de segurança.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:publicidade@revistamagnum.com.br"
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[52px] px-8 flex items-center justify-center rounded-[6px] transition-colors"
            >
              Solicitar proposta →
            </a>
            <a
              href="mailto:publicidade@revistamagnum.com.br"
              className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-600 text-[#d4d4da] text-[15px] font-medium h-[52px] px-8 flex items-center justify-center rounded-[6px] transition-colors"
            >
              publicidade@revistamagnum.com.br
            </a>
          </div>
        </div>

        {/* Audience stats */}
        <div className="px-5 lg:px-20 pb-16">
          <div className="bg-[#141d2c] h-px mb-10" />
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-3">
            Nosso público
          </p>
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] leading-none mb-8">
            Quem são os leitores da Magnum
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {AUDIENCE.map((item) => (
              <div
                key={item.label}
                className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-6 text-center"
              >
                <p className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[40px] leading-none mb-2">
                  {item.value}
                </p>
                <p className="text-[#7a9ab5] text-[14px]">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0e1520] border border-[#141d2c] rounded-xl p-6 lg:p-8">
            <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-3">
              Perfil do leitor
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Atiradores esportivos (CAC)",
                  desc: "Praticantes de tiro esportivo registrados no Exército Brasileiro, com alto poder de compra.",
                },
                {
                  title: "Colecionadores",
                  desc: "Entusiastas com interesse em armas históricas, antigas e de coleção. Público premium.",
                },
                {
                  title: "Profissionais de segurança",
                  desc: "Policiais, militares e profissionais de segurança privada — tomadores de decisão de compra.",
                },
              ].map((seg) => (
                <div key={seg.title} className="flex gap-4">
                  <div className="w-[4px] bg-[#ff1f1f] rounded shrink-0 mt-1" />
                  <div>
                    <p className="text-white text-[15px] font-semibold mb-1">{seg.title}</p>
                    <p className="text-[#7a9ab5] text-[13px] leading-[20px]">{seg.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ad formats */}
        <div className="px-5 lg:px-20 pb-16">
          <div className="bg-[#141d2c] h-px mb-10" />
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-2">
            Formatos disponíveis
          </p>
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] leading-none mb-8">
            Posicionamentos publicitários
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {FORMATS.map((fmt) => (
              <div
                key={fmt.name}
                className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-6 flex gap-5"
              >
                <div className="w-[48px] h-[48px] bg-[#141d2c] rounded-[6px] flex items-center justify-center shrink-0">
                  <div className="w-[28px] h-[20px] bg-[#ff1f1f] rounded-[2px]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-white text-[16px] font-semibold">{fmt.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-[2px] rounded-[2px] ${fmt.badgeColor}`}>
                      {fmt.badge}
                    </span>
                  </div>
                  <p className="text-[#7a9ab5] text-[14px] mb-2">{fmt.desc}</p>
                  <p className="text-[#253750] text-[12px] font-mono">{fmt.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="px-5 lg:px-20 pb-16">
          <div className="bg-[#141d2c] h-px mb-10" />
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] leading-none mb-8">
            Dúvidas frequentes
          </h2>
          <div className="flex flex-col gap-4 max-w-[760px]">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5"
              >
                <p className="text-white text-[15px] font-semibold mb-2">{faq.q}</p>
                <p className="text-[#7a9ab5] text-[14px] leading-[22px]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="px-5 lg:px-20 pb-16">
          <div className="bg-[#0e1520] border-2 border-[#ff1f1f] rounded-xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[44px] leading-none mb-3">
                Pronto para anunciar?
              </h2>
              <p className="text-[#d4d4da] text-[16px] leading-[26px]">
                Entre em contato com nossa equipe comercial. Respondemos em até 24 horas
                com uma proposta personalizada para sua marca.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <a
                href="mailto:publicidade@revistamagnum.com.br"
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[52px] px-10 flex items-center justify-center rounded-[6px] transition-colors whitespace-nowrap"
              >
                Enviar proposta →
              </a>
              <a
                href="https://wa.me/5511999999999"
                className="bg-[#070a12] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[52px] px-10 flex items-center justify-center rounded-[6px] transition-colors whitespace-nowrap"
              >
                WhatsApp comercial
              </a>
              <p className="text-[#253750] text-[12px] text-center">
                Seg–Sex, 9h às 18h
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
