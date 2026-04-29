"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import ImageUpload, { slugify } from "@/components/admin/ImageUpload";

const RichEditor = dynamic(() => import("@/components/admin/RichEditor"), { ssr: false });

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const textareaCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none";
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
    featureImageAlt: string | null;
    categoryId: string;
    isExclusive: boolean;
    status: string;
    publishedAt: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;
    canonicalUrl: string | null;
  };
  categories: { id: string; name: string }[];
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
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [mode, setMode] = useState<"visual" | "html">("visual");

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={labelCls.replace(" mb-1.5", "")}>Conteúdo</label>
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
          rows={20}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#070a12] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[12px] text-[#22c55e] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-y font-mono leading-relaxed"
          placeholder="HTML bruto do artigo..."
          spellCheck={false}
        />
      )}
    </div>
  );
}

export default function ArticleEditForm({ article, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState(article.content);
  const [title, setTitle] = useState(article.title);
  const [featureImageAlt, setFeatureImageAlt] = useState(article.featureImageAlt ?? "");
  const [seoTitle, setSeoTitle]               = useState(article.seoTitle ?? "");
  const [seoDescription, setSeoDescription]   = useState(article.seoDescription ?? "");
  const [seoKeywords, setSeoKeywords]         = useState(article.seoKeywords ?? "");
  const [canonicalUrl, setCanonicalUrl]       = useState(article.canonicalUrl ?? "");

  useEffect(() => {
    if (!featureImageAlt) setFeatureImageAlt(title);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const imageFilename = title ? `artigo-${slugify(title)}` : undefined;

  const seoTitleCount       = seoTitle.length;
  const seoDescCount        = seoDescription.length;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const body = {
      ...Object.fromEntries(formData),
      content,
      featureImageAlt,
      seoTitle,
      seoDescription,
      seoKeywords,
      canonicalUrl,
    };
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

          {/* Conteúdo com toggle HTML */}
          <div className="lg:col-span-3">
            <HtmlToggle value={content} onChange={setContent} />
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

          <div className="lg:col-span-3">
            <label className={labelCls}>Texto alternativo (alt) da imagem</label>
            <input
              value={featureImageAlt}
              onChange={(e) => setFeatureImageAlt(e.target.value)}
              className={inputCls}
              placeholder="Descrição da imagem para acessibilidade e SEO"
            />
            <p className="text-[#526888] text-[11px] mt-1">
              Preenchido automaticamente com o título quando deixado em branco.
            </p>
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

        {/* ── SEO ── */}
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5 mb-8">
          <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4">SEO</p>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[#7a9ab5] text-[12px] font-semibold">Título SEO</label>
                <span className={`text-[11px] ${seoTitleCount > 70 ? "text-red-400" : seoTitleCount > 60 ? "text-amber-400" : "text-[#526888]"}`}>{seoTitleCount}/70</span>
              </div>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className={inputCls}
                placeholder="Título para os mecanismos de busca (deixe vazio para usar o título do artigo)"
                maxLength={70}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[#7a9ab5] text-[12px] font-semibold">Descrição SEO</label>
                <span className={`text-[11px] ${seoDescCount > 160 ? "text-red-400" : seoDescCount > 130 ? "text-amber-400" : "text-[#526888]"}`}>{seoDescCount}/160</span>
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
                placeholder="Ex: tiro esportivo, IPSC, CBTS, competição"
              />
              <p className="text-[#526888] text-[11px] mt-1">Separadas por vírgula.</p>
            </div>
            <div>
              <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-1.5">URL Canônica</label>
              <input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className={inputCls}
                placeholder="https://laugoarmsbrasil.com.br/blog/... (opcional)"
              />
              <p className="text-[#526888] text-[11px] mt-1">Preencha apenas se este artigo for uma cópia de outro URL.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors">
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
          <Link href="/admin/artigos"
            className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
