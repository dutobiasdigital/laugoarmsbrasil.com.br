import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeaderScrollController from "./HeaderScrollController";
import MobileMenu from "./MobileMenu";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

interface NavItem { label: string; url: string; children?: NavItem[] }

const DEFAULT_NAV: NavItem[] = [
  { label: "HOME",    url: "/"        },
  { label: "LOJA",    url: "/loja"    },
  { label: "SOBRE",   url: "/sobre"   },
  { label: "CONTATO", url: "/contato" },
];

async function getHeaderData(): Promise<{ logoUrl: string; navItems: NavItem[] }> {
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?key=in.(brand.logo_dark,brand.logo_main,nav.menu)&select=key,value`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const rows: { key: string; value: string | null }[] = await res.json();
    if (!Array.isArray(rows)) return { logoUrl: "/logo.png", navItems: DEFAULT_NAV };

    const map: Record<string, string> = {};
    for (const r of rows) if (r.value) map[r.key] = r.value;

    const logoUrl = map["brand.logo_dark"] || map["brand.logo_main"] || "/logo.png";

    let navItems = DEFAULT_NAV;
    if (map["nav.menu"]) {
      try {
        const parsed = JSON.parse(map["nav.menu"]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = parsed.filter((i: { isActive?: boolean }) => i.isActive !== false);
          if (active.length > 0) {
            navItems = active.map((i: { label: string; url: string; children?: { label: string; url: string; isActive?: boolean }[] }) => ({
              label:    (i.label || "").toUpperCase(),
              url:      i.url || "/",
              children: Array.isArray(i.children)
                ? i.children.filter((c) => c.isActive !== false).map((c) => ({ label: c.label, url: c.url }))
                : undefined,
            }));
          }
        }
      } catch { /* use DEFAULT_NAV */ }
    }

    return { logoUrl, navItems };
  } catch {
    return { logoUrl: "/logo.png", navItems: DEFAULT_NAV };
  }
}

export default async function Header() {
  const supabase = await createClient();
  const [{ data: { user } }, { logoUrl, navItems }] = await Promise.all([
    supabase.auth.getUser(),
    getHeaderData(),
  ]);

  const mobileItems = navItems.map((i) => ({ href: i.url, label: i.label }));

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
        {navItems.map((item) => (
          <div key={item.url} className="relative group">
            <Link
              href={item.url}
              className="text-[#7a9ab5] hover:text-white text-[13px] font-semibold tracking-[0.06em] transition-colors"
            >
              {item.label}
            </Link>

            {/* Dropdown sub-items */}
            {item.children && item.children.length > 0 && (
              <div className="absolute top-full left-0 mt-2 min-w-[180px] bg-[#0e1520] border border-[#1c2a3e] rounded-[8px] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 py-1.5 z-50">
                {item.children.map((child) => (
                  <Link
                    key={child.url}
                    href={child.url}
                    className="block px-4 py-2 text-[13px] text-[#7a9ab5] hover:text-white hover:bg-[#141d2c] transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
        <MobileMenu isLoggedIn={!!user} logoUrl={logoUrl} navItems={mobileItems} />
      </div>
    </header>
  );
}
