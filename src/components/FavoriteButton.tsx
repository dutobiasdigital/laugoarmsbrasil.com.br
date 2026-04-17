"use client";

import { useState } from "react";
import Link from "next/link";

interface FavoriteButtonProps {
  contentType: "edition" | "product" | "guide_listing";
  contentId: string;
  isLoggedIn: boolean;
  initialIsFavorited?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export default function FavoriteButton({
  contentType,
  contentId,
  isLoggedIn,
  initialIsFavorited = false,
  size = "md",
  label,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const sizeMap = {
    sm: { btn: "w-[34px] h-[34px]",    icon: 14 },
    md: { btn: "h-[44px] px-4",        icon: 17 },
    lg: { btn: "h-[48px] px-5",        icon: 20 },
  };
  const s = sizeMap[size];

  async function toggle() {
    if (!isLoggedIn) {
      // Salva no localStorage para recuperar pós-login
      if (typeof window !== "undefined") {
        localStorage.setItem("pendingFavorite", JSON.stringify({ contentType, contentId }));
      }
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId }),
      });
      if (res.ok) {
        const data = await res.json() as { favorited: boolean };
        setFavorited(data.favorited);
      }
    } finally {
      setLoading(false);
    }
  }

  const returnUrl = typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <>
      <button
        onClick={toggle}
        disabled={loading}
        aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        title={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        className={`
          ${s.btn} rounded-[6px] flex items-center justify-center gap-2 border transition-all duration-200
          ${favorited
            ? "bg-[#ff1f1f] border-[#ff1f1f] text-white"
            : "bg-[#141d2c] border-[#1c2a3e] text-[#7a9ab5] hover:border-[#ff1f1f] hover:text-[#ff1f1f]"
          }
          ${loading ? "opacity-60 cursor-wait" : ""}
        `}
      >
        <svg
          width={s.icon} height={s.icon}
          viewBox="0 0 24 24"
          fill={favorited ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
        {label && <span className="text-[13px] font-semibold whitespace-nowrap">{label}</span>}
      </button>

      {/* ── Modal de autenticação ── */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAuthModal(false); }}
        >
          <div className="bg-[#0e1520] border border-[#1c2a3e] rounded-[14px] p-7 w-full max-w-[380px] shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-[#526888] hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-[#ff1f1f]/10 border border-[#ff1f1f]/20 flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff1f1f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>

            <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[24px] leading-tight mb-2">
              Salve seus favoritos
            </h3>
            <p className="text-[#7a9ab5] text-[14px] leading-relaxed mb-6">
              Entre ou crie uma conta gratuita para salvar e acessar seus favoritos em qualquer dispositivo.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(returnUrl)}`}
                className="h-[44px] flex items-center justify-center bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold rounded-[8px] transition-colors"
                onClick={() => setShowAuthModal(false)}
              >
                Entrar na conta
              </Link>
              <Link
                href={`/auth/cadastro?redirect=${encodeURIComponent(returnUrl)}`}
                className="h-[44px] flex items-center justify-center bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] hover:text-white text-[14px] font-semibold rounded-[8px] transition-colors"
                onClick={() => setShowAuthModal(false)}
              >
                Criar conta gratuita
              </Link>
            </div>

            <p className="text-[#526888] text-[12px] text-center mt-4">
              Seu favorito será salvo automaticamente após o login.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
