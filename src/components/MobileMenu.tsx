"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DEFAULT_NAV = [
  { href: "/",        label: "Home"    },
  { href: "/sobre",   label: "Sobre"   },
  { href: "/contato", label: "Contato" },
];

export default function MobileMenu({
  isLoggedIn,
  logoUrl,
  navItems,
}: {
  isLoggedIn: boolean;
  logoUrl: string;
  navItems?: { href: string; label: string }[];
}) {
  const NAV_ITEMS = navItems ?? DEFAULT_NAV;
  const [open, setOpen]       = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname              = usePathname();

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(() => setOpen(false), 320);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [close]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Botão hamburguer */}
      <button
        onClick={handleOpen}
        className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-[4px] hover:bg-[#0e1520] transition-colors group"
        aria-label="Abrir menu"
      >
        <span className="block w-5 h-[1.5px] bg-[#7a9ab5] group-hover:bg-white rounded-full transition-colors mb-[5px]" />
        <span className="block w-5 h-[1.5px] bg-[#7a9ab5] group-hover:bg-white rounded-full transition-colors mb-[5px]" />
        <span className="block w-3 h-[1.5px] bg-[#C99A3F] rounded-full self-end" />
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[999] flex flex-col bg-[#0A0A0B]"
          style={{
            opacity:   visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.3s ease, transform 0.32s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Glow ouro superior direito */}
          <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,154,63,0.08) 0%, transparent 70%)" }} />
          {/* Grade decorativa */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg,#C99A3F 0,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#C99A3F 0,transparent 1px,transparent 60px)" }} />
          {/* Stripe vertical ouro */}
          <div className="absolute left-7 top-[20%] bottom-[20%] w-[1px] rounded-full pointer-events-none"
            style={{ background: "linear-gradient(180deg,transparent,rgba(201,154,63,0.4) 30%,rgba(201,154,63,0.4) 70%,transparent)" }} />

          {/* Topbar */}
          <div className="relative z-10 flex items-center justify-between px-6 h-16 shrink-0 border-b border-white/[0.05]">
            <Link href="/" onClick={close} className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Laúgo Arms Brasil" className="w-auto max-w-[218px] h-auto object-contain" />
            </Link>
            <button
              onClick={close}
              className="w-10 h-10 flex items-center justify-center rounded border border-white/10 hover:border-[#C99A3F]/50 text-[#5C5C66] hover:text-white transition-all"
              aria-label="Fechar menu"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1.5 1.5l12 12M13.5 1.5l-12 12"/>
              </svg>
            </button>
          </div>

          {/* Nav items */}
          <nav className="relative z-10 flex-1 overflow-y-auto flex flex-col justify-center px-6 py-8 gap-1">
            {NAV_ITEMS.map((item, i) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="group flex items-center justify-between py-3.5 border-b border-white/[0.04] last:border-0"
                  style={{
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? "translateX(0)" : "translateX(-20px)",
                    transition: `opacity 0.35s ease ${100 + i * 60}ms, transform 0.35s ease ${100 + i * 60}ms`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="w-[5px] h-[5px] shrink-0 transition-all duration-300"
                      style={{
                        background: active ? "#C99A3F" : "rgba(201,154,63,0.25)",
                        boxShadow:  active ? "0 0 8px rgba(201,154,63,0.6)" : "none",
                        transform:  active ? "scale(1.4)" : "scale(1)",
                      }}
                    />
                    <span
                      className="font-['Archivo'] font-bold tracking-wide transition-colors duration-200 uppercase"
                      style={{
                        fontSize:   "clamp(28px, 7vw, 38px)",
                        lineHeight: 1,
                        color:      active ? "#ffffff" : "#5C5C66",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>

                  <span
                    style={{ color: "#C99A3F" }}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-6px] group-hover:translate-x-0"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 10h12M10 4l6 6-6 6"/>
                    </svg>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer auth */}
          <div
            className="relative z-10 shrink-0 px-6 pb-8 pt-5 border-t border-white/[0.05]"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.35s ease 380ms, transform 0.35s ease 380ms",
            }}
          >
            {isLoggedIn ? (
              <Link
                href="/admin"
                onClick={close}
                className="flex items-center justify-center gap-2 w-full h-[52px] rounded text-[#8A8A95] hover:text-white text-[15px] font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,154,63,0.2)" }}
              >
                Painel Admin
              </Link>
            ) : (
              <Link
                href="/auth/login"
                onClick={close}
                className="flex items-center justify-center w-full h-[52px] rounded text-[#8A8A95] hover:text-white text-[15px] font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(28,42,62,0.8)" }}
              >
                Entrar
              </Link>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
