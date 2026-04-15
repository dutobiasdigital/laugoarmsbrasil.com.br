"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls } from "./_ConfiguracoesClient";

interface Props { settings: Record<string, string>; }

const INTEGRATIONS = [
  {
    group: "Google",
    icon: "🔵",
    items: [
      { key: "integrations.gtm_id",          label: "Google Tag Manager ID",    placeholder: "GTM-XXXXXXX",   hint: "Injeta no <head>. Recomendado para centralizar todos os tags." },
      { key: "integrations.ga4_id",           label: "Google Analytics 4",       placeholder: "G-XXXXXXXXXX",  hint: "Measurement ID do GA4. Ignore se já estiver configurado no GTM." },
      { key: "integrations.google_ads_id",    label: "Google Ads — Conversion ID",placeholder: "AW-XXXXXXXXX", hint: "ID de conversão do Google Ads." },
      { key: "integrations.google_ads_label", label: "Google Ads — Label",        placeholder: "xxxxxxxxxxxx",  hint: "Label do evento de conversão (opcional)." },
    ],
  },
  {
    group: "Meta (Facebook)",
    icon: "🟦",
    items: [
      { key: "integrations.meta_pixel_id",   label: "Meta Pixel ID",              placeholder: "1234567890",    hint: "ID do Pixel do Facebook / Instagram." },
      { key: "integrations.meta_capi_token", label: "Meta Conversions API Token",  placeholder: "EAAxxxxxx...", hint: "Token de acesso para a Conversions API (server-side events)." },
    ],
  },
  {
    group: "Segurança",
    icon: "🔒",
    items: [
      { key: "integrations.recaptcha_site_key",   label: "reCAPTCHA v3 — Site Key",   placeholder: "6Lxxxxxxx...", hint: "Chave pública para o frontend." },
      { key: "integrations.recaptcha_secret_key", label: "reCAPTCHA v3 — Secret Key", placeholder: "6Lxxxxxxx...", hint: "Chave secreta para validação no servidor. Nunca exponha ao público." },
    ],
  },
  {
    group: "Analytics complementar",
    icon: "📊",
    items: [
      { key: "integrations.hotjar_id",   label: "Hotjar — Site ID",          placeholder: "1234567",  hint: "Heatmaps e gravações de sessão." },
      { key: "integrations.clarity_id",  label: "Microsoft Clarity — Project ID", placeholder: "xxxxxxxxxx", hint: "Heatmaps gratuitos da Microsoft." },
    ],
  },
];

export default function TabIntegracoes({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const g of INTEGRATIONS) for (const item of g.items) init[item.key] = settings[item.key] ?? "";
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

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
    <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">Integrações & Scripts</h2>
        <p className="text-[#526888] text-[13px]">Configure pixels, tags de rastreamento e ferramentas de análise. Salvo aqui, o código é injetado automaticamente em todas as páginas.</p>
      </div>

      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>
      )}

      {INTEGRATIONS.map(group => (
        <section key={group.group} className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#141d2c]">
            <span className="text-[18px]">{group.icon}</span>
            <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px]">{group.group}</h3>
          </div>

          {group.items.map(item => (
            <div key={item.key}>
              <label className={labelCls}>{item.label}</label>
              <input
                value={values[item.key]}
                onChange={e => setValues(v => ({ ...v, [item.key]: e.target.value }))}
                placeholder={item.placeholder}
                className={inputCls}
                autoComplete="off"
              />
              {item.hint && <p className="text-[#253750] text-[11px] mt-1">{item.hint}</p>}
            </div>
          ))}
        </section>
      ))}

      {/* Botão salvar */}
      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
        <button type="submit" disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors">
          {saving ? "Salvando..." : "Salvar Integrações"}
        </button>
        {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo! As alterações entram em vigor no próximo deploy.</p>}
      </div>
    </form>
  );
}
