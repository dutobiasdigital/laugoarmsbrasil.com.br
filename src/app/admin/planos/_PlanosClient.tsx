"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#7a9ab5] text-[11px] font-semibold mb-1";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceInCents: number;
  intervalMonths: number;
  active: boolean;
  subscriberCount: number;
}

const intervalLabel = (months: number) => {
  if (months === 1) return "Mensal";
  if (months === 3) return "Trimestral";
  if (months === 6) return "Semestral";
  if (months === 12) return "Anual";
  return `${months} meses`;
};

export default function PlanosClient({ plans: initialPlans }: { plans: Plan[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    priceInCents: "",
    intervalMonths: "3",
    active: true,
  });

  function toSlug(str: string) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function startEditing(plan: Plan) {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? "",
      priceInCents: String(plan.priceInCents),
      intervalMonths: String(plan.intervalMonths),
      active: plan.active,
    });
    setShowNew(false);
  }

  function startNew() {
    setEditingId(null);
    setForm({ name: "", slug: "", description: "", priceInCents: "", intervalMonths: "3", active: true });
    setShowNew(true);
  }

  async function handleSave(id?: string) {
    setError(null);
    const payload = {
      ...form,
      priceInCents: parseInt(form.priceInCents.replace(/\D/g, ""), 10),
      intervalMonths: parseInt(form.intervalMonths, 10),
    };
    const url = id ? `/api/admin/planos/${id}` : "/api/admin/planos";
    const method = id ? "PATCH" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
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

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="max-w-[900px]">
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-4 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      {/* Plans list */}
      <div className="flex flex-col gap-4 mb-6">
        {initialPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5"
          >
            {editingId === plan.id ? (
              /* Edit inline form */
              <div>
                <p className="text-[#7a9ab5] text-[12px] font-semibold mb-4">
                  Editando plano
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="lg:col-span-2">
                    <label className={labelCls}>Nome</label>
                    <input
                      className={inputCls}
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value, slug: toSlug(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Preço (centavos)</label>
                    <input
                      className={inputCls}
                      value={form.priceInCents}
                      onChange={(e) => setForm({ ...form, priceInCents: e.target.value })}
                      placeholder="2990"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Intervalo (meses)</label>
                    <select
                      className="bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full"
                      value={form.intervalMonths}
                      onChange={(e) => setForm({ ...form, intervalMonths: e.target.value })}
                    >
                      <option value="1">1 — Mensal</option>
                      <option value="3">3 — Trimestral</option>
                      <option value="6">6 — Semestral</option>
                      <option value="12">12 — Anual</option>
                    </select>
                  </div>
                  <div className="lg:col-span-4">
                    <label className={labelCls}>Descrição</label>
                    <input
                      className={inputCls}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id={`active-${plan.id}`}
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="w-[14px] h-[14px] accent-[#ff1f1f]"
                    />
                    <label htmlFor={`active-${plan.id}`} className="text-[#d4d4da] text-[13px]">
                      Ativo
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(plan.id)}
                    disabled={isPending}
                    className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold h-[36px] px-5 rounded-[6px] transition-colors"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-[#141d2c] border border-[#1c2a3e] text-[#d4d4da] text-[13px] h-[36px] px-4 rounded-[6px] hover:border-zinc-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* Display row */
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white text-[16px] font-semibold">{plan.name}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-[2px] rounded-[2px] ${
                        plan.active
                          ? "bg-[#0f381f] text-[#22c55e]"
                          : "bg-[#141d2c] text-white"
                      }`}
                    >
                      {plan.active ? "ATIVO" : "INATIVO"}
                    </span>
                  </div>
                  <p className="text-[#7a9ab5] text-[13px]">
                    {formatPrice(plan.priceInCents)} /{" "}
                    {intervalLabel(plan.intervalMonths).toLowerCase()} ·{" "}
                    {plan.subscriberCount.toLocaleString("pt-BR")} assinantes
                  </p>
                  {plan.description && (
                    <p className="text-white text-[12px] mt-1">{plan.description}</p>
                  )}
                </div>
                <button
                  onClick={() => startEditing(plan)}
                  className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] h-[36px] px-4 rounded-[6px] transition-colors whitespace-nowrap"
                >
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New plan form */}
      {showNew ? (
        <div className="bg-[#0e1520] border border-[#ff1f1f] rounded-[10px] p-5">
          <p className="text-[#ff1f1f] text-[12px] font-semibold mb-4 uppercase tracking-[1px]">
            Novo Plano
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className={labelCls}>Nome *</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value, slug: toSlug(e.target.value) })
                }
                placeholder="Ex: Plano Trimestral"
              />
            </div>
            <div>
              <label className={labelCls}>Preço (centavos) *</label>
              <input
                className={inputCls}
                value={form.priceInCents}
                onChange={(e) => setForm({ ...form, priceInCents: e.target.value })}
                placeholder="2990"
              />
            </div>
            <div>
              <label className={labelCls}>Intervalo (meses)</label>
              <select
                className="bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full"
                value={form.intervalMonths}
                onChange={(e) => setForm({ ...form, intervalMonths: e.target.value })}
              >
                <option value="1">1 — Mensal</option>
                <option value="3">3 — Trimestral</option>
                <option value="6">6 — Semestral</option>
                <option value="12">12 — Anual</option>
              </select>
            </div>
            <div className="lg:col-span-4">
              <label className={labelCls}>Descrição</label>
              <input
                className={inputCls}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrição breve do plano"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSave()}
              disabled={isPending}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold h-[36px] px-5 rounded-[6px] transition-colors"
            >
              Criar Plano
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="bg-[#141d2c] border border-[#1c2a3e] text-[#d4d4da] text-[13px] h-[36px] px-4 rounded-[6px] hover:border-zinc-500 transition-colors"
            >
              Cancelar
            </button>
          </div>
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
