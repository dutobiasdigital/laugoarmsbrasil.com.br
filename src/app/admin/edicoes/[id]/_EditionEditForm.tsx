"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editionNumber, setEditionNumber] = useState(String(edition.number ?? ""));
  const [editionType, setEditionType] = useState(edition.type);

  const folder = editionType === "REGULAR" ? "edicoes/regular" : "edicoes/especiais";
  const filename = editionNumber ? `ed${String(editionNumber).padStart(3, "0")}-capa` : undefined;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/edicoes", {
      method: "PUT",
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao atualizar edição.");
      setLoading(false);
      return;
    }
    router.push("/admin/edicoes");
  }

  return (
    <>
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-[800px]">
        <input type="hidden" name="id" value={edition.id} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="lg:col-span-2">
            <label className={labelCls}>Título *</label>
            <input name="title" required defaultValue={edition.title} className={inputCls} />
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
              value={editionNumber}
              onChange={(e) => setEditionNumber(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Tipo</label>
            <select
              name="type"
              value={editionType}
              onChange={(e) => setEditionType(e.target.value)}
              className="bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full"
            >
              <option value="REGULAR">Regular</option>
              <option value="SPECIAL">Especial</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Número de Páginas</label>
            <input name="pageCount" type="number" defaultValue={edition.pageCount ?? ""} className={inputCls} />
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>Imagem da Capa</label>
            <ImageUpload
              folder={folder}
              filename={filename}
              defaultUrl={edition.coverImageUrl ?? ""}
              inputName="coverImageUrl"
              aspectHint={`Será salva em: ${folder}/${filename ?? "ed{numero}-capa"}.jpg`}
            />
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>Caminho do PDF (Storage)</label>
            <input name="pdfStoragePath" defaultValue={edition.pdfStoragePath ?? ""} placeholder="edicoes/207/revista-magnum-207.pdf" className={inputCls} />
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>Editorial / Descrição</label>
            <textarea name="editorial" rows={4} defaultValue={edition.editorial ?? ""} className={textareaCls} />
          </div>

          <div>
            <label className={labelCls}>Data de Publicação</label>
            <input name="publishedAt" type="date" defaultValue={edition.publishedAt ?? ""} className={inputCls} />
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
            disabled={loading}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
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
