"use client";

import { useRef, useState } from "react";

interface Props {
  folder: string;
  filename?: string;
  defaultUrl?: string;
  inputName: string;
  aspectHint?: string; // e.g. "Capa: proporção 3:4"
  onUrlChange?: (url: string) => void;
}

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

export { slugify };

export default function ImageUpload({ folder, filename, defaultUrl, inputName, aspectHint, onUrlChange }: Props) {
  const [url, setUrl] = useState(defaultUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    if (filename) fd.append("filename", filename);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setUrl(data.url);
        onUrlChange?.(data.url);
      } else {
        setError(data.error || "Erro ao fazer upload.");
      }
    } catch {
      setError("Erro ao fazer upload.");
    }
    setLoading(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.stopPropagation();
    // only leave if exiting the component entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-[8px] p-2 -m-2 transition-colors ${
        isDragging ? "ring-2 ring-[#ff1f1f]/60 bg-[#ff1f1f]/5" : ""
      }`}
    >
      <input type="hidden" name={inputName} value={url} />
      {isDragging && (
        <div className="absolute inset-0 rounded-[8px] flex items-center justify-center pointer-events-none z-10">
          <span className="text-[#ff6b6b] text-[12px] font-semibold bg-[#0e1520]/90 px-3 py-1.5 rounded-[4px] border border-[#ff1f1f]/30">
            Solte para enviar
          </span>
        </div>
      )}
      <div className={`flex gap-4 items-start transition-opacity ${isDragging ? "opacity-40" : ""}`}>
        {url ? (
          <div className="w-[100px] h-[100px] bg-[#141d2c] rounded-[6px] overflow-hidden border border-[#1c2a3e] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-[100px] h-[100px] bg-[#141d2c] rounded-[6px] border border-dashed border-[#1c2a3e] flex items-center justify-center shrink-0">
            <span className="text-white text-[24px]">🖼</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] h-[38px] px-4 rounded-[6px] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "Enviando..." : url ? "Trocar imagem" : "Fazer upload"}
          </button>
          {aspectHint ? (
            <p className="text-[#526888] text-[11px] mt-1.5">{aspectHint}</p>
          ) : (
            <p className="text-[#526888] text-[11px] mt-1.5">ou arraste a imagem aqui</p>
          )}
          {error && <p className="text-[#ff6b6b] text-[12px] mt-1">{error}</p>}
          {url && (
            <p className="text-[#7a9ab5] text-[11px] mt-1 truncate max-w-[280px]">
              {url.split("/").pop()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
