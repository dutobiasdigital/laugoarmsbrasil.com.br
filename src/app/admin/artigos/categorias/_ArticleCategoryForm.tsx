"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const RichEditor = dynamic(() => import("@/components/admin/RichEditor"), { ssr: false });

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

export interface ArticleCategoryData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  mode: "create" | "edit";
  initial?: ArticleCategoryData;
}

export default function ArticleCategoryForm({ mode, initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [name, setName]           = useState(initial?.name ?? "");
  const [slug, setSlug]           = useState(initial?.slug ?? "");
  const [description, setDesc]    = useState(initial?.description ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive]   = useState(initial?.isActive ?? true);

  function handleNameChange(val: string) {
    setName(val);
    if (mode === "create") setSlug(slugify(val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body: Record<string, unknown> = { name, slug, description, sortOrder, isActive };
    if (mode === "edit" && initial?.id) body.id = initial.id;

    const res = await fetch("/api/admin/artigos/categorias", {
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

    router.push("/admin/artigos/categorias");
  }

  return (
    <>
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">

        <div className="flex flex-col gap-5 mb-8">

          <div>
            <label className={labelCls}>Nome *</label>
            <input
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={inputCls}
              placeholder="Ex: Avaliações, Legislação, Manutenção..."
            />
          </div>

          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputCls}
              placeholder="ex: avaliacoes"
            />
            <p className="text-[#526888] text-[11px] mt-1">
              Gerado automaticamente a partir do nome.
            </p>
          </div>

          <div>
            <label className={labelCls}>Descrição</label>
            <RichEditor value={description} onChange={setDesc} />
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
                Categoria ativa
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
            href="/admin/artigos/categorias"
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
