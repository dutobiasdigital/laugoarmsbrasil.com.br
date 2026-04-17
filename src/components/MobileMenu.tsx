"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: "/edicoes",
    label: "Edições",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
  },
  {
    href: "/guia",
    label: "Guia Comercial",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    href: "/loja",
    label: "Loja",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    href: "/blog",
    label: "Blog",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    href: "/assine",
    label: "Assine",
    highlight: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    href: "/anuncie",
    label: "Anuncie",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    href: "/sobre",
    label: "Sobre",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
  {
    href: "/contato",
    label: "Contato",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
];

export default function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen]       = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname              = usePathname();

  const close = useCallback(() => setOpen(false), []);

  // Anima entrada dos itens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [open]);

  // Trava scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ESC fecha
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [close]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Botão Hamburguer ───────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden relative flex flex-col justify-center items-center w-10 h-10 rounded-[8px] hover:bg-[#0e1520] transition-colors group"
        aria-label="Abrir menu"
        aria-expanded={open}
      >
        <span className="block w-[20px] h-[1.5px] bg-[#7a9ab5] group-hover:bg-white rounded-full transition-colors mb-[5px]" />
        <span className="block w-[20px] h-[1.5px] bg-[#7a9ab5] group-hover:bg-white rounded-full transition-colors mb-[5px]" />
        <span className="block w-[14px] h-[1.5px] bg-[#ff1f1f] rounded-full self-end transition-all" />
      </button>

      {/* ── Overlay + Drawer ──────────────────────────────── */}
      {open && (
        <>
          {/* Backdrop com blur */}
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
            onClick={close}
            aria-hidden
            style={{ animation: "fadeIn 0.2s ease both" }}
          />

          {/* Drawer */}
          <div
            className="fixed top-0 right-0 bottom-0 z-[70] w-[320px] max-w-[92vw] flex flex-col"
            style={{
              background: "linear-gradient(160deg, #0a0e18 0%, #070a12 60%, #0d0811 100%)",
              borderLeft: "1px solid rgba(255,31,31,0.12)",
              boxShadow: "-20px 0 60px rgba(0,0,0,0.7), -1px 0 0 rgba(255,255,255,0.04)",
              animation: "slideInRight 0.25s cubic-bezier(0.4, 0, 0.2, 1) both",
            }}
          >
            {/* Glow decorativo no topo */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,31,31,0.06) 0%, transparent 70%)" }} />

            {/* ── Topo: close + marca ── */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-[6px] h-[6px] rounded-full bg-[#ff1f1f]" style={{ boxShadow: "0 0 8px #ff1f1f" }} />
                <span className="font-['Barlow_Condensed'] font-bold text-white text-[16px] tracking-[2px] uppercase">
                  Magnum
                </span>
              </div>
              <button
                onClick={close}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#1c2a3e] hover:border-[#ff1f1f]/40 text-[#526888] hover:text-white transition-all"
                aria-label="Fechar menu"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13"/>
                </svg>
              </button>
            </div>

            {/* Divisor com gradiente */}
            <div className="mx-5 mb-3 h-px" style={{ background: "linear-gradient(90deg, rgba(255,31,31,0.3), rgba(28,42,62,0.4), transparent)" }} />

            {/* ── Nav items ── */}
            <nav className="flex-1 overflow-y-auto px-4 pb-4">
              {NAV_ITEMS.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className="group flex items-center gap-4 px-4 py-3.5 rounded-[12px] mb-1 transition-all relative overflow-hidden"
                    style={{
                      background: active
                        ? "rgba(255,31,31,0.08)"
                        : item.highlight
                        ? "rgba(255,31,31,0.05)"
                        : "transparent",
                      border: active
                        ? "1px solid rgba(255,31,31,0.2)"
                        : "1px solid transparent",
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? "translateX(0)" : "translateX(16px)",
                      transition: `opacity 0.3s ease ${i * 35}ms, transform 0.3s ease ${i * 35}ms, background 0.2s, border 0.2s`,
                    }}
                  >
                    {/* Hover bg */}
                    <span className="absolute inset-0 rounded-[12px] bg-white/0 group-hover:bg-white/[0.04] transition-colors" />

                    {/* Indicador ativo */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full bg-[#ff1f1f]"
                        style={{ boxShadow: "0 0 8px rgba(255,31,31,0.6)" }} />
                    )}

                    {/* Ícone */}
                    <span className={`shrink-0 transition-colors ${
                      active ? "text-[#ff1f1f]" : item.highlight ? "text-[#ff6b6b]" : "text-[#526888] group-hover:text-[#7a9ab5]"
                    }`}>
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span className={`font-['Barlow_Condensed'] font-bold text-[20px] leading-none tracking-[0.5px] transition-colors ${
                      active ? "text-white" : item.highlight ? "text-[#ff9999]" : "text-[#7a9ab5] group-hover:text-white"
                    }`}>
                      {item.label}
                    </span>

                    {/* Seta direita quando hover */}
                    <span className={`ml-auto shrink-0 transition-all ${
                      active ? "opacity-100 text-[#ff1f1f]" : "opacity-0 group-hover:opacity-100 text-[#526888]"
                    }`}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7h8M7 3l4 4-4 4"/>
                      </svg>
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* ── Footer: auth ── */}
            <div
              className="shrink-0 px-4 pb-6 pt-4"
              style={{ borderTop: "1px solid rgba(28,42,62,0.8)" }}
            >
              {isLoggedIn ? (
                <Link
                  href="/minha-conta"
                  onClick={close}
                  className="flex items-center justify-center gap-2 w-full h-[50px] rounded-[12px] font-semibold text-[14px] text-[#7a9ab5] hover:text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(28,42,62,0.8)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  Minha Conta
                </Link>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/auth/login"
                    onClick={close}
                    className="flex-1 flex items-center justify-center h-[50px] rounded-[12px] text-[#7a9ab5] hover:text-white text-[14px] font-semibold transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(28,42,62,0.8)" }}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/assine"
                    onClick={close}
                    className="flex-1 flex items-center justify-center h-[50px] rounded-[12px] text-white text-[14px] font-bold transition-all"
                    style={{
                      background: "linear-gradient(135deg, #ff1f1f, #cc0000)",
                      boxShadow: "0 4px 20px rgba(255,31,31,0.3)",
                    }}
                  >
                    Assinar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </>
  );
}
