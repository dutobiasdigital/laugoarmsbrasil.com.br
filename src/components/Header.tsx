import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeaderScrollController from "./HeaderScrollController";
import MobileMenu from "./MobileMenu";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function getBrandLogo(): Promise<string> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?key=in.(brand.logo_dark,brand.logo_main)&select=key,value`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const rows: { key: string; value: string }[] = await res.json();
    const map: Record<string, string> = {};
    for (const r of rows) if (r.value) map[r.key] = r.value;
    return map["brand.logo_dark"] || map["brand.logo_main"] || "/logo.png";
  } catch {
    return "/logo.png";
  }
}

const NAV = [
  { href: "/",       label: "HOME"    },
  { href: "/sobre",  label: "SOBRE"   },
  { href: "/contato",label: "CONTATO" },
];

export default async function Header() {
  const supabase = await createClient();
  const [{ data: { user } }, logoUrl] = await Promise.all([
    supabase.auth.getUser(),
    getBrandLogo(),
  ]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#070a12] border-b border-[#141d2c] h-16 flex items-center px-5 lg:px-20 transition-transform duration-300">
      <HeaderScrollController />

      <Link href="/" className="flex items-center shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="Laúgo Arms Brasil" className="h-[52px] w-auto object-contain" />
      </Link>

      <div className="w-12 shrink-0" />

      {/* Nav desktop */}
      <nav className="hidden lg:flex items-center gap-7">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-[#7a9ab5] hover:text-white text-[13px] font-semibold tracking-[0.06em] transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {user ? (
          <Link
            href="/admin"
            className="hidden lg:flex border border-[#1c2a3e] text-[#7a9ab5] hover:text-white hover:border-zinc-500 text-[13px] font-semibold px-4 py-2 rounded transition-colors"
          >
            Admin
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="border border-[#1c2a3e] text-[#7a9ab5] hover:text-white hover:border-zinc-500 text-[13px] font-semibold px-4 py-2 rounded transition-colors hidden lg:flex"
          >
            Entrar
          </Link>
        )}

        {/* Mobile menu */}
        <MobileMenu isLoggedIn={!!user} logoUrl={logoUrl} />
      </div>
    </header>
  );
}
