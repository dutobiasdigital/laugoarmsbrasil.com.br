"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/",        label: "Home"           },
  { href: "/edicoes", label: "Edições"         },
  { href: "/guia",    label: "Guia Comercial"  },
  { href: "/loja",    label: "Loja"            },
  { href: "/blog",    label: "Blog"            },
  { href: "/assine",  label: "Assine",  accent: true },
  { href: "/anuncie", label: "Anuncie"          },
  { href: "/sobre",   label: "Sobre"            },
  { href: "/contato", label: "Contato"          },
];

export default function MobileMenu({
  isLoggedIn,
  logoUrl,
}: {
  isLoggedIn: boolean;
  logoUrl: string;
}) {
  const [open, setOpen]     = useState(false);
  const [visible, setVisible] = useState(false); // controla animação de entrada
  const pathname            = usePathname();

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(() => setOpen(false), 320); // aguarda animação de saída
  }, []);

  // Abre: monta primeiro, depois dispara animação
  const handleOpen = () => {
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  };

  // Trava scroll do body
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
      {/* ── Botão hamburguer ────────────────────────────── */}
      <button
        onClick={handleOpen}
        className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-[8px] hover:bg-[#0e1520] transition-colors group"
        aria-label="Abrir menu"
      >
        <span className="block w-5 h-[1.5px] bg-[#7a9ab5] group-hover:bg-white rounded-full transition-colors mb-[5px]" />
        <span className="block w-5 h-[1.5px] bg-[#7a9ab5] group-hover:bg-white rounded-full transition-colors mb-[5px]" />
        <span className="block w-3 h-[1.5px] bg-[#ff1f1f] rounded-full self-end" />
      </button>

      {/* ── Full-screen overlay (portal → body, escapa do transform do header) ── */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-[999] flex flex-col hero-metal"
          style={{
            opacity:    visible ? 1 : 0,
            transform:  visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.3s ease, transform 0.32s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Glow vermelho superior direito */}
          <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,31,31,0.07) 0%, transparent 70%)" }} />
          {/* Glow azul-aço inferior esquerdo */}
          <div className="absolute bottom-0 -left-20 w-[350px] h-[350px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(122,154,181,0.05) 0%, transparent 70%)" }} />
          {/* Grade decorativa */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg,#7a9ab5 0,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#7a9ab5 0,transparent 1px,transparent 60px)" }} />
          {/* Stripe vermelha vertical */}
          <div className="absolute left-7 top-[20%] bottom-[20%] w-[2px] rounded-full pointer-events-none"
            style={{ background: "linear-gradient(180deg,transparent,rgba(255,31,31,0.5) 30%,rgba(255,31,31,0.5) 70%,transparent)" }} />

          {/* ── Topbar ── */}
          <div className="relative z-10 flex items-center justify-between px-6 h-16 shrink-0 border-b border-white/[0.05]">
            {/* Logo */}
            <Link href="/" onClick={close} className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Laúgo Arms Brasil" className="h-[44px] w-auto object-contain" />
            </Link>

            {/* Botão fechar */}
            <button
              onClick={close}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-[#ff1f1f]/50 text-[#526888] hover:text-white transition-all"
              aria-label="Fechar menu"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1.5 1.5l12 12M13.5 1.5l-12 12"/>
              </svg>
            </button>
          </div>

          {/* ── Nav items ── */}
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
                    opacity:   visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-20px)",
                    transition: `opacity 0.35s ease ${100 + i * 45}ms, transform 0.35s ease ${100 + i * 45}ms`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Indicador ativo */}
                    <span
                      className="w-[6px] h-[6px] rounded-full shrink-0 transition-all duration-300"
                      style={{
                        background: active ? "#ff1f1f" : item.accent ? "rgba(255,31,31,0.4)" : "rgba(82,104,136,0.4)",
                        boxShadow: active ? "0 0 8px #ff1f1f" : "none",
                        transform: active ? "scale(1.4)" : "scale(1)",
                      }}
                    />
                    <span
                      className="font-['Barlow_Condensed'] font-bold tracking-wide transition-colors duration-200"
                      style={{
                        fontSize: "clamp(28px, 7vw, 38px)",
                        lineHeight: 1,
                        color: active
                          ? "#ffffff"
                          : item.accent
                          ? "#ff6b6b"
                          : "#7a9ab5",
                      }}
                    >
                      {item.label}
                    </span>
                    {item.accent && (
                      <span className="text-[10px] font-bold tracking-[1.5px] uppercase px-2 py-[2px] rounded-full bg-[#ff1f1f]/20 text-[#ff6b6b] border border-[#ff1f1f]/20">
                        Assinar
                      </span>
                    )}
                  </div>

                  {/* Seta hover */}
                  <span className="text-[#ff1f1f] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-6px] group-hover:translate-x-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 10h12M10 4l6 6-6 6"/>
                    </svg>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* ── Footer auth ── */}
          <div
            className="relative z-10 shrink-0 px-6 pb-8 pt-5 border-t border-white/[0.05]"
            style={{
              opacity:   visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.35s ease 520ms, transform 0.35s ease 520ms",
            }}
          >
            {isLoggedIn ? (
              <Link
                href="/minha-conta"
                onClick={close}
                className="flex items-center justify-center gap-2 w-full h-[52px] rounded-[14px] font-semibold text-[15px] text-[#7a9ab5] hover:text-white transition-all"
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
                  className="flex-1 flex items-center justify-center h-[52px] rounded-[14px] text-[#7a9ab5] hover:text-white text-[15px] font-semibold transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(28,42,62,0.8)" }}
                >
                  Entrar
                </Link>
                <Link
                  href="/assine"
                  onClick={close}
                  className="flex-[2] flex items-center justify-center h-[52px] rounded-[14px] text-white text-[15px] font-bold transition-all hover:brightness-110"
                  style={{
                    background: "linear-gradient(135deg,#ff1f1f 0%,#cc0000 100%)",
                    boxShadow: "0 4px 24px rgba(255,31,31,0.35)",
                  }}
                >
                  Assinar agora →
                </Link>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
