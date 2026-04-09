"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createArticle } from "../actions";

const inputCls =
  "bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f] w-full";
const textareaCls =
  "bg-[#27272a] border border-[#3f3f46] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f] w-full resize-none";
const labelCls = "block text-[#a1a1aa] text-[12px] font-semibold mb-1.5";
const selectCls =
  "bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";

interface Props {
  categories: { id: string; name: string }[];
}

export default function ArticleForm({ categories }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await createArticle(_, formData);
      if (result.success) {
        router.push("/admin/artigos");
        return result;
      }
      return result;
    },
    null
  );

  return (
    <>
      {state?.error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
          {state.error}
        </div>
      )}

      <form action={action} className="max-w-[900px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Title - full width */}
          <div className="lg:col-span-3">
            <label className={labelCls}>Título *</label>
            <input
              name="title"
              required
              placeholder="Título do artigo"
              className={inputCls}
            />
          </div>

          {/* Slug */}
          <div className="lg:col-span-2">
            <label className={labelCls}>Slug (URL)</label>
            <input
              name="slug"
              placeholder="gerado automaticamente"
              className={inputCls}
            />
          </div>

          {/* Author */}
          <div>
            <label className={labelCls}>Autor</label>
            <input
              name="authorName"
              defaultValue="Redação Magnum"
              className={inputCls}
            />
          </div>

          {/* Excerpt */}
          <div className="lg:col-span-3">
            <label className={labelCls}>Resumo / Excerpt</label>
            <textarea
              name="excerpt"
              rows={2}
              placeholder="Breve descrição do artigo (exibida na listagem)"
              className={textareaCls}
            />
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <label className={labelCls}>Conteúdo (HTML)</label>
            <textarea
              name="content"
              rows={14}
              placeholder="<h2>Introdução</h2><p>Conteúdo do artigo aqui...</p>"
              className={textareaCls}
            />
          </div>

          {/* Feature image */}
          <div className="lg:col-span-3">
            <label className={labelCls}>URL da Imagem de Destaque</label>
            <input
              name="featureImageUrl"
              type="url"
              placeholder="https://..."
              className={inputCls}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Categoria *</label>
            <select name="categoryId" required className={selectCls}>
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Status</label>
            <select name="status" defaultValue="DRAFT" className={selectCls}>
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </div>

          {/* Published at */}
          <div>
            <label className={labelCls}>Data de Publicação</label>
            <input name="publishedAt" type="date" className={inputCls} />
          </div>

          {/* isExclusive */}
          <div className="flex items-center gap-3 pt-5">
            <input
              id="isExclusive"
              name="isExclusive"
              type="checkbox"
              className="w-[16px] h-[16px] accent-[#ff1f1f]"
            />
            <label htmlFor="isExclusive" className="text-[#d4d4da] text-[14px]">
              Conteúdo exclusivo para assinantes
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors"
          >
            {pending ? "Salvando..." : "Criar Artigo"}
          </button>
          <Link
            href="/admin/artigos"
            className="bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
