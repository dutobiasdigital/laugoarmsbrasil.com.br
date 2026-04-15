"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

/* ── Types ─────────────────────────────────────────────────── */
interface PaymentIntent {
  id:                 string;
  gateway:            string;
  gateway_id:         string | null;
  status:             string;
  product_type:       string;
  product_id:         string | null;
  product_label:      string | null;
  amount:             number;
  currency:           string;
  payer_name:         string | null;
  payer_email:        string | null;
  metadata:           Record<string, unknown> | null;
  external_reference: string | null;
  checkout_url:       string | null;
  createdAt:          string;
  updatedAt:          string;
}

/* ── Helpers ────────────────────────────────────────────────── */
const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  APPROVED:  { bg: "bg-[#0f381f]",  text: "text-[#22c55e]", label: "APROVADO"     },
  PENDING:   { bg: "bg-[#2a1e05]",  text: "text-[#f59e0b]", label: "PENDENTE"     },
  REJECTED:  { bg: "bg-[#2d0a0a]",  text: "text-[#ff6b6b]", label: "RECUSADO"     },
  REFUNDED:  { bg: "bg-[#141d2c]",  text: "text-[#7a9ab5]", label: "REEMBOLSADO"  },
  CANCELLED: { bg: "bg-[#141d2c]",  text: "text-[#253750]", label: "CANCELADO"    },
};

const GATEWAY_ICON: Record<string, string> = {
  mercadopago: "🟡",
  stripe:      "🟣",
  pagseguro:   "🟢",
  paypal:      "🔵",
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/* ── Componente ─────────────────────────────────────────────── */
export default function AdminPagamentosPage() {
  const [intents, setIntents]   = useState<PaymentIntent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // Filtros client-side
  const [q, setQ]               = useState("");
  const [statusFilter, setStatus] = useState("TODOS");
  const [gwFilter, setGw]       = useState("TODOS");

  useEffect(() => {
    setLoading(true); setError(null);
    fetch("/api/admin/pagamentos")
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setIntents(d.intents ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  /* ── Estatísticas ─── */
  const stats = useMemo(() => {
    const approved = intents.filter(i => i.status === "APPROVED");
    const pending  = intents.filter(i => i.status === "PENDING");
    const today    = intents.filter(i => new Date(i.createdAt).toDateString() === new Date().toDateString());
    const revenue  = approved.reduce((s, i) => s + i.amount, 0);
    return { total: intents.length, approved: approved.length, pending: pending.length, today: today.length, revenue };
  }, [intents]);

  /* ── Gateways disponíveis ─── */
  const gateways = useMemo(() =>
    Array.from(new Set(intents.map(i => i.gateway))).filter(Boolean),
  [intents]);

  /* ── Filtro ─── */
  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return intents.filter(i => {
      if (statusFilter !== "TODOS" && i.status  !== statusFilter) return false;
      if (gwFilter     !== "TODOS" && i.gateway !== gwFilter)     return false;
      if (ql && ![i.payer_name, i.payer_email, i.product_label, i.external_reference]
        .some(v => v?.toLowerCase().includes(ql))) return false;
      return true;
    });
  }, [intents, q, statusFilter, gwFilter]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Pagamentos
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            {stats.total} transações · Receita:{" "}
            <span className="text-[#22c55e] font-semibold">{fmt(stats.revenue)}</span>
          </p>
        </div>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",        value: stats.total,    color: "text-white",       sub: "transações"  },
          { label: "Aprovadas",    value: stats.approved, color: "text-[#22c55e]",   sub: "confirmadas" },
          { label: "Pendentes",    value: stats.pending,  color: "text-[#f59e0b]",   sub: "aguardando"  },
          { label: "Hoje",         value: stats.today,    color: "text-[#818cf8]",   sub: "novas"       },
        ].map(s => (
          <div key={s.label} className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4">
            <p className="text-[#526888] text-[11px] font-semibold tracking-[1px] uppercase mb-1">{s.label}</p>
            <p className={`font-['Barlow_Condensed'] font-bold text-[28px] leading-none ${s.color}`}>{s.value}</p>
            <p className="text-[#253750] text-[11px] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Receita card */}
      <div className="bg-[#0f381f] border border-[#22c55e]/20 rounded-[10px] p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-[#22c55e]/70 text-[11px] font-semibold tracking-[1px] uppercase mb-0.5">Receita total aprovada</p>
          <p className="font-['Barlow_Condensed'] font-bold text-[#22c55e] text-[36px] leading-none">
            {fmt(stats.revenue)}
          </p>
        </div>
        <span className="text-[40px]">💰</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="🔍 Buscar pagador, produto ou ref..."
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] placeholder-[#253750] focus:outline-none focus:border-[#ff1f1f] w-[280px] transition-colors"
        />
        <select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] transition-colors"
        >
          <option value="TODOS">Todos os status</option>
          <option value="APPROVED">Aprovado</option>
          <option value="PENDING">Pendente</option>
          <option value="REJECTED">Recusado</option>
          <option value="REFUNDED">Reembolsado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
        {gateways.length > 1 && (
          <select
            value={gwFilter}
            onChange={e => setGw(e.target.value)}
            className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] transition-colors"
          >
            <option value="TODOS">Todos os gateways</option>
            {gateways.map(g => (
              <option key={g} value={g}>{GATEWAY_ICON[g] ?? "💳"} {g}</option>
            ))}
          </select>
        )}
        {(q || statusFilter !== "TODOS" || gwFilter !== "TODOS") && (
          <button
            onClick={() => { setQ(""); setStatus("TODOS"); setGw("TODOS"); }}
            className="text-[#526888] hover:text-white text-[13px] h-[38px] px-3 transition-colors"
          >
            Limpar
          </button>
        )}
        <span className="ml-auto text-[#253750] text-[13px] flex items-center">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f]/30 rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px] mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
        {/* Header */}
        <div className="bg-[#141d2c] px-5 py-3 grid grid-cols-[1fr_1.4fr_1.2fr_90px_90px_100px_80px] gap-3 hidden md:grid">
          {["Data", "Pagador", "Produto", "Valor", "Gateway", "Status", "Ref"].map(h => (
            <p key={h} className="text-[#253750] text-[11px] font-semibold tracking-[0.5px]">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-[18px] h-[18px] border-2 border-[#ff1f1f] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#526888] text-[14px]">Carregando...</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-[#253750] text-[13px] p-8 text-center">
            Nenhuma transação encontrada.
          </p>
        ) : (
          filtered.map((intent, i) => {
            const st  = STATUS_STYLE[intent.status] ?? STATUS_STYLE.CANCELLED;
            const gwIcon = GATEWAY_ICON[intent.gateway] ?? "💳";
            const meta = intent.metadata as { slug?: string } | null;
            const isGuia = intent.product_type === "guia_plan";

            return (
              <div key={intent.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                {/* Desktop */}
                <div className="px-5 py-3.5 grid grid-cols-[1fr_1.4fr_1.2fr_90px_90px_100px_80px] gap-3 items-center hidden md:grid">
                  {/* Data */}
                  <div>
                    <p className="text-[#7a9ab5] text-[12px]">{fmtDate(intent.createdAt)}</p>
                    <p className="text-[#253750] text-[11px]">{fmtTime(intent.createdAt)}</p>
                  </div>

                  {/* Pagador */}
                  <div className="min-w-0">
                    <p className="text-[#d4d4da] text-[13px] truncate">{intent.payer_name ?? "—"}</p>
                    <p className="text-[#526888] text-[11px] truncate">{intent.payer_email ?? "—"}</p>
                  </div>

                  {/* Produto */}
                  <div className="min-w-0">
                    {isGuia && meta?.slug ? (
                      <Link
                        href={`/guia/empresa/${meta.slug}`}
                        target="_blank"
                        className="text-[#7a9ab5] hover:text-white text-[12px] truncate block transition-colors"
                      >
                        {intent.product_label ?? "—"} ↗
                      </Link>
                    ) : (
                      <p className="text-[#7a9ab5] text-[12px] truncate">{intent.product_label ?? "—"}</p>
                    )}
                    <p className="text-[#253750] text-[10px]">{intent.product_type}</p>
                  </div>

                  {/* Valor */}
                  <p className="text-white text-[14px] font-semibold">{fmt(intent.amount)}</p>

                  {/* Gateway */}
                  <p className="text-[#7a9ab5] text-[13px]">
                    {gwIcon} <span className="capitalize">{intent.gateway}</span>
                  </p>

                  {/* Status */}
                  <span className={`inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                    {st.label}
                  </span>

                  {/* Ref */}
                  <p className="text-[#253750] text-[10px] font-mono truncate" title={intent.external_reference ?? ""}>
                    {intent.external_reference ? intent.external_reference.slice(0, 8) + "…" : "—"}
                  </p>
                </div>

                {/* Mobile */}
                <div className="px-4 py-3.5 flex items-center justify-between gap-3 md:hidden">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                      <span className="text-[#526888] text-[11px]">{gwIcon} {intent.gateway}</span>
                    </div>
                    <p className="text-[#d4d4da] text-[13px] truncate">{intent.payer_name ?? "—"}</p>
                    <p className="text-[#526888] text-[11px] truncate">{intent.product_label ?? "—"}</p>
                    <p className="text-[#253750] text-[11px]">{fmtDate(intent.createdAt)}</p>
                  </div>
                  <p className="text-white text-[15px] font-bold shrink-0">{fmt(intent.amount)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-[#253750] text-[12px] mt-3 text-right">
          {filtered.length} transaç{filtered.length !== 1 ? "ões" : "ão"} · Total filtrado:{" "}
          <span className="text-[#d4d4da]">
            {fmt(filtered.filter(i => i.status === "APPROVED").reduce((s, i) => s + i.amount, 0))}
          </span>{" "}
          aprovados
        </p>
      )}
    </>
  );
}
