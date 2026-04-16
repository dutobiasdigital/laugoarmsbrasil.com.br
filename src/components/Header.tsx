import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "./ThemeToggle";
import NavEditionsDropdown from "./NavEditionsDropdown";
import CartIcon from "./CartIcon";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function getBrandLogos(): Promise<{ dark: string; light: string }> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?key=in.(brand.logo_dark,brand.logo_light,brand.logo_main)&select=key,value`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, next: { revalidate: 60 } }
    );
    const rows: { key: string; value: string }[] = await res.json();
    const map: Record<string, string> = {};
    for (const r of rows) if (r.value) map[r.key] = r.value;
    const main = map["brand.logo_main"] || "/logo.png";
    return {
      dark:  map["brand.logo_dark"]  || main,
      light: map["brand.logo_light"] || main,
    };
  } catch {
    return { dark: "/logo.png", light: "/logo.png" };
  }
}

export default async function Header() {
  const supabase = await createClient();
  const [{ data: { user } }, logos] = await Promise.all([
    supabase.auth.getUser(),
    getBrandLogos(),
  ]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#070a12] border-b border-[#141d2c] h-16 flex items-center px-5 lg:px-20">
      <Link href="/" className="flex items-center shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logos.dark}
          alt="Logo"
          className="logo-for-dark h-[52px] w-auto object-contain"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logos.light}
          alt="Logo"
          className="logo-for-light h-[52px] w-auto object-contain"
        />
      </Link>

      <div className="w-12 shrink-0" />

      {/* Nav */}
      <nav className="hidden lg:flex items-center gap-7">
        {[
          { href: "/", label: "HOME" },
          { href: "/guia", label: "GUIA" },
          { href: "/loja", label: "LOJA" },
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
      <div className="flex items-center gap-1">
        {/* Tema claro/escuro */}
        <ThemeToggle />
        {/* Carrinho */}
        <CartIcon />

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
