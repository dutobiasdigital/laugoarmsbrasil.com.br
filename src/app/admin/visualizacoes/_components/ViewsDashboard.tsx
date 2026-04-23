"use client";

import { useState } from "react";
import Link from "next/link";

export interface ViewItem {
  slug: string;
  title: string;
  total_views: number;
  unique_views?: number;
  last_viewed_at: string | null;
  extra?: string;
}

export interface SectionData {
  items: ViewItem[];
  totalViews: number;
  label: string;
  icon: string;
  color: string;
  linkBase?: string;
}

interface Props {
  sections: {
    edicoes: SectionData;
    blog: SectionData;
    loja: SectionData;
    guia: SectionData;
  };
}

type TabKey = "edicoes" | "blog" | "loja" | "guia";

/* ── Utilitários ─────────────────────────────────────── */
function fmt(n: number) { return n.toLocaleString("pt-BR"); }

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/* ── Gráfico horizontal (CSS puro) ──────────────────── */
function BarChart({ items, color }: { items: ViewItem[]; color: string }) {
  const top = items.slice(0, 10);
  const max = top[0]?.total_views ?? 1;

  if (!top.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-[#526888] text-[13px]">Nenhum dado registrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {top.map((item, i) => {
        const pct = Math.max(2, (item.total_views / max) * 100);
        return (
          <div key={item.slug} className="flex items-center gap-3">
            {/* rank */}
            <span className="text-[#526888] text-[11px] font-mono w-[18px] shrink-0 text-right">{i + 1}</span>
            {/* title */}
            <span className="text-[#d4d4da] text-[12px] truncate w-[180px] lg:w-[260px] shrink-0" title={item.title}>
              {item.title}
            </span>
            {/* bar */}
            <div className="flex-1 h-[22px] bg-[#0a0f1a] rounded-[4px] overflow-hidden">
              <div
                className="h-full rounded-[4px] transition-all"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
            {/* value */}
            <span className="text-[#d4d4da] text-[12px] font-mono w-[56px] text-right shrink-0">
              {fmt(item.total_views)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Tabela com busca ───────────────────────────────── */
function ViewsTable({
  items,
  showUnique,
  linkBase,
}: {
  items: ViewItem[];
  showUnique: boolean;
  linkBase?: string;
}) {
  const [q, setQ] = useState("");
  const [sortCol, setSortCol] = useState<"rank" | "title" | "views" | "unique" | "date">("views");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = items.filter(
    (it) =>
      it.title.toLowerCase().includes(q.toLowerCase()) ||
      it.slug.toLowerCase().includes(q.toLowerCase())
  );

  function sort(col: typeof sortCol) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir(col === "title" ? "asc" : "desc"); }
  }

  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortCol === "views")  diff = a.total_views - b.total_views;
    else if (sortCol === "unique") diff = (a.unique_views ?? 0) - (b.unique_views ?? 0);
    else if (sortCol === "date")   diff = (a.last_viewed_at ?? "").localeCompare(b.last_viewed_at ?? "");
    else if (sortCol === "title")  diff = a.title.localeCompare(b.title, "pt-BR");
    else diff = items.indexOf(a) - items.indexOf(b);
    return sortDir === "desc" ? -diff : diff;
  });

  function ColHeader({ col, label }: { col: typeof sortCol; label: string }) {
    const active = sortCol === col;
    return (
      <button
        type="button"
        onClick={() => sort(col)}
        className={`flex items-center gap-1 text-[10px] font-semibold tracking-[0.5px] uppercase transition-colors ${active ? "text-white" : "text-[#526888] hover:text-[#7a9ab5]"}`}
      >
        {label}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          className={`w-[10px] h-[10px] transition-transform ${active && sortDir === "asc" ? "rotate-180" : ""}`}>
          <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    );
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-3 flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 Filtrar por título ou slug…"
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[36px] px-3 text-[13px] text-[#d4d4da] placeholder-white/20 focus:outline-none focus:border-[#526888] w-[280px]"
        />
        <span className="text-[#526888] text-[12px]">
          {filtered.length} resultado(s)
        </span>
      </div>

      {/* Table */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
        {/* Header */}
        <div className={`bg-[#141d2c] px-4 py-2.5 grid gap-3 ${showUnique ? "grid-cols-[32px_1fr_100px_100px_130px_80px]" : "grid-cols-[32px_1fr_100px_130px_80px]"}`}>
          <ColHeader col="rank" label="#" />
          <ColHeader col="title" label="Título" />
          <ColHeader col="views" label="Views" />
          {showUnique && <ColHeader col="unique" label="Únicos" />}
          <ColHeader col="date" label="Último acesso" />
          <span className="text-[#526888] text-[10px] font-semibold tracking-[0.5px] uppercase">Link</span>
        </div>

        {sorted.length === 0 ? (
          <p className="text-[#526888] text-[13px] text-center py-8">
            {q ? "Nenhum resultado para esta busca." : "Nenhum dado registrado ainda."}
          </p>
        ) : (
          sorted.map((item, i) => {
            const originalRank = items.indexOf(item) + 1;
            return (
              <div
                key={item.slug}
                className={`px-4 py-2.5 grid gap-3 items-center transition-colors hover:bg-[#0a0f1a] ${showUnique ? "grid-cols-[32px_1fr_100px_100px_130px_80px]" : "grid-cols-[32px_1fr_100px_130px_80px]"} ${i > 0 ? "border-t border-[#141d2c]" : ""}`}
              >
                {/* rank */}
                <span className="text-[#526888] text-[11px] font-mono text-center">
                  {originalRank <= 3 ? ["🥇", "🥈", "🥉"][originalRank - 1] : originalRank}
                </span>
                {/* title + slug */}
                <div className="min-w-0">
                  <p className="text-[#d4d4da] text-[13px] truncate">{item.title}</p>
                  <p className="text-[#3a4a5e] text-[10px] font-mono truncate">{item.slug}</p>
                  {item.extra && <p className="text-[#526888] text-[10px] truncate">{item.extra}</p>}
                </div>
                {/* total views */}
                <div className="text-right">
                  <span className="text-white text-[14px] font-semibold font-mono">{fmt(item.total_views)}</span>
                </div>
                {/* unique */}
                {showUnique && (
                  <div className="text-right">
                    <span className="text-[#7a9ab5] text-[13px] font-mono">{item.unique_views != null ? fmt(item.unique_views) : "—"}</span>
                  </div>
                )}
                {/* last viewed */}
                <span className="text-[#526888] text-[11px]">{fmtDate(item.last_viewed_at)}</span>
                {/* link */}
                {linkBase ? (
                  <Link
                    href={`${linkBase}/${item.slug}`}
                    target="_blank"
                    className="text-[#526888] hover:text-[#7a9ab5] text-[11px] transition-colors"
                  >
                    Ver →
                  </Link>
                ) : <span />}
              </div>
            );
          })
        )}
      </div>

      {sorted.length > 0 && (
        <p className="text-[#3a4a5e] text-[11px] mt-2 text-right">
          {fmt(sorted.reduce((acc, it) => acc + it.total_views, 0))} views no total
        </p>
      )}
    </div>
  );
}

/* ── Seção de tab ────────────────────────────────────── */
function TabSection({ section }: { section: SectionData }) {
  const top1 = section.items[0];

  return (
    <div className="space-y-6">
      {/* Mini stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0a0f1a] border border-[#141d2c] rounded-[8px] px-4 py-3">
          <p className="text-[#526888] text-[11px] uppercase tracking-wide mb-1">Total de views</p>
          <p className="text-white text-[24px] font-bold font-mono">{fmt(section.totalViews)}</p>
        </div>
        <div className="bg-[#0a0f1a] border border-[#141d2c] rounded-[8px] px-4 py-3">
          <p className="text-[#526888] text-[11px] uppercase tracking-wide mb-1">Itens rastreados</p>
          <p className="text-white text-[24px] font-bold font-mono">{fmt(section.items.length)}</p>
        </div>
        <div className="bg-[#0a0f1a] border border-[#141d2c] rounded-[8px] px-4 py-3 col-span-2 lg:col-span-2">
          <p className="text-[#526888] text-[11px] uppercase tracking-wide mb-1">Mais visitado</p>
          {top1 ? (
            <div className="flex items-baseline gap-2">
              <p className="text-white text-[14px] font-semibold truncate">{top1.title}</p>
              <span className="text-[#ff1f1f] text-[13px] font-mono shrink-0">{fmt(top1.total_views)} views</span>
            </div>
          ) : (
            <p className="text-[#526888] text-[13px]">—</p>
          )}
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-[4px] h-[4px] rounded-full" style={{ background: section.color }} />
          <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[1px]">
            Top 10 mais visitados
          </p>
        </div>
        <BarChart items={section.items} color={section.color} />
      </div>

      {/* Tabela completa */}
      <div>
        <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[1px] mb-3">
          Todos os itens rastreados
        </p>
        <ViewsTable
          items={section.items}
          showUnique={section.label === "Edições"}
          linkBase={section.linkBase}
        />
      </div>
    </div>
  );
}

/* ══ Dashboard principal ════════════════════════════════ */
export default function ViewsDashboard({ sections }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("edicoes");

  const tabs: { key: TabKey; label: string; icon: string; color: string }[] = [
    { key: "edicoes", label: "Edições",       icon: sections.edicoes.icon, color: sections.edicoes.color },
    { key: "blog",    label: "Blog",          icon: sections.blog.icon,    color: sections.blog.color    },
    { key: "loja",    label: "Loja",          icon: sections.loja.icon,    color: sections.loja.color    },
    { key: "guia",    label: "Guia Comercial",icon: sections.guia.icon,    color: sections.guia.color    },
  ];

  const grandTotal = tabs.reduce((acc, t) => acc + sections[t.key].totalViews, 0);

  const sectionMap: Record<TabKey, SectionData> = sections;

  return (
    <div>
      {/* ── Resumo geral ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {/* Grand total */}
        <div className="lg:col-span-1 bg-[#0e1520] border border-[#1c2a3e] rounded-[10px] px-4 py-4 flex flex-col justify-between">
          <p className="text-[#526888] text-[11px] uppercase tracking-wide">Total geral</p>
          <p className="text-white text-[32px] font-bold font-mono leading-none mt-2">{fmt(grandTotal)}</p>
          <p className="text-[#3a4a5e] text-[11px] mt-1">views registradas</p>
        </div>

        {/* Por seção */}
        {tabs.map((tab) => {
          const sec = sections[tab.key];
          const pct = grandTotal > 0 ? Math.round((sec.totalViews / grandTotal) * 100) : 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`text-left bg-[#0e1520] border rounded-[10px] px-4 py-4 transition-all ${
                activeTab === tab.key
                  ? "border-[#ff1f1f] shadow-[0_0_0_1px_#ff1f1f20]"
                  : "border-[#141d2c] hover:border-[#1c2a3e]"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[16px]">{tab.icon}</span>
                <span className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-wide">{tab.label}</span>
              </div>
              <p className="text-white text-[22px] font-bold font-mono leading-none">{fmt(sec.totalViews)}</p>
              <div className="mt-2 h-[3px] bg-[#0a0f1a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: tab.color }}
                />
              </div>
              <p className="text-[#3a4a5e] text-[10px] mt-1">{pct}% do total</p>
            </button>
          );
        })}
      </div>

      {/* ── Tabs ─────────────────────────────────── */}
      <div className="flex gap-1 mb-6 border-b border-[#141d2c] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-[#ff1f1f] text-white"
                : "border-transparent text-[#526888] hover:text-[#7a9ab5]"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? "bg-[#ff1f1f] text-white" : "bg-[#141d2c] text-[#526888]"
            }`}>
              {fmt(sections[tab.key].totalViews)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Conteúdo do tab ──────────────────────── */}
      <TabSection section={sectionMap[activeTab]} />
    </div>
  );
}
