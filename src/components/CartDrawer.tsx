"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useEffect } from "react";

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, total, count, drawerOpen, closeDrawer } = useCart();

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") closeDrawer(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[61] w-full max-w-[420px] bg-[#070a12] border-l border-[#141d2c] flex flex-col transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Carrinho de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#141d2c] shrink-0">
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff1f1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[20px]">
              Carrinho
            </h2>
            {count > 0 && (
              <span className="bg-[#ff1f1f] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#526888] hover:text-white hover:bg-[#141d2c] transition-colors"
            aria-label="Fechar carrinho"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col gap-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 py-12">
              <div className="w-16 h-16 rounded-full bg-[#0e1520] border border-[#141d2c] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1c2a3e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[20px]">Carrinho vazio</p>
                <p className="text-[#526888] text-[13px] mt-1">Adicione produtos para continuar</p>
              </div>
              <button
                onClick={closeDrawer}
                className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[13px] font-semibold h-[42px] px-6 rounded-[6px] transition-colors"
              >
                Explorar loja
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.productId + (item.variationId ?? "")} className="flex gap-4">
                {/* Imagem */}
                <div className="w-[72px] h-[72px] rounded-[8px] bg-[#0e1520] border border-[#141d2c] overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 40 40" fill="none" className="text-[#1c2a3e]">
                        <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="15" cy="17" r="4" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M4 28l9-7 7 6 5-4 11 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <Link
                    href={`/loja/produto/${item.slug}`}
                    onClick={closeDrawer}
                    className="text-[#dce8ff] text-[13px] font-semibold leading-snug hover:text-white transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  {item.variationName && (
                    <p className="text-[#526888] text-[11px]">{item.variationName}</p>
                  )}
                  <p className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[16px]">
                    {formatCurrency(item.price)}
                  </p>

                  {/* Qty + remove */}
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-0 border border-[#1c2a3e] rounded-[6px] overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variationId)}
                        className="w-8 h-8 flex items-center justify-center text-[#7a9ab5] hover:text-white hover:bg-[#141d2c] transition-colors text-[16px]"
                        aria-label="Diminuir"
                      >
                        −
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-[#dce8ff] text-[13px] font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variationId)}
                        className="w-8 h-8 flex items-center justify-center text-[#7a9ab5] hover:text-white hover:bg-[#141d2c] transition-colors text-[16px]"
                        aria-label="Aumentar"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.variationId)}
                      className="text-[#526888] hover:text-[#ff6b6b] transition-colors"
                      aria-label="Remover item"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9"/>
                      </svg>
                    </button>

                    <span className="ml-auto font-['Barlow_Condensed'] font-bold text-[#d4d4da] text-[15px]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-[#141d2c] px-6 py-5 flex flex-col gap-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-[#7a9ab5] text-[14px]">Subtotal</span>
              <span className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[22px]">
                {formatCurrency(total)}
              </span>
            </div>
            <p className="text-[#526888] text-[11px] -mt-2">
              Frete e impostos calculados no checkout
            </p>

            {/* CTAs */}
            <Link
              href="/loja/checkout"
              onClick={closeDrawer}
              className="w-full h-[48px] bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-bold rounded-[8px] flex items-center justify-center gap-2 transition-colors"
            >
              Finalizar pedido →
            </Link>
            <Link
              href="/loja/carrinho"
              onClick={closeDrawer}
              className="w-full h-[44px] border border-[#1c2a3e] hover:border-[#526888] text-[#7a9ab5] hover:text-white text-[13px] font-semibold rounded-[8px] flex items-center justify-center transition-colors"
            >
              Ver carrinho completo
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
