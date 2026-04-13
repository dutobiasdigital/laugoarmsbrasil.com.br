"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import ImageUpload from "@/components/admin/ImageUpload";

const RichEditor = dynamic(() => import("@/components/admin/RichEditor"), { ssr: false });

const inputCls =
  "bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#a1a1aa] text-[12px] font-semibold mb-1.5";

interface TocItem { page: string; title: string; category: string; }
interface Category { id: string; name: string; slug: string; }

interface Props {
  edition: {
    id: string;
    title: string;
    slug: string;
    number: number | null;
    type: string;
    editorial: string | null;
    tableOfContents: string | null;
    pageCount: number | null;
    coverImageUrl: string | null;
    pdfStoragePath: string | null;
    pageFlipUrl: string | null;
    isPublished: boolean;
    publishedAt: string | null;
  };
}

function parseToc(raw: string | null): TocItem[] {
  try { return JSON.parse(raw ?? "[]"); } catch { return []; }
}

export default function EditionEditForm({ edition }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editionNumber, setEditionNumber] = useState(String(edition.number ?? ""));
  const [editionType, setEditionType] = useState(edition.type);
  const [editorial, setEditorial] = useState(edition.editorial ?? "");

  // TOC
  const [tocItems, setTocItems] = useState<TocItem[]>(parseToc(edition.tableOfContents));
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [savingCat, setSavingCat] = useState(false);

  const folder = editionType === "REGULAR" ? "edicoes/regular" : "edicoes/especiais";
  const filename = editionNumber ? `ed${String(editionNumber).padStart(3, "0")}-capa` : undefined;

  useEffect(() => {
    fetch("/api/admin/categorias")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : data.categories ?? []))
      .catch(() => {});
  }, []);

  async function addCategory() {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    const res = await fetch("/api/admin/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName.trim() }),
    });
    const data = await res.json();
    setSavingCat(false);
    if (res.ok && data.id) {
      setCategories((prev) => [...prev, data]);
      setNewCatName("");
      setAddingCat(false);
    }
  }

  function addTocItem() {
    setTocItems((prev) => [...prev, { page: "", title: "", category: "" }]);
  }

  function updateTocItem(i: number, field: keyof TocItem, value: string) {
    setTocItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function removeTocItem(i: number) {
    setTocItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const body = {
      ...Object.fromEntries(formData),
      editorial,
      tableOfContents: JSON.stringify(tocItems.filter((t) => t.title)),
    };
    const res = await fetch("/api/admin/edicoes", {
      method: "PUT",
      body: JSON.stringify(body),
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

      <form onSubmit={handleSubmit} className="max-w-[860px]">
        <input type="hidden" name="id" value={edition.id} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Título */}
          <div className="lg:col-span-2">
            <label className={labelCls}>Título *</label>
            <input name="title" required defaultValue={edition.title} className={inputCls} />
          </div>

          {/* Slug */}
          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input name="slug" defaultValue={edition.slug} className={inputCls} />
          </div>

          {/* Número */}
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

          {/* Tipo */}
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

          {/* Páginas */}
          <div>
            <label className={labelCls}>Número de Páginas</label>
            <input name="pageCount" type="number" defaultValue={edition.pageCount ?? ""} className={inputCls} />
          </div>

          {/* Capa */}
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

          {/* Page Flip */}
          <div className="lg:col-span-2">
            <label className={labelCls}>URL do Page Flip (leitor online)</label>
            <input name="pageFlipUrl" defaultValue={edition.pageFlipUrl ?? ""} placeholder="https://online.fliphtml5.com/..." className={inputCls} />
          </div>

          {/* PDF */}
          <div className="lg:col-span-2">
            <label className={labelCls}>Caminho do PDF (Storage)</label>
            <input name="pdfStoragePath" defaultValue={edition.pdfStoragePath ?? ""} placeholder="edicoes/207/revista-magnum-207.pdf" className={inputCls} />
          </div>

          {/* Editorial (RichEditor) */}
          <div className="lg:col-span-2">
            <label className={labelCls}>Editorial / Descrição</label>
            <RichEditor value={edition.editorial ?? ""} onChange={setEditorial} />
          </div>

          {/* Data publicação */}
          <div>
            <label className={labelCls}>Data de Publicação</label>
            <input name="publishedAt" type="date" defaultValue={edition.publishedAt ?? ""} className={inputCls} />
          </div>

          {/* Publicada */}
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

        {/* ── ÍNDICE ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[#a1a1aa] text-[12px] font-semibold uppercase tracking-[1px]">Índice da Edição</p>
              <p className="text-[#52525b] text-[11px] mt-0.5">Cada linha vira uma entrada no índice da edição pública.</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Inline add category */}
              {addingCat ? (
                <div className="flex items-center gap-1.5">
                  <input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
                    placeholder="Nome da categoria"
                    className="bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[32px] px-2.5 text-[13px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-[180px]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    disabled={savingCat}
                    className="bg-[#ff1f1f] text-white text-[12px] h-[32px] px-3 rounded-[6px] disabled:opacity-50"
                  >
                    {savingCat ? "..." : "Salvar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAddingCat(false); setNewCatName(""); }}
                    className="text-[#52525b] hover:text-[#a1a1aa] text-[12px] h-[32px] px-2"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingCat(true)}
                  className="bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 text-[#a1a1aa] text-[12px] h-[32px] px-3 rounded-[6px] transition-colors"
                >
                  + Nova categoria
                </button>
              )}
              <button
                type="button"
                onClick={addTocItem}
                className="bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 text-[#d4d4da] text-[12px] h-[32px] px-3 rounded-[6px] transition-colors"
              >
                + Adicionar item
              </button>
            </div>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] rounded-[8px] overflow-hidden">
            {/* Header */}
            <div className="bg-[#27272a] px-4 py-2 grid grid-cols-[100px_1fr_180px_36px] gap-3">
              {["Página", "Título da Matéria", "Categoria", ""].map((h) => (
                <p key={h} className="text-[#52525b] text-[10px] font-semibold tracking-[0.5px] uppercase">{h}</p>
              ))}
            </div>

            {tocItems.length === 0 ? (
              <p className="text-[#52525b] text-[13px] text-center py-6">
                Nenhum item. Clique em "+ Adicionar item" para começar.
              </p>
            ) : (
              tocItems.map((item, i) => (
                <div key={i} className={`px-4 py-2.5 grid grid-cols-[100px_1fr_180px_36px] gap-3 items-center ${i > 0 ? "border-t border-[#27272a]" : ""}`}>
                  <input
                    type="number"
                    placeholder="Ex: 4"
                    value={item.page}
                    onChange={(e) => updateTocItem(i, "page", e.target.value)}
                    className="bg-[#27272a] border border-[#3f3f46] rounded-[4px] h-[34px] px-2.5 text-[13px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full"
                  />
                  <input
                    type="text"
                    placeholder="Título do artigo ou seção"
                    value={item.title}
                    onChange={(e) => updateTocItem(i, "title", e.target.value)}
                    className="bg-[#27272a] border border-[#3f3f46] rounded-[4px] h-[34px] px-2.5 text-[13px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full"
                  />
                  <select
                    value={item.category}
                    onChange={(e) => updateTocItem(i, "category", e.target.value)}
                    className="bg-[#27272a] border border-[#3f3f46] rounded-[4px] h-[34px] px-2 text-[13px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full"
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeTocItem(i)}
                    className="text-[#52525b] hover:text-[#ff6b6b] text-[16px] h-[34px] flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
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
