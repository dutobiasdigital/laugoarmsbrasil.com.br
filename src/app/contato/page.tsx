import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contato — Revista Magnum",
  description: "Entre em contato com a equipe da Revista Magnum. Atendimento para assinantes, redação e publicidade.",
};

const CONTACTS = [
  { icon: "✉", label: "E-mail geral", value: "contato@revistamagnum.com.br", href: "mailto:contato@revistamagnum.com.br" },
  { icon: "📢", label: "Publicidade", value: "publicidade@revistamagnum.com.br", href: "mailto:publicidade@revistamagnum.com.br" },
  { icon: "📰", label: "Redação", value: "redacao@revistamagnum.com.br", href: "mailto:redacao@revistamagnum.com.br" },
  { icon: "💳", label: "Assinaturas", value: "assinaturas@revistamagnum.com.br", href: "mailto:assinaturas@revistamagnum.com.br" },
];

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero strip */}
        <div className="hero-metal border-b border-[#141d2c]">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-20 py-14">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full animate-pulse" />
              <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">
                Fale conosco
              </span>
            </div>
            <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[48px] lg:text-[64px] leading-[0.95] mb-3">
              Contato
            </h1>
            <p className="text-[#7a9ab5] text-[16px] max-w-[520px]">
              Estamos aqui para ajudar. Escolha o canal mais adequado para a sua mensagem.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1200px] mx-auto px-5 lg:px-20 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left — form */}
            <div>
              <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[28px] leading-none mb-6">
                Envie uma mensagem
              </h2>
              <ContactForm />
            </div>

            {/* Right — channels */}
            <div className="flex flex-col gap-4">
              <p className="font-['Barlow_Condensed'] font-bold text-white text-[28px] leading-none mb-2">
                Canais de atendimento
              </p>

              {CONTACTS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="bg-[#0e1520] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[10px] p-5 flex items-center gap-4 transition-colors group"
                >
                  <div className="w-[44px] h-[44px] bg-[#141d2c] rounded-[8px] flex items-center justify-center text-[20px] shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-[#526888] text-[11px] font-semibold tracking-[0.5px] uppercase mb-0.5">
                      {c.label}
                    </p>
                    <p className="text-[#d4d4da] text-[14px] group-hover:text-white transition-colors">
                      {c.value}
                    </p>
                  </div>
                </a>
              ))}

              <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5 mt-1">
                <p className="text-[#526888] text-[11px] font-semibold tracking-[0.5px] uppercase mb-3">
                  Horário de atendimento
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#7a9ab5] text-[14px]">Segunda — Sexta</span>
                    <span className="text-[#d4d4da] text-[14px] font-medium">9h às 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a9ab5] text-[14px]">Sábado</span>
                    <span className="text-[#d4d4da] text-[14px] font-medium">9h às 13h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a9ab5] text-[14px]">Domingo</span>
                    <span className="text-white text-[14px]">Fechado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
