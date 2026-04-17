"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

interface PageFile {
  name: string;
  size: number;
  signedUrl: string;
}

interface Props {
  slug: string;
  editionId: string;
  initialPages: PageFile[];
  initialEditorialPages: string[];
  initialIndexPages: string[];
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function pageLabel(name: string) {
  const m = name.match(/page-(\d+)\./);
  return m ? m[1] : name;
}

export default function PagesManager({
  slug,
  initialPages,
  initialEditorialPages,
  initialIndexPages,
}: Props) {
  const [pages,          setPages]          = useState<PageFile[]>(initialPages);
  const [editorialPages, setEditorialPages] = useState<string[]>(initialEditorialPages);
  const [indexPages,     setIndexPages]     = useState<string[]>(initialIndexPages);
  const [modal,          setModal]          = useState<PageFile | null>(null);
  const [uploading,      setUploading]      = useState(false);
  const [progress,       setProgress]       = useState<{ done: number; total: number } | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [success,        setSuccess]        = useState<string | null>(null);
  const [deleting,       setDeleting]       = useState<string | null>(null);
  const [savingMarker,   setSavingMarker]   = useState<"editorial" | "index" | null>(null);
  const [isDragging,     setIsDragging]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fecha modal com Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setModal(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Refresh lista do servidor (inclui novas signed URLs)
  const refreshPages = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/edition-pages/${slug}`);
      const d = await r.json();
      if (Array.isArray(d.pages)) setPages(d.pages);
    } catch { /* silencioso */ }
  }, [slug]);

  // Upload de múltiplos arquivos
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    setProgress({ done: 0, total: arr.length });

    const maxExisting = pages.reduce((acc, p) => {
      const m = p.name.match(/page-(\d+)\./);
      return m ? Math.max(acc, parseInt(m[1])) : acc;
    }, 0);

    arr.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    let failed = 0;
    for (let i = 0; i < arr.length; i++) {
      const file    = arr[i];
      const pageNum = String(maxExisting + i + 1).padStart(3, "0");
      const fd      = new FormData();
      fd.append("file", file);
      fd.append("pageNum", pageNum);
      try {
        const res = await fetch(`/api/admin/edition-pages/${slug}`, { method: "POST", body: fd });
        if (!res.ok) failed++;
      } catch { failed++; }
      setProgress({ done: i + 1, total: arr.length });
    }

    await refreshPages();
    setProgress(null);
    setUploading(false);
    setSuccess(
      failed === 0
        ? `${arr.length} página${arr.length > 1 ? "s" : ""} enviada${arr.length > 1 ? "s" : ""} com sucesso.`
        : `${arr.length - failed} enviada${arr.length - failed > 1 ? "s" : ""}, ${failed} com erro.`
    );
  }, [pages, slug, refreshPages]);

  // Drag & Drop
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  // Delete
  const handleDelete = useCallback(async (filename: string) => {
    setModal(null);
    if (!confirm(`Remover a página "${filename}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(filename);
    setError(null);
    try {
      const res = await fetch(`/api/admin/edition-pages/${slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      if (res.ok) {
        setPages((prev) => prev.filter((p) => p.name !== filename));
        setEditorialPages((prev) => prev.filter((f) => f !== filename));
        setIndexPages((prev) => prev.filter((f) => f !== filename));
        setSuccess(`"${filename}" removida.`);
      } else {
        const d = await res.json();
        setError(d.error ?? "Erro ao remover.");
      }
    } catch {
      setError("Erro ao remover.");
    }
    setDeleting(null);
  }, [slug]);

  // Marcar / desmarcar (toggle add/remove do array)
  const handleMark = useCallback(async (type: "editorial" | "index", filename: string) => {
    const current  = type === "editorial" ? editorialPages : indexPages;
    const isMarked = current.includes(filename);
    const action   = isMarked ? "remove" : "add";

    setSavingMarker(type);
    try {
      const res = await fetch(`/api/admin/edition-pages/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, filename, action }),
      });
      if (res.ok) {
        const newArr = isMarked
          ? current.filter((f) => f !== filename)
          : [...new Set([...current, filename])];
        if (type === "editorial") setEditorialPages(newArr);
        else                      setIndexPages(newArr);
      } else {
        const d = await res.json();
        setError(d.error ?? "Erro ao salvar marcação.");
      }
    } catch {
      setError("Erro ao salvar marcação.");
    }
    setSavingMarker(null);
  }, [slug, editorialPages, indexPages]);

  // Limpa mensagens após 4s
  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => { setSuccess(null); setError(null); }, 4000);
    return () => clearTimeout(t);
  }, [success, error]);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Área de upload ─────────────────────────────────────────── */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer ${
          isDragging
            ? "border-[#ff1f1f]/70 bg-[#ff1f1f]/5"
            : "border-[#1c2a3e] hover:border-[#2a3a5e] bg-[#0a0e18]/50"
        }`}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {isDragging && (
          <div className="absolute inset-0 rounded-xl flex items-center justify-center pointer-events-none z-10 bg-[#070a12]/80">
            <span className="text-[#ff1f1f] text-[15px] font-semibold">Solte para enviar</span>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="w-12 h-12 rounded-full bg-[#141d2c] flex items-center justify-center text-2xl">📄</div>
        <div>
          <p className="text-white text-[14px] font-medium">
            {uploading ? "Enviando…" : "Arraste as páginas ou clique para selecionar"}
          </p>
          <p className="text-[#526888] text-[12px] mt-1">JPG, PNG ou WebP — múltiplos arquivos aceitos — máx. 50 MB cada</p>
          <p className="text-[#3a4a5e] text-[11px] mt-1">Os arquivos são numerados automaticamente em ordem alfabética</p>
        </div>
        {uploading && progress && (
          <div className="w-full max-w-xs">
            <div className="h-1.5 bg-[#1c2a3e] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ff1f1f] transition-all duration-200"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-[#7a9ab5] text-[11px] mt-1.5 text-center">
              {progress.done} / {progress.total} arquivo{progress.total > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* ── Mensagens ──────────────────────────────────────────────── */}
      {success && (
        <div className="rounded-lg bg-[#0f381f] border border-[#22c55e]/30 px-4 py-3 text-[#22c55e] text-[13px]">✓ {success}</div>
      )}
      {error && (
        <div className="rounded-lg bg-[#380f0f] border border-[#ff1f1f]/30 px-4 py-3 text-[#ff6b6b] text-[13px]">✕ {error}</div>
      )}

      {/* ── Cabeçalho da lista ──────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-white text-[15px] font-semibold">Páginas carregadas</h2>
          <p className="text-[#526888] text-[12px] mt-0.5">
            {pages.length > 0
              ? `${pages.length} página${pages.length > 1 ? "s" : ""} no leitor`
              : "Nenhuma página cadastrada ainda"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {editorialPages.length > 0 && (
            <span className="flex items-center gap-1 bg-[#ff1f1f]/10 border border-[#ff1f1f]/30 text-[#ff6b6b] text-[11px] px-2 py-0.5 rounded-[4px]">
              📝 {editorialPages.length} editorial{editorialPages.length > 1 ? "is" : ""}
              <span className="text-[#ff1f1f]/50 text-[10px]">
                ({editorialPages.map(pageLabel).join(", ")})
              </span>
            </span>
          )}
          {indexPages.length > 0 && (
            <span className="flex items-center gap-1 bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#38bdf8] text-[11px] px-2 py-0.5 rounded-[4px]">
              📋 {indexPages.length} índice{indexPages.length > 1 ? "s" : ""}
              <span className="text-[#0ea5e9]/50 text-[10px]">
                ({indexPages.map(pageLabel).join(", ")})
              </span>
            </span>
          )}
          {pages.length > 0 && (
            <span className="bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] text-[11px] font-bold px-2.5 py-1 rounded-full">
              {pages.length}
            </span>
          )}
        </div>
      </div>

      {/* ── Grid de páginas ────────────────────────────────────────── */}
      {pages.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
          {pages.map((page) => {
            const isEditorial = editorialPages.includes(page.name);
            const isIndex     = indexPages.includes(page.name);
            const isDeleting  = deleting === page.name;

            return (
              <button
                key={page.name}
                onClick={() => setModal(page)}
                disabled={isDeleting}
                title={`${page.name}${isEditorial ? " · Editorial" : ""}${isIndex ? " · Índice" : ""}`}
                className="group relative bg-[#0d1422] rounded-lg overflow-hidden border border-[#1c2a3e] hover:border-[#ff1f1f]/50 transition-colors cursor-pointer disabled:opacity-40"
                style={{ aspectRatio: "3/4" }}
              >
                {page.signedUrl ? (
                  <Image
                    src={page.signedUrl}
                    alt={page.name}
                    fill
                    className="object-cover"
                    sizes="(max-width:640px) 25vw, (max-width:1024px) 17vw, 10vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-['Barlow_Condensed'] font-bold text-[#2a3a5e] text-[18px]">
                      {pageLabel(page.name)}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

                {/* Badge Editorial */}
                {isEditorial && (
                  <div className="absolute top-1 left-1 bg-[#ff1f1f] text-white text-[7px] font-bold px-1 py-[1px] rounded-[2px] leading-tight z-10">
                    Ed.
                  </div>
                )}
                {/* Badge Índice */}
                {isIndex && (
                  <div className={`absolute text-white text-[7px] font-bold px-1 py-[1px] rounded-[2px] leading-tight z-10 bg-[#0ea5e9] ${isEditorial ? "top-5 left-1" : "top-1 right-1"}`}>
                    Índ.
                  </div>
                )}

                {/* Número (hover) */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent py-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <p className="text-white text-[9px] font-bold text-center">{pageLabel(page.name)}</p>
                </div>

                {isDeleting && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {pages.length === 0 && !uploading && (
        <div className="rounded-xl bg-[#0a0e18] border border-[#1c2a3e] p-10 flex flex-col items-center gap-3 text-center">
          <span className="text-3xl">📚</span>
          <p className="text-[#526888] text-[13px]">
            Faça upload das páginas da edição acima para ativar o leitor
          </p>
        </div>
      )}

      {/* ── Modal de página ────────────────────────────────────────── */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="relative bg-[#0e1520] border border-[#1c2a3e] rounded-[14px] overflow-hidden flex flex-col max-w-[520px] w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#141d2c]">
              <div>
                <p className="text-white text-[14px] font-semibold">Página {pageLabel(modal.name)}</p>
                <p className="text-[#526888] text-[11px] font-mono">{modal.name} · {formatBytes(modal.size)}</p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="w-[28px] h-[28px] flex items-center justify-center rounded-full bg-[#141d2c] border border-[#1c2a3e] hover:border-[#2a3a5e] text-[#7a9ab5] hover:text-white text-[14px] transition-colors"
              >✕</button>
            </div>

            {/* Imagem */}
            <div className="relative bg-[#070a12] flex items-center justify-center" style={{ minHeight: 320 }}>
              {modal.signedUrl ? (
                <img
                  src={modal.signedUrl}
                  alt={modal.name}
                  className="max-h-[60vh] max-w-full object-contain"
                  style={{ display: "block" }}
                />
              ) : (
                <div className="py-12 text-[#2a3a5e] text-[13px]">Sem prévia disponível</div>
              )}
              {editorialPages.includes(modal.name) && (
                <div className="absolute top-2 left-2 bg-[#ff1f1f] text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                  📝 Página Editorial
                </div>
              )}
              {indexPages.includes(modal.name) && (
                <div className="absolute top-2 right-2 bg-[#0ea5e9] text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                  📋 Página Índice
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="p-4 flex flex-col gap-2">
              {/* Marcações — podem ser aplicadas simultaneamente e múltiplas vezes */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleMark("editorial", modal.name)}
                  disabled={savingMarker !== null}
                  className={`h-[40px] text-[12px] font-semibold rounded-[8px] border transition-colors disabled:opacity-50 ${
                    editorialPages.includes(modal.name)
                      ? "bg-[#ff1f1f]/15 border-[#ff1f1f]/50 text-[#ff6b6b]"
                      : "bg-[#141d2c] border-[#1c2a3e] hover:border-[#ff1f1f]/40 text-[#7a9ab5] hover:text-white"
                  }`}
                >
                  {savingMarker === "editorial"
                    ? "Salvando…"
                    : editorialPages.includes(modal.name)
                      ? "✓ Remover Editorial"
                      : "📝 Marcar como Editorial"}
                </button>
                <button
                  onClick={() => handleMark("index", modal.name)}
                  disabled={savingMarker !== null}
                  className={`h-[40px] text-[12px] font-semibold rounded-[8px] border transition-colors disabled:opacity-50 ${
                    indexPages.includes(modal.name)
                      ? "bg-[#0ea5e9]/15 border-[#0ea5e9]/50 text-[#38bdf8]"
                      : "bg-[#141d2c] border-[#1c2a3e] hover:border-[#0ea5e9]/40 text-[#7a9ab5] hover:text-white"
                  }`}
                >
                  {savingMarker === "index"
                    ? "Salvando…"
                    : indexPages.includes(modal.name)
                      ? "✓ Remover Índice"
                      : "📋 Marcar como Índice"}
                </button>
              </div>

              {/* Contador de marcações desta edição */}
              {(editorialPages.length > 0 || indexPages.length > 0) && (
                <div className="flex gap-2 text-[10px] text-[#526888]">
                  {editorialPages.length > 0 && (
                    <span>📝 Editorial: {editorialPages.map(pageLabel).join(", ")}</span>
                  )}
                  {indexPages.length > 0 && (
                    <span>📋 Índice: {indexPages.map(pageLabel).join(", ")}</span>
                  )}
                </div>
              )}

              {/* Excluir */}
              <button
                onClick={() => handleDelete(modal.name)}
                disabled={deleting !== null || savingMarker !== null}
                className="h-[40px] text-[12px] font-semibold rounded-[8px] border border-[#3a1010] hover:border-[#ff1f1f]/50 text-[#526888] hover:text-[#ff6b6b] bg-transparent transition-colors disabled:opacity-50"
              >
                🗑 Excluir esta página
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
