import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b] border-b border-[#27272a] h-16 flex items-center px-5 lg:px-20">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Image
          src="/logo.png"
          alt="Revista Magnum"
          width={32}
          height={32}
          className="w-[32px] h-auto"
        />
      </Link>

      <div className="w-12 shrink-0" />

      {/* Nav */}
      <nav className="hidden lg:flex items-center gap-7">
        {[
          { href: "/", label: "HOME" },
          { href: "/edicoes", label: "EDIÇÕES", arrow: true },
          { href: "/assine", label: "ASSINE" },
          { href: "/anuncie", label: "ANUNCIE" },
          { href: "/blog", label: "BLOG" },
          { href: "/sobre", label: "SOBRE" },
          { href: "/contato", label: "CONTATO" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-1 text-[#a1a1aa] hover:text-white text-[13px] font-semibold transition-colors"
          >
            {item.label}
            {item.arrow && <span className="text-[#52525b] text-[11px]">▾</span>}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <span className="text-[#a1a1aa] text-base hidden lg:block">☀</span>

        {user ? (
          <Link
            href="/minha-conta"
            className="border border-[#3f3f46] text-[#a1a1aa] hover:text-white hover:border-zinc-500 text-[13px] font-semibold px-4 py-2 rounded transition-colors"
          >
            Minha conta
          </Link>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="border border-[#3f3f46] text-[#a1a1aa] hover:text-white hover:border-zinc-500 text-[13px] font-semibold px-4 py-2 rounded transition-colors hidden sm:flex"
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
