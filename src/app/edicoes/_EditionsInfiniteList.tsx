"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ── Types ─────────────────────────────────────────────────────── */
interface Edition {
  id: string; title: string; number: number | null; slug: string;
  coverImageUrl: string | null; publishedAt: string | null;
  type: string; pageCount: number | null; summary: string | null;
}

interface Props {
  initialEditions: Edition[];
  total:           number;
  itemsPerPage:    number;
  tipo?:           string;
  q?:              string;
  view:            "grid" | "list";
}

/* ── Spinner ─────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-[#526888] text-[13px]">
      <div className="w-5 h-5 border-2 border-[#1c2a3e] border-t-[#ff1f1f] rounded-full animate-spin shrink-0" />
      <span>Carregando edições…</span>
    </div>
  );
}

/* ── Componente principal ─────────────────────────────────────────── */
export default function EditionsInfiniteList({
  initialEditions,
  total,
  itemsPerPage,
  tipo,
  q,
  view,
}: Props) {
  const [editions, setEditions] = useState<Edition[]>(initialEditions);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(initialEditions.length >= total);
  const offsetRef  = useRef(initialEditions.length);
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* Sempre que as props iniciais mudarem (ex: filtro de tipo), reset */
  useEffect(() => {
    setEditions(initialEditions);
    offsetRef.current = initialEditions.length;
    setDone(initialEditions.length >= total);
    setLoading(false);
  }, [initialEditions, total]);

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit:  String(itemsPerPage),
        offset: String(offsetRef.current),
      });
      if (tipo) params.set("tipo", tipo);
      if (q)    params.set("q",    q);

      const res = await fetch(`/api/editions/list?${params}`);
      if (!res.ok) throw new Error("fetch failed");
      const { editions: more }: { editions: Edition[]; total: number } = await res.json();

      if (more.length === 0) {
        setDone(true);
      } else {
        setEditions(prev => {
          const ids = new Set(prev.map(e => e.id));
          const fresh = more.filter(e => !ids.has(e.id));
          offsetRef.current += fresh.length;
          return [...prev, ...fresh];
        });
        if (offsetRef.current >= total) setDone(true);
      }
    } catch {
      /* silently ignore — user can scroll again */
    } finally {
      setLoading(false);
    }
  }, [loading, done, itemsPerPage, tipo, q, total]);

  /* IntersectionObserver: dispara 300px antes do fim */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  /* Agrupar por ano quando não há busca */
  const byYear: Record<string, Edition[]> = {};
  if (!q) {
    for (const ed of editions) {
      const year = ed.publishedAt
        ? String(new Date(ed.publishedAt).getFullYear())
        : "Sem data";
      (byYear[year] ??= []).push(ed);
    }
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="flex flex-col gap-8">

      {/* Resultados de busca */}
      {q && (
        editions.length === 0 && !loading ? (
          <div className="py-20 text-center">
            <p className="text-[#526888] text-[16px] mb-2">
              Nenhuma edição encontrada para &ldquo;{q}&rdquo;
            </p>
          </div>
        ) : view === "list" ? (
          <div className="flex flex-col gap-3">
            {editions.map(ed => <EditionListItem key={ed.id} edition={ed} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {editions.map(ed => <EditionCard key={ed.id} edition={ed} />)}
          </div>
        )
      )}

      {/* Agrupado por ano */}
      {!q && (
        years.length === 0 && !loading ? (
          <p className="text-white text-sm py-12 text-center">Nenhuma edição encontrada.</p>
        ) : (
          years.map(year => (
            <div key={year} className="flex flex-col gap-4">
              <p className="text-white text-[13px] font-semibold tracking-[1px]">{year}</p>
              <div className="bg-[#141d2c] h-px w-full" />
              {view === "list" ? (
                <div className="flex flex-col gap-3">
                  {byYear[year].map(ed => <EditionListItem key={ed.id} edition={ed} />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {byYear[year].map(ed => <EditionCard key={ed.id} edition={ed} />)}
                </div>
              )}
            </div>
          ))
        )
      )}

      {/* Sentinel — observado pelo IntersectionObserver */}
      <div ref={sentinelRef} aria-hidden="true">
        {loading && <Spinner />}
        {done && editions.length > 0 && (
          <p className="text-center text-[#1c2a3e] text-[12px] py-4">
            — {editions.length} edições carregadas —
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Card — visualização em GRADE ──────────────────────────────── */
function EditionCard({ edition }: { edition: Edition }) {
  const isSpecial = edition.type === "SPECIAL";
  return (
    <div className="card-metal-border hover:scale-[1.02] transition-transform duration-300">
      <Link
        href={`/edicoes/${edition.slug}`}
        className="group relative rounded-[13px] overflow-hidden flex flex-col bg-[#0a0f1a] h-full"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          {edition.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={edition.coverImageUrl}
              alt={edition.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`absolute inset-0 flex items-center justify-center ${isSpecial ? "bg-[#cc0000]/20" : "bg-white/5"}`}>
              <p className={`font-['Barlow_Condensed'] font-extrabold text-[24px] ${isSpecial ? "text-[#ff1f1f]/40" : "text-white/10"}`}>
                {isSpecial ? "ESP" : edition.number ? `Nº ${edition.number}` : "—"}
              </p>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#141416] to-transparent" />
        </div>

        <div className="flex flex-col gap-1 px-3.5 pt-2 pb-4"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)" }}>
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-bold tracking-[0.8px] uppercase px-1.5 py-[2px] rounded-[3px] ${
              isSpecial
                ? "bg-[#ff1f1f]/20 text-[#ff6b6b] border border-[#ff1f1f]/30"
                : "bg-white/5 text-white/40 border border-white/10"
            }`}>
              {isSpecial ? "Especial" : "Regular"}
            </span>
            {edition.number && !isSpecial && (
              <span className="text-[9px] font-semibold text-white/30">#{edition.number}</span>
            )}
          </div>
          <p className="font-['Barlow_Condensed'] font-bold text-white text-[15px] leading-snug line-clamp-2 group-hover:text-white/90 transition-colors">
            {edition.number ? `Edição ${edition.number}` : edition.title}
          </p>
          {edition.publishedAt && (
            <p className="text-white/25 text-[10px]">
              {new Date(edition.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
              {edition.pageCount ? ` · ${edition.pageCount}p` : ""}
            </p>
          )}
        </div>

        {isSpecial && (
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ boxShadow: "inset 0 0 30px rgba(255,31,31,0.06)" }} />
        )}
      </Link>
    </div>
  );
}

/* ── Item — visualização em LISTA ──────────────────────────────── */
function EditionListItem({ edition }: { edition: Edition }) {
  const isSpecial = edition.type === "SPECIAL";
  const publishMeta = edition.publishedAt
    ? new Date(edition.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : null;

  return (
    <Link
      href={`/edicoes/${edition.slug}`}
      className="group flex bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/25 rounded-[12px] overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/40"
    >
      <div className="w-[100px] sm:w-[120px] shrink-0 relative overflow-hidden bg-[#0a0e18]">
        {edition.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={edition.coverImageUrl}
            alt={edition.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ aspectRatio: "3/4", display: "block" }}
          />
        ) : (
          <div className={`w-full h-full min-h-[133px] flex items-center justify-center ${isSpecial ? "bg-[#cc0000]/15" : "bg-white/[0.03]"}`}>
            <p className={`font-['Barlow_Condensed'] font-extrabold text-[20px] ${isSpecial ? "text-[#ff1f1f]/30" : "text-white/10"}`}>
              {edition.number ? `Nº ${edition.number}` : "—"}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between gap-3 p-4 sm:p-5 flex-1 min-w-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[9px] font-bold tracking-[0.8px] uppercase px-1.5 py-[2px] rounded-[3px] ${
              isSpecial
                ? "bg-[#ff1f1f]/20 text-[#ff6b6b] border border-[#ff1f1f]/30"
                : "bg-white/5 text-white/40 border border-white/10"
            }`}>
              {isSpecial ? "Especial" : "Regular"}
            </span>
            {edition.number && !isSpecial && (
              <span className="text-[9px] font-semibold text-white/30">#{edition.number}</span>
            )}
            {publishMeta && (
              <span className="text-[#526888] text-[11px]">{publishMeta}</span>
            )}
            {edition.pageCount && (
              <span className="text-[#3a4a5e] text-[11px]">· {edition.pageCount} págs.</span>
            )}
          </div>

          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] sm:text-[26px] leading-tight group-hover:text-white/90 transition-colors">
            {edition.number ? `Revista Magnum — Edição ${edition.number}` : edition.title}
          </h2>

          {edition.summary && (
            <p className="text-[#7a9ab5] text-[13px] leading-[20px] line-clamp-2 sm:line-clamp-3">
              {edition.summary}
            </p>
          )}
        </div>

        <div>
          <span className="inline-flex items-center gap-2 bg-[#ff1f1f] group-hover:bg-[#cc0000] text-white text-[12px] font-semibold h-[34px] px-4 rounded-[6px] transition-colors">
            <span>📖</span> Ler Edição
          </span>
        </div>
      </div>
    </Link>
  );
}
