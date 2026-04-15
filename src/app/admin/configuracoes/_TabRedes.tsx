"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls } from "./_ConfiguracoesClient";

interface Props { settings: Record<string, string>; }

const REDES = [
  { key: "social.instagram",  label: "Instagram",  icon: "📸", placeholder: "https://instagram.com/revistamagnum",   hint: "URL completa do perfil" },
  { key: "social.facebook",   label: "Facebook",   icon: "👤", placeholder: "https://facebook.com/revistamagnum",    hint: "URL completa da página" },
  { key: "social.youtube",    label: "YouTube",    icon: "▶️", placeholder: "https://youtube.com/@revistamagnum",   hint: "URL do canal" },
  { key: "social.tiktok",     label: "TikTok",     icon: "🎵", placeholder: "https://tiktok.com/@revistamagnum",    hint: "URL do perfil" },
  { key: "social.twitter",    label: "X / Twitter",icon: "🐦", placeholder: "https://x.com/revistamagnum",          hint: "URL do perfil" },
  { key: "social.linkedin",   label: "LinkedIn",   icon: "💼", placeholder: "https://linkedin.com/company/magnum",  hint: "URL da página da empresa" },
  { key: "social.pinterest",  label: "Pinterest",  icon: "📌", placeholder: "https://pinterest.com/revistamagnum",  hint: "URL do perfil" },
  { key: "social.telegram",   label: "Telegram",   icon: "✈️", placeholder: "https://t.me/revistamagnum",           hint: "Link do canal ou grupo" },
  { key: "social.whatsapp",   label: "WhatsApp (número para botão)",icon: "💬", placeholder: "5511999999999",        hint: "Apenas números com DDI+DDD, sem espaços ou símbolos" },
];

export default function TabRedes({ settings }: Props) {
  // Inicializa valores e quais redes estão ativas
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const r of REDES) init[r.key] = settings[r.key] ?? "";
    return init;
  });

  const [active, setActive] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const r of REDES) init[r.key] = !!(settings[r.key]?.trim());
    return init;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function toggle(key: string) {
    setActive(a => {
      const next = { ...a, [key]: !a[key] };
      if (!next[key]) setValues(v => ({ ...v, [key]: "" })); // limpa ao desativar
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    // Salva todas as redes (value vazio = desativada)
    const result = await saveSettings(values);
    if (result.error) setError(result.error);
    else setSaved(true);
    setSaving(false);
    if (result.ok) setTimeout(() => setSaved(false), 3000);
  }

  const activeCount = REDES.filter(r => active[r.key]).length;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">Redes Sociais</h2>
        <p className="text-[#526888] text-[13px]">Ative as redes que a empresa usa e insira os links. Os ícones aparecerão automaticamente no header e footer.</p>
      </div>

      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>}

      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] overflow-hidden">
        <div className="bg-[#141d2c] px-5 py-3 flex items-center justify-between">
          <p className="text-[#253750] text-[11px] font-semibold tracking-[0.5px] uppercase">Redes disponíveis</p>
          <p className="text-[#526888] text-[12px]">{activeCount} ativada{activeCount !== 1 ? "s" : ""}</p>
        </div>

        {REDES.map((rede, i) => (
          <div key={rede.key}>
            {i > 0 && <div className="bg-[#141d2c] h-px" />}
            <div className="px-5 py-4">
              {/* Toggle header */}
              <div className="flex items-center gap-3 mb-3">
                <button type="button" onClick={() => toggle(rede.key)}
                  className={`w-[40px] h-[22px] rounded-full transition-colors shrink-0 relative ${active[rede.key] ? "bg-[#ff1f1f]" : "bg-[#141d2c] border border-[#1c2a3e]"}`}>
                  <div className={`w-[16px] h-[16px] bg-white rounded-full absolute top-[3px] transition-all ${active[rede.key] ? "left-[21px]" : "left-[3px]"}`} />
                </button>
                <span className="text-[16px]">{rede.icon}</span>
                <p className={`text-[14px] font-semibold ${active[rede.key] ? "text-[#d4d4da]" : "text-[#526888]"}`}>{rede.label}</p>
                {active[rede.key] && <span className="text-[10px] bg-[#0f381f] text-[#22c55e] px-2 py-[2px] rounded-[2px] font-bold">ATIVA</span>}
              </div>

              {/* Campo de URL — visível só quando ativa */}
              {active[rede.key] && (
                <div className="ml-[56px]">
                  <label className={labelCls}>{rede.label} — URL / Contato</label>
                  <input
                    value={values[rede.key]}
                    onChange={e => setValues(v => ({ ...v, [rede.key]: e.target.value }))}
                    placeholder={rede.placeholder}
                    className={inputCls}
                  />
                  {rede.hint && <p className="text-[#253750] text-[11px] mt-1">{rede.hint}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
        <button type="submit" disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors">
          {saving ? "Salvando..." : "Salvar Redes Sociais"}
        </button>
        {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo! Links disponíveis no header e footer.</p>}
      </div>
    </form>
  );
}
