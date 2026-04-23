"use client";

import { useState } from "react";
import type { MediaFile } from "./MediaUploadZone";
import { formatBytes } from "./MediaUploadZone";

interface Props {
  file: MediaFile;
  onClose: () => void;
  onUpdated: (file: MediaFile) => void;
  onDeleted: (id: string) => void;
}

const FOLDERS = ["geral", "artigos", "edicoes", "loja", "banners", "hero"];

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function MediaDetailPanel({ file, onClose, onUpdated, onDeleted }: Props) {
  const [title, setTitle]       = useState(file.title ?? "");
  const [altText, setAltText]   = useState(file.alt_text ?? "");
  const [desc, setDesc]         = useState(file.description ?? "");
  const [folder, setFolder]     = useState(file.folder);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error, setError]       = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/midias/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, alt_text: altText, description: desc, folder }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar");
      onUpdated(json.file);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/midias/${file.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      onDeleted(file.id);
    } catch (e) {
      setError(String(e));
      setDeleting(false);
      setConfirmDel(false);
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(file.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputCls = "w-full bg-[#0a0f1a] border border-[#1c2a3e] rounded-[6px] px-3 py-2 text-[13px] text-[#d4d4da] placeholder-white/20 focus:outline-none focus:border-[#526888]";
  const labelCls = "block text-[#7a9ab5] text-[11px] font-semibold mb-1 uppercase tracking-wide";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#141d2c]">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[20px] leading-none truncate pr-3">
          {file.title ?? file.filename}
        </h3>
        <button
          onClick={onClose}
          className="text-[#526888] hover:text-white transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            className="w-5 h-5">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="bg-[#060a12] border-b border-[#141d2c] flex items-center justify-center" style={{ minHeight: 200, maxHeight: 280 }}>
        {file.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={file.alt_text ?? file.filename}
            className="max-w-full max-h-[260px] object-contain"
          />
        ) : file.type === "video" ? (
          <video src={file.url} controls className="max-w-full max-h-[260px]" />
        ) : file.type === "pdf" ? (
          <div className="text-center py-6">
            <span className="text-[#ff1f1f] text-[32px] font-bold">PDF</span>
            <p className="text-[#526888] text-[12px] mt-2">{file.filename}</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="#526888" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
              className="w-12 h-12 mx-auto mb-2">
              <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-[#526888] text-[12px]">{file.filename}</p>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* File info */}
        <div className="bg-[#0a0f1a] border border-[#141d2c] rounded-[8px] p-3 space-y-1.5 text-[12px]">
          <div className="flex justify-between">
            <span className="text-[#526888]">Tipo</span>
            <span className="text-[#d4d4da] uppercase">{file.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#526888]">Tamanho</span>
            <span className="text-[#d4d4da]">{formatBytes(file.size_bytes)}</span>
          </div>
          {file.width && file.height && (
            <div className="flex justify-between">
              <span className="text-[#526888]">Dimensões</span>
              <span className="text-[#d4d4da]">{file.width} × {file.height}px</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#526888]">Enviado em</span>
            <span className="text-[#d4d4da]">{fmt(file.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#526888]">Pasta</span>
            <span className="text-[#d4d4da]">{file.folder}</span>
          </div>
        </div>

        {/* URL */}
        <div>
          <label className={labelCls}>URL do arquivo</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={file.url}
              className={`${inputCls} flex-1 text-[11px] cursor-default`}
            />
            <button
              onClick={copyUrl}
              className={`shrink-0 h-[36px] px-3 rounded-[6px] text-[12px] font-semibold border transition-colors ${
                copied
                  ? "bg-[#0f381f] border-[#22c55e] text-[#22c55e]"
                  : "bg-[#141d2c] border-[#1c2a3e] text-[#7a9ab5] hover:text-white"
              }`}
            >
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>

        {/* Editable fields */}
        <div>
          <label className={labelCls}>Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Título da mídia" />
        </div>
        <div>
          <label className={labelCls}>Texto alternativo (alt)</label>
          <input value={altText} onChange={(e) => setAltText(e.target.value)} className={inputCls} placeholder="Descreva a imagem para acessibilidade" />
        </div>
        <div>
          <label className={labelCls}>Descrição</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="Descrição opcional"
          />
        </div>
        <div>
          <label className={labelCls}>Pasta</label>
          <select value={folder} onChange={(e) => setFolder(e.target.value)} className={inputCls}>
            {FOLDERS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-[#ff1f1f] text-[12px]">{error}</p>}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold h-[38px] rounded-[6px] transition-colors"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-[#526888] text-[#7a9ab5] hover:text-white text-[13px] h-[38px] px-4 rounded-[6px] flex items-center transition-colors"
          >
            Abrir
          </a>
        </div>

        {/* Delete */}
        <div className="border-t border-[#141d2c] pt-4">
          {!confirmDel ? (
            <button
              onClick={() => setConfirmDel(true)}
              className="w-full text-[#526888] hover:text-[#ff1f1f] text-[12px] h-[34px] border border-[#141d2c] hover:border-[#ff1f1f]/40 rounded-[6px] transition-colors"
            >
              Excluir arquivo
            </button>
          ) : (
            <div className="bg-[#1a0a0a] border border-[#ff1f1f]/30 rounded-[8px] p-3 space-y-2">
              <p className="text-[#d4d4da] text-[12px]">Confirmar exclusão? Esta ação é irreversível.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[12px] font-semibold h-[32px] rounded-[6px] transition-colors"
                >
                  {deleting ? "Excluindo…" : "Sim, excluir"}
                </button>
                <button
                  onClick={() => setConfirmDel(false)}
                  className="flex-1 bg-[#141d2c] text-[#7a9ab5] hover:text-white text-[12px] h-[32px] rounded-[6px] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
