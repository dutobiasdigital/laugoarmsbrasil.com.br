"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

interface Variation {
  id: string;
  name: string;
  attributes: { tamanho?: string; cor?: string } | null;
  price: number | null;
  stock: number;
  isActive: boolean;
  sortOrder: number;
}

interface Props {
  productId: string;
  slug: string;
  name: string;
  basePrice: number;
  imageUrl: string | null;
  hasVariations: boolean;
  stock: number | null;
  variations: Variation[];
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AddToCartButton({ productId, slug, name, basePrice, imageUrl, hasVariations, stock, variations }: Props) {
  const { addItem } = useCart();
  const [qty, setQty]               = useState(1);
  const [selectedVar, setSelectedVar] = useState<string | null>(
    hasVariations && variations.length > 0 ? variations[0].id : null
  );
  const [added, setAdded]           = useState(false);

  const activeVariations = variations.filter(v => v.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  const selectedVariation = activeVariations.find(v => v.id === selectedVar) ?? null;
  const effectivePrice    = (hasVariations && selectedVariation?.price != null)
    ? selectedVariation.price
    : basePrice;

  const effectiveStock = hasVariations
    ? (selectedVariation?.stock ?? 0)
    : (stock ?? 0);

  const inStock = effectiveStock > 0;

  function handleAdd() {
    if (!inStock) return;
    addItem({
      productId,
      slug,
      name,
      imageUrl,
      price: effectivePrice,
      quantity: qty,
      variationId: selectedVariation?.id,
      variationName: selectedVariation?.name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Preço */}
      <div className="flex items-end gap-2">
        {hasVariations && activeVariations.length > 0 && !selectedVariation && (
          <p className="text-[#526888] text-[13px] mb-2">a partir de</p>
        )}
        <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[44px] leading-none">
          {formatCurrency(effectivePrice)}
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${inStock ? "bg-[#22c55e]" : "bg-[#ff1f1f]"}`} />
        <span className={`text-[13px] font-semibold ${inStock ? "text-[#22c55e]" : "text-[#ff6b6b]"}`}>
          {hasVariations
            ? (selectedVariation ? (inStock ? `Em estoque${effectiveStock <= 5 ? ` — últimas ${effectiveStock}` : ""}` : "Esgotado") : "Selecione uma opção")
            : (inStock ? `Em estoque${effectiveStock > 0 && effectiveStock <= 5 ? ` — últimas ${effectiveStock}` : ""}` : "Esgotado")}
        </span>
      </div>

      {/* Variações */}
      {hasVariations && activeVariations.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[#7a9ab5] text-[11px] font-bold uppercase tracking-[1px]">
            {selectedVariation ? `Selecionado: ${selectedVariation.name}` : "Escolha uma opção"}
          </p>
          <div className="flex flex-wrap gap-2">
            {activeVariations.map(v => {
              const sel = selectedVar === v.id;
              const out = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  onClick={() => !out && setSelectedVar(v.id)}
                  disabled={out}
                  className={`relative px-4 py-2.5 rounded-[8px] border text-[13px] font-semibold transition-all ${
                    sel
                      ? "border-[#ff1f1f] bg-[#ff1f1f]/10 text-white"
                      : out
                        ? "border-[#0e1520] bg-[#070a12] text-[#2a3a4e] cursor-not-allowed"
                        : "border-[#1c2a3e] bg-[#0a0f1a] text-[#d4d4da] hover:border-[#526888] hover:text-white"
                  }`}
                >
                  {v.name}
                  {v.price != null && v.price !== basePrice && (
                    <span className={`ml-1.5 text-[11px] ${sel ? "text-[#ff9999]" : "text-[#526888]"}`}>
                      {formatCurrency(v.price)}
                    </span>
                  )}
                  {out && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="absolute inset-x-0 top-1/2 h-[1px] bg-[#1c2a3e] rotate-[20deg]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Qty + Add to cart */}
      <div className="flex items-center gap-3">
        {/* Qty stepper */}
        <div className="flex items-center border border-[#1c2a3e] rounded-[8px] overflow-hidden">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-11 h-12 flex items-center justify-center text-[#7a9ab5] hover:text-white hover:bg-[#141d2c] transition-colors text-[20px] font-light"
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className="w-10 h-12 flex items-center justify-center text-[#dce8ff] text-[15px] font-bold border-x border-[#1c2a3e]">
            {qty}
          </span>
          <button
            onClick={() => setQty(q => q + 1)}
            className="w-11 h-12 flex items-center justify-center text-[#7a9ab5] hover:text-white hover:bg-[#141d2c] transition-colors text-[20px] font-light"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAdd}
          disabled={!inStock || (hasVariations && !selectedVar)}
          className={`flex-1 h-12 rounded-[8px] text-[14px] font-bold transition-all flex items-center justify-center gap-2 ${
            added
              ? "bg-[#22c55e] text-white"
              : inStock && (!hasVariations || selectedVar)
                ? "bg-[#ff1f1f] hover:bg-[#cc0000] text-white"
                : "bg-[#0e1520] text-[#2a3a4e] cursor-not-allowed"
          }`}
        >
          {added ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 5l4 4 8-8"/>
              </svg>
              Adicionado!
            </>
          ) : inStock ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Adicionar ao carrinho
            </>
          ) : "Produto esgotado"}
        </button>
      </div>
    </div>
  );
}
