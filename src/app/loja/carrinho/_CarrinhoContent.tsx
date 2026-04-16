"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CarrinhoContent() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  const subtotal   = total;
  const frete      = subtotal >= 20000 ? 0 : 1990;
  const totalFinal = subtotal + frete;

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24 px-5">
        <div className="w-20 h-20 rounded-full bg-[#0e1520] border border-[#141d2c] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1c2a3e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[32px]">Carrinho vazio</p>
          <p className="text-[#526888] text-[14px] mt-2">Adicione produtos para continuar comprando.</p>
        </div>
        <Link href="/loja" className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-bold h-[48px] px-8 rounded-[8px] flex items-center gap-2 transition-colors">
          ← Voltar à loja
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="px-5 lg:px-20 py-4 border-b border-[#0e1520]">
        <nav className="flex items-center gap-2 text-[12px] text-[#526888]">
          <Link href="/loja" className="hover:text-[#7a9ab5] transition-colors">Loja</Link>
          <span>/</span>
          <span className="text-[#7a9ab5]">Carrinho</span>
        </nav>
      </div>

      <div className="px-5 lg:px-20 py-10">
        <h1 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[40px] mb-8">
          Carrinho de Compras
        </h1>

        {/* Barra de frete grátis */}
        <div className="mb-6 bg-[#0e1520] border border-[#141d2c] rounded-[10px] px-5 py-4">
          <div className="flex items-center justify-between text-[13px] mb-2">
            <span className="text-[#7a9ab5]">
              {subtotal >= 20000
                ? "🎉 Você ganhou frete grátis!"
                : `Faltam ${formatCurrency(20000 - subtotal)} para frete grátis`}
            </span>
            <span className="text-[#526888] font-mono">{Math.min(100, Math.round(subtotal / 200))}%</span>
          </div>
          <div className="h-1.5 bg-[#141d2c] rounded-full overflow-hidden">
            <div className="h-full bg-[#ff1f1f] rounded-full transition-all"
              style={{ width: `${Math.min(100, (subtotal / 20000) * 100)}%` }} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Itens */}
          <div className="flex-1 flex flex-col gap-4">
            {items.map(item => (
              <div key={item.productId + (item.variationId ?? "")}
                className="flex gap-5 bg-[#0a0f1a] border border-[#141d2c] rounded-[12px] p-5">
                <div className="w-[96px] h-[96px] shrink-0 rounded-[8px] bg-[#0e1520] border border-[#141d2c] overflow-hidden">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#1c2a3e]">
                      <svg width="28" height="28" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="2"/><circle cx="15" cy="17" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M4 28l9-7 7 6 5-4 11 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/loja/produto/${item.slug}`}
                    className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[18px] hover:text-white transition-colors leading-tight line-clamp-2">
                    {item.name}
                  </Link>
                  {item.variationName && <p className="text-[#526888] text-[12px] mt-0.5">{item.variationName}</p>}
                  <p className="font-['Barlow_Condensed'] font-bold text-[#ff1f1f] text-[20px] mt-2">
                    {formatCurrency(item.price)}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between shrink-0">
                  <button onClick={() => removeItem(item.productId, item.variationId)}
                    className="text-[#526888] hover:text-[#ff6b6b] transition-colors" aria-label="Remover">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9"/>
                    </svg>
                  </button>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center border border-[#1c2a3e] rounded-[6px] overflow-hidden">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variationId)}
                        className="w-8 h-8 flex items-center justify-center text-[#7a9ab5] hover:text-white hover:bg-[#141d2c] transition-colors">−</button>
                      <span className="w-8 h-8 flex items-center justify-center text-[#dce8ff] text-[13px] font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variationId)}
                        className="w-8 h-8 flex items-center justify-center text-[#7a9ab5] hover:text-white hover:bg-[#141d2c] transition-colors">+</button>
                    </div>
                    <p className="text-[#d4d4da] text-[14px] font-bold font-['Barlow_Condensed']">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={clearCart}
              className="self-start text-[#526888] hover:text-[#ff6b6b] text-[12px] font-semibold transition-colors mt-1">
              Limpar carrinho
            </button>
          </div>

          {/* Resumo */}
          <div className="w-full lg:w-[360px] shrink-0 bg-[#0e1520] border border-[#141d2c] rounded-[14px] p-6 flex flex-col gap-4 lg:sticky lg:top-24">
            <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[22px]">Resumo do pedido</h2>

            <div className="flex flex-col gap-3 border-t border-[#141d2c] pt-4">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#7a9ab5]">Subtotal</span>
                <span className="text-[#d4d4da] font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#7a9ab5]">Frete estimado</span>
                <span className={frete === 0 ? "text-[#22c55e] font-semibold" : "text-[#d4d4da] font-semibold"}>
                  {frete === 0 ? "Grátis" : formatCurrency(frete)}
                </span>
              </div>
            </div>

            <div className="border-t border-[#141d2c] pt-4 flex justify-between items-center">
              <span className="text-[#7a9ab5] text-[14px]">Total</span>
              <span className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px]">
                {formatCurrency(totalFinal)}
              </span>
            </div>

            <p className="text-[#526888] text-[11px]">
              Impostos inclusos. Frete calculado com precisão no checkout.
            </p>

            <Link href="/loja/checkout"
              className="w-full h-[52px] bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-bold rounded-[8px] flex items-center justify-center gap-2 transition-colors">
              Finalizar pedido →
            </Link>

            <Link href="/loja/produtos"
              className="w-full h-[44px] border border-[#1c2a3e] hover:border-[#526888] text-[#7a9ab5] hover:text-white text-[13px] font-semibold rounded-[8px] flex items-center justify-center transition-colors">
              Continuar comprando
            </Link>

            <div className="flex items-center justify-center gap-4 pt-2 border-t border-[#0a0f1a]">
              {["🔒 Compra segura", "🛡 Dados protegidos"].map(t => (
                <span key={t} className="text-[#1c2a3e] text-[10px] font-semibold">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
