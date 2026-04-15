"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  ARMAREIRO:  "Armareiro",   CLUBE_TIRO:  "Clube de Tiro", MUNICOES:   "Munições",
  CACA:       "Caça/Pesca",  JURIDICO:    "Jurídico",      TREINAMENTO: "Treinamento",
  MANUTENCAO: "Manutenção",  IMPORTACAO:  "Importação",    TRANSPORTE:  "Transporte",
  SEGURO:     "Seguros",     OUTROS:      "Outros",
};

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  FREE:     { label: "Free",      color: "bg-[#141d2c] text-[#526888]" },
  PREMIUM:  { label: "Premium",   color: "bg-[#1a1a40] text-[#818cf8]" },
  DESTAQUE: { label: "Destaque",  color: "bg-[#260a0a] text-[#ff1f1f]" },
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pendente",  color: "bg-[#1a1a0a] text-[#facc15]" },
  ACTIVE:    { label: "Ativo",     color: "bg-[#0f381f] text-[#22c55e]" },
  SUSPENDED: { label: "Suspenso",  color: "bg-[#141d2c] text-[#526888]" },
};

const FILTER_TABS = [
  { label: "Todos",     value: "" },
  { label: "Pendentes", value: "PENDING" },
  { label: "Ativos",    value: "ACTIVE" },
  { label: "Suspensos", value: "SUSPENDED" },
];

interface Listing {
  id: string; slug: string; name: string; category: string;
  plan: string; status: string; city: string; state: string;
  featured: boolean; viewsCount: number; createdAt: string;
}

export default function AdminGuiaPage() {
  const [listings, setListings]   = useState<Listing[]>([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch]       = useState("");
  const [updating, setUpdating]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/admin/guia?status=${statusFilter}`
        : "/api/admin/guia";
      const res  = await fetch(url);
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function quickStatus(id: string, newStatus: string) {
    setUpdating(id);
    try {
      await fetch("/api/admin/guia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setListings(ls =>
        ls.map(l => l.id === id ? { ...l, status: newStatus } : l)
      );
    } finally {
      setUpdating(null);
    }
  }

  const displayed = listings.filter(l =>
    !search.trim() ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.city.toLowerCase().includes(search.toLowerCase()) ||
    l.state.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:     listings.length,
    pending:   listings.filter(l => l.status === "PENDING").length,
    active:    listings.filter(l => l.status === "ACTIVE").length,
    suspended: listings.filter(l => l.status === "SUSPENDED").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none">Guia Comercial</h1>
          <p className="text-[#526888] text-[14px] mt-1">Gerencie os cadastros do diretório</p>
        </div>
        <div className="flex gap-3">
          <Link href="/guia" target="_blank"
            className="bg-[#0e1520] border border-[#141d2c] hover:border-zinc-600 text-[#d4d4da] text-[13px] h-[36px] px-4 flex items-center rounded-[6px] transition-colors">
            ↗ Ver Guia
          </Link>
          <Link href="/admin/guia/nova"
            className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[36px] px-4 flex items-center rounded-[6px] transition-colors">
            + Nova empresa
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",     value: stats.total,     color: "text-white" },
          { label: "Pendentes", value: stats.pending,   color: "text-[#facc15]" },
          { label: "Ativos",    value: stats.active,    color: "text-[#22c55e]" },
          { label: "Suspensos", value: stats.suspended, color: "text-[#526888]" },
        ].map(s => (
          <div key={s.label} className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4">
            <p className={`font-['Barlow_Condensed'] font-bold text-[36px] leading-none ${s.color}`}>{s.value}</p>
            <p className="text-[#526888] text-[12px] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros + busca */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          {FILTER_TABS.map(f => (
            <button
              key={f.label}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 h-[34px] flex items-center rounded-[6px] text-[13px] font-semibold border transition-colors ${
                statusFilter === f.value
                  ? "bg-[#260a0a] border-[#ff1f1f] text-white"
                  : "bg-[#0e1520] border-[#141d2c] text-[#526888] hover:text-white"
              }`}
            >
              {f.label}
              {f.value === "PENDING" && stats.pending > 0 && (
                <span className="ml-1.5 bg-[#facc15] text-[#0a0e18] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, cidade ou estado..."
          className="flex-1 bg-[#0e1520] border border-[#141d2c] focus:border-[#ff1f1f] rounded-[6px] h-[34px] px-3 text-[13px] text-[#d4d4da] placeholder-white/30 focus:outline-none transition-colors"
        />
      </div>

      {/* Tabela */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-[#141d2c] px-5 py-3 grid gap-3"
          style={{ gridTemplateColumns: "1fr 110px 80px 90px 100px 180px" }}>
          {["Empresa", "Categoria", "Plano", "Status", "Local", "Ações"].map(h => (
            <p key={h} className="text-white text-[11px] font-semibold tracking-[0.5px] uppercase">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-white text-[14px]">Carregando...</div>
        ) : displayed.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-white text-[14px]">
              {search ? `Nenhum resultado para "${search}"` : "Nenhum cadastro encontrado."}
            </p>
          </div>
        ) : (
          displayed.map((l, i) => {
            const pl = PLAN_LABELS[l.plan] ?? PLAN_LABELS.FREE;
            const sl = STATUS_CFG[l.status] ?? STATUS_CFG.PENDING;
            const isBusy = updating === l.id;
            return (
              <div key={l.id}>
                {i > 0 && <div className="bg-[#141d2c] h-px" />}
                <div className={`px-5 py-3.5 grid gap-3 items-center transition-opacity ${isBusy ? "opacity-50" : ""}`}
                  style={{ gridTemplateColumns: "1fr 110px 80px 90px 100px 180px" }}>

                  {/* Nome */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {l.featured && <span className="text-[#facc15] text-[11px]">★</span>}
                      <p className="text-[#d4d4da] text-[14px] font-semibold truncate">{l.name}</p>
                    </div>
                    <p className="text-white text-[11px]">
                      {l.viewsCount} views · {new Date(l.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  {/* Categoria */}
                  <p className="text-[#526888] text-[12px] truncate">{CATEGORY_LABELS[l.category] ?? l.category}</p>

                  {/* Plano */}
                  <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] w-fit ${pl.color}`}>{pl.label}</span>

                  {/* Status */}
                  <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[3px] w-fit ${sl.color}`}>{sl.label}</span>

                  {/* Local */}
                  <p className="text-[#526888] text-[12px]">{l.city}, {l.state}</p>

                  {/* Ações */}
                  <div className="flex gap-1 items-center">
                    {/* Aprovar → ACTIVE */}
                    {l.status === "PENDING" && (
                      <button
                        onClick={() => quickStatus(l.id, "ACTIVE")}
                        disabled={isBusy}
                        className="bg-[#0f381f] hover:bg-[#0f4a25] border border-[#22c55e]/30 text-[#22c55e] text-[11px] h-[28px] px-2.5 rounded-[4px] transition-colors whitespace-nowrap disabled:opacity-50"
                      >
                        ✓ Aprovar
                      </button>
                    )}
                    {/* Suspender */}
                    {l.status === "ACTIVE" && (
                      <button
                        onClick={() => quickStatus(l.id, "SUSPENDED")}
                        disabled={isBusy}
                        className="bg-[#1a1a0a] hover:bg-[#252506] border border-[#facc15]/20 text-[#facc15] text-[11px] h-[28px] px-2 rounded-[4px] transition-colors disabled:opacity-50"
                        title="Suspender"
                      >
                        ⏸
                      </button>
                    )}
                    {/* Reativar */}
                    {l.status === "SUSPENDED" && (
                      <button
                        onClick={() => quickStatus(l.id, "ACTIVE")}
                        disabled={isBusy}
                        className="bg-[#141d2c] hover:bg-[#1c2a3e] border border-[#526888]/30 text-[#526888] text-[11px] h-[28px] px-2 rounded-[4px] transition-colors disabled:opacity-50"
                        title="Reativar"
                      >
                        ▶
                      </button>
                    )}
                    {/* Editar */}
                    <Link href={`/admin/guia/${l.id}`}
                      className="bg-[#141d2c] hover:bg-[#1c2a3e] text-[#d4d4da] text-[11px] h-[28px] px-2.5 rounded-[4px] flex items-center transition-colors">
                      Editar
                    </Link>
                    {/* Ver perfil público */}
                    <Link href={`/guia/empresa/${l.slug}`} target="_blank"
                      className="bg-[#141d2c] hover:bg-[#1c2a3e] text-[#526888] text-[11px] h-[28px] px-2 rounded-[4px] flex items-center transition-colors"
                      title="Ver perfil público">
                      ↗
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && displayed.length > 0 && (
        <p className="text-white text-[12px] mt-3 text-right">
          {displayed.length} empresa{displayed.length !== 1 ? "s" : ""} exibida{displayed.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
