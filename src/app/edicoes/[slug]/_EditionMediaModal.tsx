"use client";

import { useState, useEffect, useCallback } from "react";

interface GalleryImage {
  url: string;
  storage_path: string;
  order: number;
}

interface Props {
  videoUrl: string | null;
  galleryImages: GalleryImage[];
}

export default function EditionMediaModal({ videoUrl, galleryImages }: Props) {
  const [open, setOpen]           = useState(false);
  const [tab, setTab]             = useState<"video" | "gallery">("video");
  const [slide, setSlide]         = useState(0);

  const hasVideo   = !!videoUrl;
  const hasGallery = galleryImages.length > 0;

  if (!hasVideo && !hasGallery) return null;

  const prev = useCallback(() =>
    setSlide(s => (s - 1 + galleryImages.length) % galleryImages.length), [galleryImages.length]);
  const next = useCallback(() =>
    setSlide(s => (s + 1) % galleryImages.length), [galleryImages.length]);

  function openWith(t: "video" | "gallery") {
    setTab(t);
    if (t === "gallery") setSlide(0);
    setOpen(true);
  }

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")      setOpen(false);
      if (e.key === "ArrowLeft"  && tab === "gallery") prev();
      if (e.key === "ArrowRight" && tab === "gallery") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, tab, prev, next]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Botões de acesso ── */}
      <div className="flex flex-wrap gap-2">
        {hasVideo && (
          <button
            onClick={() => openWith("video")}
            className="flex items-center gap-2 h-[40px] px-5 rounded-[4px] border border-[#1c2a3e] bg-[#0e1520] hover:border-[#ff1f1f]/60 text-[#7a9ab5] hover:text-white text-[13px] font-semibold transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Assistir Vídeo
          </button>
        )}
        {hasGallery && (
          <button
            onClick={() => openWith("gallery")}
            className="flex items-center gap-2 h-[40px] px-5 rounded-[4px] border border-[#1c2a3e] bg-[#0e1520] hover:border-[#ff1f1f]/60 text-[#7a9ab5] hover:text-white text-[13px] font-semibold transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
            Ver Galeria
            <span className="text-[10px] opacity-50 font-mono">({galleryImages.length})</span>
          </button>
        )}
      </div>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-[#0a0f1a] border border-[#1c2a3e] rounded-[16px] w-full max-w-[960px] shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "90vh" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#141d2c] shrink-0">
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-[#070a12] rounded-[8px] p-1">
                {hasVideo && (
                  <button
                    onClick={() => setTab("video")}
                    className={`flex items-center gap-2 h-[30px] px-4 rounded-[6px] text-[12px] font-semibold transition-all ${
                      tab === "video" ? "bg-[#ff1f1f] text-white" : "text-[#526888] hover:text-white"
                    }`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                    Vídeo
                  </button>
                )}
                {hasGallery && (
                  <button
                    onClick={() => setTab("gallery")}
                    className={`flex items-center gap-2 h-[30px] px-4 rounded-[6px] text-[12px] font-semibold transition-all ${
                      tab === "gallery" ? "bg-[#ff1f1f] text-white" : "text-[#526888] hover:text-white"
                    }`}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                      <polyline points="21,15 16,10 5,21" />
                    </svg>
                    Galeria <span className="opacity-40 font-mono text-[10px]">{galleryImages.length}</span>
                  </button>
                )}
              </div>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-full text-[#526888] hover:text-white hover:bg-white/10 transition-all"
                aria-label="Fechar"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M11.5 3.5L3.5 11.5M3.5 3.5l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">

              {/* ── Vídeo ── */}
              {tab === "video" && hasVideo && (
                <div className="flex-1 flex items-center justify-center bg-black p-4">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    key={videoUrl}
                    src={videoUrl!}
                    controls
                    autoPlay
                    className="w-full rounded-[8px] max-h-full"
                    style={{ maxHeight: "calc(90vh - 120px)" }}
                  />
                </div>
              )}

              {/* ── Galeria ── */}
              {tab === "gallery" && hasGallery && (
                <div className="flex flex-col flex-1 overflow-hidden">
                  {/* Imagem principal */}
                  <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden"
                    style={{ minHeight: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={galleryImages[slide].url}
                      alt={`Imagem ${slide + 1} de ${galleryImages.length}`}
                      className="max-w-full max-h-full object-contain select-none"
                      style={{ maxHeight: "calc(90vh - 180px)" }}
                      draggable={false}
                    />

                    {/* Contador */}
                    <span className="absolute top-3 right-3 bg-black/70 text-white text-[11px] font-mono px-2.5 py-1 rounded-full">
                      {slide + 1} / {galleryImages.length}
                    </span>

                    {/* Setas */}
                    {galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={prev}
                          className="absolute left-3 w-[42px] h-[42px] bg-black/60 hover:bg-[#ff1f1f] text-white text-[22px] flex items-center justify-center rounded-full transition-all"
                          aria-label="Anterior"
                        >‹</button>
                        <button
                          onClick={next}
                          className="absolute right-3 w-[42px] h-[42px] bg-black/60 hover:bg-[#ff1f1f] text-white text-[22px] flex items-center justify-center rounded-full transition-all"
                          aria-label="Próxima"
                        >›</button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {galleryImages.length > 1 && (
                    <div className="shrink-0 flex gap-2 px-4 py-3 overflow-x-auto bg-[#070a12] border-t border-[#141d2c]"
                      style={{ scrollbarWidth: "thin" }}>
                      {galleryImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSlide(i)}
                          className={`shrink-0 w-[56px] h-[56px] rounded-[6px] overflow-hidden border-2 transition-all ${
                            i === slide
                              ? "border-[#ff1f1f] opacity-100"
                              : "border-transparent opacity-40 hover:opacity-80"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
