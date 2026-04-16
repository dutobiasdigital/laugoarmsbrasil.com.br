"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartIcon() {
  const { count } = useCart();
  return (
    <Link
      href="/loja/carrinho"
      aria-label="Carrinho de compras"
      className="relative flex items-center justify-center w-9 h-9 text-[#7a9ab5] hover:text-white transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-[#ff1f1f] text-white text-[9px] font-bold min-w-[16px] h-[16px] px-[3px] rounded-full flex items-center justify-center leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
