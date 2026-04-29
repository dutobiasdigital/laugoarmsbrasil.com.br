"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const textareaCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const sectionTitle = "text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

interface CategoryData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

interface Props {
  mode: "create" | "edit";
  initial?: CategoryData;
}

export default function CategoryForm({ mode, initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [title, setTitle]           = useState(initial?.title ?? "");
  const [slug, setSlug]             = useState(initial?.slug ?? "");
  const [description, setDesc]      = useState(initial?.description ?? "");
  const [sortOrder, setSortOrder]   = useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive]     = useState(initial?.isActive ?? true);
  const [metaTitle, setMetaTitle]         = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDesc]    = useState(initial?.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords]   = useState(initial?.metaKeywords ?? "");

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
      title, slug, description, sortOrder, isActive,
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

  /* contador de caracteres */
  const metaDescCount = metaDescription.length;
  const metaDescColor = metaDescCount > 160 ? "text-red-400" : metaDescCount > 130 ? "text-amber-400" : "text-[#526888]";

  return (
    <>
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
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
              placeholder="Ex: Roupas, Óculos, Coldres..."
            />
          </div>

          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputCls}
              placeholder="ex: roupas"
            />
            <p className="text-[#526888] text-[11px] mt-1">
              Gerado automaticamente a partir do título. Usado na URL: /loja/<strong>{slug || "slug"}</strong>
            </p>
          </div>

          <div>
            <label className={labelCls}>Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              className={textareaCls}
              placeholder="Descrição chamativa da categoria para exibição na loja..."
            />
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
                className="w-[16px] h-[16px] accent-[#ff1f1f]"
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
                Exibido na aba do navegador e nos resultados do Google. Ideal: até 60 caracteres.{" "}
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
                placeholder="Resumo atrativo da categoria para aparecer nos resultados de busca. Até 160 caracteres."
                maxLength={200}
              />
              <p className={`text-[11px] mt-1 ${metaDescColor}`}>
                {metaDescCount}/160 caracteres — ideal para evitar corte nos resultados do Google.
              </p>
            </div>

            <div>
              <label className={labelCls}>Palavras-chave (keywords)</label>
              <input
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className={inputCls}
                placeholder="Ex: coldre pistola, coldre kydex, coldre tiro esportivo"
              />
              <p className="text-[#526888] text-[11px] mt-1">
                Separadas por vírgula. Auxiliam ferramentas internas de busca.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors"
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
