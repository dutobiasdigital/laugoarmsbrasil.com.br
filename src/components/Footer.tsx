import Image from "next/image";
import Link from "next/link";

/* ── Social icon SVGs ─────────────────────────────────────────── */
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}
function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
  );
}
function IconTiktok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.84 4.84 0 01-1.02-.07z"/>
    </svg>
  );
}
function IconLinkedin() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

const SOCIAL_META = [
  { key: "social.instagram", label: "Instagram",   Icon: IconInstagram },
  { key: "social.facebook",  label: "Facebook",    Icon: IconFacebook  },
  { key: "social.youtube",   label: "YouTube",     Icon: IconYoutube   },
  { key: "social.twitter",   label: "X (Twitter)", Icon: IconX         },
  { key: "social.tiktok",    label: "TikTok",      Icon: IconTiktok    },
  { key: "social.linkedin",  label: "LinkedIn",    Icon: IconLinkedin  },
];

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

interface FooterColData { title: string; links: { label: string; url: string }[] }

async function getFooterData(): Promise<{ social: Record<string, string>; cols: FooterColData[] }> {
  if (!SERVICE) return { social: {}, cols: [] };
  try {
    const socialKeys = SOCIAL_META.map((s) => s.key).join(",");
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?key=in.(${socialKeys},nav.footer)&select=key,value`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const rows: { key: string; value: string | null }[] = await res.json();
    if (!Array.isArray(rows)) return { social: {}, cols: [] };

    const social: Record<string, string> = {};
    let cols: FooterColData[] = [];

    for (const r of rows) {
      if (!r.value?.trim()) continue;
      if (r.key === "nav.footer") {
        try {
          const parsed = JSON.parse(r.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cols = parsed.map((c: { title?: string; links?: { label: string; url: string }[] }) => ({
              title: c.title ?? "",
              links: Array.isArray(c.links) ? c.links.map((l) => ({ label: l.label, url: l.url })) : [],
            }));
          }
        } catch { /* use empty */ }
      } else {
        social[r.key] = r.value.trim();
      }
    }
    return { social, cols };
  } catch { return { social: {}, cols: [] }; }
}

/* ── Nav column helper ────────────────────────────────────────── */
function NavCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#526888] uppercase tracking-[1.8px] mb-3">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[13px] text-[#7a9ab5] hover:text-white transition-colors leading-none"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Footer ───────────────────────────────────────────────────── */
export default async function Footer() {
  const { social: socialLinks, cols: footerCols } = await getFooterData();
  const activeSocial = SOCIAL_META
    .filter(({ key }) => !!socialLinks[key])
    .map(({ key, label, Icon }) => ({ href: socialLinks[key], label, Icon }));

  return (
    <footer className="bg-[#070a12] border-t border-[#141d2c] mt-auto">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-20 py-10 sm:py-14">

        {/* ── Top section ── */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 mb-8 sm:mb-10">

          {/* Brand block */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:w-[220px] shrink-0">
            <div className="mb-3">
              <Image
                src="/logo.png"
                alt="Laúgo Arms Brasil"
                width={160}
                height={64}
                className="h-[52px] w-auto object-contain"
              />
            </div>
            <p className="text-[12px] text-[#526888] leading-relaxed max-w-[240px] mb-4">
              O maior acervo especializado em armas, munições e legislação do Brasil. Desde 1985.
            </p>

            {/* Social icons */}
            {activeSocial.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                {activeSocial.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[#526888] hover:text-white hover:bg-[#ff1f1f] hover:border-[#ff1f1f] border border-[#1c2a3e] transition-all duration-200"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Separator — vertical on desktop, horizontal on mobile */}
          <div className="hidden sm:block w-px bg-[#141d2c] self-stretch" />
          <div className="block sm:hidden h-px bg-[#141d2c]" />

          {/* Nav grid — dinâmico via admin ou fallback padrão */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-7 flex-1">
            {footerCols.length > 0
              ? footerCols.map((col, i) => (
                  <NavCol
                    key={i}
                    title={col.title}
                    links={col.links.map((l) => ({ href: l.url, label: l.label }))}
                  />
                ))
              : (
                <>
                  <NavCol title="Loja" links={[
                    { href: "/loja",    label: "Produtos" },
                    { href: "/sobre",   label: "Sobre"    },
                    { href: "/anuncie", label: "Anuncie"  },
                    { href: "/contato", label: "Contato"  },
                  ]} />
                  <NavCol title="Legal" links={[
                    { href: "/termos-de-uso",           label: "Termos de Uso"           },
                    { href: "/politica-de-privacidade", label: "Política de Privacidade" },
                  ]} />
                </>
              )
            }
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-[#0e1520] pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-[#526888] text-center sm:text-left">
            © {new Date().getFullYear()} Laúgo Arms Brasil. Todos os direitos reservados.
          </p>
          <a
            href="https://arkelab.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#526888] hover:text-white transition-colors"
          >
            Desenvolvido por arkeLAB
          </a>
        </div>

      </div>
    </footer>
  );
}
