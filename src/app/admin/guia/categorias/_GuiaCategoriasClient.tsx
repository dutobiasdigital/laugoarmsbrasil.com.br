"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import type { GuiaCategory } from "./page";

/* ─── Segment options (maps guide_categories.segmentKey → companies.segment) ─── */
const SEGMENT_OPTIONS = [
  { value: "",               label: "— Sem vínculo de segmento —" },
  { value: "ARMAS",          label: "🔫 Armas" },
  { value: "MUNICOES",       label: "💣 Munições" },
  { value: "ACESSORIOS",     label: "🛒 Acessórios" },
  { value: "CACA",           label: "🦌 Caça / Pesca" },
  { value: "TIRO_ESPORTIVO", label: "🎯 Tiro Esportivo" },
  { value: "OUTROS",         label: "📋 Outros" },
];

/* ─── LinkedCompany (returned by DELETE 409) ─── */
interface LinkedCompany {
  id: string;
  tradeName: string;
  city: string | null;
  state: string | null;
  segment: string;
  logoUrl: string | null;
}

/* ─── Styling constants ─── */
const inputCls =
  "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const areaCls =
  "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full transition-colors resize-none";
const selectCls =
  "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full transition-colors";

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

function segmentLabel(val: string): string {
  return SEGMENT_OPTIONS.find((o) => o.value === val)?.label ?? val;
}

/* ─── blank form state ─── */
type FormData = Omit<GuiaCategory, "id">;

const BLANK_FORM: FormData = {
  title: "",
  slug: "",
  icon: "",
  shortCall: "",
  description: "",
  imageUrl: "",
  imageAlt: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  isActive: true,
  sortOrder: 0,
  segmentKey: "",
};

/* ─── SectionCard ─── */
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
      <div className="bg-[#141d2c] px-5 py-3">
        <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.8px]">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ─── CharCounter ─── */
function CharCounter({ value, max, warnStart }: { value: string; max: number; warnStart?: number }) {
  const len = (value ?? "").length;
  const color =
    warnStart && len >= warnStart && len <= max
      ? "text-green-400"
      : len > max
      ? "text-[#ff1f1f]"
      : "text-[#526888]";
  return <span className={`text-[11px] ${color}`}>{len}/{max}</span>;
}

/* ─── CategoryForm ─── */
function CategoryForm({
  initial,
  allCategories,
  onSave,
  onCancel,
  saving,
  error,
}: {
  initial: FormData & { id?: string };
  allCategories: GuiaCategory[];
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<FormData>({
    title:           initial.title           ?? "",
    slug:            initial.slug            ?? "",
    icon:            initial.icon            ?? "",
    shortCall:       initial.shortCall       ?? "",
    description:     initial.description     ?? "",
    imageUrl:        initial.imageUrl        ?? "",
    imageAlt:        initial.imageAlt        ?? "",
    metaTitle:       initial.metaTitle       ?? "",
    metaDescription: initial.metaDescription ?? "",
    metaKeywords:    initial.metaKeywords    ?? "",
    isActive:        initial.isActive        ?? true,
    sortOrder:       initial.sortOrder       ?? 0,
    segmentKey:      initial.segmentKey      ?? "",
  });

  const isNew = !initial.id;

  function handleTitleChange(val: string) {
    setForm((f) => ({ ...f, title: val, slug: toSlug(val) }));
  }

  useEffect(() => {
    if (!form.imageAlt && form.title) {
      setForm((f) => ({ ...f, imageAlt: f.title }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  /* Check if segmentKey is already used by another category */
  const segmentConflict =
    form.segmentKey &&
    allCategories.some((c) => c.id !== initial.id && c.segmentKey === form.segmentKey);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      {/* 1. Identidade */}
      <SectionCard title="Identidade">
        <div className="grid grid-cols-[80px_1fr_1fr_80px] gap-4 mb-4">
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
          <div className="col-span-2">
            <label className={labelCls}>Título <span className="text-[#ff1f1f]">*</span></label>
            <input
              className={inputCls}
              placeholder="Armareiros e Lojas"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>
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

        {/* Slug */}
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

        {/* Segment Key */}
        <div className="mb-4">
          <label className={labelCls}>
            Segmento Vinculado
            <span className="ml-2 text-[#526888] font-normal normal-case tracking-normal">
              (define quais empresas pertencem a esta categoria)
            </span>
          </label>
          <select
            className={selectCls}
            value={form.segmentKey ?? ""}
            onChange={(e) => set("segmentKey", e.target.value || null)}
          >
            {SEGMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {segmentConflict && (
            <p className="text-amber-400 text-[11px] mt-1">
              ⚠️ Outro categoria já usa este segmento. Empresas podem aparecer duplicadas.
            </p>
          )}
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
          <span className="text-[#d4d4da] text-[13px]">{form.isActive ? "Ativa" : "Inativa"}</span>
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
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => set("description", stripHtml(form.description ?? ""))}
              className="text-[#526888] hover:text-[#d4d4da] text-[12px] h-[30px] px-3 rounded-[4px] bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 transition-colors"
            >
              Limpar HTML
            </button>
          </div>
        </div>
      </SectionCard>

      {/* 3. Imagem Destaque */}
      <SectionCard title="Imagem Destaque">
        <ImageUpload
          folder="guide-categories"
          filename={form.slug || undefined}
          defaultUrl={form.imageUrl ?? ""}
          inputName="imageUrl"
          aspectHint="Imagem de destaque da categoria (proporção sugerida: 16:9)"
          onUrlChange={(url) => set("imageUrl", url)}
        />
        <div className="mt-4">
          <label className={labelCls}>Alt da Imagem (texto alternativo)</label>
          <input
            className={inputCls}
            placeholder="Texto alternativo para acessibilidade"
            value={form.imageAlt ?? ""}
            onChange={(e) => set("imageAlt", e.target.value)}
          />
        </div>
      </SectionCard>

      {/* 4. SEO */}
      <SectionCard title="SEO">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls.replace("mb-1.5", "mb-0")}>Meta Title</label>
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
              <label className={labelCls.replace("mb-1.5", "mb-0")}>Meta Description</label>
              <CharCounter value={form.metaDescription ?? ""} max={160} warnStart={120} />
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
            <p className="text-[#526888] text-[11px] mt-1">Separadas por vírgula</p>
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
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[40px] px-6 rounded-[6px] transition-colors min-w-[160px] flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-[14px] h-[14px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </>
          ) : isNew ? "+ Criar Categoria" : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}

/* ─── ReassignPanel ─── */
function ReassignPanel({
  companies,
  categoryTitle,
  allCategories,
  deletingCatId,
  onSuccess,
  onCancel,
}: {
  companies: LinkedCompany[];
  categoryTitle: string;
  allCategories: GuiaCategory[];
  deletingCatId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  /* Map: companyId → new segmentKey */
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    companies.forEach((c) => { init[c.id] = ""; });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Quick-fill all */
  function applyAll(segment: string) {
    setAssignments((prev) => {
      const next = { ...prev };
      companies.forEach((c) => { next[c.id] = segment; });
      return next;
    });
  }

  const allAssigned = companies.every((c) => assignments[c.id]);

  async function handleSave() {
    if (!allAssigned) {
      setError("Selecione uma nova categoria para cada empresa.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      /* 1. Reassign companies */
      const assignmentsList = companies.map((c) => ({
        id:      c.id,
        segment: assignments[c.id],
      }));
      const reassignRes = await fetch("/api/admin/guia/reassign-companies", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ assignments: assignmentsList }),
      });
      if (!reassignRes.ok) {
        const j = await reassignRes.json();
        setError(j.error ?? "Erro ao reatribuir empresas.");
        return;
      }

      /* 2. Now delete the category (should succeed) */
      const delRes = await fetch(`/api/admin/guia/categorias/${deletingCatId}`, {
        method: "DELETE",
      });
      if (!delRes.ok) {
        const j = await delRes.json();
        setError(j.error ?? "Empresas reatribuídas, mas falha ao excluir categoria.");
        return;
      }

      onSuccess();
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  /* Filter options — exclude categories with same segmentKey as the one being deleted
     so we only show valid targets */
  const targetOptions = allCategories.filter((c) => c.id !== deletingCatId && c.segmentKey);

  return (
    <div className="bg-[#0e1520] border border-amber-700/40 rounded-[12px] overflow-hidden">
      {/* Header */}
      <div className="bg-amber-900/30 border-b border-amber-700/40 px-5 py-4 flex items-start gap-3">
        <span className="text-[22px] shrink-0 mt-0.5">⚠️</span>
        <div>
          <p className="text-amber-300 text-[15px] font-semibold">
            {companies.length} empresa{companies.length !== 1 ? "s" : ""} vinculada{companies.length !== 1 ? "s" : ""} a &ldquo;{categoryTitle}&rdquo;
          </p>
          <p className="text-amber-400/70 text-[13px] mt-0.5">
            Selecione uma nova categoria para cada empresa antes de excluir.
          </p>
        </div>
      </div>

      <div className="p-5">
        {/* Bulk assign */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-[#141d2c] rounded-[8px]">
          <span className="text-[#7a9ab5] text-[12px] shrink-0">Aplicar a todas:</span>
          <select
            className="flex-1 bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[36px] px-3 text-[13px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f]"
            defaultValue=""
            onChange={(e) => { if (e.target.value) applyAll(e.target.value); }}
          >
            <option value="">— Escolher categoria —</option>
            {targetOptions.map((c) => (
              <option key={c.id} value={c.segmentKey!}>
                {c.icon} {c.title}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-4 text-[#ff6b6b] text-[13px]">
            {error}
          </div>
        )}

        {/* Company list */}
        <div className="space-y-2 mb-5">
          {companies.map((co) => (
            <div
              key={co.id}
              className="bg-[#141d2c] rounded-[8px] p-3 grid grid-cols-[48px_1fr_200px] gap-3 items-center"
            >
              {/* Logo / icon */}
              {co.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={co.logoUrl}
                  alt={co.tradeName}
                  className="w-[40px] h-[40px] rounded-[6px] object-contain bg-[#0e1520]"
                />
              ) : (
                <div className="w-[40px] h-[40px] rounded-[6px] bg-[#0e1520] flex items-center justify-center text-[18px]">
                  🏢
                </div>
              )}

              {/* Info */}
              <div className="min-w-0">
                <p className="text-[#d4d4da] text-[13px] font-semibold truncate">{co.tradeName}</p>
                <p className="text-[#526888] text-[11px]">
                  {co.city && co.state ? `${co.city} · ${co.state}` : (co.city || co.state || "—")}
                  <span className="ml-2 text-[#1c2a3e]">|</span>
                  <span className="ml-2">{segmentLabel(co.segment)}</span>
                </p>
              </div>

              {/* New category select */}
              <select
                className="bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[36px] px-2 text-[12px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full"
                value={assignments[co.id] ?? ""}
                onChange={(e) =>
                  setAssignments((prev) => ({ ...prev, [co.id]: e.target.value }))
                }
              >
                <option value="">— Nova categoria —</option>
                {targetOptions.map((c) => (
                  <option key={c.id} value={c.segmentKey!}>
                    {c.icon} {c.title}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[13px] h-[38px] px-5 rounded-[6px] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !allAssigned}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-40 text-white text-[13px] font-semibold h-[38px] px-5 rounded-[6px] transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-[13px] h-[13px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              `Reatribuir e Excluir Categoria`
            )}
          </button>
        </div>
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

  /* ─── Reassign state ─── */
  const [reassignData, setReassignData] = useState<{
    companies: LinkedCompany[];
    categoryTitle: string;
    catId: string;
  } | null>(null);

  function openCreate() {
    setEditTarget(null);
    setError(null);
    setReassignData(null);
    setMode("create");
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function openEdit(cat: GuiaCategory) {
    setEditTarget(cat);
    setError(null);
    setReassignData(null);
    setMode("edit");
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function closeForm() {
    setMode("list");
    setEditTarget(null);
    setError(null);
    setReassignData(null);
  }

  async function handleSave(data: FormData) {
    setSaving(true);
    setError(null);
    try {
      const isNew = mode === "create";
      const url    = isNew ? "/api/admin/guia/categorias" : `/api/admin/guia/categorias/${editTarget!.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:           data.title.trim(),
          slug:            data.slug,
          icon:            data.icon            || null,
          shortCall:       data.shortCall       || null,
          description:     data.description     || null,
          imageUrl:        data.imageUrl        || null,
          imageAlt:        data.imageAlt        || null,
          metaTitle:       data.metaTitle       || null,
          metaDescription: data.metaDescription || null,
          metaKeywords:    data.metaKeywords    || null,
          segmentKey:      data.segmentKey      || null,
          isActive:        data.isActive,
          sortOrder:       data.sortOrder,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Erro ao salvar.");
        return;
      }

      if (isNew) {
        setCategories((prev) => [...prev, json].sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        setCategories((prev) =>
          prev.map((c) => (c.id === editTarget!.id ? { ...c, ...json } : c))
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
    if (!window.confirm(`Excluir a categoria "${cat.title}"? Esta ação não pode ser desfeita.`)) return;
    setError(null);
    setReassignData(null);

    try {
      const res  = await fetch(`/api/admin/guia/categorias/${cat.id}`, { method: "DELETE" });
      const json = await res.json();

      if (res.status === 409 && json.error === "has_companies") {
        /* Show reassign panel */
        setReassignData({
          companies:     json.companies,
          categoryTitle: json.categoryTitle,
          catId:         cat.id,
        });
        return;
      }

      if (!res.ok) {
        setError(json.error ?? "Erro ao excluir.");
        return;
      }

      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      startTransition(() => router.refresh());
    } catch {
      setError("Erro de rede. Tente novamente.");
    }
  }

  function handleReassignSuccess() {
    if (!reassignData) return;
    setCategories((prev) => prev.filter((c) => c.id !== reassignData.catId));
    setReassignData(null);
    startTransition(() => router.refresh());
  }

  /* ─── Form view ─── */
  if (mode === "create" || mode === "edit") {
    const formInitial: FormData & { id?: string } = editTarget
      ? { ...editTarget }
      : { ...BLANK_FORM };

    return (
      <div ref={formTopRef}>
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
          initial={formInitial}
          allCategories={categories}
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

      {/* Reassign panel (shown after 409 on delete) */}
      {reassignData && (
        <div className="mb-6">
          <ReassignPanel
            companies={reassignData.companies}
            categoryTitle={reassignData.categoryTitle}
            allCategories={categories}
            deletingCatId={reassignData.catId}
            onSuccess={handleReassignSuccess}
            onCancel={() => setReassignData(null)}
          />
        </div>
      )}

      {/* Empty state */}
      {categories.length === 0 ? (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] px-6 py-16 text-center">
          <p className="text-[#526888] text-[14px] mb-4">Nenhuma categoria cadastrada.</p>
          <button
            onClick={openCreate}
            className="text-[#ff1f1f] hover:text-[#ff4444] text-[14px] transition-colors"
          >
            Criar primeira categoria →
          </button>
        </div>
      ) : (
        <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
          {/* Header row */}
          <div
            className="bg-[#141d2c] px-5 py-3 grid gap-4"
            style={{ gridTemplateColumns: "40px 1fr 180px 130px 80px 50px 120px" }}
          >
            {["Ícone", "Título / Slug", "Chamada Curta", "Segmento", "Status", "Ord.", "Ações"].map((h) => (
              <p key={h} className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">
                {h}
              </p>
            ))}
          </div>

          {categories.map((cat, i) => (
            <div key={cat.id}>
              {i > 0 && <div className="bg-[#141d2c] h-px" />}
              <div
                className={`px-5 py-4 grid gap-4 items-center transition-colors ${
                  reassignData?.catId === cat.id ? "bg-amber-900/10" : ""
                }`}
                style={{ gridTemplateColumns: "40px 1fr 180px 130px 80px 50px 120px" }}
              >
                {/* Icon */}
                <div className="text-[22px] leading-none flex items-center justify-center">
                  {cat.icon || <span className="text-[#1c2a3e] text-[18px]">—</span>}
                </div>

                {/* Title + slug */}
                <div className="min-w-0">
                  <p className="text-[#d4d4da] text-[14px] font-medium truncate">{cat.title}</p>
                  <p className="text-[#526888] text-[11px] font-mono mt-0.5 truncate">{cat.slug}</p>
                </div>

                {/* shortCall */}
                <p className="text-[#7a9ab5] text-[12px] truncate">
                  {cat.shortCall || <span className="text-[#1c2a3e]">—</span>}
                </p>

                {/* segmentKey */}
                <div>
                  {cat.segmentKey ? (
                    <span className="text-[11px] bg-[#141d2c] text-[#7a9ab5] px-2 py-[3px] rounded-[4px] font-mono">
                      {cat.segmentKey}
                    </span>
                  ) : (
                    <span className="text-[#1c2a3e] text-[12px]">—</span>
                  )}
                </div>

                {/* Status */}
                <div><ActiveBadge active={cat.isActive} /></div>

                {/* sortOrder */}
                <p className="text-[#526888] text-[12px] text-center">{cat.sortOrder}</p>

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
