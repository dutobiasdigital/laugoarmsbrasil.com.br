"use client";

export default function TabHome() {
  const cards = [
    { icon: "🏢", title: "Empresa",      desc: "Identidade, design system, filiais e redes sociais", tab: "empresa" },
    { icon: "🌐", title: "SEO",          desc: "Meta tags, palavras-chave e imagens OG", tab: "seo" },
    { icon: "💳", title: "Pagamentos",   desc: "Gateways e configurações de cobrança", tab: "pagamentos" },
    { icon: "🧩", title: "Módulos",      desc: "Paginação, scroll infinito e paywall por módulo", tab: "modulos" },
    { icon: "📄", title: "Páginas",      desc: "Termos de uso e política de privacidade", tab: "paginas" },
    { icon: "📧", title: "E-mails",      desc: "SMTP, templates e notificações", tab: "emails" },
    { icon: "🔌", title: "Integrações",  desc: "Analytics, APIs e serviços externos", tab: "integracoes" },
    { icon: "🔐", title: "Acesso",       desc: "Usuários administrativos e permissões", tab: "acesso" },
    { icon: "⚙️", title: "Sistema",     desc: "Regional, fuso horário e informações técnicas", tab: "sistema" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[760px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">
          Configurações
        </h2>
        <p className="text-[#526888] text-[13px]">
          Gerencie todos os aspectos do site — identidade, SEO, pagamentos, e-mails e integrações.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((c) => (
          <div
            key={c.tab}
            className="bg-[#0e1520] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[12px] p-5 flex items-start gap-4 transition-colors cursor-default"
          >
            <span className="text-[28px] mt-0.5">{c.icon}</span>
            <div>
              <p className="font-['Barlow_Condensed'] font-bold text-white text-[16px] leading-tight">{c.title}</p>
              <p className="text-[#526888] text-[12px] mt-0.5">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-5 flex items-center gap-4">
        <span className="text-[28px]">💡</span>
        <div>
          <p className="text-white text-[13px] font-semibold mb-0.5">Dica</p>
          <p className="text-[#526888] text-[12px]">
            Use o menu lateral para navegar entre as seções. Alterações são salvas individualmente em cada aba.
          </p>
        </div>
      </div>
    </div>
  );
}
