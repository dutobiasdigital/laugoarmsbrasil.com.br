"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface AvatarUploadProps {
  userId: string;
  currentUrl: string | null;
  onUrlChange: (url: string) => void;
}

interface DragState {
  active: boolean;
  startX: number;
  startY: number;
  startOffsetX: number;
  startOffsetY: number;
}

export default function AvatarUpload({ userId, currentUrl, onUrlChange }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Position/scale state for panning
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  const CROP_SIZE = 300; // displayed crop circle size in px
  const OUTPUT_SIZE = 300; // canvas output size

  const drag = useRef<DragState>({
    active: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setCropOpen(true);
    setOffsetX(0);
    setOffsetY(0);
    setScale(1);
    setError(null);
    // reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleImageLoad() {
    const img = imgRef.current;
    if (!img) return;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNaturalW(nw);
    setNaturalH(nh);

    // Fit the image to fill the crop circle initially
    const fitScale = Math.max(CROP_SIZE / nw, CROP_SIZE / nh);
    setScale(fitScale);
    setOffsetX((CROP_SIZE - nw * fitScale) / 2);
    setOffsetY((CROP_SIZE - nh * fitScale) / 2);
  }

  // Clamp offset so image always covers the crop circle
  function clampOffset(ox: number, oy: number, sc: number) {
    const imgW = naturalW * sc;
    const imgH = naturalH * sc;
    const minX = CROP_SIZE - imgW;
    const minY = CROP_SIZE - imgH;
    const maxX = 0;
    const maxY = 0;
    return {
      x: Math.min(maxX, Math.max(minX, ox)),
      y: Math.min(maxY, Math.max(minY, oy)),
    };
  }

  const startDrag = useCallback((clientX: number, clientY: number) => {
    drag.current = {
      active: true,
      startX: clientX,
      startY: clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
  }, [offsetX, offsetY]);

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!drag.current.active) return;
    const dx = clientX - drag.current.startX;
    const dy = clientY - drag.current.startY;
    const newOx = drag.current.startOffsetX + dx;
    const newOy = drag.current.startOffsetY + dy;
    const clamped = clampOffset(newOx, newOy, scale);
    setOffsetX(clamped.x);
    setOffsetY(clamped.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, naturalW, naturalH]);

  const endDrag = useCallback(() => {
    drag.current.active = false;
  }, []);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const minScale = Math.max(CROP_SIZE / naturalW, CROP_SIZE / naturalH);
    const newScale = Math.max(minScale, Math.min(5, scale + delta));
    // Re-clamp offset with new scale
    const clamped = clampOffset(offsetX, offsetY, newScale);
    setScale(newScale);
    setOffsetX(clamped.x);
    setOffsetY(clamped.y);
  }

  async function handleSave() {
    const img = imgRef.current;
    if (!img || !imageSrc) return;

    setUploading(true);
    setError(null);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d")!;

      // Circular clip
      ctx.beginPath();
      ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
      ctx.clip();

      // Scale from displayed CROP_SIZE to canvas OUTPUT_SIZE
      const ratio = OUTPUT_SIZE / CROP_SIZE;
      ctx.drawImage(img, offsetX * ratio, offsetY * ratio, naturalW * scale * ratio, naturalH * scale * ratio);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );

      if (!blob) throw new Error("Falha ao gerar imagem.");

      const formData = new FormData();
      formData.append("file", blob, "avatar.jpg");
      formData.append("userId", userId);

      const res = await fetch("/api/admin/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erro ao fazer upload.");
      }

      const { url } = await res.json();
      onUrlChange(url);
      handleCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setUploading(false);
    }
  }

  function handleCancel() {
    setCropOpen(false);
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayUrl = currentUrl || null;

  return (
    <>
      {/* Compact avatar display */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-16 h-16 rounded-full border-2 border-[#1c2a3e] bg-[#141d2c] overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#ff1f1f] transition-colors"
          onClick={() => fileInputRef.current?.click()}
          title="Alterar foto"
        >
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-8 h-8 text-[#7a9ab5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[#7a9ab5] hover:text-white text-[11px] transition-colors"
        >
          Alterar foto
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Crop modal */}
      {cropOpen && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0e1520] border border-[#1c2a3e] rounded-[12px] p-6 w-[380px] max-w-[95vw] shadow-2xl">
            <p className="text-white font-semibold text-[15px] mb-1">Ajustar foto</p>
            <p className="text-[#7a9ab5] text-[12px] mb-4">Arraste para reposicionar. Role o mouse para ampliar.</p>

            {/* Crop area */}
            <div className="flex justify-center mb-4">
              <div
                ref={containerRef}
                className="relative overflow-hidden rounded-full cursor-grab active:cursor-grabbing select-none"
                style={{
                  width: CROP_SIZE,
                  height: CROP_SIZE,
                  boxShadow: "0 0 0 9999px rgba(14,21,32,0.85)",
                  border: "2px solid #ff1f1f",
                }}
                onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
                onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                onTouchStart={(e) => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); }}
                onTouchMove={(e) => { const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }}
                onTouchEnd={endDrag}
                onWheel={handleWheel}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  onLoad={handleImageLoad}
                  style={{
                    position: "absolute",
                    left: offsetX,
                    top: offsetY,
                    width: naturalW * scale,
                    height: naturalH * scale,
                    maxWidth: "none",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {error && (
              <p className="text-[#ff6b6b] text-[12px] mb-3 text-center">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={uploading}
                className="flex-1 bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] font-semibold h-[38px] rounded-[6px] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={uploading}
                className="flex-1 bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold h-[38px] rounded-[6px] transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
