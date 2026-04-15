"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export default function EditionSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ]    = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function navigate(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    params.delete("pagina");
    startTransition(() => {
      router.push(`/edicoes?${params.toString()}`);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(q);
  }

  function handleClear() {
    setQ("");
    navigate("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar edição..."
          className="bg-[#141d2c] border border-[#1c2a3e] focus:border-[#526888] rounded-md h-[38px] pl-9 pr-8 text-white text-[14px] placeholder-white/30 focus:outline-none w-[220px] transition-colors"
        />
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#526888] pointer-events-none"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        {q && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#526888] hover:text-white text-[14px] transition-colors leading-none"
            aria-label="Limpar busca"
          >
            ✕
          </button>
        )}
      </div>
      {isPending && (
        <span className="text-[#526888] text-[12px] animate-pulse">buscando…</span>
      )}
    </form>
  );
}
