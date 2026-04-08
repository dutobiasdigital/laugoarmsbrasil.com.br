import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="text-sm font-bold tracking-widest text-white font-['Barlow_Condensed'] mb-3">
              REVISTA MAGNUM
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              O maior acervo especializado em armas, munições e legislação do Brasil. Desde 1985.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Navegação
            </p>
            <ul className="space-y-2">
              {[
                { href: "/edicoes", label: "Edições" },
                { href: "/blog", label: "Blog" },
                { href: "/assine", label: "Assine" },
                { href: "/auth/login", label: "Entrar" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Legal
            </p>
            <ul className="space-y-2">
              {[
                { href: "/termos", label: "Termos de Uso" },
                { href: "/privacidade", label: "Política de Privacidade" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-600">
            © {new Date().getFullYear()} Revista Magnum. Todos os direitos reservados.
          </p>
          <p className="text-[11px] text-zinc-700">
            Desenvolvido por{" "}
            <a
              href="https://arkelab.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              arkeLAB
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
