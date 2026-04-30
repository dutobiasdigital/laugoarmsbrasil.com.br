"use client";

import { useState } from "react";
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

export interface CategoryOption {
  id: string;
  title: string;
  parentId: string | null;
}

interface CategoryData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

interface Props {
  mode: "create" | "edit";
  initial?: CategoryData;
  allCategories?: CategoryOption[];
}

export default function CategoryForm({ mode, initial, allCategories = [] }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [title, setTitle]           = useState(initial?.title ?? "");
  const [slug, setSlug]             = useState(initial?.slug ?? "");
  const [description, setDesc]      = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl]     = useState(initial?.imageUrl ?? "");
  const [parentId, setParentId]     = useState(initial?.parentId ?? "");
  const [sortOrder, setSortOrder]   = useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive]     = useState(initial?.isActive ?? true);
  const [metaTitle, setMetaTitle]         = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDesc]    = useState(initial?.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords]   = useState(initial?.metaKeywords ?? "");

  // Only show root categories as parent options (prevent deep nesting)
  const parentOptions = allCategories.filter(
    (c) => c.id !== initial?.id && c.parentId === null
  );

  function handleTitleChange(val: string) {
    setTitle(val);
    if (mode === "create") {
      setSlug(slugify(val));
      if (!metaTitle) setMetaTitle(`${val} | Loja Laúgo Arms Brasil`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body: Record<string, unknown> = {
      title, slug, description,
      imageUrl: imageUrl.trim() || null,
      parentId: parentId || null,
      sortOrder, isActive,
      metaTitle, metaDescription, metaKeywords,
    };
    if (mode === "edit" && initial?.id) body.id = initial.id;

    const res = await fetch("/api/admin/loja/categorias", {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao salvar categoria.");
      setLoading(false);
      return;
    }

    router.push("/admin/loja/categorias");
  }

  const metaDescCount = metaDescription.length;
  const metaDescColor = metaDescCount > 160 ? "text-red-400" : metaDescCount > 130 ? "text-amber-400" : "text-[#526888]";

  return (
    <>
      {error && (
        <div className="bg-[#2d0a0a] border border-[#CB0A0E] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-[700px]">

        {/* ── Informações básicas ── */}
        <div className="flex flex-col gap-5 mb-8">
          <p className={sectionTitle}>Informações da Categoria</p>

          <div>
            <label className={labelCls}>Título *</label>
            <input
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={inputCls}
              placeholder="Ex: Coldres, Óculos Balísticos, Munições..."
            />
          </div>

          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputCls}
              placeholder="ex: coldres"
            />
            <p className="text-[#526888] text-[11px] mt-1">
              Gerado automaticamente. Usado na URL: /loja/<strong>{slug || "slug"}</strong>
            </p>
          </div>

          {/* Categoria pai */}
          <div>
            <label className={labelCls}>Categoria Pai</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#CB0A0E] w-full"
            >
              <option value="">Nenhuma (categoria principal)</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <p className="text-[#526888] text-[11px] mt-1">
              Deixe em branco para criar uma categoria raiz. Subcategorias aparecem agrupadas sob a categoria pai.
            </p>
          </div>

          <div>
            <label className={labelCls}>Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              className={textareaCls}
              placeholder="Descrição da categoria para exibição na loja..."
            />
          </div>

          {/* Imagem */}
          <div>
            <label className={labelCls}>Imagem da Categoria (URL)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputCls}
              placeholder="https://jpjhryhvdwxmluyswvli.supabase.co/storage/v1/object/public/laugo-media/..."
            />
            <p className="text-[#526888] text-[11px] mt-1">
              Cole a URL de uma imagem da Biblioteca de Mídias.
            </p>
            {imageUrl && (
              <div className="mt-3 relative w-full max-w-[320px] aspect-video bg-[#0a0f1a] rounded-[8px] overflow-hidden border border-[#1c2a3e]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview da imagem"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[11px] px-2 py-1 rounded-[4px] transition-colors"
                >
                  Remover
                </button>
              </div>
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
              <p className="text-[#526888] text-[11px] mt-1">Menor número = aparece primeiro.</p>
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
                Categoria ativa (visível na loja)
              </label>
            </div>
          </div>
        </div>

        {/* ── SEO ── */}
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5 mb-8">
          <p className={sectionTitle}>SEO — Mecanismos de Busca</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Título da Página (meta title)</label>
              <input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={inputCls}
                placeholder="Ex: Coldres para Pistolas e Revólveres | Loja Laúgo Arms"
                maxLength={70}
              />
              <p className="text-[#526888] text-[11px] mt-1">
                Ideal: até 60 caracteres.{" "}
                <span className={metaTitle.length > 60 ? "text-amber-400" : "text-[#526888]"}>
                  {metaTitle.length}/70
                </span>
              </p>
            </div>

            <div>
              <label className={labelCls}>Descrição (meta description)</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDesc(e.target.value)}
                className={textareaCls}
                placeholder="Resumo atrativo para aparecer nos resultados de busca. Até 160 caracteres."
                maxLength={200}
              />
              <p className={`text-[11px] mt-1 ${metaDescColor}`}>
                {metaDescCount}/160 caracteres
              </p>
            </div>

            <div>
              <label className={labelCls}>Palavras-chave</label>
              <input
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className={inputCls}
                placeholder="Ex: coldre pistola, coldre kydex, coldre tiro esportivo"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#CB0A0E] hover:bg-[#A00810] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors"
          >
            {loading ? "Salvando..." : mode === "create" ? "Criar Categoria" : "Salvar Alterações"}
          </button>
          <Link
            href="/admin/loja/categorias"
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
