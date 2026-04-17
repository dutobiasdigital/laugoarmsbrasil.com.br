"use client";

import { useState } from "react";

interface Props {
  phone:     string;
  companyId: string;
}

/** Masks the last 4 digits of a phone number: (11) 98765-**** */
function maskPhone(phone: string): string {
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return "****";
  return cleaned.slice(0, -4) + "****";
}

export default function PhoneReveal({ phone, companyId }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [tracked, setTracked]   = useState(false);

  function handleReveal() {
    setRevealed(true);
    if (!tracked) {
      setTracked(true);
      fetch("/api/guia/interaction", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id: companyId, type: "PHONE" }),
      }).catch(() => {});
    }
  }

  return (
    <div className="flex items-center gap-3 bg-[#141d2c] border border-[#1c2a3e] rounded-[10px] px-4 h-[52px] group overflow-hidden">
      <span className="text-[18px] shrink-0">📞</span>

      <div className="flex-1 min-w-0">
        {revealed ? (
          <a
            href={`tel:${phone.replace(/\D/g, "")}`}
            className="text-[15px] text-[#22c55e] font-semibold hover:text-white transition-colors"
          >
            {phone}
          </a>
        ) : (
          <span className="text-[15px] text-[#d4d4da] font-mono tracking-wide">
            {maskPhone(phone)}
          </span>
        )}
      </div>

      {!revealed && (
        <button
          onClick={handleReveal}
          className="shrink-0 bg-[#0e1520] border border-[#1c2a3e] hover:border-[#ff1f1f] hover:bg-[#ff1f1f] text-[#7a9ab5] hover:text-white text-[11px] font-semibold h-[30px] px-3 rounded-[6px] transition-all whitespace-nowrap"
        >
          Exibir Contato
        </button>
      )}
    </div>
  );
}
