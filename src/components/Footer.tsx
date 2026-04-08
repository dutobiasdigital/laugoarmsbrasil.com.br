import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#09090b] border-t border-[#27272a] mt-auto">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-20 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-1 mb-3">
              <div className="w-[22px] h-[22px] bg-[#ff1f1f] rounded-[2px]" />
              <span className="font-['Barlow_Condensed'] font-extrabold text-[18px] text-[#ff1f1f]">
                MAGNUM
              </span>
            </div>
            <p className="text-xs text-[#52525b] leading-relaxed">
              O maior acervo especializado em armas, munições e legislação do Brasil. Desde 1985.
            </p>
          </div>

          {/* Revista */}
          <div>
            <p className="text-[10px] font-semibold text-[#3f3f46] uppercase tracking-[2px] mb-3">
              Revista
            </p>
            <ul className="space-y-2">
              {[
                { href: "/edicoes", label: "Edições" },
                { href: "/blog", label: "Blog" },
                { href: "/sobre", label: "Sobre" },
                { href: "/anuncie", label: "Anuncie" },
                { href: "/contato", label: "Contato" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Conta */}
          <div>
            <p className="text-[10px] font-semibold text-[#3f3f46] uppercase tracking-[2px] mb-3">
              Conta
            </p>
            <ul className="space-y-2">
              {[
                { href: "/assine", label: "Assine" },
                { href: "/auth/login", label: "Entrar" },
                { href: "/auth/cadastro", label: "Cadastrar" },
                { href: "/minha-conta", label: "Minha conta" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <p className="text-[10px] font-semibold text-[#3f3f46] uppercase tracking-[2px] mb-3">
              Empresa
            </p>
            <ul className="space-y-2">
              {[
                { href: "/termos", label: "Termos de Uso" },
                { href: "/privacidade", label: "Política de Privacidade" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#18181b] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#3f3f46]">
            © {new Date().getFullYear()} Revista Magnum. Todos os direitos reservados.
          </p>
          <a
            href="https://arkelab.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#3f3f46] hover:text-[#52525b] transition-colors"
          >
            Desenvolvido por arkeLAB
          </a>
        </div>
      </div>
    </footer>
  );
}
