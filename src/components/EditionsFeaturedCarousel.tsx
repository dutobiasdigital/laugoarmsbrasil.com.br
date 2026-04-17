"use client";

import Link from "next/link";
import { useRef } from "react";

interface Edition {
  id: string;
  title: string;
  number: number | null;
  slug: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  type: string;
}

export default function EditionsFeaturedCarousel({ editions }: { editions: Edition[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 310 : -310, behavior: "smooth" });
  }

  if (editions.length === 0) return null;

  return (
    <div className="relative">
      {/* ← arrow */}
      <button
        onClick={() => scroll("left")}
        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/40 rounded-full items-center justify-center text-[#7a9ab5] hover:text-white transition-all shadow-lg"
        aria-label="Edições anteriores"
      >
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M8 2L4 6l4 4"/>
        </svg>
      </button>

      {/* → arrow */}
      <button
        onClick={() => scroll("right")}
        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/40 rounded-full items-center justify-center text-[#7a9ab5] hover:text-white transition-all shadow-lg"
        aria-label="Próximas edições"
      >
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M4 2l4 4-4 4"/>
        </svg>
      </button>

      {/* Scroll track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {editions.map((ed) => {
          const isSpecial = ed.type === "SPECIAL";
          const date = ed.publishedAt
            ? new Date(ed.publishedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
            : null;

          return (
            <Link
              key={ed.id}
              href={`/edicoes/${ed.slug}`}
              className="group shrink-0 w-[190px] flex flex-col bg-[#0a0f1a] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[14px] overflow-hidden transition-all hover:shadow-[0_0_24px_rgba(255,31,31,0.07)]"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Cover — proporção de revista 3/4 */}
              <div className="relative w-full aspect-[3/4] bg-[#0e1520] overflow-hidden">
                {ed.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ed.coverImageUrl}
                    alt={ed.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#1c2a3e]">
                    <p className="font-['Barlow_Condensed'] font-bold text-[18px]">
                      {ed.number ? `Nº ${ed.number}` : "MAGNUM"}
                    </p>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1.5 p-3.5">
                <span className={`text-[10px] font-bold tracking-[1px] uppercase ${
                  isSpecial ? "text-[#ff1f1f]" : "text-[#526888]"
                }`}>
                  {isSpecial ? "Especial" : "Regular"}{ed.number ? ` · Nº ${ed.number}` : ""}
                </span>
                <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[15px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                  {ed.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[#526888] text-[11px] font-mono">{date ?? ""}</p>
                  <span className="text-[#526888] text-[11px] font-semibold group-hover:text-[#ff1f1f] transition-colors">
                    Ler →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
