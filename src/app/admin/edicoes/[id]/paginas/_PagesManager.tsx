"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface PageFile {
  name: string;
  size: number;
}

interface Props {
  slug: string;
  initialPages: PageFile[];
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function pageLabel(name: string) {
  // "page-001.jpg" → "001"
  const m = name.match(/page-(\d+)\./);
  return m ? m[1] : name;
}

export default function PagesManager({ slug, initialPages }: Props) {
  const [pages,     setPages]     = useState<PageFile[]>(initialPages);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState<{ done: number; total: number } | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Refresh lista do servidor
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

    // Determina o próximo número de página disponível
    const maxExisting = pages.reduce((acc, p) => {
      const m = p.name.match(/page-(\d+)\./);
      return m ? Math.max(acc, parseInt(m[1])) : acc;
    }, 0);

    // Ordena os arquivos selecionados pelo nome original para respeitar sequência
    arr.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    let failed = 0;
    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      const pageNum = String(maxExisting + i + 1).padStart(3, "0");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("pageNum", pageNum);

      try {
        const res = await fetch(`/api/admin/edition-pages/${slug}`, {
          method: "POST",
          body: fd,
        });
        if (!res.ok) failed++;
      } catch {
        failed++;
      }

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
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  // Delete
  const handleDelete = async (filename: string) => {
    if (!confirm(`Remover "${filename}"?`)) return;
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
        setSuccess(`"${filename}" removida.`);
      } else {
        const d = await res.json();
        setError(d.error ?? "Erro ao remover.");
      }
    } catch {
      setError("Erro ao remover.");
    }
    setDeleting(null);
  };

  // Limpa mensagens após 4s
  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => { setSuccess(null); setError(null); }, 4000);
    return () => clearTimeout(t);
  }, [success, error]);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Área de upload ────────────────────────────────────────────── */}
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

        <div className="w-12 h-12 rounded-full bg-[#141d2c] flex items-center justify-center text-2xl">
          📄
        </div>

        <div>
          <p className="text-white text-[14px] font-medium">
            {uploading ? "Enviando…" : "Arraste as páginas ou clique para selecionar"}
          </p>
          <p className="text-[#526888] text-[12px] mt-1">
            JPG, PNG ou WebP — múltiplos arquivos aceitos — máx. 50 MB cada
          </p>
          <p className="text-[#3a4a5e] text-[11px] mt-1">
            Os arquivos são numerados automaticamente em ordem alfabética
          </p>
        </div>

        {/* Barra de progresso */}
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

      {/* ── Mensagens ─────────────────────────────────────────────────── */}
      {success && (
        <div className="rounded-lg bg-[#0f381f] border border-[#22c55e]/30 px-4 py-3 text-[#22c55e] text-[13px]">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-[#380f0f] border border-[#ff1f1f]/30 px-4 py-3 text-[#ff6b6b] text-[13px]">
          ✕ {error}
        </div>
      )}

      {/* ── Cabeçalho da lista ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-[15px] font-semibold">
            Páginas carregadas
          </h2>
          <p className="text-[#526888] text-[12px] mt-0.5">
            {pages.length > 0
              ? `${pages.length} página${pages.length > 1 ? "s" : ""} no leitor`
              : "Nenhuma página cadastrada ainda"}
          </p>
        </div>
        {pages.length > 0 && (
          <span className="bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] text-[11px] font-bold px-2.5 py-1 rounded-full">
            {pages.length}
          </span>
        )}
      </div>

      {/* ── Grid de páginas ───────────────────────────────────────────── */}
      {pages.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
          {pages.map((page) => (
            <div
              key={page.name}
              className="group relative bg-[#0d1422] rounded-lg overflow-hidden border border-[#1c2a3e] hover:border-[#2a3a5e] transition-colors"
              style={{ aspectRatio: "3/4" }}
            >
              {/* Número */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-['Barlow_Condensed'] font-bold text-[#2a3a5e] text-[20px] leading-none">
                  {pageLabel(page.name)}
                </span>
                <span className="text-[#1c2a3e] text-[9px] mt-1">{formatBytes(page.size)}</span>
              </div>

              {/* Overlay com botão delete no hover */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(page.name)}
                  disabled={deleting === page.name}
                  className="w-8 h-8 rounded-full bg-[#ff1f1f] hover:bg-[#cc0000] flex items-center justify-center text-white text-[14px] transition-colors disabled:opacity-50"
                  title={`Remover página ${pageLabel(page.name)}`}
                >
                  {deleting === page.name ? (
                    <span className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin block" />
                  ) : "✕"}
                </button>
              </div>

              {/* Nome do arquivo (tooltip bottom) */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity py-1 px-1">
                <p className="text-white/60 text-[8px] text-center truncate">{page.name}</p>
              </div>
            </div>
          ))}
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
    </div>
  );
}
