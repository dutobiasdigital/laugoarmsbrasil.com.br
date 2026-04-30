"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#CB0A0E] w-full";
const textareaCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#CB0A0E] w-full resize-none";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const sectionTitle = "text-[#CB0A0E] text-[10px] font-bold tracking-[1.5px] uppercase mb-4";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

export interface MediaFileOption {
  id: string;
  url: string;
  filename: string;
  alt_text: string | null;
  type: string;
}

export interface GaleriaItemData {
  url: string;
  filename?: string;
  alt_text?: string;
  media_type?: string;
  sort_order?: number;
}

export interface GaleriaData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  cover_url: string;
  is_active: boolean;
  sort_order: number;
  items?: GaleriaItemData[];
}

interface Props {
  mode: "create" | "edit";
  initial?: GaleriaData;
  mediaFiles: MediaFileOption[];
}

export default function GaleriaForm({ mode, initial, mediaFiles }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [title, setTitle]         = useState(initial?.title ?? "");
  const [slug, setSlug]           = useState(initial?.slug ?? "");
  const [description, setDesc]    = useState(initial?.description ?? "");
  const [coverUrl, setCoverUrl]   = useState(initial?.cover_url ?? "");
  const [isActive, setIsActive]   = useState(initial?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [mediaFilter, setMediaFilter] = useState<"all" | "image" | "video">("all");

  // Items selecionados (mapeados por url para evitar duplicatas)
  const [selectedItems, setSelectedItems] = useState<GaleriaItemData[]>(
    initial?.items ?? []
  );

  const selectedUrls = new Set(selectedItems.map((i) => i.url));

  const filteredMedia = mediaFiles.filter((f) => {
    if (mediaFilter === "all") return true;
    return f.type === mediaFilter;
  });

  function handleTitleChange(val: string) {
    setTitle(val);
    if (mode === "create") setSlug(slugify(val));
  }

  function toggleMedia(file: MediaFileOption) {
    if (selectedUrls.has(file.url)) {
      setSelectedItems((prev) => prev.filter((i) => i.url !== file.url));
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          url:        file.url,
          filename:   file.filename,
          alt_text:   file.alt_text ?? "",
          media_type: file.type === "video" ? "video" : "image",
          sort_order: prev.length,
        },
      ]);
    }
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const next = [...selectedItems];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    // reassign sort_order
    setSelectedItems(next.map((item, i) => ({ ...item, sort_order: i })));
  }

  function removeItem(idx: number) {
    setSelectedItems((prev) => prev.filter((_, i) => i !== idx).map((item, i) => ({ ...item, sort_order: i })));
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const body: Record<string, unknown> = {
        title,
        slug,
        description,
        cover_url: coverUrl,
        is_active: isActive,
        sort_order: sortOrder,
        items: selectedItems,
      };
      if (mode === "edit" && initial?.id) body.id = initial.id;

      const res = await fetch("/api/admin/galerias", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar galeria.");
        setLoading(false);
        return;
      }

      router.push("/admin/galerias");
    },
    [title, slug, description, coverUrl, isActive, sortOrder, selectedItems, mode, initial, router]
  );

  return (
    <>
      {error && (
        <div className="bg-[#2d0a0a] border border-[#CB0A0E] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-[820px]">

        {/* ── Informações básicas ── */}
        <div className="flex flex-col gap-5 mb-8">
          <p className={sectionTitle}>Informações da Galeria</p>

          <div>
            <label className={labelCls}>Título *</label>
            <input
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={inputCls}
              placeholder="Ex: Exposição FENAEXER 2026"
            />
          </div>

          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputCls}
              placeholder="ex: exposicao-fenaexer-2026"
            />
            <p className="text-[#526888] text-[11px] mt-1">
              Gerado automaticamente. Usado na URL: /galerias/<strong>{slug || "slug"}</strong>
            </p>
          </div>

          <div>
            <label className={labelCls}>Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              className={textareaCls}
              placeholder="Descrição da galeria..."
            />
          </div>

          <div>
            <label className={labelCls}>URL da Imagem de Capa</label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className={inputCls}
              placeholder="https://..."
            />
            {coverUrl && (
              <img
                src={coverUrl}
                alt="Capa"
                className="mt-2 h-[80px] w-auto rounded-[6px] object-cover border border-[#1c2a3e]"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Ordem de Exibição</label>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <div className="flex items-center gap-3 pt-7">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-[16px] h-[16px] accent-[#CB0A0E]"
              />
              <label htmlFor="isActive" className="text-[#d4d4da] text-[14px]">
                Galeria ativa (visível no site)
              </label>
            </div>
          </div>
        </div>

        {/* ── Media picker ── */}
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className={sectionTitle + " mb-0"}>Imagens da Galeria</p>
            <div className="flex gap-2">
              {(["all", "image", "video"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setMediaFilter(f)}
                  className={`text-[11px] px-3 h-[28px] rounded-[4px] font-semibold transition-colors ${
                    mediaFilter === f
                      ? "bg-[#CB0A0E] text-white"
                      : "bg-[#141d2c] text-[#7a9ab5] hover:text-white"
                  }`}
                >
                  {f === "all" ? "Todos" : f === "image" ? "Imagens" : "Vídeos"}
                </button>
              ))}
            </div>
          </div>

          {filteredMedia.length === 0 ? (
            <p className="text-[#526888] text-[13px] text-center py-6">
              Nenhuma mídia encontrada. Faça upload na{" "}
              <Link href="/admin/midias" className="text-[#CB0A0E] hover:opacity-80">
                biblioteca de mídias
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-6 gap-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredMedia.map((file) => {
                const selected = selectedUrls.has(file.url);
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => toggleMedia(file)}
                    title={file.filename}
                    className={`relative rounded-[6px] overflow-hidden aspect-square border-2 transition-all ${
                      selected
                        ? "border-green-500 ring-2 ring-green-500/40"
                        : "border-[#1c2a3e] hover:border-[#526888]"
                    }`}
                  >
                    {file.type === "video" ? (
                      <div className="w-full h-full bg-[#141d2c] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                          className="w-6 h-6 text-[#526888]">
                          <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={file.url}
                        alt={file.alt_text ?? file.filename}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {selected && (
                      <div className="absolute top-1 right-1 w-[18px] h-[18px] bg-green-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Items selecionados com ordenação */}
          {selectedItems.length > 0 && (
            <div className="mt-5 border-t border-[#1c2a3e] pt-4">
              <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px] mb-3">
                {selectedItems.length} {selectedItems.length === 1 ? "item selecionado" : "itens selecionados"} — arranje a ordem
              </p>
              <div className="flex flex-col gap-2">
                {selectedItems.map((item, idx) => (
                  <div
                    key={item.url}
                    className="flex items-center gap-3 bg-[#141d2c] rounded-[6px] px-3 py-2"
                  >
                    <span className="text-[#526888] text-[11px] w-[20px] text-center font-mono">{idx + 1}</span>
                    {item.media_type === "video" ? (
                      <div className="w-[40px] h-[30px] bg-[#0d1520] rounded-[4px] flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                          className="w-4 h-4 text-[#526888]">
                          <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.alt_text ?? ""}
                        className="w-[40px] h-[30px] object-cover rounded-[4px] shrink-0"
                      />
                    )}
                    <span className="flex-1 text-[#d4d4da] text-[12px] truncate">{item.filename || item.url.split("/").pop()}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0}
                        className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] text-[#7a9ab5] hover:text-white hover:bg-[#1c2a3e] disabled:opacity-30 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === selectedItems.length - 1}
                        className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] text-[#7a9ab5] hover:text-white hover:bg-[#1c2a3e] disabled:opacity-30 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] text-[#526888] hover:text-red-400 hover:bg-[#1c2a3e] transition-colors ml-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Ações ── */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#CB0A0E] hover:bg-[#a80009] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors"
          >
            {loading ? "Salvando..." : mode === "create" ? "Criar Galeria" : "Salvar Alterações"}
          </button>
          <Link
            href="/admin/galerias"
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
