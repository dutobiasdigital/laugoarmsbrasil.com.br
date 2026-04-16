"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#7a9ab5] text-[11px] font-semibold mb-1";
const selectCls =
  "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceInCents: number;
  intervalMonths: number;
  active: boolean;
  subscriberCount: number;
  highlight: boolean;
  badge: string | null;
  buttonText: string | null;
  features: string | null;
  sortOrder: number;
}

const intervalLabel = (months: number) => {
  if (months === 1)  return "Mensal";
  if (months === 3)  return "Trimestral";
  if (months === 6)  return "Semestral";
  if (months === 12) return "Anual";
  return `${months} meses`;
};

function formatMoneyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const cents = parseInt(digits, 10);
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function centsFromDisplay(display: string): number {
  const digits = display.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function centsToDisplay(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toSlug(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* ── Editor de itens ────────────────────────────────────── */
function FeatureEditor({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  function move(from: number, to: number) {
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  }
  function remove(idx: number) { onChange(items.filter((_, i) => i !== idx)); }
  function update(idx: number, val: string) {
    const next = [...items];
    next[idx] = val;
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <input
            className={inputCls + " flex-1"}
            value={item}
            placeholder="Ex: Acesso ao acervo completo"
            onChange={(e) => update(idx, e.target.value)}
          />
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => move(idx, idx - 1)}
            className="h-[38px] w-[32px] flex items-center justify-center bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] text-[#7a9ab5] hover:text-white disabled:opacity-30 text-[12px] shrink-0 transition-colors"
            title="Mover para cima"
          >↑</button>
          <button
            type="button"
            disabled={idx === items.length - 1}
            onClick={() => move(idx, idx + 1)}
            className="h-[38px] w-[32px] flex items-center justify-center bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] text-[#7a9ab5] hover:text-white disabled:opacity-30 text-[12px] shrink-0 transition-colors"
            title="Mover para baixo"
          >↓</button>
          <button
            type="button"
            onClick={() => remove(idx)}
            className="h-[38px] w-[32px] flex items-center justify-center bg-[#1a0808] border border-[#3d1010] rounded-[6px] text-[#ff6b6b] hover:border-[#ff1f1f] text-[12px] shrink-0 transition-colors"
            title="Remover item"
          >✕</button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="h-[34px] bg-[#141d2c] border border-dashed border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[12px] rounded-[6px] transition-colors mt-0.5"
      >
        + Adicionar item
      </button>
    </div>
  );
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  priceDisplay: string;
  intervalMonths: string;
  active: boolean;
  highlight: boolean;
  badge: string;
  buttonText: string;
  featureItems: string[];
  sortOrder: string;
}

const emptyForm = (): FormState => ({
  name: "", slug: "", description: "",
  priceDisplay: "", intervalMonths: "3", active: true,
  highlight: false, badge: "", buttonText: "",
  featureItems: [], sortOrder: "0",
});

export default function PlanosClient({ plans: initialPlans }: { plans: Plan[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew,   setShowNew]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [form,      setForm]      = useState<FormState>(emptyForm());

  function setPrice(raw: string) {
    setForm((f) => ({ ...f, priceDisplay: formatMoneyInput(raw) }));
  }

  function startEditing(plan: Plan) {
    setEditingId(plan.id);
    setForm({
      name:          plan.name,
      slug:          plan.slug,
      description:   plan.description ?? "",
      priceDisplay:  centsToDisplay(plan.priceInCents),
      intervalMonths: String(plan.intervalMonths),
      active:        plan.active,
      highlight:     plan.highlight,
      badge:         plan.badge ?? "",
      buttonText:    plan.buttonText ?? "",
      featureItems:  plan.features ? plan.features.split("\n").filter(Boolean) : [],
      sortOrder:     String(plan.sortOrder ?? 0),
    });
    setShowNew(false);
    setError(null);
  }

  function startNew() {
    setEditingId(null);
    setForm(emptyForm());
    setShowNew(true);
    setError(null);
  }

  async function handleSave(id?: string) {
    setError(null);
    const priceInCents = centsFromDisplay(form.priceDisplay);
    if (!form.name.trim()) { setError("Nome é obrigatório."); return; }
    if (priceInCents <= 0 && id === undefined) { setError("Preço deve ser maior que zero."); return; }

    const payload = {
      name:           form.name.trim(),
      slug:           form.slug || toSlug(form.name),
      description:    form.description.trim() || null,
      priceInCents,
      intervalMonths: parseInt(form.intervalMonths, 10),
      active:         form.active,
      highlight:      form.highlight,
      badge:          form.badge.trim() || null,
      buttonText:     form.buttonText.trim() || null,
      features:       form.featureItems.filter(Boolean).join("\n") || null,
      sortOrder:      parseInt(form.sortOrder, 10) || 0,
    };

    const url    = id ? `/api/admin/planos/${id}` : "/api/admin/planos";
    const method = id ? "PATCH" : "POST";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao salvar.");
        return;
      }
      setEditingId(null);
      setShowNew(false);
      startTransition(() => router.refresh());
    } catch {
      setError("Erro de conexão.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Tem certeza que deseja excluir este plano?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/planos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao excluir.");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Erro de conexão.");
    } finally {
      setDeleting(null);
    }
  }

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function PlanForm({ planId }: { planId?: string }) {
    return (
      <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Nome */}
          <div className="lg:col-span-2">
            <label className={labelCls}>Nome *</label>
            <input
              className={inputCls}
              value={form.name}
              placeholder="Ex: Plano Trimestral"
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: toSlug(e.target.value) })}
            />
          </div>

          {/* Preço */}
          <div>
            <label className={labelCls}>Preço (R$) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526888] text-[13px] pointer-events-none">R$</span>
              <input
                className={inputCls + " pl-8"}
                value={form.priceDisplay}
                placeholder="0,00"
                inputMode="numeric"
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Intervalo */}
          <div>
            <label className={labelCls}>Intervalo (meses)</label>
            <select className={selectCls} value={form.intervalMonths} onChange={(e) => setForm({ ...form, intervalMonths: e.target.value })}>
              <option value="1">1 — Mensal</option>
              <option value="3">3 — Trimestral</option>
              <option value="6">6 — Semestral</option>
              <option value="12">12 — Anual</option>
            </select>
          </div>

          {/* Descrição */}
          <div className="lg:col-span-2">
            <label className={labelCls}>Descrição</label>
            <input
              className={inputCls}
              value={form.description}
              placeholder="Descrição breve do plano"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Ordem */}
          <div>
            <label className={labelCls}>Ordem de exibição</label>
            <input
              className={inputCls}
              value={form.sortOrder}
              type="number"
              min="0"
              placeholder="0"
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>

          {/* Ativo */}
          <div className="flex items-end pb-1">
            <div className="flex items-center gap-2">
              <input
                id={`active-${planId ?? "new"}`}
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-[14px] h-[14px] accent-[#ff1f1f]"
              />
              <label htmlFor={`active-${planId ?? "new"}`} className="text-[#d4d4da] text-[13px]">Ativo</label>
            </div>
          </div>
        </div>

        {/* Seção Destaque */}
        <div className="bg-[#0a0f1a] border border-[#1c2a3e] rounded-[8px] p-4 mb-4">
          <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px] mb-3">Destaque &amp; Apresentação</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Destaque */}
            <div className="flex items-center gap-2 pt-5">
              <input
                id={`highlight-${planId ?? "new"}`}
                type="checkbox"
                checked={form.highlight}
                onChange={(e) => setForm({ ...form, highlight: e.target.checked })}
                className="w-[14px] h-[14px] accent-[#ff1f1f]"
              />
              <label htmlFor={`highlight-${planId ?? "new"}`} className="text-[#d4d4da] text-[13px]">
                Destacar plano
              </label>
            </div>

            {/* Label/Badge */}
            <div>
              <label className={labelCls}>Label (badge acima)</label>
              <input
                className={inputCls}
                value={form.badge}
                placeholder="Ex: MAIS POPULAR"
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
              />
            </div>

            {/* Texto do botão */}
            <div className="lg:col-span-2">
              <label className={labelCls}>Texto do botão</label>
              <input
                className={inputCls}
                value={form.buttonText}
                placeholder="Ex: Assinar agora →"
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Itens / Benefícios */}
        <div className="mb-4">
          <label className={labelCls}>Itens / Benefícios</label>
          <FeatureEditor
            items={form.featureItems}
            onChange={(items) => setForm({ ...form, featureItems: items })}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleSave(planId)}
            disabled={isPending}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold h-[36px] px-5 rounded-[6px] transition-colors"
          >
            {planId ? "Salvar" : "Criar Plano"}
          </button>
          <button
            type="button"
            onClick={() => { setEditingId(null); setShowNew(false); setError(null); }}
            className="bg-[#141d2c] border border-[#1c2a3e] text-[#d4d4da] text-[13px] h-[36px] px-4 rounded-[6px] hover:border-zinc-500 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-[900px]">
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-4 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      {/* Lista de planos */}
      <div className="flex flex-col gap-4 mb-6">
        {initialPlans.map((plan) => (
          <div key={plan.id} className={`bg-[#0e1520] border rounded-[10px] p-5 ${plan.highlight ? "border-[#ff1f1f]/40" : "border-[#141d2c]"}`}>
            {editingId === plan.id ? (
              <div>
                <p className="text-[#7a9ab5] text-[12px] font-semibold mb-4 uppercase tracking-[0.5px]">Editando plano</p>
                <PlanForm planId={plan.id} />
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-white text-[16px] font-semibold">{plan.name}</p>
                    {plan.highlight && (
                      <span className="text-[10px] font-bold px-2 py-[2px] rounded-[2px] bg-[#ff1f1f]/20 text-[#ff1f1f]">DESTAQUE</span>
                    )}
                    {plan.badge && (
                      <span className="text-[10px] font-bold px-2 py-[2px] rounded-[2px] bg-[#141d2c] text-[#7a9ab5] border border-[#1c2a3e]">
                        {plan.badge}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-[2px] rounded-[2px] ${plan.active ? "bg-[#0f381f] text-[#22c55e]" : "bg-[#141d2c] text-[#526888]"}`}>
                      {plan.active ? "ATIVO" : "INATIVO"}
                    </span>
                  </div>
                  <p className="text-[#7a9ab5] text-[13px] mb-1">
                    {formatPrice(plan.priceInCents)} /{" "}
                    {intervalLabel(plan.intervalMonths).toLowerCase()} ·{" "}
                    {plan.subscriberCount.toLocaleString("pt-BR")} assinante{plan.subscriberCount !== 1 ? "s" : ""}
                  </p>
                  {plan.description && (
                    <p className="text-white/70 text-[12px] mb-2">{plan.description}</p>
                  )}
                  {plan.buttonText && (
                    <p className="text-[#526888] text-[11px] mb-2">Botão: <span className="text-[#d4d4da]">{plan.buttonText}</span></p>
                  )}
                  {plan.features && (
                    <ul className="flex flex-col gap-[3px] mt-2">
                      {plan.features.split("\n").filter(Boolean).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-[12px] text-[#7a9ab5]">
                          <span className="text-[#ff1f1f] text-[10px]">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEditing(plan)}
                    className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] h-[36px] px-4 rounded-[6px] transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    disabled={deleting === plan.id}
                    className="bg-[#1a0808] border border-[#3d1010] hover:border-[#ff1f1f] text-[#ff6b6b] text-[13px] h-[36px] px-3 rounded-[6px] transition-colors disabled:opacity-50"
                  >
                    {deleting === plan.id ? "..." : "Excluir"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Novo plano */}
      {showNew ? (
        <div className="bg-[#0e1520] border border-[#ff1f1f] rounded-[10px] p-5">
          <p className="text-[#ff1f1f] text-[12px] font-semibold mb-4 uppercase tracking-[1px]">Novo Plano</p>
          <PlanForm />
        </div>
      ) : (
        <button
          onClick={startNew}
          className="bg-[#141d2c] border border-dashed border-[#1c2a3e] hover:border-zinc-500 text-[#7a9ab5] hover:text-white text-[14px] h-[48px] w-full rounded-[10px] transition-colors"
        >
          + Adicionar novo plano
        </button>
      )}
    </div>
  );
}
