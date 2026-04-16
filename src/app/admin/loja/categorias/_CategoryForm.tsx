"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const textareaCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";

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
}

interface Props {
  mode: "create" | "edit";
  initial?: CategoryData;
}

export default function CategoryForm({ mode, initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [title, setTitle]       = useState(initial?.title ?? "");
  const [slug, setSlug]         = useState(initial?.slug ?? "");
  const [description, setDesc]  = useState(initial?.description ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive]  = useState(initial?.isActive ?? true);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (mode === "create") {
      setSlug(slugify(val));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body: Record<string, unknown> = { title, slug, description, sortOrder, isActive };
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

  return (
    <>
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-[700px]">
        <div className="grid grid-cols-1 gap-5 mb-5">
          <div>
            <label className={labelCls}>Título *</label>
            <input
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={inputCls}
              placeholder="Ex: Revistas, Livros, Acessórios..."
            />
          </div>

          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputCls}
              placeholder="ex: revistas"
            />
            <p className="text-[#7a9ab5] text-[11px] mt-1">
              Gerado automaticamente a partir do título. Usado na URL da loja.
            </p>
          </div>

          <div>
            <label className={labelCls}>Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              className={textareaCls}
              placeholder="Descrição breve da categoria..."
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
              <p className="text-[#7a9ab5] text-[11px] mt-1">Menor número = aparece primeiro.</p>
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
