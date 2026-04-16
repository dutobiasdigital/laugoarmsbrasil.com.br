"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface GuiaCategory {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  shortCall: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  isActive: boolean;
  sortOrder: number;
}

const inputCls =
  "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const areaCls =
  "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full transition-colors resize-none";

/* ─── helpers ─── */
function toSlug(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function stripHtml(html: string): string {
  if (typeof window === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent ?? "";
}

/* ─── blank form state ─── */
const BLANK: Omit<GuiaCategory, "id"> = {
  title: "",
  slug: "",
  icon: "",
  shortCall: "",
  imageUrl: "",
  imageAlt: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  isActive: true,
  sortOrder: 0,
};

type FormData = Omit<GuiaCategory, "id"> & { description: string };

const BLANK_FORM: FormData = { ...BLANK, description: "" };

/* ─── SectionCard ─── */
function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
      <div className="bg-[#141d2c] px-5 py-3">
        <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.8px]">
          {title}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ─── CharCounter ─── */
function CharCounter({
  value,
  max,
  warnStart,
}: {
  value: string;
  max: number;
  warnStart?: number;
}) {
  const len = (value ?? "").length;
  const color =
    warnStart && len >= warnStart && len <= max
      ? "text-green-400"
      : len > max
      ? "text-[#ff1f1f]"
      : "text-[#526888]";
  return (
    <span className={`text-[11px] ${color}`}>
      {len}/{max}
    </span>
  );
}

/* ─── CategoryForm ─── */
function CategoryForm({
  initial,
  onSave,
  onCancel,
  saving,
  error,
}: {
  initial: FormData & { id?: string };
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<FormData>({
    title: initial.title,
    slug: initial.slug,
    icon: initial.icon ?? "",
    shortCall: initial.shortCall ?? "",
    description: initial.description ?? "",
    imageUrl: initial.imageUrl ?? "",
    imageAlt: initial.imageAlt ?? "",
    metaTitle: initial.metaTitle ?? "",
    metaDescription: initial.metaDescription ?? "",
    metaKeywords: initial.metaKeywords ?? "",
    isActive: initial.isActive,
    sortOrder: initial.sortOrder,
  });

  const isNew = !initial.id;

  /* auto-slug from title */
  function handleTitleChange(val: string) {
    setForm((f) => ({
      ...f,
      title: val,
      slug: toSlug(val),
    }));
  }

  /* auto-fill imageAlt from title when empty */
  useEffect(() => {
    if (!form.imageAlt && form.title) {
      setForm((f) => ({ ...f, imageAlt: f.title }));
    }
    // only run when title changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <div className="space-y-4">
      {/* Error */}
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      {/* 1. Identidade */}
      <SectionCard title="Identidade">
        <div className="grid grid-cols-[80px_1fr_1fr_80px] gap-4 mb-4">
          {/* Icon */}
          <div>
            <label className={labelCls}>Ícone</label>
            <input
              className={inputCls}
              placeholder="🔫"
              value={form.icon ?? ""}
              onChange={(e) => set("icon", e.target.value)}
              maxLength={8}
            />
          </div>

          {/* Title */}
          <div className="col-span-2">
            <label className={labelCls}>
              Título <span className="text-[#ff1f1f]">*</span>
            </label>
            <input
              className={inputCls}
              placeholder="Armeiros e Lojas"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          {/* Sort order */}
          <div>
            <label className={labelCls}>Ordem</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>

        {/* Slug (readonly) */}
        <div className="mb-4">
          <label className={labelCls}>Slug (gerado automaticamente)</label>
          <div className="bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 flex items-center">
            <span className="text-[#526888] text-[12px] font-mono">
              {form.slug || <span className="text-white/20">—</span>}
            </span>
          </div>
        </div>

        {/* shortCall */}
        <div className="mb-4">
          <label className={labelCls}>Chamada Curta</label>
          <input
            className={inputCls}
            placeholder="Lojas de armas e acessórios"
            value={form.shortCall ?? ""}
            onChange={(e) => set("shortCall", e.target.value)}
          />
        </div>

        {/* isActive */}
        <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
          <div className="relative">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-[36px] h-[20px] bg-[#141d2c] border border-[#1c2a3e] rounded-full peer-checked:bg-[#ff1f1f] peer-checked:border-[#ff1f1f] transition-colors" />
            <div className="absolute top-[3px] left-[3px] w-[14px] h-[14px] bg-white rounded-full transition-transform peer-checked:translate-x-[16px]" />
          </div>
          <span className="text-[#d4d4da] text-[13px]">
            {form.isActive ? "Ativa" : "Inativa"}
          </span>
        </label>
      </SectionCard>

      {/* 2. Descrição */}
      <SectionCard title="Descrição">
        <div>
          <label className={labelCls}>Descrição Completa (aceita HTML)</label>
          <textarea
            className={areaCls}
            rows={6}
            placeholder="Descrição completa da categoria..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const clean = stripHtml(form.description);
                set("description", clean);
              }}
              className="text-[#526888] hover:text-[#d4d4da] text-[12px] h-[30px] px-3 rounded-[4px] bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 transition-colors"
            >
              Limpar HTML
            </button>
          </div>
        </div>
      </SectionCard>

      {/* 3. Imagem Destaque */}
      <SectionCard title="Imagem Destaque">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>URL da Imagem</label>
            <input
              className={inputCls}
              type="url"
              placeholder="https://..."
              value={form.imageUrl ?? ""}
              onChange={(e) => set("imageUrl", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Alt da Imagem</label>
            <input
              className={inputCls}
              placeholder="Texto alternativo"
              value={form.imageAlt ?? ""}
              onChange={(e) => set("imageAlt", e.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      {/* 4. SEO */}
      <SectionCard title="SEO">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls.replace("mb-1.5", "mb-0")}>
                Meta Title
              </label>
              <CharCounter value={form.metaTitle ?? ""} max={60} />
            </div>
            <input
              className={inputCls}
              placeholder="Título para mecanismos de busca"
              value={form.metaTitle ?? ""}
              onChange={(e) => set("metaTitle", e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls.replace("mb-1.5", "mb-0")}>
                Meta Description
              </label>
              <CharCounter
                value={form.metaDescription ?? ""}
                max={160}
                warnStart={120}
              />
            </div>
            <textarea
              className={areaCls}
              rows={2}
              placeholder="Descrição para mecanismos de busca"
              value={form.metaDescription ?? ""}
              onChange={(e) => set("metaDescription", e.target.value)}
              maxLength={200}
            />
          </div>

          <div>
            <label className={labelCls}>Palavras-chave</label>
            <input
              className={inputCls}
              placeholder="armas, acessórios, munição"
              value={form.metaKeywords ?? ""}
              onChange={(e) => set("metaKeywords", e.target.value)}
            />
            <p className="text-[#526888] text-[11px] mt-1">
              Separadas por vírgula
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-10 -mx-6 px-6 py-4 bg-[#0a0e18]/90 backdrop-blur-sm border-t border-[#141d2c] flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[14px] h-[40px] px-5 rounded-[6px] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || !form.title.trim()}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[40px] px-6 rounded-[6px] transition-colors min-w-[140px] flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-[14px] h-[14px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </>
          ) : isNew ? (
            "+ Criar Categoria"
          ) : (
            "Salvar Alterações"
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── ActiveBadge ─── */
function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 bg-[#0f381f] text-[#22c55e] text-[10px] font-bold px-2 py-[3px] rounded-[4px]">
      <span className="w-[5px] h-[5px] rounded-full bg-[#22c55e] inline-block" />
      ATIVA
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-[#141d2c] text-[#526888] text-[10px] font-bold px-2 py-[3px] rounded-[4px]">
      <span className="w-[5px] h-[5px] rounded-full bg-[#526888] inline-block" />
      INATIVA
    </span>
  );
}

/* ─── Main component ─── */
export default function GuiaCategoriasClient({
  categories: initial,
}: {
  categories: GuiaCategory[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [categories, setCategories] = useState<GuiaCategory[]>(initial);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editTarget, setEditTarget] = useState<GuiaCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  function openCreate() {
    setEditTarget(null);
    setError(null);
    setMode("create");
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function openEdit(cat: GuiaCategory) {
    setEditTarget(cat);
    setError(null);
    setMode("edit");
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function closeForm() {
    setMode("list");
    setEditTarget(null);
    setError(null);
  }

  async function handleSave(data: FormData) {
    setSaving(true);
    setError(null);
    try {
      const isNew = mode === "create";
      const url = isNew
        ? "/api/admin/guia/categorias"
        : `/api/admin/guia/categorias/${editTarget!.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title.trim(),
          slug: data.slug,
          icon: data.icon || null,
          shortCall: data.shortCall || null,
          description: data.description || null,
          imageUrl: data.imageUrl || null,
          imageAlt: data.imageAlt || null,
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
          metaKeywords: data.metaKeywords || null,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Erro ao salvar.");
        return;
      }

      if (isNew) {
        setCategories((prev) =>
          [...prev, json].sort((a, b) => a.sortOrder - b.sortOrder)
        );
      } else {
        setCategories((prev) =>
          prev
            .map((c) => (c.id === editTarget!.id ? { ...c, ...json } : c))
            .sort((a, b) => a.sortOrder - b.sortOrder)
        );
      }

      closeForm();
      startTransition(() => router.refresh());
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: GuiaCategory) {
    if (
      !window.confirm(
        `Excluir a categoria "${cat.title}"? Esta ação não pode ser desfeita.`
      )
    )
      return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/guia/categorias/${cat.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Erro ao excluir.");
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      startTransition(() => router.refresh());
    } catch {
      setError("Erro de rede. Tente novamente.");
    }
  }

  /* ─── Form view ─── */
  if (mode === "create" || mode === "edit") {
    const initial: FormData & { id?: string } = editTarget
      ? { ...editTarget, description: "" }
      : { ...BLANK_FORM };

    return (
      <div ref={formTopRef}>
        {/* Sub-header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={closeForm}
            className="text-[#526888] hover:text-[#d4d4da] text-[13px] transition-colors"
          >
            ← Voltar
          </button>
          <div className="bg-[#141d2c] w-px h-[16px]" />
          <h2 className="text-[#d4d4da] text-[16px] font-semibold">
            {mode === "create" ? "Nova Categoria" : `Editar: ${editTarget?.title}`}
          </h2>
        </div>

        <CategoryForm
          initial={initial}
          onSave={handleSave}
          onCancel={closeForm}
          saving={saving}
          error={error}
        />
      </div>
    );
  }

  /* ─── List view ─── */
  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#526888] text-[13px]">
          {categories.length} categoria{categories.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={openCreate}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 rounded-[6px] transition-colors flex items-center gap-2"
        >
          + Adicionar Categoria
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-4 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      {/* Empty state */}
      {categories.length === 0 ? (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] px-6 py-16 text-center">
          <p className="text-[#526888] text-[14px] mb-4">
            Nenhuma categoria cadastrada.
          </p>
          <button
            onClick={openCreate}
            className="text-[#ff1f1f] hover:text-[#ff4444] text-[14px] transition-colors"
          >
            Criar primeira categoria →
          </button>
        </div>
      ) : (
        /* Table */
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
          {/* Header row */}
          <div
            className="bg-[#141d2c] px-5 py-3 grid gap-4"
            style={{ gridTemplateColumns: "40px 1fr 160px 80px 50px 120px" }}
          >
            {["Ícone", "Título / Slug", "Chamada Curta", "Status", "Ord.", "Ações"].map(
              (h) => (
                <p
                  key={h}
                  className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]"
                >
                  {h}
                </p>
              )
            )}
          </div>

          {categories.map((cat, i) => (
            <div key={cat.id}>
              {i > 0 && <div className="bg-[#141d2c] h-px" />}
              <div
                className="px-5 py-4 grid gap-4 items-center"
                style={{ gridTemplateColumns: "40px 1fr 160px 80px 50px 120px" }}
              >
                {/* Icon */}
                <div className="text-[22px] leading-none flex items-center justify-center">
                  {cat.icon || (
                    <span className="text-[#1c2a3e] text-[18px]">—</span>
                  )}
                </div>

                {/* Title + slug */}
                <div className="min-w-0">
                  <p className="text-[#d4d4da] text-[14px] font-medium truncate">
                    {cat.title}
                  </p>
                  <p className="text-[#526888] text-[11px] font-mono mt-0.5 truncate">
                    {cat.slug}
                  </p>
                </div>

                {/* shortCall */}
                <p className="text-[#7a9ab5] text-[12px] truncate">
                  {cat.shortCall || (
                    <span className="text-[#1c2a3e]">—</span>
                  )}
                </p>

                {/* Status */}
                <div>
                  <ActiveBadge active={cat.isActive} />
                </div>

                {/* sortOrder */}
                <p className="text-[#526888] text-[12px] text-center">
                  {cat.sortOrder}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[11px] h-[30px] px-3 rounded-[6px] transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="bg-[#141d2c] border border-[#1c2a3e] hover:border-red-800/60 text-[#526888] hover:text-red-400 text-[11px] h-[30px] px-2.5 rounded-[6px] transition-colors"
                    title="Excluir"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
