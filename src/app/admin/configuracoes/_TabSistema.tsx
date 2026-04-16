"use client";

import { useState } from "react";
import { saveSettings, labelCls, selectCls } from "./_ConfiguracoesClient";

interface Props { settings: Record<string, string>; }

const TIMEZONES = [
  "America/Sao_Paulo", "America/Manaus", "America/Belem",
  "America/Fortaleza", "America/Recife", "America/Cuiaba",
  "America/Porto_Velho", "America/Boa_Vista", "America/Noronha",
];

const LANGUAGES = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
  { value: "es",    label: "Español" },
];

const REGIONAL_KEYS = ["site.language", "site.timezone", "site.time_format", "site.week_starts"];

export default function TabSistema({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of REGIONAL_KEYS) init[k] = settings[k] ?? "";
    if (!init["site.language"])    init["site.language"]    = "pt-BR";
    if (!init["site.timezone"])    init["site.timezone"]    = "America/Sao_Paulo";
    if (!init["site.time_format"]) init["site.time_format"] = "24h";
    if (!init["site.week_starts"]) init["site.week_starts"] = "sunday";
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function set(key: string, val: string) { setValues((v) => ({ ...v, [key]: val })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const result = await saveSettings(values);
    if (result.error) setError(result.error);
    else setSaved(true);
    setSaving(false);
    if (result.ok) setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">
          Sistema
        </h2>
        <p className="text-[#526888] text-[13px]">
          Configurações regionais e informações técnicas da plataforma.
        </p>
      </div>

      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
          <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">
            🌍 Regional
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Idioma padrão</label>
              <select
                value={values["site.language"]}
                onChange={(e) => set("site.language", e.target.value)}
                className={selectCls}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Fuso horário</label>
              <select
                value={values["site.timezone"]}
                onChange={(e) => set("site.timezone", e.target.value)}
                className={selectCls}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz.replace("America/", "")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Formato de hora</label>
              <select
                value={values["site.time_format"]}
                onChange={(e) => set("site.time_format", e.target.value)}
                className={selectCls}
              >
                <option value="24h">24 horas — ex: 13:00</option>
                <option value="12h">12 horas — ex: 1:00 PM</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Semana começa em</label>
              <select
                value={values["site.week_starts"]}
                onChange={(e) => set("site.week_starts", e.target.value)}
                className={selectCls}
              >
                <option value="sunday">Domingo</option>
                <option value="monday">Segunda-feira</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors"
          >
            {saving ? "Salvando..." : "Salvar Configurações Regionais"}
          </button>
          {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo com sucesso!</p>}
        </div>
      </form>

      {/* Informações do sistema */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">
          ⚙️ Informações do Sistema
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Versão",         value: "1.0.0" },
            { label: "Framework",      value: "Next.js 16.2.3" },
            { label: "Banco de dados", value: "PostgreSQL — Supabase" },
            { label: "Hospedagem",     value: "Vercel" },
            { label: "Deploy",         value: "Git → GitHub → Vercel (auto)" },
            { label: "CDN de imagens", value: "Supabase Storage" },
          ].map((item) => (
            <div key={item.label} className="bg-[#141d2c] rounded-[8px] p-4">
              <p className="text-white text-[11px] font-semibold tracking-[0.5px] uppercase mb-1">
                {item.label}
              </p>
              <p className="text-[#d4d4da] text-[13px]">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
