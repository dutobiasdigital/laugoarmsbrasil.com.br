"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls, areaCls } from "./_ConfiguracoesClient";

interface Props { settings: Record<string, string>; }

const KEYS = [
  "editorial.artigos_por_pagina", "editorial.edicoes_por_pagina",
  "editorial.artigos_gratuitos", "editorial.mensagem_paywall",
  "editorial.aviso_cookies", "editorial.url_termos",
  "editorial.url_privacidade", "editorial.rodape_artigo",
];

export default function TabEditorial({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of KEYS) init[k] = settings[k] ?? "";
    if (!init["editorial.artigos_por_pagina"]) init["editorial.artigos_por_pagina"] = "12";
    if (!init["editorial.edicoes_por_pagina"]) init["editorial.edicoes_por_pagina"] = "24";
    if (!init["editorial.artigos_gratuitos"])  init["editorial.artigos_gratuitos"]  = "0";
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

  const paywallOn = parseInt(values["editorial.artigos_gratuitos"] ?? "0") > 0;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">Editorial & Conteúdo</h2>
        <p className="text-[#526888] text-[13px]">Regras de exibição de conteúdo, paywall, textos legais e paginação.</p>
      </div>

      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>}

      {/* Paginação */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">📄 Paginação</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Artigos por página</label>
            <input value={values["editorial.artigos_por_pagina"]} onChange={e => set("editorial.artigos_por_pagina", e.target.value)}
              type="number" min="1" max="100" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Edições por página</label>
            <input value={values["editorial.edicoes_por_pagina"]} onChange={e => set("editorial.edicoes_por_pagina", e.target.value)}
              type="number" min="1" max="100" className={inputCls} />
          </div>
        </div>
      </section>

      {/* Paywall */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🔒 Paywall</h3>
        <div>
          <label className={labelCls}>
            Artigos gratuitos antes do paywall
            <span className="ml-2 text-[#526888] font-normal">(0 = sem paywall — acesso livre)</span>
          </label>
          <input value={values["editorial.artigos_gratuitos"]} onChange={e => set("editorial.artigos_gratuitos", e.target.value)}
            type="number" min="0" max="50" className={inputCls} />
        </div>
        {paywallOn && (
          <div>
            <label className={labelCls}>Mensagem de paywall</label>
            <textarea value={values["editorial.mensagem_paywall"]} onChange={e => set("editorial.mensagem_paywall", e.target.value)}
              rows={3}
              placeholder="Este conteúdo é exclusivo para assinantes. Assine agora e tenha acesso ilimitado à Laúgo Arms Brasil."
              className={areaCls} />
          </div>
        )}
        {!paywallOn && (
          <p className="text-[#526888] text-[12px] bg-[#141d2c] rounded-[6px] px-3 py-2">
            💡 Paywall desativado. Todos os artigos são acessíveis gratuitamente.
          </p>
        )}
      </section>

      {/* Links legais */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">⚖️ Links Legais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>URL — Termos de Uso</label>
            <input value={values["editorial.url_termos"]} onChange={e => set("editorial.url_termos", e.target.value)}
              type="url" placeholder="https://laugoarmsbrasil.com.br/termos" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>URL — Política de Privacidade</label>
            <input value={values["editorial.url_privacidade"]} onChange={e => set("editorial.url_privacidade", e.target.value)}
              type="url" placeholder="https://laugoarmsbrasil.com.br/privacidade" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Aviso de cookies / LGPD (banner do site)</label>
          <textarea value={values["editorial.aviso_cookies"]} onChange={e => set("editorial.aviso_cookies", e.target.value)}
            rows={2}
            placeholder="Usamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa Política de Privacidade."
            className={areaCls} />
        </div>
      </section>

      {/* Rodapé de artigos */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">📰 Rodapé dos Artigos</h3>
        <div>
          <label className={labelCls}>Texto exibido ao final de cada artigo</label>
          <textarea value={values["editorial.rodape_artigo"]} onChange={e => set("editorial.rodape_artigo", e.target.value)}
            rows={3}
            placeholder="© Laúgo Arms Brasil. Reprodução proibida sem autorização. As opiniões expressas são de responsabilidade dos autores."
            className={areaCls} />
        </div>
      </section>

      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
        <button type="submit" disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors">
          {saving ? "Salvando..." : "Salvar Editorial"}
        </button>
        {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo com sucesso!</p>}
      </div>
    </form>
  );
}
