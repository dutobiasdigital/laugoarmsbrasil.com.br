"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import ImageUpload, { slugify } from "@/components/admin/ImageUpload";

const RichEditor = dynamic(() => import("@/components/admin/RichEditor"), { ssr: false });

const BASE_INPUT =
  "bg-[#141d2c] border rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none w-full";
const selectCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";

function inputCls(hasError = false) {
  return `${BASE_INPUT} ${hasError ? "border-[#ff6b6b] focus:border-[#ff6b6b]" : "border-[#1c2a3e] focus:border-[#ff1f1f]"}`;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[#ff6b6b] text-[11px] mt-1">{msg}</p>;
}

/* ── Currency mask ───────────────────────────────────── */
function formatMoneyCents(cents: number): string {
  if (!cents && cents !== 0) return "";
  const r = (cents / 100).toFixed(2);
  const [int, dec] = r.split(".");
  const intF = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${intF},${dec}`;
}

function parseMoneyCents(display: string): number {
  const digits = display.replace(/\D/g, "");
  return parseInt(digits || "0", 10);
}

function MoneyInput({
  value,
  onChange,
  placeholder = "R$ 0,00",
  hasError = false,
}: {
  value: number;          // centavos
  onChange: (cents: number) => void;
  placeholder?: string;
  hasError?: boolean;
}) {
  const [display, setDisplay] = useState(() => value ? formatMoneyCents(value) : "");

  useEffect(() => {
    setDisplay(value ? formatMoneyCents(value) : "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(raw: string) {
    const cents = parseMoneyCents(raw);
    const formatted = cents ? formatMoneyCents(cents) : "";
    setDisplay(formatted);
    onChange(cents);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={(e) => handleChange(e.target.value)}
      onFocus={(e) => { if (!e.target.value) setDisplay("R$ "); }}
      onBlur={(e) => { if (e.target.value === "R$ ") setDisplay(""); }}
      className={inputCls(hasError)}
      placeholder={placeholder}
    />
  );
}

/* ── Section heading ──────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 mt-2">
      <h3 className="text-white font-semibold text-[15px]">{children}</h3>
      <div className="bg-[#1c2a3e] h-px mt-2" />
    </div>
  );
}

/* ── HTML/Visual toggle ───────────────────────────────── */
function HtmlToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  return (
    <div>
      <div className="flex justify-end mb-1.5">
        <div className="flex rounded-[6px] overflow-hidden border border-[#1c2a3e]">
          {(["visual", "html"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`px-3 h-[28px] text-[11px] font-semibold transition-colors ${
                mode === m ? "bg-[#ff1f1f] text-white" : "bg-[#141d2c] text-[#7a9ab5] hover:text-white"
              }`}>
              {m === "visual" ? "Visual" : "HTML"}
            </button>
          ))}
        </div>
      </div>
      {mode === "visual" ? (
        <RichEditor value={value} onChange={onChange} />
      ) : (
        <textarea rows={14} value={value} onChange={(e) => onChange(e.target.value)}
          className="bg-[#070a12] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[12px] text-[#22c55e] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-y font-mono leading-relaxed"
          spellCheck={false} />
      )}
    </div>
  );
}

/* ── Content tabs ─────────────────────────────────────── */
interface ContentTab { id: string; title: string; content: string }

const SUGGESTED_TABS = [
  "Especificações Técnicas",
  "Como Usar",
  "Garantia",
  "Perguntas Frequentes",
  "Sobre a Marca",
];

/* ── PDF items ────────────────────────────────────────── */
interface PdfItem {
  _key: string;
  id?: string;
  title: string;
  fileUrl: string;
  uploading?: boolean;
  uploadError?: string;
}

/* ── Variation ────────────────────────────────────────── */
interface Variation {
  _key: string;
  id?: string;
  name: string;
  tamanho: string;
  cor: string;
  priceCents: number;
  stock: number;
  sku: string;
  isActive: boolean;
  sortOrder: number;
}

function newVariation(idx: number): Variation {
  return { _key: `${Date.now()}-${idx}`, name: "", tamanho: "", cor: "", priceCents: 0, stock: 0, sku: "", isActive: true, sortOrder: idx };
}

function VariationRow({
  variation: v,
  index,
  errors,
  onChange,
  onRemove,
}: {
  variation: Variation;
  index: number;
  errors: Record<string, string>;
  onChange: (key: string, partial: Partial<Variation>) => void;
  onRemove: (key: string) => void;
}) {
  return (
    <div className="bg-[#070a12] border border-[#1c2a3e] rounded-[8px] p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#7a9ab5] text-[12px] font-semibold">Variação #{index + 1}</span>
        <button type="button" onClick={() => onRemove(v._key)}
          className="text-[#ff6b6b] hover:text-[#ff1f1f] text-[12px] transition-colors">
          Remover
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        <div>
          <label className={labelCls}>Nome da Variação *</label>
          <input value={v.name} onChange={(e) => onChange(v._key, { name: e.target.value })}
            className={inputCls(!!errors[`var_${v._key}`])} placeholder="Ex: Tamanho G..." />
          <FieldError msg={errors[`var_${v._key}`]} />
        </div>
        <div>
          <label className={labelCls}>Tamanho</label>
          <input value={v.tamanho} onChange={(e) => onChange(v._key, { tamanho: e.target.value })}
            className={inputCls()} placeholder="P, M, G, GG..." />
        </div>
        <div>
          <label className={labelCls}>Cor</label>
          <input value={v.cor} onChange={(e) => onChange(v._key, { cor: e.target.value })}
            className={inputCls()} placeholder="Azul, Preto..." />
        </div>
        <div>
          <label className={labelCls}>Preço (opcional)</label>
          <MoneyInput value={v.priceCents} onChange={(c) => onChange(v._key, { priceCents: c })}
            placeholder="Usar preço base" />
        </div>
        <div>
          <label className={labelCls}>Estoque</label>
          <input type="number" min={0} value={v.stock}
            onChange={(e) => onChange(v._key, { stock: Number(e.target.value) })}
            className={inputCls()} />
        </div>
        <div>
          <label className={labelCls}>SKU da Variação</label>
          <input value={v.sku} onChange={(e) => onChange(v._key, { sku: e.target.value })}
            className={inputCls()} placeholder="Código SKU" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input id={`var-active-${v._key}`} type="checkbox" checked={v.isActive}
          onChange={(e) => onChange(v._key, { isActive: e.target.checked })}
          className="w-[15px] h-[15px] accent-[#ff1f1f]" />
        <label htmlFor={`var-active-${v._key}`} className="text-[#d4d4da] text-[13px]">Variação ativa</label>
      </div>
    </div>
  );
}

/* ── Main form ────────────────────────────────────────── */
interface ProductData {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  basePriceCents: number;
  hasVariations: boolean;
  stock: number;
  sku: string;
  description: string;
  technicalSpecs?: string;       // legacy — migrated to contentTabs on load
  contentTabs: ContentTab[];
  weight: number;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionLength: string;
  mainImageUrl: string;
  mainImageAlt: string;
  pdfs: PdfItem[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  variations: Variation[];
}

interface Props {
  mode: "create" | "edit";
  categories: { id: string; title: string }[];
  initial?: ProductData;
}

export default function ProductForm({ mode, categories, initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  /* Basic */
  const [name, setName]       = useState(initial?.name ?? "");
  const [slug, setSlug]       = useState(initial?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? (categories[0]?.id ?? ""));
  const [isActive, setIsActive]     = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);

  /* Price */
  const [basePriceCents, setBasePriceCents] = useState<number>(initial?.basePriceCents ?? 0);

  /* Stock */
  const [hasVariations, setHasVariations] = useState(initial?.hasVariations ?? false);
  const [stock, setStock]     = useState(initial?.stock ?? 0);
  const [sku, setSku]         = useState(initial?.sku ?? "");

  /* Content tabs */
  const [description, setDescription] = useState(initial?.description ?? "");
  const [contentTabs, setContentTabs] = useState<ContentTab[]>(() => {
    if (initial?.contentTabs && initial.contentTabs.length > 0) return initial.contentTabs;
    // Migrate legacy technicalSpecs → first tab
    if (initial?.technicalSpecs) {
      return [{ id: "migrated-specs", title: "Especificações Técnicas", content: initial.technicalSpecs }];
    }
    return [];
  });
  const [activeTab, setActiveTab] = useState<string>("description");

  /* Dimensions */
  const [weight, setWeight]       = useState(initial?.weight ?? 0);
  const [dimWidth, setDimWidth]   = useState(initial?.dimensionWidth ?? "");
  const [dimHeight, setDimHeight] = useState(initial?.dimensionHeight ?? "");
  const [dimLength, setDimLength] = useState(initial?.dimensionLength ?? "");

  /* Media */
  const [mainImageUrl, setMainImageUrl] = useState(initial?.mainImageUrl ?? "");
  const [mainImageAlt, setMainImageAlt] = useState(initial?.mainImageAlt ?? "");

  /* PDFs */
  const [pdfs, setPdfs] = useState<PdfItem[]>(initial?.pdfs ?? []);
  const pdfRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [pdfDragging, setPdfDragging] = useState<Record<string, boolean>>({});

  /* Meta */
  const [metaTitle, setMetaTitle]             = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords]       = useState(initial?.metaKeywords ?? "");

  /* Variations */
  const [variations, setVariations] = useState<Variation[]>(initial?.variations ?? []);

  const imageFilename = name ? `produto-${slugify(name)}` : undefined;

  useEffect(() => {
    if (!mainImageAlt) setMainImageAlt(name);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function handleNameChange(val: string) {
    setName(val);
    if (mode === "create") setSlug(slugify(val));
  }

  /* ── Variation handlers ── */
  function addVariation() {
    setVariations((prev) => [...prev, newVariation(prev.length)]);
  }
  function updateVariation(key: string, partial: Partial<Variation>) {
    setVariations((prev) => prev.map((v) => v._key === key ? { ...v, ...partial } : v));
  }
  function removeVariation(key: string) {
    setVariations((prev) => prev.filter((v) => v._key !== key));
  }

  /* ── Content tab handlers ── */
  function addSuggestedTab(title: string) {
    const id = `tab-${Date.now()}`;
    setContentTabs((prev) => [...prev, { id, title, content: "" }]);
    setActiveTab(id);
  }
  function addCustomTab() {
    const id = `tab-${Date.now()}`;
    setContentTabs((prev) => [...prev, { id, title: "Nova Seção", content: "" }]);
    setActiveTab(id);
  }
  function removeContentTab(id: string) {
    setContentTabs((prev) => prev.filter((t) => t.id !== id));
    if (activeTab === id) setActiveTab("description");
  }
  function updateTabTitle(id: string, title: string) {
    setContentTabs((prev) => prev.map((t) => t.id === id ? { ...t, title } : t));
  }
  function updateTabContent(id: string, content: string) {
    setContentTabs((prev) => prev.map((t) => t.id === id ? { ...t, content } : t));
  }

  /* ── PDF handlers ── */
  function addPdf() {
    setPdfs((prev) => [...prev, { _key: `pdf-${Date.now()}`, title: "", fileUrl: "" }]);
  }
  function removePdf(key: string) {
    setPdfs((prev) => prev.filter((p) => p._key !== key));
  }
  async function uploadPdf(key: string, file: File) {
    setPdfs((prev) => prev.map((p) => p._key === key ? { ...p, uploading: true, uploadError: undefined } : p));
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "produtos/pdfs");
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setPdfs((prev) => prev.map((p) => p._key === key ? { ...p, uploading: false, fileUrl: data.url } : p));
      } else {
        setPdfs((prev) => prev.map((p) => p._key === key ? { ...p, uploading: false, uploadError: data.error || "Erro no upload" } : p));
      }
    } catch {
      setPdfs((prev) => prev.map((p) => p._key === key ? { ...p, uploading: false, uploadError: "Erro de conexão" } : p));
    }
  }

  /* ── Validation ── */
  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim())  errs.name = "Nome é obrigatório.";
    if (!slug.trim())  errs.slug = "Slug é obrigatório.";
    if (!basePriceCents) errs.basePrice = "Preço base é obrigatório.";
    if (hasVariations) {
      variations.forEach((v) => {
        if (!v.name.trim()) errs[`var_${v._key}`] = "Nome obrigatório.";
      });
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // scroll to first error
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return Object.keys(errs).length === 0;
  }

  /* ── Submit ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const payload: Record<string, unknown> = {
      name,
      slug,
      categoryId: categoryId || null,
      isActive,
      isFeatured,
      basePrice: basePriceCents,
      hasVariations,
      stock: hasVariations ? null : stock,
      sku: sku || null,
      description: description || null,
      contentTabs,
      weight: weight || null,
      dimensionWidth:  dimWidth  ? parseFloat(dimWidth)  : null,
      dimensionHeight: dimHeight ? parseFloat(dimHeight) : null,
      dimensionLength: dimLength ? parseFloat(dimLength) : null,
      mainImageUrl: mainImageUrl || null,
      mainImageAlt: mainImageAlt || null,
      pdfs: pdfs.filter((p) => p.fileUrl).map((p, i) => ({
        ...(p.id ? { id: p.id } : {}),
        title: p.title,
        fileUrl: p.fileUrl,
        sortOrder: i,
      })),
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      metaKeywords: metaKeywords || null,
    };

    if (mode === "edit" && initial?.id) payload.id = initial.id;

    if (hasVariations) {
      payload.variations = variations.map((v, i) => ({
        ...(v.id ? { id: v.id } : {}),
        name: v.name,
        attributes: { tamanho: v.tamanho, cor: v.cor },
        price: v.priceCents || null,
        stock: v.stock,
        sku: v.sku || null,
        isActive: v.isActive,
        sortOrder: i,
      }));
    }

    const res = await fetch("/api/admin/loja/produtos", {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao salvar produto.");
      setLoading(false);
      return;
    }

    router.push("/admin/loja/produtos");
  }

  const availableSuggestions = SUGGESTED_TABS.filter((s) => !contentTabs.some((t) => t.title === s));

  return (
    <>
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}
      {Object.keys(errors).length > 0 && (
        <div className="bg-[#2d1a00] border border-amber-600 rounded-[8px] px-4 py-3 mb-5 text-amber-400 text-[13px]">
          Corrija os campos obrigatórios antes de continuar.
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-[960px]">

        {/* ── Informações básicas ── */}
        <SectionTitle>Informações Básicas</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-3">
            <label className={labelCls}>Nome do Produto *</label>
            <input value={name} onChange={(e) => handleNameChange(e.target.value)}
              className={inputCls(!!errors.name)} placeholder="Nome do produto..." />
            <FieldError msg={errors.name} />
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>Slug (URL) *</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)}
              className={inputCls(!!errors.slug)} placeholder="url-do-produto" />
            <FieldError msg={errors.slug} />
          </div>

          <div>
            <label className={labelCls}>Categoria</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectCls}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6 lg:col-span-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input id="isActive" type="checkbox" checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)} className="w-[15px] h-[15px] accent-[#ff1f1f]" />
              <span className="text-[#d4d4da] text-[14px]">Produto ativo</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input id="isFeatured" type="checkbox" checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)} className="w-[15px] h-[15px] accent-[#ff1f1f]" />
              <span className="text-[#d4d4da] text-[14px]">Produto em destaque</span>
            </label>
          </div>
        </div>

        {/* ── Preço e estoque ── */}
        <SectionTitle>Preço e Estoque</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div>
            <label className={labelCls}>Preço Base *</label>
            <MoneyInput value={basePriceCents} onChange={setBasePriceCents} hasError={!!errors.basePrice} />
            <FieldError msg={errors.basePrice} />
          </div>

          <div>
            <label className={labelCls}>SKU</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)}
              className={inputCls()} placeholder="Código do produto" />
          </div>

          <div className="flex items-center gap-2.5 pt-7">
            <input id="hasVariations" type="checkbox" checked={hasVariations}
              onChange={(e) => setHasVariations(e.target.checked)} className="w-[15px] h-[15px] accent-[#ff1f1f]" />
            <label htmlFor="hasVariations" className="text-[#d4d4da] text-[14px]">Tem variações</label>
          </div>

          {!hasVariations && (
            <div>
              <label className={labelCls}>Estoque</label>
              <input type="number" min={0} value={stock}
                onChange={(e) => setStock(Number(e.target.value))} className={inputCls()} />
            </div>
          )}
        </div>

        {/* ── Conteúdo com tabs dinâmicas ── */}
        <SectionTitle>Conteúdo</SectionTitle>
        <div className="mb-6">
          {/* Tab bar */}
          <div className="flex items-center flex-wrap gap-0 border-b border-[#1c2a3e] mb-5 overflow-x-auto">
            {/* Descrição (fixed) */}
            <button type="button" onClick={() => setActiveTab("description")}
              className={`px-4 h-[40px] text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "description"
                  ? "border-[#ff1f1f] text-white"
                  : "border-transparent text-[#7a9ab5] hover:text-white"
              }`}>
              Descrição
            </button>

            {/* Dynamic tabs */}
            {contentTabs.map((tab) => (
              <div key={tab.id} className={`flex items-center border-b-2 transition-colors ${
                activeTab === tab.id ? "border-[#ff1f1f]" : "border-transparent"
              }`}>
                {activeTab === tab.id ? (
                  <input
                    value={tab.title}
                    onChange={(e) => updateTabTitle(tab.id, e.target.value)}
                    onClick={() => setActiveTab(tab.id)}
                    className="h-[40px] px-3 text-[13px] font-semibold bg-transparent text-white focus:outline-none min-w-[80px] max-w-[180px]"
                  />
                ) : (
                  <button type="button" onClick={() => setActiveTab(tab.id)}
                    className="px-4 h-[40px] text-[13px] font-semibold text-[#7a9ab5] hover:text-white transition-colors whitespace-nowrap">
                    {tab.title}
                  </button>
                )}
                <button type="button" onClick={() => removeContentTab(tab.id)}
                  className="pr-2 text-[#526888] hover:text-[#ff6b6b] text-[16px] leading-none transition-colors">
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Active editor */}
          {activeTab === "description" && (
            <HtmlToggle value={description} onChange={setDescription} />
          )}
          {contentTabs.map((tab) =>
            activeTab === tab.id ? (
              <HtmlToggle key={tab.id} value={tab.content}
                onChange={(v) => updateTabContent(tab.id, v)} />
            ) : null
          )}

          {/* Suggestions */}
          <div className="mt-5 pt-4 border-t border-[#0e1520]">
            <p className="text-[#526888] text-[11px] font-semibold uppercase tracking-wider mb-2.5">
              Adicionar nova seção:
            </p>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.map((s) => (
                <button key={s} type="button" onClick={() => addSuggestedTab(s)}
                  className="flex items-center gap-1.5 px-3 h-[30px] border border-dashed border-[#1c2a3e] hover:border-[#ff1f1f] text-[#7a9ab5] hover:text-white text-[12px] rounded-[6px] transition-colors">
                  <span className="text-[#ff1f1f] font-bold text-[14px] leading-none">+</span>
                  {s}
                </button>
              ))}
              <button type="button" onClick={addCustomTab}
                className="flex items-center gap-1.5 px-3 h-[30px] border border-dashed border-[#1c2a3e] hover:border-[#ff1f1f] text-[#7a9ab5] hover:text-white text-[12px] rounded-[6px] transition-colors">
                <span className="text-[#ff1f1f] font-bold text-[14px] leading-none">+</span>
                Personalizada...
              </button>
            </div>
          </div>
        </div>

        {/* ── Dimensões e peso ── */}
        <SectionTitle>Dimensões e Peso (para frete)</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div>
            <label className={labelCls}>Peso (gramas)</label>
            <input type="number" min={0} value={weight}
              onChange={(e) => setWeight(Number(e.target.value))} className={inputCls()} placeholder="500" />
          </div>
          <div>
            <label className={labelCls}>Largura (cm)</label>
            <input type="number" min={0} step="0.1" value={dimWidth}
              onChange={(e) => setDimWidth(e.target.value)} className={inputCls()} placeholder="20" />
          </div>
          <div>
            <label className={labelCls}>Altura (cm)</label>
            <input type="number" min={0} step="0.1" value={dimHeight}
              onChange={(e) => setDimHeight(e.target.value)} className={inputCls()} placeholder="15" />
          </div>
          <div>
            <label className={labelCls}>Comprimento (cm)</label>
            <input type="number" min={0} step="0.1" value={dimLength}
              onChange={(e) => setDimLength(e.target.value)} className={inputCls()} placeholder="10" />
          </div>
        </div>

        {/* ── Mídia ── */}
        <SectionTitle>Mídia</SectionTitle>
        <div className="mb-6">
          <label className={labelCls}>Imagem Principal</label>
          <ImageUpload
            folder="produtos"
            filename={imageFilename}
            defaultUrl={mainImageUrl}
            inputName="_mainImageUrl_hidden"
            aspectHint="Proporção recomendada: 1:1 ou 4:3"
            onUrlChange={setMainImageUrl}
          />
          <div className="mt-3">
            <label className={labelCls}>Texto alternativo (alt)</label>
            <input value={mainImageAlt} onChange={(e) => setMainImageAlt(e.target.value)}
              className={inputCls()} placeholder="Descrição da imagem para acessibilidade e SEO" />
          </div>
        </div>

        {/* ── PDFs ── */}
        <SectionTitle>Arquivos PDF</SectionTitle>
        <div className="mb-6">
          {pdfs.length === 0 && (
            <div className="bg-[#070a12] border border-dashed border-[#1c2a3e] rounded-[8px] px-5 py-8 text-center text-[#7a9ab5] text-[13px] mb-3">
              Nenhum arquivo adicionado. Clique em &quot;Adicionar PDF&quot; para incluir fichas técnicas ou manuais.
            </div>
          )}

          {pdfs.map((pdf) => (
            <div key={pdf._key} className="bg-[#070a12] border border-[#1c2a3e] rounded-[8px] p-4 mb-3">
              <div className="flex items-start gap-4">
                {/* PDF icon */}
                <div className="w-[42px] h-[42px] bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] flex items-center justify-center shrink-0 mt-5">
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                    <path d="M3 1h9l4 4v14H3V1z" stroke="#7a9ab5" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M12 1v4h4" stroke="#7a9ab5" strokeWidth="1.5"/>
                    <path d="M6 10h6M6 13h4" stroke="#7a9ab5" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>

                <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Título do arquivo</label>
                    <input
                      value={pdf.title}
                      onChange={(e) => setPdfs((prev) => prev.map((p) => p._key === pdf._key ? { ...p, title: e.target.value } : p))}
                      className={inputCls()}
                      placeholder="Ex: Ficha Técnica, Manual do Usuário..."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Arquivo PDF</label>
                    {pdf.fileUrl ? (
                      <div className="flex items-center gap-2 h-[40px]">
                        <a href={pdf.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[#7a9ab5] hover:text-white text-[12px] truncate flex-1 underline">
                          {decodeURIComponent(pdf.fileUrl.split("/").pop() ?? pdf.fileUrl).substring(0, 40)}
                        </a>
                        <button type="button" onClick={() => pdfRefs.current[pdf._key]?.click()}
                          className="text-[#526888] hover:text-[#7a9ab5] text-[11px] shrink-0 transition-colors">
                          Trocar
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setPdfDragging((d) => ({ ...d, [pdf._key]: true })); }}
                        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setPdfDragging((d) => ({ ...d, [pdf._key]: false })); }}
                        onDrop={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          setPdfDragging((d) => ({ ...d, [pdf._key]: false }));
                          const file = e.dataTransfer.files?.[0];
                          if (file) uploadPdf(pdf._key, file);
                        }}
                        className={`relative rounded-[6px] transition-colors ${pdfDragging[pdf._key] ? "ring-2 ring-[#ff1f1f]/60 bg-[#ff1f1f]/5" : ""}`}
                      >
                        {pdfDragging[pdf._key] && (
                          <div className="absolute inset-0 rounded-[6px] flex items-center justify-center pointer-events-none z-10">
                            <span className="text-[#ff6b6b] text-[12px] font-semibold bg-[#0e1520]/90 px-3 py-1 rounded-[4px]">
                              Solte o PDF aqui
                            </span>
                          </div>
                        )}
                        <button type="button" disabled={pdf.uploading}
                          onClick={() => pdfRefs.current[pdf._key]?.click()}
                          className={`bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] h-[40px] px-4 rounded-[6px] transition-colors disabled:opacity-50 w-full flex items-center gap-2 ${pdfDragging[pdf._key] ? "opacity-40" : ""}`}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M1 10v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          {pdf.uploading ? "Enviando..." : "Fazer upload do PDF"}
                        </button>
                        <p className="text-[#526888] text-[11px] mt-1.5">ou arraste o arquivo aqui</p>
                      </div>
                    )}
                    <input
                      ref={(el) => { pdfRefs.current[pdf._key] = el; }}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadPdf(pdf._key, file);
                        e.target.value = "";
                      }}
                    />
                    {pdf.uploadError && <p className="text-[#ff6b6b] text-[11px] mt-1">{pdf.uploadError}</p>}
                  </div>
                </div>

                <button type="button" onClick={() => removePdf(pdf._key)}
                  className="mt-5 text-[#526888] hover:text-[#ff6b6b] transition-colors shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addPdf}
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-[#ff1f1f] text-[#d4d4da] hover:text-white text-[13px] h-[38px] px-5 rounded-[6px] transition-colors flex items-center gap-2">
            <span className="text-[#ff1f1f] font-bold">+</span> Adicionar PDF
          </button>
        </div>

        {/* ── Variações ── */}
        {hasVariations && (
          <>
            <SectionTitle>Variações do Produto</SectionTitle>
            <div className="mb-6">
              <p className="text-[#7a9ab5] text-[13px] mb-4">
                Defina as variações disponíveis (tamanhos, cores etc). Deixe o preço vazio para usar o preço base.
              </p>

              {variations.length === 0 && (
                <div className="bg-[#070a12] border border-dashed border-[#1c2a3e] rounded-[8px] px-5 py-8 text-center text-[#7a9ab5] text-[13px] mb-3">
                  Nenhuma variação adicionada. Clique em &quot;Adicionar variação&quot; para começar.
                </div>
              )}

              {variations.map((v, i) => (
                <VariationRow key={v._key} variation={v} index={i} errors={errors}
                  onChange={updateVariation} onRemove={removeVariation} />
              ))}

              <button type="button" onClick={addVariation}
                className="bg-[#141d2c] border border-[#1c2a3e] hover:border-[#ff1f1f] text-[#d4d4da] hover:text-white text-[13px] h-[38px] px-5 rounded-[6px] transition-colors flex items-center gap-2">
                <span className="text-[#ff1f1f] font-bold">+</span> Adicionar variação
              </button>
            </div>
          </>
        )}

        {/* ── SEO ── */}
        <SectionTitle>SEO</SectionTitle>
        <div className="flex flex-col gap-5 mb-6">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[#7a9ab5] text-[12px] font-semibold">Meta Title</label>
              <span className={`text-[11px] ${metaTitle.length > 60 ? "text-amber-400" : "text-[#526888]"}`}>{metaTitle.length}/70</span>
            </div>
            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={70}
              className={inputCls()} placeholder="Título para mecanismos de busca..." />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[#7a9ab5] text-[12px] font-semibold">Meta Description</label>
              <span className={`text-[11px] ${metaDescription.length > 130 ? "text-amber-400" : "text-[#526888]"}`}>{metaDescription.length}/160</span>
            </div>
            <textarea rows={3} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={160}
              className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none"
              placeholder="Descrição para mecanismos de busca..." />
          </div>
          <div>
            <label className={labelCls}>Meta Keywords</label>
            <input value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)}
              className={inputCls()} placeholder="palavra-chave1, palavra-chave2, palavra-chave3" />
            <p className="text-[#7a9ab5] text-[11px] mt-1">Separe as palavras-chave por vírgula.</p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2 border-t border-[#1c2a3e] mt-4">
          <button type="submit" disabled={loading}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors">
            {loading ? "Salvando..." : mode === "create" ? "Criar Produto" : "Salvar Alterações"}
          </button>
          <Link href="/admin/loja/produtos"
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
