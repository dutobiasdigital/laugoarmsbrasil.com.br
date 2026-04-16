"use client";

import Link from "next/link";
import { useRef } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  mainImageUrl: string | null;
  isFeatured: boolean;
  stock: number | null;
  hasVariations: boolean;
  category: { title: string; slug: string } | null;
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FeaturedCarousel({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <div className="relative">
      {/* Arrows */}
      <button
        onClick={() => scroll("left")}
        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/40 rounded-full items-center justify-center text-[#7a9ab5] hover:text-white transition-all shadow-lg"
        aria-label="Scroll esquerda"
      >
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2L4 6l4 4"/></svg>
      </button>
      <button
        onClick={() => scroll("right")}
        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 bg-[#0e1520] border border-[#141d2c] hover:border-[#ff1f1f]/40 rounded-full items-center justify-center text-[#7a9ab5] hover:text-white transition-all shadow-lg"
        aria-label="Scroll direita"
      >
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 2l4 4-4 4"/></svg>
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map(product => {
          const inStock = product.hasVariations || (product.stock ?? 0) > 0;
          return (
            <Link
              key={product.id}
              href={`/loja/produto/${product.slug}`}
              className="group shrink-0 w-[240px] flex flex-col bg-[#0a0f1a] border border-[#141d2c] hover:border-[#1c2a3e] rounded-[14px] overflow-hidden transition-all hover:shadow-[0_0_24px_rgba(255,31,31,0.06)]"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Imagem */}
              <div className="relative w-full aspect-square bg-[#0e1520] overflow-hidden">
                {product.mainImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.mainImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#1c2a3e]">
                    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                      <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="15" cy="17" r="4" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M4 28l9-7 7 6 5-4 11 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                {!inStock && (
                  <div className="absolute inset-0 bg-[#070a12]/60 flex items-center justify-center">
                    <span className="text-[#526888] text-[11px] font-bold tracking-wider uppercase">Esgotado</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1.5 p-4">
                {product.category && (
                  <span className="text-[#ff1f1f] text-[10px] font-bold tracking-[1px] uppercase">
                    {product.category.title}
                  </span>
                )}
                <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[16px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                  {product.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[18px]">
                    {formatCurrency(product.basePrice)}
                  </p>
                  <span className="text-[#526888] text-[11px] group-hover:text-[#ff1f1f] transition-colors font-semibold">
                    Ver →
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
