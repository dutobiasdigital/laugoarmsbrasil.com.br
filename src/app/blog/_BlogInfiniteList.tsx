"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ── Types ─────────────────────────────────────────────────────── */
interface ArticleItem {
  id: string; title: string; slug: string; excerpt: string | null;
  featureImageUrl: string | null; publishedAt: string | null;
  isExclusive: boolean; authorName: string;
  category: { name: string };
}

interface Props {
  initialArticles: ArticleItem[];
  total:           number;
  itemsPerPage:    number;
  categoria?:      string;
  /* offset inicial: 1 quando há artigo em destaque (featured), 0 caso contrário */
  baseOffset:      number;
}

/* ── Spinner ─────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-[#526888] text-[13px]">
      <div className="w-5 h-5 border-2 border-[#1c2a3e] border-t-[#ff1f1f] rounded-full animate-spin shrink-0" />
      <span>Carregando artigos…</span>
    </div>
  );
}

/* ── Componente principal ─────────────────────────────────────────── */
export default function BlogInfiniteList({
  initialArticles,
  total,
  itemsPerPage,
  categoria,
  baseOffset,
}: Props) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(initialArticles.length + baseOffset >= total);
  const offsetRef  = useRef(initialArticles.length + baseOffset);
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* Reset quando props mudarem (troca de categoria) */
  useEffect(() => {
    setArticles(initialArticles);
    offsetRef.current = initialArticles.length + baseOffset;
    setDone(initialArticles.length + baseOffset >= total);
    setLoading(false);
  }, [initialArticles, total, baseOffset]);

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit:  String(itemsPerPage),
        offset: String(offsetRef.current),
      });
      if (categoria) params.set("categoria", categoria);

      const res = await fetch(`/api/blog/articles?${params}`);
      if (!res.ok) throw new Error("fetch failed");
      const { articles: more }: { articles: ArticleItem[]; total: number } = await res.json();

      if (more.length === 0) {
        setDone(true);
      } else {
        setArticles(prev => {
          const ids = new Set(prev.map(a => a.id));
          const fresh = more.filter(a => !ids.has(a.id));
          offsetRef.current += fresh.length;
          return [...prev, ...fresh];
        });
        if (offsetRef.current >= total) setDone(true);
      }
    } catch {
      /* silently ignore */
    } finally {
      setLoading(false);
    }
  }, [loading, done, itemsPerPage, categoria, total]);

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

  if (articles.length === 0 && !loading) {
    return (
      <p className="text-white text-sm py-12 text-center">Nenhum artigo encontrado.</p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Grid de artigos */}
      {articles.length > 0 && (
        <div>
          <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] mb-6">
            Artigos recentes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map(art => art && (
              <Link
                key={art.id}
                href={`/blog/${art.slug}`}
                className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden flex flex-col hover:border-zinc-600 transition-colors"
              >
                <div className="h-[180px] bg-[#141d2c] flex items-center justify-center">
                  {art.featureImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={art.featureImageUrl} alt={art.title} className="w-full h-full object-cover" />
                  ) : (
                    <p className="text-[#1c2a3e] text-[11px] font-mono">Imagem</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-center gap-1.5">
                    {art.isExclusive && (
                      <span className="bg-[#ff1f1f] text-white text-[10px] font-semibold px-2 py-[2px] rounded-full uppercase">
                        Exclusivo
                      </span>
                    )}
                    <span className="bg-[#141d2c] border border-[#1c2a3e] text-[#7a9ab5] text-[10px] px-2 py-[2px] rounded-full">
                      {art.category.name}
                    </span>
                  </div>
                  <h3 className="text-white text-[16px] font-semibold leading-[22px] line-clamp-2">
                    {art.title}
                  </h3>
                  {art.excerpt && (
                    <p className="text-[#7a9ab5] text-[13px] leading-[20px] line-clamp-2">
                      {art.excerpt}
                    </p>
                  )}
                  <p className="text-white text-[12px] mt-auto pt-1">
                    {art.publishedAt
                      ? new Date(art.publishedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })
                      : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sentinel */}
      <div ref={sentinelRef} aria-hidden="true">
        {loading && <Spinner />}
        {done && articles.length > 0 && (
          <p className="text-center text-[#1c2a3e] text-[12px] py-4">
            — {articles.length} artigos carregados —
          </p>
        )}
      </div>
    </div>
  );
}
