"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import ImageUpload, { slugify } from "@/components/admin/ImageUpload";

const RichEditor = dynamic(() => import("@/components/admin/RichEditor"), { ssr: false });

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const selectCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";

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
        <span className={labelCls.replace(" mb-1.5", "")}>{label}</span>
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
      {mode === "visual" ? (
        <RichEditor value={value} onChange={onChange} />
      ) : (
        <textarea
          rows={14}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#070a12] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[12px] text-[#22c55e] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-y font-mono leading-relaxed"
          spellCheck={false}
        />
      )}
    </div>
  );
}

/* ── Variation row ────────────────────────────────────── */
interface Variation {
  _key: string;
  id?: string;
  name: string;
  tamanho: string;
  cor: string;
  price: string;
  stock: number;
  sku: string;
  isActive: boolean;
  sortOrder: number;
}

function newVariation(idx: number): Variation {
  return {
    _key: `${Date.now()}-${idx}`,
    name: "",
    tamanho: "",
    cor: "",
    price: "",
    stock: 0,
    sku: "",
    isActive: true,
    sortOrder: idx,
  };
}

interface VariationRowProps {
  variation: Variation;
  index: number;
  onChange: (key: string, partial: Partial<Variation>) => void;
  onRemove: (key: string) => void;
}

function VariationRow({ variation: v, index, onChange, onRemove }: VariationRowProps) {
  return (
    <div className="bg-[#070a12] border border-[#1c2a3e] rounded-[8px] p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#7a9ab5] text-[12px] font-semibold">Variação #{index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(v._key)}
          className="text-[#ff6b6b] hover:text-[#ff1f1f] text-[12px] transition-colors"
        >
          Remover
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        <div>
          <label className={labelCls}>Nome da Variação *</label>
          <input
            value={v.name}
            onChange={(e) => onChange(v._key, { name: e.target.value })}
            className={inputCls}
            placeholder="Ex: Tamanho G, Cor Azul..."
          />
        </div>
        <div>
          <label className={labelCls}>Tamanho</label>
          <input
            value={v.tamanho}
            onChange={(e) => onChange(v._key, { tamanho: e.target.value })}
            className={inputCls}
            placeholder="P, M, G, GG..."
          />
        </div>
        <div>
          <label className={labelCls}>Cor</label>
          <input
            value={v.cor}
            onChange={(e) => onChange(v._key, { cor: e.target.value })}
            className={inputCls}
            placeholder="Azul, Preto..."
          />
        </div>
        <div>
          <label className={labelCls}>Preço (R$, opcional)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={v.price}
            onChange={(e) => onChange(v._key, { price: e.target.value })}
            className={inputCls}
            placeholder="Deixe vazio para usar o preço base"
          />
        </div>
        <div>
          <label className={labelCls}>Estoque</label>
          <input
            type="number"
            min={0}
            value={v.stock}
            onChange={(e) => onChange(v._key, { stock: Number(e.target.value) })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>SKU da Variação</label>
          <input
            value={v.sku}
            onChange={(e) => onChange(v._key, { sku: e.target.value })}
            className={inputCls}
            placeholder="Código SKU"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id={`var-active-${v._key}`}
          type="checkbox"
          checked={v.isActive}
          onChange={(e) => onChange(v._key, { isActive: e.target.checked })}
          className="w-[15px] h-[15px] accent-[#ff1f1f]"
        />
        <label htmlFor={`var-active-${v._key}`} className="text-[#d4d4da] text-[13px]">
          Variação ativa
        </label>
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
  basePrice: string;
  hasVariations: boolean;
  stock: number;
  sku: string;
  description: string;
  technicalSpecs: string;
  weight: number;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionLength: string;
  mainImageUrl: string;
  mainImageAlt: string;
  pdfFileUrl: string;
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

  const [name, setName]       = useState(initial?.name ?? "");
  const [slug, setSlug]       = useState(initial?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? (categories[0]?.id ?? ""));
  const [isActive, setIsActive]     = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);

  const [basePrice, setBasePrice]     = useState(initial?.basePrice ?? "");
  const [hasVariations, setHasVariations] = useState(initial?.hasVariations ?? false);
  const [stock, setStock]             = useState(initial?.stock ?? 0);
  const [sku, setSku]                 = useState(initial?.sku ?? "");

  const [description, setDescription]       = useState(initial?.description ?? "");
  const [technicalSpecs, setTechnicalSpecs] = useState(initial?.technicalSpecs ?? "");

  const [weight, setWeight]             = useState(initial?.weight ?? 0);
  const [dimWidth, setDimWidth]         = useState(initial?.dimensionWidth ?? "");
  const [dimHeight, setDimHeight]       = useState(initial?.dimensionHeight ?? "");
  const [dimLength, setDimLength]       = useState(initial?.dimensionLength ?? "");

  const [mainImageUrl, setMainImageUrl] = useState(initial?.mainImageUrl ?? "");
  const [mainImageAlt, setMainImageAlt] = useState(initial?.mainImageAlt ?? "");
  const [pdfFileUrl, setPdfFileUrl]     = useState(initial?.pdfFileUrl ?? "");

  const [metaTitle, setMetaTitle]             = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords]       = useState(initial?.metaKeywords ?? "");

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

  function addVariation() {
    setVariations((prev) => [...prev, newVariation(prev.length)]);
  }

  function updateVariation(key: string, partial: Partial<Variation>) {
    setVariations((prev) => prev.map((v) => v._key === key ? { ...v, ...partial } : v));
  }

  function removeVariation(key: string) {
    setVariations((prev) => prev.filter((v) => v._key !== key));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const basePriceCents = Math.round(parseFloat(String(basePrice) || "0") * 100);

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
      technicalSpecs: technicalSpecs || null,
      weight: weight || null,
      dimensionWidth: dimWidth ? parseFloat(dimWidth) : null,
      dimensionHeight: dimHeight ? parseFloat(dimHeight) : null,
      dimensionLength: dimLength ? parseFloat(dimLength) : null,
      mainImageUrl: mainImageUrl || null,
      mainImageAlt: mainImageAlt || null,
      pdfFileUrl: pdfFileUrl || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      metaKeywords: metaKeywords || null,
    };

    if (mode === "edit" && initial?.id) payload.id = initial.id;

    // Attach variations if hasVariations
    if (hasVariations) {
      payload.variations = variations.map((v, i) => ({
        ...(v.id ? { id: v.id } : {}),
        name: v.name,
        attributes: { tamanho: v.tamanho, cor: v.cor },
        price: v.price ? Math.round(parseFloat(v.price) * 100) : null,
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

  return (
    <>
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-[960px]">

        {/* ── Informações básicas ── */}
        <SectionTitle>Informações Básicas</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-3">
            <label className={labelCls}>Nome do Produto *</label>
            <input
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={inputCls}
              placeholder="Nome do produto..."
            />
          </div>

          <div className="lg:col-span-2">
            <label className={labelCls}>Slug (URL)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputCls}
              placeholder="url-do-produto"
            />
          </div>

          <div>
            <label className={labelCls}>Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={selectCls}
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6 lg:col-span-3">
            <div className="flex items-center gap-2.5">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-[15px] h-[15px] accent-[#ff1f1f]"
              />
              <label htmlFor="isActive" className="text-[#d4d4da] text-[14px]">Produto ativo</label>
            </div>
            <div className="flex items-center gap-2.5">
              <input
                id="isFeatured"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-[15px] h-[15px] accent-[#ff1f1f]"
              />
              <label htmlFor="isFeatured" className="text-[#d4d4da] text-[14px]">Produto em destaque</label>
            </div>
          </div>
        </div>

        {/* ── Preço e estoque ── */}
        <SectionTitle>Preço e Estoque</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div>
            <label className={labelCls}>Preço Base (R$)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className={inputCls}
              placeholder="0,00"
            />
          </div>

          <div>
            <label className={labelCls}>SKU</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={inputCls}
              placeholder="Código do produto"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-7">
            <input
              id="hasVariations"
              type="checkbox"
              checked={hasVariations}
              onChange={(e) => setHasVariations(e.target.checked)}
              className="w-[15px] h-[15px] accent-[#ff1f1f]"
            />
            <label htmlFor="hasVariations" className="text-[#d4d4da] text-[14px]">Tem variações</label>
          </div>

          {!hasVariations && (
            <div>
              <label className={labelCls}>Estoque</label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className={inputCls}
              />
            </div>
          )}
        </div>

        {/* ── Conteúdo ── */}
        <SectionTitle>Conteúdo</SectionTitle>
        <div className="flex flex-col gap-6 mb-6">
          <HtmlToggle label="Descrição" value={description} onChange={setDescription} />
          <HtmlToggle label="Especificações Técnicas" value={technicalSpecs} onChange={setTechnicalSpecs} />
        </div>

        {/* ── Dimensões e peso ── */}
        <SectionTitle>Dimensões e Peso (para frete)</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div>
            <label className={labelCls}>Peso (gramas)</label>
            <input
              type="number"
              min={0}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className={inputCls}
              placeholder="500"
            />
          </div>
          <div>
            <label className={labelCls}>Largura (cm)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={dimWidth}
              onChange={(e) => setDimWidth(e.target.value)}
              className={inputCls}
              placeholder="20"
            />
          </div>
          <div>
            <label className={labelCls}>Altura (cm)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={dimHeight}
              onChange={(e) => setDimHeight(e.target.value)}
              className={inputCls}
              placeholder="15"
            />
          </div>
          <div>
            <label className={labelCls}>Comprimento (cm)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={dimLength}
              onChange={(e) => setDimLength(e.target.value)}
              className={inputCls}
              placeholder="10"
            />
          </div>
        </div>

        {/* ── Mídia ── */}
        <SectionTitle>Mídia</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
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
              <label className={labelCls}>Texto alternativo (alt) da imagem principal</label>
              <input
                value={mainImageAlt}
                onChange={(e) => setMainImageAlt(e.target.value)}
                className={inputCls}
                placeholder="Descrição da imagem para acessibilidade e SEO"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>URL do PDF (ficha técnica)</label>
            <input
              type="url"
              value={pdfFileUrl}
              onChange={(e) => setPdfFileUrl(e.target.value)}
              className={inputCls}
              placeholder="https://..."
            />
            <p className="text-[#7a9ab5] text-[11px] mt-1">Link direto para o arquivo PDF.</p>
          </div>
        </div>

        {/* ── Variações ── */}
        {hasVariations && (
          <>
            <SectionTitle>Variações do Produto</SectionTitle>
            <div className="mb-6">
              <p className="text-[#7a9ab5] text-[13px] mb-4">
                Defina as variações disponíveis (ex: tamanhos, cores). Deixe o preço vazio para usar o preço base.
              </p>

              {variations.length === 0 && (
                <div className="bg-[#070a12] border border-dashed border-[#1c2a3e] rounded-[8px] px-5 py-8 text-center text-[#7a9ab5] text-[13px] mb-3">
                  Nenhuma variação adicionada. Clique em "Adicionar variação" para começar.
                </div>
              )}

              {variations.map((v, i) => (
                <VariationRow
                  key={v._key}
                  variation={v}
                  index={i}
                  onChange={updateVariation}
                  onRemove={removeVariation}
                />
              ))}

              <button
                type="button"
                onClick={addVariation}
                className="bg-[#141d2c] border border-[#1c2a3e] hover:border-[#ff1f1f] text-[#d4d4da] hover:text-white text-[13px] h-[38px] px-5 rounded-[6px] transition-colors flex items-center gap-2"
              >
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
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={70}
              className={inputCls}
              placeholder="Título para mecanismos de busca..."
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[#7a9ab5] text-[12px] font-semibold">Meta Description</label>
              <span className={`text-[11px] ${metaDescription.length > 130 ? "text-amber-400" : "text-[#526888]"}`}>{metaDescription.length}/160</span>
            </div>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={160}
              className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none"
              placeholder="Descrição para mecanismos de busca..."
            />
          </div>
          <div>
            <label className={labelCls}>Meta Keywords</label>
            <input
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              className={inputCls}
              placeholder="palavra-chave1, palavra-chave2, palavra-chave3"
            />
            <p className="text-[#7a9ab5] text-[11px] mt-1">Separe as palavras-chave por vírgula.</p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2 border-t border-[#1c2a3e] mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors"
          >
            {loading ? "Salvando..." : mode === "create" ? "Criar Produto" : "Salvar Alterações"}
          </button>
          <Link
            href="/admin/loja/produtos"
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
