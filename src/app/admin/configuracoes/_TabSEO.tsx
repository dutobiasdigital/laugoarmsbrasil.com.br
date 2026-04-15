"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls, areaCls, selectCls } from "./_ConfiguracoesClient";

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

const KEYS = [
  "site.name", "site.tagline", "site.description", "site.keywords",
  "site.logo_url", "site.favicon_url", "site.og_image_url",
  "site.domain", "site.language", "site.timezone",
];

export default function TabSEO({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of KEYS) init[k] = settings[k] ?? "";
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function set(key: string, val: string) { setValues(v => ({ ...v, [key]: val })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const result = await saveSettings(values);
    if (result.error) setError(result.error);
    else setSaved(true);
    setSaving(false);
    if (result.ok) setTimeout(() => setSaved(false), 3000);
  }

  const descLen = values["site.description"]?.length ?? 0;
  const descOk  = descLen >= 120 && descLen <= 160;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">Site & SEO</h2>
        <p className="text-[#526888] text-[13px]">Identidade pública do site. Usados em meta tags, compartilhamento social e no painel.</p>
      </div>

      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>
      )}

      {/* Identidade */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🪪 Identidade</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nome do Site *</label>
            <input value={values["site.name"]} onChange={e => set("site.name", e.target.value)}
              placeholder="Revista Magnum" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Slogan / Tagline</label>
            <input value={values["site.tagline"]} onChange={e => set("site.tagline", e.target.value)}
              placeholder="O Mundo das Armas em Suas Mãos" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>
            Descrição padrão (meta description)
            <span className={`ml-2 font-normal ${descOk ? "text-[#22c55e]" : "text-[#526888]"}`}>
              {descLen}/160 {descOk ? "✓ ideal" : descLen < 120 ? "(mínimo 120)" : "(máximo 160)"}
            </span>
          </label>
          <textarea value={values["site.description"]} onChange={e => set("site.description", e.target.value)}
            rows={3} placeholder="O maior acervo de publicações especializadas em armas, munições e legislação do Brasil."
            className={areaCls} />
        </div>

        <div>
          <label className={labelCls}>Palavras-chave (separadas por vírgula)</label>
          <input value={values["site.keywords"]} onChange={e => set("site.keywords", e.target.value)}
            placeholder="revista de armas, tiro esportivo, CAC, munições, legislação" className={inputCls} />
        </div>
      </section>

      {/* Imagens */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🖼 Imagens</h3>

        <div>
          <label className={labelCls}>URL do Logotipo</label>
          <input value={values["site.logo_url"]} onChange={e => set("site.logo_url", e.target.value)}
            placeholder="https://..." type="url" className={inputCls} />
          <p className="text-[#253750] text-[11px] mt-1">PNG transparente recomendado. Exibido no header.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>URL do Favicon</label>
            <input value={values["site.favicon_url"]} onChange={e => set("site.favicon_url", e.target.value)}
              placeholder="https://.../favicon.ico" type="url" className={inputCls} />
            <p className="text-[#253750] text-[11px] mt-1">ICO ou PNG 32×32px.</p>
          </div>
          <div>
            <label className={labelCls}>Imagem OG (compartilhamento social)</label>
            <input value={values["site.og_image_url"]} onChange={e => set("site.og_image_url", e.target.value)}
              placeholder="https://.../og-image.jpg" type="url" className={inputCls} />
            <p className="text-[#253750] text-[11px] mt-1">1200×630px. JPG ou PNG.</p>
          </div>
        </div>

        {/* Preview das imagens */}
        {(values["site.logo_url"] || values["site.og_image_url"]) && (
          <div className="flex gap-4 pt-2">
            {values["site.logo_url"] && (
              <div className="flex flex-col items-center gap-1">
                <div className="w-[80px] h-[40px] bg-[#141d2c] rounded flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={values["site.logo_url"]} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                </div>
                <p className="text-[#253750] text-[10px]">Logo</p>
              </div>
            )}
            {values["site.og_image_url"] && (
              <div className="flex flex-col items-center gap-1">
                <div className="w-[120px] h-[63px] bg-[#141d2c] rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={values["site.og_image_url"]} alt="OG preview" className="w-full h-full object-cover" />
                </div>
                <p className="text-[#253750] text-[10px]">OG 1200×630</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Domínio & Localização */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🌍 Domínio & Localização</h3>

        <div>
          <label className={labelCls}>Domínio base (URL canônica)</label>
          <input value={values["site.domain"]} onChange={e => set("site.domain", e.target.value)}
            placeholder="https://www.revistamagnum.com.br" type="url" className={inputCls} />
          <p className="text-[#253750] text-[11px] mt-1">Sem barra no final. Usado em canonical URLs e sitemaps.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Idioma padrão</label>
            <select value={values["site.language"]} onChange={e => set("site.language", e.target.value)} className={selectCls}>
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Fuso horário</label>
            <select value={values["site.timezone"]} onChange={e => set("site.timezone", e.target.value)} className={selectCls}>
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace("America/", "")}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Botão salvar */}
      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
        <button type="submit" disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors">
          {saving ? "Salvando..." : "Salvar Site & SEO"}
        </button>
        {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo com sucesso!</p>}
      </div>
    </form>
  );
}
