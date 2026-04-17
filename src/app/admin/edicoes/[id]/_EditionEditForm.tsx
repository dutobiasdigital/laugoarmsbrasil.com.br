"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import ImageUpload from "@/components/admin/ImageUpload";

const RichEditor = dynamic(() => import("@/components/admin/RichEditor"), { ssr: false });

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const textareaCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";

interface TocItem { page: string; title: string; category: string; }
interface Category { id: string; name: string; slug: string; }

type MarkedPage = { filename: string; url: string };

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
    summary: string | null;
    coverImageUrl: string | null;
    pdfStoragePath: string | null;
    pageFlipUrl: string | null;
    isPublished: boolean;
    isOnNewstand: boolean;
    publishedAt: string | null;
    editorialPageFiles?: string[];
    indexPageFiles?: string[];
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;
    canonicalUrl: string | null;
  };
  editorialPageUrls?: MarkedPage[];
  indexPageUrls?: MarkedPage[];
}

function parseToc(raw: string | null): TocItem[] {
  try { return JSON.parse(raw ?? "[]"); } catch { return []; }
}

/* ── Limpador de HTML sujo (Word / Google Docs) ─────── */
function cleanHtml(html: string): string {
  const ALLOWED: Record<string, string[]> = {
    p: [], br: [], strong: [], em: [], b: [], i: [], u: [],
    h2: [], h3: [], h4: [],
    ul: [], ol: [], li: [],
    a: ["href"],
    blockquote: [], hr: [],
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  function walk(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const inner = Array.from(el.childNodes).map(walk).join("");
    if (!(tag in ALLOWED)) return inner; // unwrap unknown tags
    if (tag === "br" || tag === "hr") return `<${tag} />`;
    let attrs = "";
    for (const attr of ALLOWED[tag]) {
      if (el.hasAttribute(attr)) {
        attrs += ` ${attr}="${(el.getAttribute(attr) ?? "").replace(/"/g, "&quot;")}"`;
      }
    }
    return `<${tag}${attrs}>${inner}</${tag}>`;
  }

  return Array.from(doc.body.childNodes)
    .map(walk)
    .join("")
    .replace(/<p>\s*<\/p>/g, "")
    .trim();
}

/* ── Toggle de visualização HTML ─────────────────────── */
function HtmlToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [mode, setMode] = useState<"visual" | "html">("visual");

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={labelCls.replace(" mb-1.5", "")}>{label}</label>
        <div className="flex items-center gap-2">
          {mode === "html" && (
            <button
              type="button"
              onClick={() => onChange(cleanHtml(value))}
              title="Remove formatação suja do Word/Google Docs, mantendo apenas tags básicas"
              className="px-2.5 h-[28px] text-[11px] font-semibold bg-[#0e1520] hover:bg-[#141d2c] text-[#7a9ab5] hover:text-white rounded-[6px] border border-[#1c2a3e] transition-colors"
            >
              🧹 Limpar HTML
            </button>
          )}
          <div className="flex rounded-[6px] overflow-hidden border border-[#1c2a3e]">
            {(["visual", "html"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 h-[28px] text-[11px] font-semibold transition-colors ${
                  mode === m
                    ? "bg-[#ff1f1f] text-white"
                    : "bg-[#141d2c] text-[#7a9ab5] hover:text-white"
                }`}
              >
                {m === "visual" ? "Visual" : "HTML"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === "visual" ? (
        <RichEditor value={value} onChange={onChange} />
      ) : (
        <textarea
          rows={16}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#070a12] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[12px] text-[#22c55e] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-y font-mono leading-relaxed"
          placeholder="HTML bruto da edição..."
          spellCheck={false}
        />
      )}
    </div>
  );
}

export default function EditionEditForm({ edition, editorialPageUrls = [], indexPageUrls = [] }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editionNumber, setEditionNumber] = useState(String(edition.number ?? ""));
  const [editionType, setEditionType] = useState(edition.type);
  const [editorial, setEditorial] = useState(edition.editorial ?? "");
  const [isOnNewstand, setIsOnNewstand] = useState(edition.isOnNewstand);

  // TOC
  const [tocItems, setTocItems] = useState<TocItem[]>(parseToc(edition.tableOfContents));
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [savingCat, setSavingCat] = useState(false);

  const [seoTitle,       setSeoTitle]       = useState(edition.seoTitle       ?? "");
  const [seoDescription, setSeoDescription] = useState(edition.seoDescription ?? "");
  const [seoKeywords,    setSeoKeywords]    = useState(edition.seoKeywords    ?? "");
  const [canonicalUrl,   setCanonicalUrl]   = useState(edition.canonicalUrl   ?? "");

  const seoTitleCount = seoTitle.length;
  const seoDescCount  = seoDescription.length;

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

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const res = await fetch("/api/admin/edicoes", {
      method: "DELETE",
      body: JSON.stringify({ id: edition.id }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao excluir edição.");
      setDeleting(false);
      setConfirmDelete(false);
      return;
    }
    router.push("/admin/edicoes");
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
      isOnNewstand,
      seoTitle,
      seoDescription,
      seoKeywords,
      canonicalUrl,
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

          {/* Chamada / Resumo */}
          <div className="lg:col-span-2">
            <label className={labelCls}>
              Chamada da Edição
              <span className="text-[#3a4a5e] font-normal ml-1">(texto puro — resumo das matérias)</span>
            </label>
            <textarea
              name="summary"
              rows={3}
              defaultValue={edition.summary ?? ""}
              placeholder="Ex: Nesta edição: colecionismo de revólveres históricos, entrevista com campeão do IPSC, as melhores pistolas compactas para porte..."
              className={textareaCls}
            />
            <p className="text-[#3a4a5e] text-[11px] mt-1">
              Aparece como subtítulo/chamada na página da edição e em listagens. Sem formatação HTML.
            </p>
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
              className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full"
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
            {edition.pageFlipUrl === "native" ? (
              <div className="flex items-center gap-3 h-[40px] bg-[#0f2a1a] border border-[#22c55e]/30 rounded-[6px] px-3">
                <span className="text-[#22c55e] text-[13px] font-semibold">✓ Leitor nativo ativo</span>
                <span className="text-[#526888] text-[12px]">— páginas no Storage (gerenciado na aba Páginas do Leitor)</span>
                <input type="hidden" name="pageFlipUrl" value="native" />
              </div>
            ) : (
              <input name="pageFlipUrl" defaultValue={edition.pageFlipUrl ?? ""} placeholder="https://online.fliphtml5.com/..." className={inputCls} />
            )}
          </div>

          {/* Páginas marcadas (Editorial / Índice) — suporta múltiplas */}
          {(editorialPageUrls.length > 0 || indexPageUrls.length > 0 ||
            (edition.editorialPageFiles ?? []).length > 0 || (edition.indexPageFiles ?? []).length > 0) && (
            <div className="lg:col-span-2">
              <label className={labelCls}>Páginas Marcadas no Leitor</label>
              <div className="flex gap-4 flex-wrap items-end">
                {/* Editoriais */}
                {(editorialPageUrls.length > 0 || (edition.editorialPageFiles ?? []).length > 0) && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#ff6b6b] text-[10px] font-semibold">📝 Editorial</p>
                    <div className="flex gap-2 flex-wrap">
                      {(editorialPageUrls.length > 0 ? editorialPageUrls : (edition.editorialPageFiles ?? []).map((f) => ({ filename: f, url: "" }))).map((pg) => (
                        <div key={pg.filename} className="flex flex-col gap-1">
                          <div className="relative w-[60px] h-[80px] bg-[#0d1422] rounded-[4px] overflow-hidden border border-[#ff1f1f]/30">
                            {pg.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={pg.url} alt={pg.filename} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#2a3a5e] text-[9px]">sem prévia</div>
                            )}
                            <div className="absolute top-0.5 left-0.5 bg-[#ff1f1f] text-white text-[6px] font-bold px-0.5 py-[1px] rounded-[2px]">Ed.</div>
                          </div>
                          <p className="text-[#7a9ab5] text-[9px] text-center font-mono">
                            {pg.filename.replace(/page-(\d+)\..+/, "pág. $1")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Índices */}
                {(indexPageUrls.length > 0 || (edition.indexPageFiles ?? []).length > 0) && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#38bdf8] text-[10px] font-semibold">📋 Índice</p>
                    <div className="flex gap-2 flex-wrap">
                      {(indexPageUrls.length > 0 ? indexPageUrls : (edition.indexPageFiles ?? []).map((f) => ({ filename: f, url: "" }))).map((pg) => (
                        <div key={pg.filename} className="flex flex-col gap-1">
                          <div className="relative w-[60px] h-[80px] bg-[#0d1422] rounded-[4px] overflow-hidden border border-[#0ea5e9]/30">
                            {pg.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={pg.url} alt={pg.filename} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#2a3a5e] text-[9px]">sem prévia</div>
                            )}
                            <div className="absolute top-0.5 right-0.5 bg-[#0ea5e9] text-white text-[6px] font-bold px-0.5 py-[1px] rounded-[2px]">Índ.</div>
                          </div>
                          <p className="text-[#7a9ab5] text-[9px] text-center font-mono">
                            {pg.filename.replace(/page-(\d+)\..+/, "pág. $1")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-end pb-1">
                  <a
                    href={`/admin/edicoes/${edition.id}/paginas`}
                    className="text-[#7a9ab5] hover:text-white text-[12px] transition-colors underline underline-offset-2"
                  >
                    Gerenciar →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* PDF */}
          <div className="lg:col-span-2">
            <label className={labelCls}>Caminho do PDF (Storage)</label>
            <input name="pdfStoragePath" defaultValue={edition.pdfStoragePath ?? ""} placeholder="edicoes/207/revista-magnum-207.pdf" className={inputCls} />
          </div>

          {/* Editorial com toggle HTML */}
          <div className="lg:col-span-2">
            <HtmlToggle label="Editorial / Descrição" value={editorial} onChange={setEditorial} />
          </div>

          {/* Data publicação */}
          <div>
            <label className={labelCls}>Data de Publicação</label>
            <input name="publishedAt" type="date" defaultValue={edition.publishedAt ?? ""} className={inputCls} />
          </div>

          {/* Flags */}
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex items-center gap-3">
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

            <div className="flex items-center gap-3">
              <input
                id="isOnNewstand"
                type="checkbox"
                checked={isOnNewstand}
                onChange={(e) => setIsOnNewstand(e.target.checked)}
                className="w-[16px] h-[16px] accent-[#ff1f1f]"
              />
              <label htmlFor="isOnNewstand" className="text-[#d4d4da] text-[14px]">
                📰 Na Banca (aparece na página &quot;Nas Bancas&quot;)
              </label>
            </div>
            {isOnNewstand && (
              <p className="text-[#f59e0b] text-[11px] ml-7">
                Apenas uma edição pode estar na banca. As outras serão desmarcadas automaticamente.
              </p>
            )}
          </div>
        </div>

        {/* ── ÍNDICE ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[#7a9ab5] text-[12px] font-semibold uppercase tracking-[1px]">Índice da Edição</p>
              <p className="text-white text-[11px] mt-0.5">Cada linha vira uma entrada no índice da edição pública.</p>
            </div>
            <div className="flex items-center gap-2">
              {addingCat ? (
                <div className="flex items-center gap-1.5">
                  <input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
                    placeholder="Nome da categoria"
                    className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[32px] px-2.5 text-[13px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-[180px]"
                    autoFocus
                  />
                  <button type="button" onClick={addCategory} disabled={savingCat}
                    className="bg-[#ff1f1f] text-white text-[12px] h-[32px] px-3 rounded-[6px] disabled:opacity-50">
                    {savingCat ? "..." : "Salvar"}
                  </button>
                  <button type="button" onClick={() => { setAddingCat(false); setNewCatName(""); }}
                    className="text-white hover:text-[#7a9ab5] text-[12px] h-[32px] px-2">✕</button>
                </div>
              ) : (
                <button type="button" onClick={() => setAddingCat(true)}
                  className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] text-[12px] h-[32px] px-3 rounded-[6px] transition-colors">
                  + Nova categoria
                </button>
              )}
              <button type="button" onClick={addTocItem}
                className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[12px] h-[32px] px-3 rounded-[6px] transition-colors">
                + Adicionar item
              </button>
            </div>
          </div>

          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[8px] overflow-hidden">
            <div className="bg-[#141d2c] px-4 py-2 grid grid-cols-[100px_1fr_180px_36px] gap-3">
              {["Página", "Título da Matéria", "Categoria", ""].map((h) => (
                <p key={h} className="text-white text-[10px] font-semibold tracking-[0.5px] uppercase">{h}</p>
              ))}
            </div>
            {tocItems.length === 0 ? (
              <p className="text-white text-[13px] text-center py-6">Nenhum item. Clique em "+ Adicionar item" para começar.</p>
            ) : (
              tocItems.map((item, i) => (
                <div key={i} className={`px-4 py-2.5 grid grid-cols-[100px_1fr_180px_36px] gap-3 items-center ${i > 0 ? "border-t border-[#141d2c]" : ""}`}>
                  <input type="number" placeholder="Ex: 4" value={item.page}
                    onChange={(e) => updateTocItem(i, "page", e.target.value)}
                    className="bg-[#141d2c] border border-[#1c2a3e] rounded-[4px] h-[34px] px-2.5 text-[13px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full" />
                  <input type="text" placeholder="Título do artigo ou seção" value={item.title}
                    onChange={(e) => updateTocItem(i, "title", e.target.value)}
                    className="bg-[#141d2c] border border-[#1c2a3e] rounded-[4px] h-[34px] px-2.5 text-[13px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full" />
                  <select value={item.category} onChange={(e) => updateTocItem(i, "category", e.target.value)}
                    className="bg-[#141d2c] border border-[#1c2a3e] rounded-[4px] h-[34px] px-2 text-[13px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full">
                    <option value="">Sem categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => removeTocItem(i)}
                    className="text-white hover:text-[#ff6b6b] text-[16px] h-[34px] flex items-center justify-center transition-colors">✕</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── SEO ── */}
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5 mb-8">
          <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4">SEO</p>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[#7a9ab5] text-[12px] font-semibold">Título SEO</label>
                <span className={`text-[11px] ${seoTitleCount > 70 ? "text-red-400" : seoTitleCount > 60 ? "text-amber-400" : "text-[#526888]"}`}>
                  {seoTitleCount}/70
                </span>
              </div>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className={inputCls}
                placeholder="Título para os mecanismos de busca (deixe vazio para usar o título da edição)"
                maxLength={70}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[#7a9ab5] text-[12px] font-semibold">Descrição SEO</label>
                <span className={`text-[11px] ${seoDescCount > 160 ? "text-red-400" : seoDescCount > 130 ? "text-amber-400" : "text-[#526888]"}`}>
                  {seoDescCount}/160
                </span>
              </div>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className={textareaCls}
                placeholder="Resumo atrativo para aparecer nos resultados do Google. Até 160 caracteres."
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-1.5">Palavras-chave</label>
              <input
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                className={inputCls}
                placeholder="Ex: revólver, tiro esportivo, IPSC, munição, defesa pessoal"
              />
              <p className="text-[#526888] text-[11px] mt-1">Separadas por vírgula.</p>
            </div>
            <div>
              <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-1.5">URL Canônica</label>
              <input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className={inputCls}
                placeholder="https://revistamagnum.com.br/edicoes/... (opcional)"
              />
              <p className="text-[#526888] text-[11px] mt-1">Preencha apenas se esta edição for uma cópia de outro URL.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex gap-3">
            <button type="submit" disabled={loading || deleting}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors">
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
            <Link href="/admin/edicoes"
              className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
              Cancelar
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <>
                <span className="text-[#ff6b6b] text-[13px] font-medium">Confirma exclusão?</span>
                <button type="button" onClick={handleDelete} disabled={deleting}
                  className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold h-[38px] px-4 rounded-[6px] transition-colors">
                  {deleting ? "Excluindo..." : "Sim, excluir"}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} disabled={deleting}
                  className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] h-[38px] px-4 rounded-[6px] transition-colors">
                  Não
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} disabled={loading}
                className="border border-[#3a1010] hover:border-[#ff1f1f]/50 text-[#526888] hover:text-[#ff6b6b] text-[13px] h-[38px] px-4 rounded-[6px] transition-colors bg-transparent">
                🗑 Excluir edição
              </button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
