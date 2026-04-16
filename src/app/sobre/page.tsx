import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Sobre — Revista Magnum",
  description:
    "Há mais de 25 anos, a Revista Magnum é a publicação de referência sobre armas, munições, defesa e legislação no Brasil.",
};

const TEAM = [
  { name: "Ricardo Alves", role: "Editor-chefe", initials: "RA" },
  { name: "Fernanda Moura", role: "Editora de Arte", initials: "FM" },
  { name: "Carlos Henrique", role: "Redator especialista", initials: "CH" },
  { name: "Paulo Sérgio", role: "Fotógrafo", initials: "PS" },
];

const NUMBERS = [
  { value: "207+", label: "Edições publicadas" },
  { value: "25+", label: "Anos no mercado" },
  { value: "50k+", label: "Leitores mensais" },
  { value: "1998", label: "Ano de fundação" },
];

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <div className="hero-metal border-b border-[#141d2c]">
        <div className="px-5 lg:px-20 pt-16 pb-12 max-w-[1200px]">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
            <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">
              Sobre nós
            </span>
          </div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[56px] lg:text-[72px] leading-[1] mb-6 max-w-[760px]">
            A publicação de referência em armamento do Brasil
          </h1>
          <p className="text-[#7a9ab5] text-[18px] lg:text-[20px] leading-[30px] max-w-[640px]">
            Desde 1998, a Revista Magnum informa e educa atiradores, colecionadores,
            caçadores e profissionais de segurança com jornalismo especializado,
            análises técnicas e cobertura legislativa.
          </p>
        </div>
        </div>{/* /hero-metal */}

        {/* Stats */}
        <div className="px-5 lg:px-20 pb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {NUMBERS.map((n) => (
              <div
                key={n.label}
                className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-6 text-center"
              >
                <p className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[44px] leading-none mb-2">
                  {n.value}
                </p>
                <p className="text-[#7a9ab5] text-[14px]">{n.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="px-5 lg:px-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-3">
                Nossa missão
              </p>
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[42px] leading-[46px] mb-5">
                Informação técnica, legal e segura
              </h2>
              <div className="flex flex-col gap-4 text-[#d4d4da] text-[16px] leading-[26px]">
                <p>
                  A Revista Magnum nasceu da necessidade de uma publicação séria e
                  responsável sobre o universo das armas de fogo no Brasil. Um espaço
                  onde atiradores esportivos, colecionadores e profissionais de segurança
                  pudessem encontrar informação confiável.
                </p>
                <p>
                  Ao longo de mais de duas décadas, construímos uma reputação de
                  credibilidade editorial. Cada artigo é produzido com rigor técnico
                  e verificação factual, respeitando a legislação vigente e contribuindo
                  para o uso responsável e legal das armas.
                </p>
              </div>
            </div>
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-8 lg:p-10">
              <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">
                Nossos pilares
              </p>
              <div className="flex flex-col gap-5">
                {[
                  { title: "Rigor técnico", desc: "Análises detalhadas por especialistas com experiência comprovada." },
                  { title: "Atualização legislativa", desc: "Cobertura constante das mudanças na legislação de armas e defesa." },
                  { title: "Independência editorial", desc: "Conteúdo livre de conflitos de interesse, voltado ao leitor." },
                  { title: "Responsabilidade", desc: "Promoção do uso legal, seguro e consciente das armas de fogo." },
                ].map((p) => (
                  <div key={p.title} className="flex gap-4">
                    <div className="w-[4px] bg-[#ff1f1f] rounded shrink-0 mt-1" />
                    <div>
                      <p className="text-white text-[15px] font-semibold mb-1">{p.title}</p>
                      <p className="text-[#7a9ab5] text-[13px] leading-[20px]">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="px-5 lg:px-20 pb-16">
          <div className="bg-[#141d2c] h-px mb-10" />
          <p className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase mb-2">
            Time editorial
          </p>
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] leading-none mb-8">
            Quem faz a Magnum
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5 text-center"
              >
                <div className="w-[64px] h-[64px] rounded-full bg-[#141d2c] flex items-center justify-center text-[20px] font-bold text-[#7a9ab5] mx-auto mb-3">
                  {member.initials}
                </div>
                <p className="text-white text-[15px] font-semibold mb-0.5">{member.name}</p>
                <p className="text-white text-[13px]">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 lg:px-20 pb-16">
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1">
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[40px] leading-none mb-3">
                Junte-se a mais de 50 mil leitores
              </h2>
              <p className="text-[#7a9ab5] text-[16px] leading-[26px]">
                Acesse todas as edições, artigos exclusivos e conteúdo especializado
                com uma assinatura Magnum.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/assine"
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[52px] px-8 flex items-center justify-center rounded-[6px] transition-colors whitespace-nowrap"
              >
                Assinar agora →
              </Link>
              <Link
                href="/blog"
                className="bg-[#070a12] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[15px] font-medium h-[52px] px-8 flex items-center justify-center rounded-[6px] transition-colors whitespace-nowrap"
              >
                Ver artigos gratuitos
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
