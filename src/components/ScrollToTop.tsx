"use client";

import { useEffect, useState, useCallback } from "react";

/** Botão flutuante "voltar ao topo" — aparece após SHOW_AFTER px de scroll */
const SHOW_AFTER = 300;

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback(() => {
    setVisible(window.scrollY > SHOW_AFTER);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      className={`
        fixed bottom-6 left-6 z-50
        w-11 h-11 rounded-[8px]
        flex items-center justify-center
        border transition-all duration-300 ease-out
        hover:scale-105 active:scale-95
        ${visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
        }
      `}
      style={{
        background:  "var(--bg-card,    #0e1520)",
        borderColor: "var(--border-mid, #1c2a3e)",
        color:       "var(--brand,      #ff1f1f)",
        boxShadow:   "0 4px 16px rgba(0,0,0,0.4)",
      }}
    >
      {/* Chevron up */}
      <svg
        width="18" height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3.75 11.25 9 5.25l5.25 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
