"use client";

import { useState } from "react";
import TabEmail from "./_TabEmail";
import TabEmailTemplates from "./_TabEmailTemplates";
import TabNotificacoes from "./_TabNotificacoes";

interface Props { settings: Record<string, string>; }

const SUB_TABS = [
  { id: "smtp",         label: "SMTP" },
  { id: "templates",    label: "Templates" },
  { id: "notificacoes", label: "Notificações" },
];

export default function TabEmails({ settings }: Props) {
  const [sub, setSub] = useState("smtp");

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-tab nav */}
      <div className="flex gap-1 bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-1">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSub(t.id)}
            className={`flex-1 h-[36px] rounded-[8px] text-[13px] font-medium transition-colors ${
              sub === t.id
                ? "bg-[#ff1f1f] text-white"
                : "text-[#7a9ab5] hover:text-white hover:bg-[#141d2c]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === "smtp"         && <TabEmail settings={settings} />}
      {sub === "templates"    && <TabEmailTemplates settings={settings} />}
      {sub === "notificacoes" && <TabNotificacoes settings={settings} />}
    </div>
  );
}
