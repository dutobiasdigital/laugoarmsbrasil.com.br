"use client";

import { useState } from "react";

interface Tab { id: string; title: string; content: string }

export default function ProductContentTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  const current = tabs.find((t) => t.id === active);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-[#1c2a3e] mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-5 h-[44px] text-[14px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
              active === tab.id
                ? "border-[#ff1f1f] text-white"
                : "border-transparent text-[#7a9ab5] hover:text-white"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Content */}
      {current && (
        <div
          className="prose prose-invert prose-sm max-w-none text-[#7a9ab5] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: current.content }}
        />
      )}
    </div>
  );
}
