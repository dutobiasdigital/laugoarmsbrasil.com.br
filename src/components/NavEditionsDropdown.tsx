"use client";

import { useState } from "react";
import Link from "next/link";

const items = [
  { href: "/nas-bancas", label: "Nas Bancas", icon: "📰", highlight: true },
  { href: "/edicoes?tipo=normais", label: "Edições Regulares", icon: null, highlight: false },
  { href: "/edicoes?tipo=especiais", label: "Edições Especiais", icon: null, highlight: false },
];

export default function NavEditionsDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 text-[#7a9ab5] hover:text-white text-[13px] font-semibold transition-colors"
      >
        EDIÇÕES <span className="text-[11px] text-white">▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 pt-2 z-50">
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[8px] overflow-hidden min-w-[210px] shadow-2xl">
            {items.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-4 py-3 text-[13px] transition-colors hover:bg-[#141d2c] ${
                  i < items.length - 1 ? "border-b border-[#141d2c]" : ""
                } ${
                  item.highlight
                    ? "text-[#ff1f1f] font-bold"
                    : "text-[#d4d4da] font-semibold"
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
