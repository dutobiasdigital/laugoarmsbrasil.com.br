"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import ImageUpload from "@/components/admin/ImageUpload";

const RichEditor = dynamic(() => import("@/components/admin/RichEditor"), { ssr: false });

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const sectionTitle =
  "text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

/* ── Limpador de HTML sujo ─────────────────────────── */
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
    if (!(tag in ALLOWED)) return inner;
    if (tag === "br" || tag === "hr") return `<${tag} />`;
    let attrs = "";
    for (const attr of ALLOWED[tag]) {
      if (el.hasAttribute(attr))
        attrs += ` ${attr}="${(el.getAttribute(attr) ?? "").replace(/"/g, "&quot;")}"`;
    }
    return `<${tag}${attrs}>${inner}</${tag}>`;
  }
  return Array.from(doc.body.childNodes)
    .map(walk)
    .join("")
    .replace(/<p>\s*<\/p>/g, "")
    .trim();
}

/* ── Toggle Visual / HTML ──────────────────────────── */
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
              title="Remove formatação suja do Word/Google Docs"
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
          rows={14}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#070a12] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[12px] text-[#22c55e] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-y font-mono leading-relaxed"
          placeholder="HTML da descrição da categoria..."
          spellCheck={false}
        />
      )}
    </div>
  );
}

interface CategoryData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  imageUrl: string;
  imageAlt: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

interface Props {
  mode: "create" | "edit";
  initial?: CategoryData;
}

export default function CategoryForm({ mode, initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName]             = useState(initial?.name ?? "");
  const [slug, setSlug]             = useState(initial?.slug ?? "");
  const [description, setDesc]      = useState(initial?.description ?? "");
  const [isActive, setIsActive]     = useState(initial?.isActive ?? true);
  const [sortOrder, setSortOrder]   = useState(initial?.sortOrder ?? 0);
  const [imageUrl, setImageUrl]     = useState(initial?.imageUrl ?? "");
  const [imageAlt, setImageAlt]     = useState(initial?.imageAlt ?? "");
  const [metaTitle, setMetaTitle]         = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDesc]    = useState(initial?.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords]   = useState(initial?.metaKeywords ?? "");

  useEffect(() => {
    if (!imageAlt) setImageAlt(name);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function handleNameChange(val: string) {
    setName(val);
    if (mode === "create") {
      setSlug(slugify(val));
      if (!metaTitle) setMetaTitle(`${val} | Revista Magnum`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body: Record<string, unknown> = {
      name, slug, description, isActive, sortOrder, imageUrl, imageAlt,
      metaTitle, metaDescription, metaKeywords,
    };
    if (mode === "edit" && initial?.id) body.id = initial.id;

    const res = await fetch("/api/admin/categorias", {
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
    router.push("/admin/categorias");
  }

  const metaDescCount = metaDescription.length;
  const metaDescColor =
    metaDescCount > 160 ? "text-red-400" : metaDescCount > 130 ? "text-amber-400" : "text-[#526888]";

  return (
    <>
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-[700px]">

        {/* ── Informações básicas ── */}
        <div className="flex flex-col gap-5 mb-8">
          <p className={sectionTitle}>Informações da Categoria</p>

          <div>
            <label className={labelCls}>Nome *</label>
            <input
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={inputCls}
              placeholder="Ex: Armamento, Tiro Esportivo, Legislação..."
            />
          </div>

          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputCls}
              placeholder="ex: tiro-esportivo"
            />
            <p className="text-[#526888] text-[11px] mt-1">
              Gerado automaticamente. URL: /blog/categoria/<strong>{slug || "slug"}</strong>
            </p>
          </div>

          <HtmlToggle label="Descrição" value={description} onChange={setDesc} />

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
                Categoria ativa (visível no blog)
              </label>
            </div>
          </div>

          <div>
            <label className={labelCls}>Foto de Destaque</label>
            <ImageUpload
              folder="categorias"
              filename={name ? `cat-${slugify(name)}` : undefined}
              defaultUrl={imageUrl}
              onUrlChange={setImageUrl}
              inputName="imageUrl"
              aspectHint="Proporção recomendada: 16:9 (ex: 1200×630px)"
            />
          </div>

          <div>
            <label className={labelCls}>Texto alternativo (alt)</label>
            <input
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className={inputCls}
              placeholder="Descrição da imagem para acessibilidade e SEO"
            />
            <p className="text-[#526888] text-[11px] mt-1">
              Deixe em branco para usar o título da categoria automaticamente.
            </p>
          </div>
        </div>

        {/* ── SEO ── */}
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5 mb-8">
          <p className={sectionTitle}>SEO — Mecanismos de Busca</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Título da Página (meta title)</label>
              <input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={inputCls}
                placeholder="Ex: Tiro Esportivo | Blog Revista Magnum"
                maxLength={70}
              />
              <p className="text-[#526888] text-[11px] mt-1">
                Ideal: até 60 caracteres.{" "}
                <span className={metaTitle.length > 60 ? "text-amber-400" : "text-[#526888]"}>
                  {metaTitle.length}/70
                </span>
              </p>
            </div>
            <div>
              <label className={labelCls}>Descrição (meta description)</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDesc(e.target.value)}
                className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none"
                placeholder="Resumo atrativo para aparecer nos resultados do Google. Até 160 caracteres."
                maxLength={200}
              />
              <p className={`text-[11px] mt-1 ${metaDescColor}`}>
                {metaDescCount}/160 caracteres
              </p>
            </div>
            <div>
              <label className={labelCls}>Palavras-chave</label>
              <input
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className={inputCls}
                placeholder="Ex: tiro esportivo, IPSC, CBTS, competição"
              />
              <p className="text-[#526888] text-[11px] mt-1">Separadas por vírgula.</p>
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
            href="/admin/categorias"
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
