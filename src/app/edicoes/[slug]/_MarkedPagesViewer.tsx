"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  indexUrls: string[];
}

export default function MarkedPagesViewer({ indexUrls }: Props) {
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);

  const close = useCallback(() => setZoomIdx(null), []);

  const prev = useCallback(() =>
    setZoomIdx(i => i !== null ? (i - 1 + indexUrls.length) % indexUrls.length : null),
    [indexUrls.length]);

  const next = useCallback(() =>
    setZoomIdx(i => i !== null ? (i + 1) % indexUrls.length : null),
    [indexUrls.length]);

  useEffect(() => {
    if (zoomIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")      close();
      if (e.key === "ArrowLeft")   prev();
      if (e.key === "ArrowRight")  next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomIdx, close, prev, next]);

  useEffect(() => {
    document.body.style.overflow = zoomIdx !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [zoomIdx]);

  if (indexUrls.length === 0) return null;

  return (
    <>
      {/* ── Miniaturas do índice ── */}
      <div className="shrink-0 flex flex-col gap-2 lg:w-[200px]">
        <p className="text-[#ff1f1f] text-[9px] font-bold tracking-[2px] uppercase">
          {indexUrls.length > 1 ? `Índice · ${indexUrls.length} páginas` : "Índice"}
        </p>
        <div className="flex flex-row lg:flex-col gap-2 flex-wrap">
          {indexUrls.map((url, i) => (
            <button
              key={i}
              onClick={() => setZoomIdx(i)}
              className="group relative rounded-[6px] overflow-hidden transition-all"
              style={{ border: "1px solid var(--border)", width: indexUrls.length === 1 ? "100%" : undefined }}
              title="Clique para ampliar"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Índice página ${i + 1}`}
                className="w-full h-auto block"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                <svg
                  className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                  width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2" strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {zoomIdx !== null && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/92 backdrop-blur-sm p-4"
          onClick={close}
        >
          <div className="relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
            {/* Contador */}
            {indexUrls.length > 1 && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-white/60 text-[12px] font-mono">
                {zoomIdx + 1} / {indexUrls.length}
              </span>
            )}

            {/* Imagem */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={indexUrls[zoomIdx]}
              alt={`Índice ${zoomIdx + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-[8px] shadow-2xl"
              draggable={false}
            />

            {/* Fechar */}
            <button
              onClick={close}
              className="absolute -top-3 -right-3 w-[32px] h-[32px] bg-white/10 hover:bg-[#ff1f1f] text-white rounded-full flex items-center justify-center text-[14px] transition-colors"
              aria-label="Fechar"
            >✕</button>

            {/* Setas */}
            {indexUrls.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-[-52px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-white/10 hover:bg-[#ff1f1f] text-white rounded-full flex items-center justify-center text-[20px] transition-colors"
                  aria-label="Anterior"
                >‹</button>
                <button
                  onClick={next}
                  className="absolute right-[-52px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-white/10 hover:bg-[#ff1f1f] text-white rounded-full flex items-center justify-center text-[20px] transition-colors"
                  aria-label="Próxima"
                >›</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
