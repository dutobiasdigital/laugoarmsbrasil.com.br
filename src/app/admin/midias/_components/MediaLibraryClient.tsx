"use client";

import { useState, useEffect } from "react";
import MediaCard from "./MediaCard";
import MediaDetailPanel from "./MediaDetailPanel";
import MediaUploadZone from "./MediaUploadZone";
import FolderManager from "./FolderManager";
import type { MediaFile } from "./MediaUploadZone";

interface Props {
  initialFiles: MediaFile[];
  initialTotal: number;
  initialFolders: string[];
}

const TYPE_OPTIONS = [
  { value: "", label: "Todos os tipos" },
  { value: "image",    label: "Imagens" },
  { value: "video",    label: "Vídeos" },
  { value: "pdf",      label: "PDFs" },
  { value: "document", label: "Documentos" },
  { value: "other",    label: "Outros" },
];

export default function MediaLibraryClient({ initialFiles, initialTotal, initialFolders }: Props) {
  const [files, setFiles]           = useState<MediaFile[]>(initialFiles);
  const [total, setTotal]           = useState(initialTotal);
  const [selected, setSelected]     = useState<MediaFile | null>(null);
  const [checked, setChecked]       = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [showFolderMgr, setShowFolderMgr] = useState(false);
  const [folders, setFolders]       = useState<string[]>(initialFolders);
  const [q, setQ]                   = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [uploadFolder, setUploadFolder] = useState("geral");
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(1);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const PER_PAGE = 48;

  // Garante que uploadFolder é válido quando a lista de pastas muda
  useEffect(() => {
    if (!folders.includes(uploadFolder)) setUploadFolder(folders[0] ?? "geral");
  }, [folders, uploadFolder]);

  async function fetchFiles(opts?: { q?: string; type?: string; folder?: string; pagina?: number }) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const query  = opts?.q      ?? q;
      const type   = opts?.type   ?? typeFilter;
      const folder = opts?.folder ?? folderFilter;
      const pg     = opts?.pagina ?? page;
      if (query)  params.set("q",      query);
      if (type)   params.set("type",   type);
      if (folder) params.set("folder", folder);
      params.set("pagina",   String(pg));
      params.set("per_page", String(PER_PAGE));
      const res  = await fetch(`/api/admin/midias?${params.toString()}`);
      const json = await res.json();
      setFiles(json.files ?? []);
      setTotal(json.total ?? 0);
      setChecked(new Set());
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters(overrides?: { q?: string; type?: string; folder?: string }) {
    const nextQ      = overrides?.q      ?? q;
    const nextType   = overrides?.type   ?? typeFilter;
    const nextFolder = overrides?.folder ?? folderFilter;
    setPage(1);
    fetchFiles({ q: nextQ, type: nextType, folder: nextFolder, pagina: 1 });
  }

  function handleUploaded(file: MediaFile) {
    setFiles((prev) => [file, ...prev]);
    setTotal((t) => t + 1);
    setSelected(file);
  }

  function handleUpdated(updated: MediaFile) {
    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setSelected(updated);
  }

  function handleDeleted(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setTotal((t) => t - 1);
    setSelected(null);
  }

  function toggleCheck(id: string, val: boolean) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (val) next.add(id); else next.delete(id);
      return next;
    });
  }

  async function bulkDelete() {
    if (!checked.size) return;
    setBulkDeleting(true);
    try {
      await fetch("/api/admin/midias", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(checked) }),
      });
      setFiles((prev) => prev.filter((f) => !checked.has(f.id)));
      setTotal((t) => t - checked.size);
      setChecked(new Set());
      setSelected(null);
    } finally {
      setBulkDeleting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const inputCls = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[13px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#526888]";

  return (
    <div className="flex gap-0 h-full min-h-0">
      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters({ q: e.currentTarget.value })}
            placeholder="🔍 Buscar por nome…"
            className={`${inputCls} w-[220px]`}
          />
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); applyFilters({ type: e.target.value }); }}
            className={inputCls}
          >
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={folderFilter}
            onChange={(e) => { setFolderFilter(e.target.value); applyFilters({ folder: e.target.value }); }}
            className={inputCls}
          >
            <option value="">Todas as pastas</option>
            {folders.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          {(q || typeFilter || folderFilter) && (
            <button
              onClick={() => { setQ(""); setTypeFilter(""); setFolderFilter(""); applyFilters({ q: "", type: "", folder: "" }); }}
              className="text-[#7a9ab5] hover:text-white text-[12px] h-[38px] px-2 transition-colors"
            >
              Limpar
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            {checked.size > 0 && (
              <button
                onClick={bulkDelete}
                disabled={bulkDeleting}
                className="bg-[#1a0a0a] border border-[#ff1f1f]/40 hover:border-[#ff1f1f] text-[#ff1f1f] text-[13px] h-[38px] px-4 rounded-[6px] transition-colors disabled:opacity-50"
              >
                {bulkDeleting ? "Excluindo…" : `Excluir ${checked.size} selecionado(s)`}
              </button>
            )}
            <button
              onClick={() => setShowFolderMgr(true)}
              className="h-[38px] px-4 rounded-[6px] text-[13px] font-semibold bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
              </svg>
              Pastas
            </button>
            <button
              onClick={() => setShowUpload((v) => !v)}
              className={`h-[38px] px-5 rounded-[6px] text-[13px] font-semibold transition-colors ${
                showUpload
                  ? "bg-[#141d2c] border border-[#1c2a3e] text-[#d4d4da]"
                  : "bg-[#ff1f1f] hover:bg-[#cc0000] text-white"
              }`}
            >
              {showUpload ? "Fechar upload" : "+ Enviar arquivos"}
            </button>
          </div>
        </div>

        {/* Upload zone */}
        {showUpload && (
          <div className="mb-5 bg-[#0a0f1a] border border-[#1c2a3e] rounded-[10px] p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[#7a9ab5] text-[12px]">Pasta:</span>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[32px] px-2 text-[12px] text-[#d4d4da] focus:outline-none focus:border-[#526888]"
              >
                {folders.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <MediaUploadZone folder={uploadFolder} onUploaded={handleUploaded} />
          </div>
        )}

        {/* Stats */}
        <p className="text-[#526888] text-[12px] mb-3">
          {loading ? "Carregando…" : `${total.toLocaleString("pt-BR")} arquivo(s)${checked.size > 0 ? ` — ${checked.size} selecionado(s)` : ""}`}
        </p>

        {/* Grid */}
        {files.length === 0 && !loading ? (
          <div className="bg-[#0e1520] border border-dashed border-[#1c2a3e] rounded-[10px] p-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="#526888" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
              className="w-10 h-10 mx-auto mb-3">
              <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-[#526888] text-[14px]">Nenhuma mídia encontrada.</p>
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[38px] px-6 rounded-[6px] transition-colors"
            >
              + Enviar primeiro arquivo
            </button>
          </div>
        ) : (
          <div className={`grid gap-2 ${selected ? "grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"} transition-all`}>
            {files.map((file) => (
              <MediaCard
                key={file.id}
                file={file}
                selected={selected?.id === file.id}
                checked={checked.has(file.id)}
                onSelect={() => setSelected((prev) => prev?.id === file.id ? null : file)}
                onCheck={(val) => toggleCheck(file.id, val)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#141d2c]">
            <p className="text-[#526888] text-[12px]">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPage(p); fetchFiles({ pagina: p }); }}
                  className={`w-[30px] h-[30px] rounded-[4px] text-[12px] font-semibold transition-colors ${
                    p === page
                      ? "bg-[#ff1f1f] text-white"
                      : "bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-[320px] shrink-0 ml-5 bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden flex flex-col sticky top-0 self-start max-h-[calc(100vh-120px)]">
          <MediaDetailPanel
            file={selected}
            onClose={() => setSelected(null)}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        </div>
      )}

      {/* Gerenciador de pastas */}
      {showFolderMgr && (
        <FolderManager
          folders={folders}
          onClose={() => setShowFolderMgr(false)}
          onChanged={(updated) => { setFolders(updated); setShowFolderMgr(false); }}
        />
      )}
    </div>
  );
}
