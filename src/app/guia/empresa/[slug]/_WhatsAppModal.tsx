"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  companyId:      string;
  companyName:    string;
  logoUrl:        string | null;
  whatsappNumber: string;
  defaultMessage: string | null;
}

const DEFAULT_MSG =
  "Olá! Vim pelo Guia Comercial da Laúgo Arms Brasil e gostaria de mais informações sobre seus serviços.";

export default function WhatsAppModal({
  companyId,
  companyName,
  logoUrl,
  whatsappNumber,
  defaultMessage,
}: Props) {
  const [open, setOpen]       = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(defaultMessage?.trim() || DEFAULT_MSG);
  const [sending, setSending] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  /* Slide-in animation */
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [open]);

  /* Focus textarea when modal opens */
  useEffect(() => {
    if (visible) setTimeout(() => textRef.current?.focus(), 200);
  }, [visible]);

  /* Close on Escape */
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function handleSend() {
    if (sending) return;
    setSending(true);
    /* Track interaction (fire-and-forget) */
    fetch("/api/guia/interaction", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: companyId, type: "WHATSAPP" }),
    }).catch(() => {});
    /* Open WhatsApp */
    const num = whatsappNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, "_blank");
    setTimeout(() => { setSending(false); setOpen(false); }, 400);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 bg-[#0f2b1a] border border-[#1a4a2e] hover:border-[#22c55e] hover:bg-[#0f2b1a]/80 rounded-[10px] px-4 h-[52px] text-[15px] text-[#22c55e] font-semibold transition-all group"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="flex-1 text-left">Falar Agora — WhatsApp</span>
        <svg className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-4 sm:p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className={`w-full max-w-[400px] rounded-[20px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)] transition-all duration-300 ease-out ${
              visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-6 opacity-0 scale-95"
            }`}
            style={{ fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif" }}
          >

            {/* ── Header (WhatsApp-style) ── */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#1f2c34" }}>
              {/* Company logo */}
              <div className="relative shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={companyName}
                    className="w-[44px] h-[44px] rounded-full object-contain bg-white p-1 border-2 border-[#00a884]/40"
                  />
                ) : (
                  <div className="w-[44px] h-[44px] rounded-full bg-[#00a884]/20 border-2 border-[#00a884]/40 flex items-center justify-center text-[22px]">
                    🏢
                  </div>
                )}
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-[12px] h-[12px] bg-[#00a884] rounded-full border-2 border-[#1f2c34]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[15px] font-semibold truncate">{companyName}</p>
                <p className="text-[#00a884] text-[12px]">● online agora</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#8696a0] hover:text-white text-[20px] leading-none transition-colors w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* ── Chat area ── */}
            <div
              className="relative px-4 pt-4 pb-2 min-h-[220px]"
              style={{
                background: "#0b141a",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            >
              {/* Date pill */}
              <div className="flex justify-center mb-4">
                <span className="text-[11px] text-[#8696a0] bg-[#1f2c34] px-3 py-1 rounded-full">
                  Hoje
                </span>
              </div>

              {/* Message bubble (editable, outgoing = right side) */}
              <div className="flex justify-end mb-2">
                <div
                  className="relative max-w-[88%] rounded-[12px] rounded-tr-[4px] px-3 py-2.5"
                  style={{ background: "#005c4b" }}
                >
                  {/* Tail */}
                  <div
                    className="absolute -top-0 -right-[8px] w-0 h-0"
                    style={{
                      borderLeft: "8px solid #005c4b",
                      borderTop:  "8px solid transparent",
                    }}
                  />
                  <textarea
                    ref={textRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-transparent text-[#e9edef] text-[14px] leading-[20px] focus:outline-none resize-none placeholder-[#8696a0]/60 min-w-[220px]"
                    placeholder="Escreva sua mensagem..."
                  />
                  <div className="flex justify-end items-center gap-1 mt-1">
                    <span className="text-[#8696a0] text-[11px]">agora</span>
                    {/* double check */}
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                      <path d="M1 5L4.5 8.5L9 3M5 5L8.5 8.5L13 3" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ background: "#1f2c34" }}>
              {/* Laúgo logo — bottom right as requested */}
              <div className="flex items-center gap-1.5 opacity-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Laúgo Arms Brasil" className="h-[18px] w-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="flex items-center gap-2 text-white text-[14px] font-semibold h-[42px] px-5 rounded-[10px] transition-all disabled:opacity-50"
                style={{ background: sending ? "#128c7e" : "#00a884" }}
              >
                {sending ? (
                  <span className="w-[16px] h-[16px] border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                )}
                Enviar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
