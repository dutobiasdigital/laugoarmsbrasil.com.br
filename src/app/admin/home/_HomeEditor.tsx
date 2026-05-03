"use client";

import { useState } from "react";
import RichEditor from "@/components/admin/RichEditor";

interface Props {
  initialContent: string;
}

export default function HomeEditor({ initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "home.content": content }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Erro ao salvar o conteúdo. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <RichEditor value={content} onChange={setContent} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold px-6 py-2.5 rounded transition-colors"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
        {saved && (
          <span className="text-[#4ade80] text-[13px]">Salvo com sucesso.</span>
        )}
      </div>
    </div>
  );
}
