"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Props {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: Props) {
  const [active, setActive]       = useState(0);
  const [zoomed, setZoomed]       = useState(false);
  const [lightbox, setLightbox]   = useState(false);
  const [lightboxIdx, setLbIdx]   = useState(0);
  const imgRef                    = useRef<HTMLImageElement>(null);
  const containerRef              = useRef<HTMLDivElement>(null);

  const imgs = images.length > 0 ? images : [null];

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightbox) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setLbIdx(i => Math.min(i + 1, imgs.length - 1));
      if (e.key === "ArrowLeft")  setLbIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [lightbox, imgs.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  }, []);

  const currentSrc = imgs[active];

  return (
    <>
      {/* Main image */}
      <div className="flex flex-col gap-4 select-none">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => currentSrc && setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onClick={() => { if (currentSrc) { setLbIdx(active); setLightbox(true); } }}
          className={`relative aspect-square bg-[#0e1520] border border-[#141d2c] rounded-[16px] overflow-hidden ${currentSrc ? (zoomed ? "cursor-zoom-out" : "cursor-zoom-in") : "cursor-default"}`}
        >
          {currentSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={currentSrc}
              alt={alt}
              className="w-full h-full object-cover"
              style={{
                transform: zoomed ? "scale(1.9)" : "scale(1)",
                transition: zoomed ? "none" : "transform 0.25s ease",
              }}
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[#1c2a3e]">
              <svg width="64" height="64" viewBox="0 0 40 40" fill="none">
                <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="15" cy="17" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 28l9-7 7 6 5-4 11 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <p className="text-[11px] font-semibold">Sem imagem</p>
            </div>
          )}

          {/* Zoom hint */}
          {currentSrc && !zoomed && (
            <button
              onClick={e => { e.stopPropagation(); setLbIdx(active); setLightbox(true); }}
              className="absolute bottom-3 right-3 w-9 h-9 bg-[#070a12]/70 border border-[#1c2a3e] hover:bg-[#141d2c] rounded-[6px] flex items-center justify-center text-[#7a9ab5] hover:text-white transition-colors backdrop-blur-sm"
              aria-label="Ampliar imagem"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M1 1h5M1 1v5M15 1h-5M15 1v5M1 15h5M1 15v-5M15 15h-5M15 15v-5"/>
              </svg>
            </button>
          )}

          {/* Prev/Next arrows (multi-image) */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setActive(i => Math.max(i - 1, 0)); }}
                disabled={active === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#070a12]/70 border border-[#1c2a3e] hover:bg-[#141d2c] rounded-full flex items-center justify-center text-[#7a9ab5] hover:text-white transition-colors disabled:opacity-30 backdrop-blur-sm"
                aria-label="Imagem anterior"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2L4 6l4 4"/></svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); setActive(i => Math.min(i + 1, imgs.length - 1)); }}
                disabled={active === imgs.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#070a12]/70 border border-[#1c2a3e] hover:bg-[#141d2c] rounded-full flex items-center justify-center text-[#7a9ab5] hover:text-white transition-colors disabled:opacity-30 backdrop-blur-sm"
                aria-label="Próxima imagem"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 2l4 4-4 4"/></svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {imgs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {imgs.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`shrink-0 w-[72px] h-[72px] rounded-[8px] border-2 overflow-hidden transition-all ${
                  active === i ? "border-[#ff1f1f]" : "border-[#141d2c] hover:border-[#1c2a3e]"
                }`}
                aria-label={`Ver imagem ${i + 1}`}
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={`${alt} — miniatura ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full bg-[#0e1520]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Fechar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14"/>
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {imgs[lightboxIdx] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgs[lightboxIdx]!}
                alt={alt}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-[8px]"
              />
            )}
          </div>

          {/* Arrows */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setLbIdx(i => Math.max(i - 1, 0)); }}
                disabled={lightboxIdx === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-20"
                aria-label="Anterior"
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2L4 6l4 4"/></svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); setLbIdx(i => Math.min(i + 1, imgs.length - 1)); }}
                disabled={lightboxIdx === imgs.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-20"
                aria-label="Próxima"
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 2l4 4-4 4"/></svg>
              </button>
            </>
          )}

          {/* Counter */}
          {imgs.length > 1 && (
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-[13px]">
              {lightboxIdx + 1} / {imgs.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
