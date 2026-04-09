"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateEdition } from "../actions";

const inputCls =
  "bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f] w-full";
const textareaCls =
  "bg-[#27272a] border border-[#3f3f46] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f] w-full resize-none";
const labelCls = "block text-[#a1a1aa] text-[12px] font-semibold mb-1.5";

interface Props {
  edition: {
    id: string;
    title: string;
    slug: string;
    number: number | null;
    type: string;
    editorial: string | null;
    pageCount: number | null;
    coverImageUrl: string | null;
    pdfStoragePath: string | null;
    isPublished: boolean;
    publishedAt: string | null;
  };
}

export default function EditionEditForm({ edition }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await updateEdition(_, formData);
      if (result.success) {
        router.push("/admin/edicoes");
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

      <form action={action} className="max-w-[800px]">
        <input type="hidden" name="id" value={edition.id} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="lg:col-span-2">
            <label className={labelCls}>Título *</label>
            <input
              name="title"
              required
              defaultValue={edition.title}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input name="slug" defaultValue={edition.slug} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Número da Edição</label>
            <input
              name="number"
              type="number"
              defaultValue={edition.number ?? ""}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Tipo</label>
            <select
              name="type"
              defaultValue={edition.type}
              className="bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full"
            >
              <option value="REGULAR">Regular</option>
              <option value="SPECIAL">Especial</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Número de Páginas</label>
            <input
              name="pageCount"
              type="number"
              defaultValue={edition.pageCount ?? ""}
              className={inputCls}
            />
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>URL da Capa</label>
            <input
              name="coverImageUrl"
              type="url"
              defaultValue={edition.coverImageUrl ?? ""}
              placeholder="https://..."
              className={inputCls}
            />
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>Caminho do PDF (Storage)</label>
            <input
              name="pdfStoragePath"
              defaultValue={edition.pdfStoragePath ?? ""}
              placeholder="edicoes/207/revista-magnum-207.pdf"
              className={inputCls}
            />
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>Editorial / Descrição</label>
            <textarea
              name="editorial"
              rows={4}
              defaultValue={edition.editorial ?? ""}
              className={textareaCls}
            />
          </div>

          <div>
            <label className={labelCls}>Data de Publicação</label>
            <input
              name="publishedAt"
              type="date"
              defaultValue={edition.publishedAt ?? ""}
              className={inputCls}
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              defaultChecked={edition.isPublished}
              className="w-[16px] h-[16px] accent-[#ff1f1f]"
            />
            <label htmlFor="isPublished" className="text-[#d4d4da] text-[14px]">
              Publicada (visível no site)
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors"
          >
            {pending ? "Salvando..." : "Salvar Alterações"}
          </button>
          <Link
            href="/admin/edicoes"
            className="bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
