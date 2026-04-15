import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#070a12] border-t border-[#141d2c] mt-auto">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-20 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-10 mb-10">
          {/* Brand — substitua /logo.png pelo logotipo oficial */}
          <div className="sm:col-span-2">
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="Revista Magnum"
                width={200}
                height={80}
                className="h-[64px] w-auto object-contain"
              />
            </div>
            <p className="text-xs text-[#253750] leading-relaxed max-w-[280px]">
              O maior acervo especializado em armas, munições e legislação do Brasil. Desde 1985.
            </p>
          </div>

          {/* Revista */}
          <div>
            <p className="text-[10px] font-semibold text-[#1c2a3e] uppercase tracking-[2px] mb-3">
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
                  <Link href={link.href} className="text-xs text-[#253750] hover:text-[#7a9ab5] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guia */}
          <div>
            <p className="text-[10px] font-semibold text-[#1c2a3e] uppercase tracking-[2px] mb-3">
              Guia Comercial
            </p>
            <ul className="space-y-2">
              {[
                { href: "/guia",            label: "Diretório" },
                { href: "/guia/cadastrar",  label: "Cadastrar empresa" },
                { href: "/guia/busca",      label: "Busca" },
                { href: "/guia/armareiros", label: "Armareiros" },
                { href: "/guia/clubes-de-tiro", label: "Clubes de Tiro" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-[#253750] hover:text-[#7a9ab5] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Conta */}
          <div>
            <p className="text-[10px] font-semibold text-[#1c2a3e] uppercase tracking-[2px] mb-3">
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
                  <Link href={link.href} className="text-xs text-[#253750] hover:text-[#7a9ab5] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <p className="text-[10px] font-semibold text-[#1c2a3e] uppercase tracking-[2px] mb-3">
              Empresa
            </p>
            <ul className="space-y-2">
              {[
                { href: "/termos", label: "Termos de Uso" },
                { href: "/privacidade", label: "Política de Privacidade" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-[#253750] hover:text-[#7a9ab5] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#0e1520] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#1c2a3e]">
            © {new Date().getFullYear()} Revista Magnum. Todos os direitos reservados.
          </p>
          <a
            href="https://arkelab.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#1c2a3e] hover:text-[#253750] transition-colors"
          >
            Desenvolvido por arkeLAB
          </a>
        </div>
      </div>
    </footer>
  );
}
