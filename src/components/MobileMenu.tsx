"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/",        label: "Home"    },
  { href: "/edicoes", label: "Edições" },
  { href: "/guia",    label: "Guia Comercial" },
  { href: "/loja",    label: "Loja"    },
  { href: "/assine",  label: "Assine"  },
  { href: "/anuncie", label: "Anuncie" },
  { href: "/blog",    label: "Blog"    },
  { href: "/sobre",   label: "Sobre"   },
  { href: "/contato", label: "Contato" },
];

export default function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  // Trava scroll do body quando aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Fecha ao pressionar ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ── Botão hamburguer ─────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-[6px] hover:bg-[#0e1520] transition-colors"
        aria-label="Abrir menu"
        aria-expanded={open}
      >
        <span className="block w-5 h-[2px] bg-[#7a9ab5] rounded-full" />
        <span className="block w-5 h-[2px] bg-[#7a9ab5] rounded-full" />
        <span className="block w-3.5 h-[2px] bg-[#7a9ab5] rounded-full self-end" />
      </button>

      {/* ── Overlay + Drawer ─────────────────────────────── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* Drawer desliza da direita */}
          <div className="fixed top-0 right-0 bottom-0 z-[70] w-[300px] max-w-[90vw] bg-[#070a12] border-l border-[#141d2c] flex flex-col shadow-2xl animate-slide-in-right">

            {/* Header do drawer */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-[#141d2c] shrink-0">
              <span className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[18px] tracking-wide uppercase">
                Menu
              </span>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-[6px] text-[#7a9ab5] hover:text-white hover:bg-[#0e1520] transition-colors"
                aria-label="Fechar menu"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l12 12M14 2L2 14"/>
                </svg>
              </button>
            </div>

            {/* Itens de navegação */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-[#7a9ab5] hover:text-white hover:bg-[#0e1520] text-[15px] font-semibold transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              {/* Divisor */}
              <div className="h-px bg-[#141d2c] mx-1 my-2" />

              {/* Destaque — Assine */}
              <Link
                href="/assine"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 mx-1 h-[46px] bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-bold rounded-[8px] transition-colors"
              >
                Assine agora
              </Link>
            </nav>

            {/* Footer do drawer — auth */}
            <div className="shrink-0 px-4 py-4 border-t border-[#141d2c]">
              {isLoggedIn ? (
                <Link
                  href="/minha-conta"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-full h-[42px] border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[13px] font-semibold rounded-[6px] transition-colors"
                >
                  Minha Conta
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 flex items-center justify-center h-[42px] border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[13px] font-semibold rounded-[6px] transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/assine"
                    onClick={() => setOpen(false)}
                    className="flex-1 flex items-center justify-center h-[42px] bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-bold rounded-[6px] transition-colors"
                  >
                    Assinar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
