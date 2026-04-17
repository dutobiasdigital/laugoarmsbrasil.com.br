"use client";
import { useEffect } from "react";

// Registra acesso do usuário autenticado uma vez a cada 4 horas
// Usa localStorage para evitar chamadas repetidas desnecessárias
export default function AccessLogger() {
  useEffect(() => {
    const KEY = "rm_access_ts";
    const FOUR_H = 4 * 60 * 60 * 1000;
    try {
      const last = localStorage.getItem(KEY);
      const now  = Date.now();
      if (last && now - parseInt(last) < FOUR_H) return;

      fetch("/api/log-access", { method: "POST" })
        .then(r => r.json())
        .then(d => { if (d.ok) localStorage.setItem(KEY, String(now)); })
        .catch(() => {});
    } catch { /* localStorage indisponível (SSR guard) */ }
  }, []);

  return null;
}
