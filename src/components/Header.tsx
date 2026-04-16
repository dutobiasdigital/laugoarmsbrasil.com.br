import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "./ThemeToggle";
import NavEditionsDropdown from "./NavEditionsDropdown";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#070a12] border-b border-[#141d2c] h-16 flex items-center px-5 lg:px-20">
      {/* Logo — substitua /logo.png pelo logotipo oficial */}
      <Link href="/" className="flex items-center shrink-0">
        <Image
          src="/logo.png"
          alt="Revista Magnum"
          width={200}
          height={64}
          className="h-[52px] w-auto object-contain"
          priority
        />
      </Link>

      <div className="w-12 shrink-0" />

      {/* Nav */}
      <nav className="hidden lg:flex items-center gap-7">
        {[
          { href: "/", label: "HOME" },
          { href: "/guia", label: "GUIA" },
          { href: "/assine", label: "ASSINE" },
          { href: "/anuncie", label: "ANUNCIE" },
          { href: "/blog", label: "BLOG" },
          { href: "/sobre", label: "SOBRE" },
          { href: "/contato", label: "CONTATO" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-1 text-[#7a9ab5] hover:text-white text-[13px] font-semibold transition-colors"
          >
            {item.label}
          </Link>
        ))}
        <NavEditionsDropdown />
      </nav>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Tema claro/escuro */}
        <ThemeToggle />

        {user ? (
          <Link
            href="/minha-conta"
            className="border border-[#1c2a3e] text-[#7a9ab5] hover:text-white hover:border-zinc-500 text-[13px] font-semibold px-4 py-2 rounded transition-colors"
          >
            Minha conta
          </Link>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="border border-[#1c2a3e] text-[#7a9ab5] hover:text-white hover:border-zinc-500 text-[13px] font-semibold px-4 py-2 rounded transition-colors hidden sm:flex"
            >
              Entrar
            </Link>
            <Link
              href="/assine"
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold px-5 py-2 rounded transition-colors"
            >
              Assine
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
