"use client";

import { useState } from "react";

const inputCls =
  "bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-[#52525b] focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#a1a1aa] text-[12px] font-semibold mb-1.5";
const selectCls =
  "bg-[#27272a] border border-[#3f3f46] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "ATIVO" },
  PAST_DUE: { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "ATRASADO" },
  CANCELED: { bg: "bg-[#27272a]", text: "text-[#52525b]", label: "CANCELADO" },
  PENDING: { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "PENDENTE" },
  EXPIRED: { bg: "bg-[#27272a]", text: "text-[#52525b]", label: "EXPIRADO" },
};

interface Plan {
  id: string;
  name: string;
  priceInCents: number;
  intervalMonths: number;
}

interface Subscription {
  id: string;
  status: string;
  planId: string;
  planName: string;
  planPriceInCents: number;
  intervalMonths: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  subscribedAt: string;
  canceledAt: string | null;
  notes: string;
}

interface Props {
  user: { id: string; name: string; email: string; phone: string; role: string };
  subscription: Subscription | null;
  plans: Plan[];
}

export default function AssinanteClient({ user, subscription, plans }: Props) {
  const [userName, setUserName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);
  const [userMsg, setUserMsg] = useState<string | null>(null);

  const [subStatus, setSubStatus] = useState(subscription?.status ?? "ACTIVE");
  const [subPlanId, setSubPlanId] = useState(subscription?.planId ?? (plans[0]?.id ?? ""));
  const [subStart, setSubStart] = useState(subscription?.currentPeriodStart ?? new Date().toISOString().split("T")[0]);
  const [subEnd, setSubEnd] = useState(subscription?.currentPeriodEnd ?? "");
  const [subNotes, setSubNotes] = useState(subscription?.notes ?? "");
  const [subSaving, setSubSaving] = useState(false);
  const [subMsg, setSubMsg] = useState<string | null>(null);
  const [showSubForm, setShowSubForm] = useState(false);

  const formatCurrency = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  async function saveUser() {
    setSaving(true);
    setUserMsg(null);
    const res = await fetch(`/api/admin/assinantes/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: userName, phone, role }),
    });
    setSaving(false);
    setUserMsg(res.ok ? "Dados salvos!" : "Erro ao salvar.");
    setTimeout(() => setUserMsg(null), 3000);
  }

  async function saveSubscription() {
    if (!subPlanId || !subStart || !subEnd) {
      setSubMsg("Preencha plano, data de início e data de término.");
      return;
    }
    setSubSaving(true);
    setSubMsg(null);
    const res = await fetch(`/api/admin/assinantes/${user.id}/assinatura`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: subPlanId,
        status: subStatus,
        currentPeriodStart: subStart,
        currentPeriodEnd: subEnd,
        notes: subNotes,
      }),
    });
    setSubSaving(false);
    if (res.ok) {
      setSubMsg("Assinatura atualizada!");
      setShowSubForm(false);
    } else {
      const d = await res.json();
      setSubMsg(d.error || "Erro ao salvar assinatura.");
    }
    setTimeout(() => setSubMsg(null), 4000);
  }

  const currentPlan = plans.find((p) => p.id === subPlanId);
  const st = STATUS_STYLE[subscription?.status ?? ""] ?? null;

  return (
    <div className="space-y-5">
      {/* User info */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-[10px] p-5">
        <p className="text-[#a1a1aa] text-[12px] font-semibold uppercase tracking-[1px] mb-4">Dados Pessoais</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nome</label>
            <input className={inputCls} value={userName} onChange={(e) => setUserName(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>E-mail</label>
            <input className={`${inputCls} opacity-60 cursor-not-allowed`} value={user.email} readOnly />
          </div>
          <div>
            <label className={labelCls}>Telefone</label>
            <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 11 99999-9999" />
          </div>
          <div>
            <label className={labelCls}>Perfil</label>
            <select className={selectCls} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="SUBSCRIBER">Assinante</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={saveUser}
            disabled={saving}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold h-[36px] px-5 rounded-[6px] transition-colors"
          >
            {saving ? "Salvando..." : "Salvar dados"}
          </button>
          {userMsg && (
            <p className={`text-[13px] ${userMsg.includes("Erro") ? "text-[#ff6b6b]" : "text-[#22c55e]"}`}>
              {userMsg}
            </p>
          )}
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-[10px] p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[#a1a1aa] text-[12px] font-semibold uppercase tracking-[1px]">Assinatura</p>
          <button
            onClick={() => setShowSubForm(!showSubForm)}
            className="bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 text-[#d4d4da] text-[12px] h-[30px] px-3 rounded-[6px] transition-colors"
          >
            {showSubForm ? "Cancelar" : subscription ? "Editar assinatura" : "Ativar assinatura"}
          </button>
        </div>

        {!showSubForm && subscription && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <p className="text-[#52525b] text-[11px] mb-0.5">Plano</p>
              <p className="text-[#d4d4da] text-[14px] font-semibold">{subscription.planName}</p>
            </div>
            <div>
              <p className="text-[#52525b] text-[11px] mb-0.5">Valor</p>
              <p className="text-[#d4d4da] text-[14px]">{formatCurrency(subscription.planPriceInCents)}</p>
            </div>
            <div>
              <p className="text-[#52525b] text-[11px] mb-0.5">Status</p>
              {st ? (
                <span className={`inline-flex items-center h-[20px] px-2.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                  {st.label}
                </span>
              ) : <p className="text-[#52525b] text-[13px]">—</p>}
            </div>
            <div>
              <p className="text-[#52525b] text-[11px] mb-0.5">Início do período</p>
              <p className="text-[#d4d4da] text-[13px]">
                {new Date(subscription.currentPeriodStart).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-[#52525b] text-[11px] mb-0.5">Fim do período</p>
              <p className="text-[#d4d4da] text-[13px]">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-[#52525b] text-[11px] mb-0.5">Assinante desde</p>
              <p className="text-[#d4d4da] text-[13px]">{subscription.subscribedAt}</p>
            </div>
            {subscription.notes && (
              <div className="col-span-2 lg:col-span-3">
                <p className="text-[#52525b] text-[11px] mb-0.5">Observações</p>
                <p className="text-[#a1a1aa] text-[13px]">{subscription.notes}</p>
              </div>
            )}
          </div>
        )}

        {!showSubForm && !subscription && (
          <p className="text-[#52525b] text-[13px]">Nenhuma assinatura ativa. Clique em "Ativar assinatura" para configurar.</p>
        )}

        {showSubForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Plano *</label>
                <select className={selectCls} value={subPlanId} onChange={(e) => {
                  setSubPlanId(e.target.value);
                  const plan = plans.find((p) => p.id === e.target.value);
                  if (plan && subStart) {
                    const start = new Date(subStart);
                    start.setMonth(start.getMonth() + plan.intervalMonths);
                    setSubEnd(start.toISOString().split("T")[0]);
                  }
                }}>
                  {plans.length === 0 && <option value="">Nenhum plano cadastrado</option>}
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.priceInCents)}/{p.intervalMonths === 1 ? "mês" : `${p.intervalMonths} meses`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status *</label>
                <select className={selectCls} value={subStatus} onChange={(e) => setSubStatus(e.target.value)}>
                  <option value="ACTIVE">Ativo</option>
                  <option value="PENDING">Pendente</option>
                  <option value="PAST_DUE">Atrasado</option>
                  <option value="CANCELED">Cancelado</option>
                  <option value="EXPIRED">Expirado</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Início do período *</label>
                <input
                  type="date"
                  className={inputCls}
                  value={subStart}
                  onChange={(e) => {
                    setSubStart(e.target.value);
                    if (currentPlan && e.target.value) {
                      const start = new Date(e.target.value);
                      start.setMonth(start.getMonth() + currentPlan.intervalMonths);
                      setSubEnd(start.toISOString().split("T")[0]);
                    }
                  }}
                />
              </div>
              <div>
                <label className={labelCls}>Fim do período *</label>
                <input type="date" className={inputCls} value={subEnd} onChange={(e) => setSubEnd(e.target.value)} />
              </div>
              <div className="lg:col-span-2">
                <label className={labelCls}>Observações</label>
                <input className={inputCls} value={subNotes} onChange={(e) => setSubNotes(e.target.value)} placeholder="Ex: Pago via transferência bancária" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveSubscription}
                disabled={subSaving}
                className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold h-[36px] px-5 rounded-[6px] transition-colors"
              >
                {subSaving ? "Salvando..." : subscription ? "Atualizar assinatura" : "Ativar assinatura"}
              </button>
              {subMsg && (
                <p className={`text-[13px] ${subMsg.includes("Erro") || subMsg.includes("Preencha") ? "text-[#ff6b6b]" : "text-[#22c55e]"}`}>
                  {subMsg}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
