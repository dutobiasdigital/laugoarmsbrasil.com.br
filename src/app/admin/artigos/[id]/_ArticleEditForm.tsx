"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import ImageUpload, { slugify } from "@/components/admin/ImageUpload";

const RichEditor = dynamic(() => import("@/components/admin/RichEditor"), { ssr: false });

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full";
const textareaCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-full resize-none";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const selectCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";

interface Props {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    authorName: string;
    featureImageUrl: string | null;
    categoryId: string;
    isExclusive: boolean;
    status: string;
    publishedAt: string | null;
  };
  categories: { id: string; name: string }[];
}

export default function ArticleEditForm({ article, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState(article.content);
  const [title, setTitle] = useState(article.title);

  const imageFilename = title ? `artigo-${slugify(title)}` : undefined;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const body = { ...Object.fromEntries(formData), content };
    const res = await fetch("/api/admin/artigos", {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao atualizar artigo.");
      setLoading(false);
      return;
    }
    router.push("/admin/artigos");
  }

  return (
    <>
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-[900px]">
        <input type="hidden" name="id" value={article.id} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-3">
            <label className={labelCls}>Título *</label>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>Slug (URL)</label>
            <input name="slug" defaultValue={article.slug} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Autor</label>
            <input name="authorName" defaultValue={article.authorName} className={inputCls} />
          </div>

          <div className="lg:col-span-3">
            <label className={labelCls}>Resumo / Excerpt</label>
            <textarea name="excerpt" rows={2} defaultValue={article.excerpt ?? ""} className={textareaCls} />
          </div>

          <div className="lg:col-span-3">
            <label className={labelCls}>Conteúdo</label>
            <RichEditor value={article.content} onChange={setContent} />
          </div>

          <div className="lg:col-span-3">
            <label className={labelCls}>Imagem de Destaque</label>
            <ImageUpload
              folder="artigos"
              filename={imageFilename}
              defaultUrl={article.featureImageUrl ?? ""}
              inputName="featureImageUrl"
              aspectHint="Proporção recomendada: 16:9"
            />
          </div>

          <div>
            <label className={labelCls}>Categoria *</label>
            <select name="categoryId" required defaultValue={article.categoryId} className={selectCls}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select name="status" defaultValue={article.status} className={selectCls}>
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Data de Publicação</label>
            <input name="publishedAt" type="date" defaultValue={article.publishedAt ?? ""} className={inputCls} />
          </div>

          <div className="flex items-center gap-3 pt-5">
            <input id="isExclusive" name="isExclusive" type="checkbox" defaultChecked={article.isExclusive} className="w-[16px] h-[16px] accent-[#ff1f1f]" />
            <label htmlFor="isExclusive" className="text-[#d4d4da] text-[14px]">Conteúdo exclusivo para assinantes</label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors">
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
          <Link href="/admin/artigos" className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
