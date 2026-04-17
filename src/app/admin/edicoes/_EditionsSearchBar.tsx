"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const FILTERS = [
  { value: "",         label: "Todas"      },
  { value: "destaque", label: "⭐ Destaque" },
  { value: "regular",  label: "Regulares"  },
  { value: "especial", label: "Especiais"  },
] as const;

export default function EditionsSearchBar({ initialQ }: { initialQ: string }) {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ]   = useState(initialQ);
  const timer       = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    // always reset to page 1 when filters change
    params.delete("pagina");
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    return `/admin/edicoes${qs ? `?${qs}` : ""}`;
  }

  function handleInput(value: string) {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      router.push(buildUrl({ q: value || undefined }));
    }, 380);
  }

  const activeFiltro = searchParams.get("filtro") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {/* ── Omnisearch ── */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526888] pointer-events-none select-none text-[14px]">
          🔍
        </span>
        <input
          value={q}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Buscar por título ou número..."
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-[#2a3a5e] focus:border-[#ff1f1f] rounded-[6px] h-[38px] pl-9 pr-8 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none w-[300px] transition-colors"
        />
        {q && (
          <button
            type="button"
            onClick={() => handleInput("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#526888] hover:text-white text-[13px] transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Separador ── */}
      <div className="w-px h-5 bg-[#1c2a3e] hidden sm:block" />

      {/* ── Filtros tipo botão ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => router.push(buildUrl({ filtro: f.value || undefined }))}
            className={`h-[38px] px-4 flex items-center text-[13px] font-semibold rounded-[6px] border transition-colors whitespace-nowrap ${
              activeFiltro === f.value
                ? "bg-[#ff1f1f] border-[#ff1f1f] text-white"
                : "bg-[#141d2c] border-[#1c2a3e] text-[#7a9ab5] hover:text-white hover:border-[#2a3a5e]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
