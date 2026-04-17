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

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcBookSize(vw: number, vh: number, isMobile: boolean) {
  const TOP_BAR    = 48;
  const BOTTOM_BAR = 56;
  const H_PAD      = isMobile ? 8 : 40;
  const PAGE_RATIO = 1211 / 1624;

  const availH = vh - TOP_BAR - BOTTOM_BAR;
  const availW = vw - H_PAD;

  let pageH: number, pageW: number;
  if (isMobile) {
    pageH = Math.min(availH, availW / PAGE_RATIO);
    pageW = pageH * PAGE_RATIO;
  } else {
    pageH = Math.min(availH, (availW / 2) / PAGE_RATIO);
    pageW = pageH * PAGE_RATIO;
  }

  return {
    width:  Math.floor(Math.max(pageW, 200)),
    height: Math.floor(Math.max(pageH, 300)),
  };
}

const ZOOM_MIN  = 1;
const ZOOM_MAX  = 4;
const ZOOM_STEP = 0.25;

function clampZoom(z: number) {
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface ReaderProps {
  slug: string;
  editionTitle: string;
  backUrl: string;
  initialPage?: number;
  editionId?: string;
  isLoggedIn?: boolean;
  initialIsFavorited?: boolean;
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Reader({
  slug,
  editionTitle,
  backUrl,
  initialPage,
  editionId,
  isLoggedIn = false,
  initialIsFavorited = false,
}: ReaderProps) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef    = useRef<any>(null);
  const areaRef    = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [pages,        setPages]        = useState<string[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [currentPage,  setCurrentPage]  = useState(0);
  const [bookSize,     setBookSize]     = useState({ width: 400, height: 600 });
  const [isMobile,     setIsMobile]     = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ready,        setReady]        = useState(false);

  // ── Favorito ────────────────────────────────────────────────────────────────
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [favLoading,  setFavLoading]  = useState(false);

  const toggleFavorite = useCallback(async () => {
    if (!isLoggedIn || !editionId || favLoading) return;
    setFavLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: "edition", contentId: editionId }),
      });
      const data = await res.json();
      setIsFavorited(data.favorited);
    } catch { /* ignore */ }
    setFavLoading(false);
  }, [isLoggedIn, editionId, favLoading]);

  // ── Zoom / Pan ──────────────────────────────────────────────────────────────
  const [zoom,         setZoom]        = useState(1);
  const [pan,          setPan]         = useState({ x: 0, y: 0 });
  const [isGesturing,  setIsGesturing] = useState(false); // disable transition during gesture

  // Mouse pan
  const isPanning     = useRef(false);
  const panStart      = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  // Touch pan (single finger when zoomed)
  const touchPanning  = useRef(false);
  const touchPanStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const pinchDist     = useRef(0);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsGesturing(false);
  }, []);

  const zoomIn  = useCallback(() => setZoom((z) => clampZoom(z + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const next = clampZoom(z - ZOOM_STEP);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // ── Ir para página ───────────────────────────────────────────────────────
  const [gotoValue, setGotoValue] = useState("");

  const handleGotoSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const n = parseInt(gotoValue, 10);
      if (!isNaN(n) && n >= 1 && n <= pages.length) {
        bookRef.current?.pageFlip().turnToPage(n - 1);
        resetZoom();
      }
      setGotoValue("");
    },
    [gotoValue, pages.length, resetZoom]
  );

  // Limita o pan para não ultrapassar o conteúdo ampliado
  const clampPan = useCallback(
    (x: number, y: number, currentZoom: number) => {
      if (!areaRef.current) return { x, y };
      const area = areaRef.current.getBoundingClientRect();
      const contentW = bookSize.width  * (isMobile ? 1 : 2) * currentZoom;
      const contentH = bookSize.height * currentZoom;
      const maxX = Math.max(0, (contentW - area.width)  / 2);
      const maxY = Math.max(0, (contentH - area.height) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      };
    },
    [bookSize, isMobile]
  );

  // ── Scroll do mouse para zoom ─────────────────────────────────────────────
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => {
        const next = clampZoom(z + delta);
        if (next <= 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
    area.addEventListener("wheel", onWheel, { passive: false });
    return () => area.removeEventListener("wheel", onWheel);
  }, []);

  // ── Mouse: pan (só no overlay — quando zoom > 1) ─────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isPanning.current = true;
    setIsGesturing(true);
    panStart.current = { mx: e.clientX, my: e.clientY, ox: pan.x, oy: pan.y };
  }, [pan]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const raw = {
      x: panStart.current.ox + e.clientX - panStart.current.mx,
      y: panStart.current.oy + e.clientY - panStart.current.my,
    };
    setPan(clampPan(raw.x, raw.y, zoom));
  }, [zoom, clampPan]);

  const stopPan = useCallback(() => {
    isPanning.current = false;
    setIsGesturing(false);
  }, []);

  // ── Touch: pinch inicial quando zoom = 1 (no areaRef) ─────────────────────
  const onTouchStartArea = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const onTouchMoveArea = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    const dx   = e.touches[0].clientX - e.touches[1].clientX;
    const dy   = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ratio = dist / (pinchDist.current || dist);
    pinchDist.current = dist;
    setZoom((z) => {
      const next = clampZoom(z * ratio);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // ── Touch: overlay quando zoom > 1 (pan + pinch sem conflito com FlipBook) ─
  const onTouchStartZoomed = useCallback((e: React.TouchEvent) => {
    setIsGesturing(true);
    if (e.touches.length === 2) {
      touchPanning.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1) {
      touchPanning.current = true;
      touchPanStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        ox: pan.x,
        oy: pan.y,
      };
    }
  }, [pan]);

  const onTouchMoveZoomed = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchPanning.current = false;
      const dx   = e.touches[0].clientX - e.touches[1].clientX;
      const dy   = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / (pinchDist.current || dist);
      pinchDist.current = dist;
      setZoom((z) => {
        const next = clampZoom(z * ratio);
        if (next <= 1) setPan({ x: 0, y: 0 });
        return next;
      });
    } else if (e.touches.length === 1 && touchPanning.current) {
      const raw = {
        x: touchPanStart.current.ox + e.touches[0].clientX - touchPanStart.current.x,
        y: touchPanStart.current.oy + e.touches[0].clientY - touchPanStart.current.y,
      };
      setPan(clampPan(raw.x, raw.y, zoom));
    }
  }, [zoom, clampPan]);

  const onTouchEndZoomed = useCallback(() => {
    touchPanning.current = false;
    setIsGesturing(false);
  }, []);

  // ── Pula para página inicial quando vindo de link do índice ──────────────
  useEffect(() => {
    if (!ready || !initialPage || initialPage <= 1) return;
    const idx = Math.min(initialPage - 1, pages.length - 1);
    bookRef.current?.pageFlip().turnToPage(idx);
    setCurrentPage(idx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // ── Busca páginas + registra visualização ────────────────────────────────
  useEffect(() => {
    fetch(`/api/editions/${slug}/pages`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => {
        if (Array.isArray(d.urls) && d.urls.length > 0) {
          setPages(d.urls);
          fetch(`/api/editions/${slug}/view`, { method: "POST" }).catch(() => {});
        } else {
          setError("Nenhuma página encontrada para esta edição.");
        }
      })
      .catch(() => setError("Não foi possível carregar a edição."))
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Tamanho do livro ──────────────────────────────────────────────────────
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

  // ── Navegação de páginas ──────────────────────────────────────────────────
  const flipNext = useCallback(() => bookRef.current?.pageFlip().flipNext("bottom"), []);
  const flipPrev = useCallback(() => bookRef.current?.pageFlip().flipPrev("bottom"), []);

  const handleFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
    resetZoom();
  }, [resetZoom]);

  // ── Teclado ───────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") { e.preventDefault(); zoomIn(); return; }
        if (e.key === "-")                  { e.preventDefault(); zoomOut(); return; }
        if (e.key === "0")                  { e.preventDefault(); resetZoom(); return; }
      }
      if (zoom > 1) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") flipNext();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp"   || e.key === "PageUp")   flipPrev();
      if (e.key === "Escape") router.push(backUrl);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipNext, flipPrev, zoomIn, zoomOut, resetZoom, zoom, router, backUrl]);

  // ── Fullscreen ────────────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // ── Estados de loading / erro ─────────────────────────────────────────────
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

  if (error || pages.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#070a12] flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <span className="text-5xl">📖</span>
          <p className="text-white text-lg font-semibold">{error ?? "Conteúdo em preparação"}</p>
          <p className="text-[#7a9ab5] text-sm max-w-sm">
            As páginas desta edição ainda estão sendo adicionadas ao sistema.
          </p>
          <button onClick={() => router.push(backUrl)} className="mt-2 text-[#ff1f1f] hover:underline text-sm">
            ← Voltar para a edição
          </button>
        </div>
      </div>
    );
  }

  // ── Derivados ─────────────────────────────────────────────────────────────
  const displayLeft  = currentPage + 1;
  const displayRight = !isMobile && currentPage + 2 <= pages.length ? currentPage + 2 : null;
  const isFirst      = currentPage === 0;
  const isLast       = isMobile ? currentPage >= pages.length - 1 : currentPage >= pages.length - 2;
  const isZoomed     = zoom > 1.01;
  const zoomPct      = Math.round(zoom * 100);

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
        {/* Esquerda: logo + título */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className="font-['Barlow_Condensed'] font-black text-white text-[18px] leading-none shrink-0"
            style={{ letterSpacing: "0.04em" }}
          >
            MAGNUM
          </span>
          <span className="text-[#2a3a4e] shrink-0 mx-1">|</span>
          <span className="text-[#7a9ab5] text-[13px] truncate">{editionTitle}</span>
        </div>

        {/* Direita: página, zoom indicator, favorito, fechar */}
        <div className="flex items-center gap-2 shrink-0">
          {ready && (
            <span className="text-[#526888] text-[11px] tabular-nums hidden sm:block">
              {displayRight ? `${displayLeft}–${displayRight}` : `${displayLeft}`} / {pages.length}
            </span>
          )}

          {/* Indicador de zoom */}
          {isZoomed && (
            <button
              onClick={resetZoom}
              className="text-[#ff1f1f] text-[11px] font-bold tabular-nums hover:text-white transition-colors px-1.5 py-0.5 rounded bg-[#ff1f1f]/10 hover:bg-[#ff1f1f]/20"
              title="Resetar zoom (Ctrl+0)"
            >
              {zoomPct}% ✕
            </button>
          )}

          {/* Botão Favoritar */}
          {isLoggedIn && editionId && (
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              className={`w-8 h-8 flex items-center justify-center rounded transition-all ${
                isFavorited
                  ? "text-[#ff1f1f] bg-[#ff1f1f]/15 hover:bg-[#ff1f1f]/25"
                  : "text-[#526888] hover:text-[#ff1f1f] hover:bg-white/8"
              } ${favLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isFavorited ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
          )}

          {/* Fechar */}
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
      <div
        ref={areaRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onTouchStart={isZoomed ? undefined : onTouchStartArea}
        onTouchMove={isZoomed ? undefined : onTouchMoveArea}
      >
        {/*
          ── Overlay transparente (apenas quando zoomed) ──────────────────
          Fica sobre o livro e captura TODOS os eventos de mouse/touch,
          impedindo que o FlipBook receba toques e cause tremido.
          touchAction: "none" evita scroll/zoom nativo do browser.
        */}
        {isZoomed && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 20,
              touchAction: "none",
              cursor: "grab",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopPan}
            onMouseLeave={stopPan}
            onDoubleClick={resetZoom}
            onTouchStart={onTouchStartZoomed}
            onTouchMove={onTouchMoveZoomed}
            onTouchEnd={onTouchEndZoomed}
          />
        )}

        {/* Seta esquerda */}
        {!isZoomed && (
          <button
            onClick={flipPrev}
            disabled={isFirst}
            className="absolute left-2 z-10 w-10 h-16 flex items-center justify-center rounded-full text-white/35 hover:text-white hover:bg-white/8 disabled:opacity-0 transition-all text-3xl font-light"
            title="Página anterior (←)"
          >
            ‹
          </button>
        )}

        {/* Wrapper com transform de zoom + pan */}
        <div
          ref={wrapperRef}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            willChange: "transform",
            // Sem transition durante gestos para evitar lag/tremido
            // Com transition suave nos cliques de zoom (+/-) e reset
            transition: isGesturing ? "none" : "transform 0.12s ease",
          }}
        >
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
            useMouseEvents={!isZoomed}
            swipeDistance={isMobile ? 20 : 30}
            showPageCorners={!isMobile && !isZoomed}
            disableFlipByClick={isZoomed}
            mobileScrollSupport={false}
            autoSize={false}
            minWidth={150}
            maxWidth={1200}
            minHeight={200}
            maxHeight={1800}
            startPage={0}
            onFlip={handleFlip}
            onInit={() => setReady(true)}
            className=""
            style={{}}
          >
            {pages.map((url, i) => (
              <Page key={i} url={url} index={i} width={bookSize.width} height={bookSize.height} />
            ))}
          </HTMLFlipBook>
        </div>

        {/* Seta direita */}
        {!isZoomed && (
          <button
            onClick={flipNext}
            disabled={isLast}
            className="absolute right-2 z-10 w-10 h-16 flex items-center justify-center rounded-full text-white/35 hover:text-white hover:bg-white/8 disabled:opacity-0 transition-all text-3xl font-light"
            title="Próxima página (→)"
          >
            ›
          </button>
        )}

        {/* Dica de zoom */}
        {isZoomed && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ zIndex: 21 }}
          >
            <span className="text-[#526888] text-[10px] bg-black/60 px-2 py-1 rounded">
              arraste para mover · duplo-clique ou Ctrl+0 para resetar
            </span>
          </div>
        )}
      </div>

      {/* ── Bottom Bar ───────────────────────────────────────────────────── */}
      <div
        className="h-14 shrink-0 flex items-center justify-center gap-2 px-3"
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
          title="Página anterior"
        >
          ‹
        </button>

        {/* Contador de páginas */}
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
          title="Próxima página"
        >
          ›
        </button>

        <div className="w-px h-5 bg-[#1c2a3e]" />

        {/* ── Ir para página ───────────────────────── */}
        <form onSubmit={handleGotoSubmit} className="flex items-center gap-1" title="Ir para a página">
          <label className="text-[#3a4a5e] text-[10px] uppercase tracking-wider hidden md:block shrink-0">
            ir
          </label>
          <input
            type="number"
            min={1}
            max={pages.length}
            value={gotoValue}
            onChange={(e) => setGotoValue(e.target.value)}
            placeholder="pág."
            className="w-12 h-7 bg-[#0e1520] border border-[#1c2a3e] focus:border-[#ff1f1f]/60 rounded text-white text-[12px] text-center tabular-nums focus:outline-none transition-colors placeholder:text-[#2a3a4e]"
            style={{ appearance: "textfield" }}
            onKeyDown={(e) => e.key === "Escape" && setGotoValue("")}
          />
          <button
            type="submit"
            className="h-7 px-2 bg-[#141d2c] hover:bg-[#1c2a3e] border border-[#1c2a3e] rounded text-[#7a9ab5] hover:text-white text-[11px] font-medium transition-colors"
          >
            →
          </button>
        </form>

        <div className="w-px h-5 bg-[#1c2a3e]" />

        {/* ── Controles de zoom ─────────────────────── */}
        <button
          onClick={zoomOut}
          disabled={zoom <= ZOOM_MIN}
          className="w-8 h-8 flex items-center justify-center rounded border border-[#1c2a3e] hover:border-[#2a3a5e] text-[#7a9ab5] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-lg font-light"
          title="Diminuir zoom (Ctrl−)"
        >
          −
        </button>

        <button
          onClick={resetZoom}
          className={`min-w-[44px] h-7 flex items-center justify-center rounded text-[11px] font-bold tabular-nums transition-colors ${
            isZoomed
              ? "text-[#ff1f1f] bg-[#ff1f1f]/10 hover:bg-[#ff1f1f]/20"
              : "text-[#526888] hover:text-white hover:bg-white/5"
          }`}
          title="Resetar zoom (Ctrl+0)"
        >
          {zoomPct}%
        </button>

        <button
          onClick={zoomIn}
          disabled={zoom >= ZOOM_MAX}
          className="w-8 h-8 flex items-center justify-center rounded border border-[#1c2a3e] hover:border-[#2a3a5e] text-[#7a9ab5] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-lg"
          title="Aumentar zoom (Ctrl+)"
        >
          +
        </button>

        <div className="w-px h-5 bg-[#1c2a3e]" />

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="w-9 h-9 flex items-center justify-center rounded text-[#526888] hover:text-white hover:bg-white/8 transition-colors"
          title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
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
          onClick={() => { bookRef.current?.pageFlip().turnToPage(0); resetZoom(); }}
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
