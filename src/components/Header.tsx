import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/60">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-widest text-white font-['Barlow_Condensed']">
            REVISTA MAGNUM
          </span>
          <span className="text-[9px] text-zinc-600 tracking-[0.25em] uppercase hidden sm:block">
            O mundo das armas
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/edicoes" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Edições
          </Link>
          <Link href="/blog" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Blog
          </Link>
          <Link href="/assine" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Assine
          </Link>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/minha-conta"
              className="text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded transition-colors"
            >
              Minha conta
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block"
              >
                Entrar
              </Link>
              <Link
                href="/assine"
                className="text-sm font-semibold text-white bg-[#ff1f1f] hover:bg-[#cc0000] px-4 py-2 rounded transition-colors"
              >
                Assinar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
