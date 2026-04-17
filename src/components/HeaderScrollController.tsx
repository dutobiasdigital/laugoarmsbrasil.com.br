"use client";

import { useEffect } from "react";

/**
 * HeaderScrollController
 * Esconde o header ao rolar para baixo e reexibe ao rolar para cima.
 * Funciona em todos os dispositivos — sem alterar o Header (server component).
 */
export default function HeaderScrollController() {
  useEffect(() => {
    let lastY   = window.scrollY;
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const header = document.querySelector<HTMLElement>("header");
        if (header) {
          const currentY = window.scrollY;
          if (currentY > lastY && currentY > 80) {
            // Rolando para baixo — esconde
            header.style.transform = "translateY(-100%)";
          } else {
            // Rolando para cima (ou no topo) — mostra
            header.style.transform = "translateY(0)";
          }
          lastY = currentY;
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
