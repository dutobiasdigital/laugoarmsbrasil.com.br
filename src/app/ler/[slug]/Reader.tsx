"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// ── Tipos do FlipBook ─────────────────────────────────────────────────────────

interface FlipBookProps {
  width: number;
  height: number;
  showCover?: boolean;
  mobileScrollSupport?: boolean;
  usePortrait?: boolean;
  drawShadow?: boolean;
  flippingTime?: number;
  startZIndex?: number;
  clickEventForward?: boolean;
  useMouseEvents?: boolean;
  swipeDistance?: number;
  showPageCorners?: boolean;
  disableFlipByClick?: boolean;
  maxShadowOpacity?: number;
  className?: string;
  style?: React.CSSProperties;
  size?: "fixed" | "stretch";
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  autoSize?: boolean;
  startPage?: number;
  onFlip?: (e: { data: number }) => void;
  onInit?: (e: unknown) => void;
  ref?: React.Ref<unknown>;
  children?: React.ReactNode;
}

// react-pageflip usa DOM/canvas — importação apenas no client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HTMLFlipBook = dynamic(() => import("react-pageflip") as any, {
  ssr: false,
}) as React.ComponentType<FlipBookProps>;

// ── Página individual (forwardRef para o react-pageflip) ──────────────────────

const Page = React.forwardRef<
  HTMLDivElement,
  { url: string; index: number; width: number; height: number }
>(({ url, index, width, height }, ref) => (
  <div
    ref={ref}
    style={{
      width,
      height,
      background: "#0d1422",
      overflow: "hidden",
      position: "relative",
    }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={url}
      alt={`Página ${index + 1}`}
      loading={index < 6 ? "eager" : "lazy"}
      draggable={false}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        userSelect: "none",
        pointerEvents: "none",
      }}
    />
    <span
      style={{
        position: "absolute",
        bottom: 8,
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: 10,
        color: "rgba(255,255,255,0.20)",
        fontFamily: "monospace",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {index + 1}
    </span>
  </div>
));
Page.displayName = "Page";

// ── Calcula dimensões do livro para o viewport ────────────────────────────────

function calcBookSize(vw: number, vh: number, isMobile: boolean) {
  const TOP_BAR    = 48;
  const BOTTOM_BAR = 56;
  const H_PAD      = isMobile ? 8 : 40;
  const PAGE_RATIO = 1211 / 1624; // largura / altura original

  const availH = vh - TOP_BAR - BOTTOM_BAR;
  const availW = vw - H_PAD;

  let pageH: number;
  let pageW: number;

  if (isMobile) {
    // portrait: uma página por vez
    pageH = Math.min(availH, availW / PAGE_RATIO);
    pageW = pageH * PAGE_RATIO;
  } else {
    // landscape: duas páginas lado a lado
    pageH = Math.min(availH, (availW / 2) / PAGE_RATIO);
    pageW = pageH * PAGE_RATIO;
  }

  return {
    width:  Math.floor(Math.max(pageW, 200)),
    height: Math.floor(Math.max(pageH, 300)),
  };
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface ReaderProps {
  slug: string;
  editionTitle: string;
  backUrl: string;
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Reader({ slug, editionTitle, backUrl }: ReaderProps) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);

  const [pages,        setPages]        = useState<string[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [currentPage,  setCurrentPage]  = useState(0);
  const [bookSize,     setBookSize]     = useState({ width: 400, height: 600 });
  const [isMobile,     setIsMobile]     = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ready,        setReady]        = useState(false);

  // Busca as signed URLs das páginas
  useEffect(() => {
    fetch(`/api/editions/${slug}/pages`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data.urls) && data.urls.length > 0) {
          setPages(data.urls);
        } else {
          setError("Nenhuma página encontrada para esta edição.");
        }
      })
      .catch(() => setError("Não foi possível carregar a edição."))
      .finally(() => setLoading(false));
  }, [slug]);

  // Calcula tamanho do livro conforme viewport
  useEffect(() => {
    function update() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setBookSize(calcBookSize(window.innerWidth, window.innerHeight, mobile));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Controles de navegação
  const flipNext = useCallback(() => bookRef.current?.pageFlip().flipNext("bottom"), []);
  const flipPrev = useCallback(() => bookRef.current?.pageFlip().flipPrev("bottom"), []);

  // Atalhos de teclado
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") flipNext();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp"   || e.key === "PageUp")   flipPrev();
      if (e.key === "Escape") router.push(backUrl);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipNext, flipPrev, router, backUrl]);

  // Fullscreen API
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Estado: carregando ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#070a12] flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#ff1f1f]/20 border-t-[#ff1f1f] animate-spin" />
          <p className="text-[#7a9ab5] text-sm">Carregando edição…</p>
        </div>
      </div>
    );
  }

  // ── Estado: erro ou sem páginas ───────────────────────────────────────────
  if (error || pages.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#070a12] flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <span className="text-5xl">📖</span>
          <p className="text-white text-lg font-semibold">
            {error ?? "Conteúdo em preparação"}
          </p>
          <p className="text-[#7a9ab5] text-sm max-w-sm">
            As páginas desta edição ainda estão sendo adicionadas ao sistema.
          </p>
          <button
            onClick={() => router.push(backUrl)}
            className="mt-2 text-[#ff1f1f] hover:underline text-sm"
          >
            ← Voltar para a edição
          </button>
        </div>
      </div>
    );
  }

  // Páginas visíveis no spread atual
  const displayLeft  = currentPage + 1;
  const displayRight = !isMobile && currentPage + 2 <= pages.length ? currentPage + 2 : null;
  const isFirst      = currentPage === 0;
  const isLast       = isMobile
    ? currentPage >= pages.length - 1
    : currentPage >= pages.length - 2;

  return (
    <div className="fixed inset-0 bg-[#0b0f1a] flex flex-col z-50 select-none">

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div
        className="h-12 shrink-0 flex items-center justify-between px-4 gap-4"
        style={{
          background: "linear-gradient(180deg, #080c16 0%, rgba(8,12,22,0.95) 100%)",
          borderBottom: "1px solid rgba(28,42,62,0.8)",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="font-['Barlow_Condensed'] font-black text-white text-[18px] leading-none shrink-0"
            style={{ letterSpacing: "0.04em" }}
          >
            MAGNUM
          </span>
          <span className="text-[#2a3a4e] shrink-0 mx-1">|</span>
          <span className="text-[#7a9ab5] text-[13px] truncate">{editionTitle}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {ready && (
            <span className="text-[#526888] text-[11px] tabular-nums hidden sm:block">
              {displayRight
                ? `${displayLeft}–${displayRight}`
                : `${displayLeft}`}{" "}
              / {pages.length}
            </span>
          )}
          <button
            onClick={() => router.push(backUrl)}
            className="w-8 h-8 flex items-center justify-center rounded text-[#526888] hover:text-white hover:bg-white/8 transition-colors text-[15px]"
            title="Fechar leitor (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Área do livro ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">

        {/* Seta esquerda */}
        <button
          onClick={flipPrev}
          disabled={isFirst}
          className="absolute left-2 z-10 w-10 h-16 flex items-center justify-center rounded-full text-white/35 hover:text-white hover:bg-white/8 disabled:opacity-0 transition-all text-3xl font-light pointer-events-auto"
          title="Página anterior (←)"
        >
          ‹
        </button>

        {/* FlipBook */}
        <HTMLFlipBook
          ref={bookRef}
          width={bookSize.width}
          height={bookSize.height}
          size="fixed"
          showCover={true}
          usePortrait={isMobile}
          drawShadow={true}
          flippingTime={650}
          startZIndex={1}
          maxShadowOpacity={0.5}
          clickEventForward={false}
          useMouseEvents={true}
          swipeDistance={isMobile ? 20 : 30}
          showPageCorners={!isMobile}
          disableFlipByClick={false}
          mobileScrollSupport={false}
          autoSize={false}
          minWidth={150}
          maxWidth={1200}
          minHeight={200}
          maxHeight={1800}
          startPage={0}
          onFlip={(e) => setCurrentPage(e.data)}
          onInit={() => setReady(true)}
          className=""
          style={{}}
        >
          {pages.map((url, i) => (
            <Page
              key={i}
              url={url}
              index={i}
              width={bookSize.width}
              height={bookSize.height}
            />
          ))}
        </HTMLFlipBook>

        {/* Seta direita */}
        <button
          onClick={flipNext}
          disabled={isLast}
          className="absolute right-2 z-10 w-10 h-16 flex items-center justify-center rounded-full text-white/35 hover:text-white hover:bg-white/8 disabled:opacity-0 transition-all text-3xl font-light pointer-events-auto"
          title="Próxima página (→)"
        >
          ›
        </button>
      </div>

      {/* ── Bottom Bar ───────────────────────────────────────────────────── */}
      <div
        className="h-14 shrink-0 flex items-center justify-center gap-3"
        style={{
          background: "linear-gradient(0deg, #080c16 0%, rgba(8,12,22,0.95) 100%)",
          borderTop: "1px solid rgba(28,42,62,0.8)",
        }}
      >
        {/* Prev */}
        <button
          onClick={flipPrev}
          disabled={isFirst}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-[#1c2a3e] hover:border-[#ff1f1f]/50 text-[#7a9ab5] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-2xl font-light"
        >
          ‹
        </button>

        {/* Contador */}
        {ready ? (
          <div className="flex items-center gap-1.5 min-w-[80px] justify-center">
            <span className="text-[#3a4a5e] text-[10px] uppercase tracking-widest hidden sm:block">pág.</span>
            <span className="text-white text-[13px] font-bold tabular-nums">
              {displayRight ? `${displayLeft}–${displayRight}` : `${displayLeft}`}
            </span>
            <span className="text-[#3a4a5e] text-[11px]">/</span>
            <span className="text-[#526888] text-[12px] tabular-nums">{pages.length}</span>
          </div>
        ) : (
          <div className="w-20 h-4 bg-[#1c2a3e]/40 rounded animate-pulse" />
        )}

        {/* Next */}
        <button
          onClick={flipNext}
          disabled={isLast}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-[#1c2a3e] hover:border-[#ff1f1f]/50 text-[#7a9ab5] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-2xl font-light"
        >
          ›
        </button>

        <div className="w-px h-5 bg-[#1c2a3e]" />

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="w-9 h-9 flex items-center justify-center rounded text-[#526888] hover:text-white hover:bg-white/8 transition-colors"
          title={isFullscreen ? "Sair do fullscreen" : "Tela cheia"}
        >
          {isFullscreen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          )}
        </button>

        {/* Ir para capa */}
        <button
          onClick={() => bookRef.current?.pageFlip().turnToPage(0)}
          className="w-9 h-9 flex items-center justify-center rounded text-[#526888] hover:text-white hover:bg-white/8 transition-colors"
          title="Ir para a capa"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
      </div>
    </div>
  );
}
