"use client";

import { useState } from "react";

export default function EditorialExpandable({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-l-2 border-[#ff1f1f]/60 pl-5 py-2 rounded-r-sm"
      style={{ background: "linear-gradient(90deg, rgba(255,31,31,0.05) 0%, transparent 70%)" }}>

      <p className="text-[#ff1f1f] text-[9px] font-bold tracking-[2px] uppercase mb-3">Editorial</p>

      <div className="relative">
        <div
          className="text-[15px] leading-[28px] overflow-hidden transition-[max-height] duration-500 ease-in-out"
          style={{
            maxHeight: expanded ? "2000px" : "196px",
            color: "var(--text-primary)",
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {!expanded && (
          <div
            className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{ background: "linear-gradient(to top, var(--bg-base) 20%, transparent 100%)" }}
          />
        )}
      </div>

      <button
        onClick={() => setExpanded(e => !e)}
        className="mt-5 flex items-center gap-2 text-[13px] font-semibold transition-colors group"
        style={{ color: expanded ? "var(--text-muted)" : "#ff1f1f" }}
      >
        <span className="border border-current rounded-[4px] px-4 py-1.5 group-hover:bg-white/5 transition-colors">
          {expanded ? "Fechar editorial" : "Ler editorial completo"}
        </span>
        <span
          className="text-[10px] transition-transform duration-300 inline-block"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>
    </div>
  );
}
