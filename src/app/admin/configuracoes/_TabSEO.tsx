"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls, areaCls, selectCls } from "./_ConfiguracoesClient";

interface Props { settings: Record<string, string>; }

/* ── Chaves gerenciadas nesta tab ─────────────────────────── */
const BASE_KEYS = [
  "site.name", "site.tagline", "site.description", "site.keywords",
  "site.logo_url", "site.favicon_url", "site.og_image_url",
];
const SEO_KEYS = [
  "seo.indexing_enabled", "seo.meta_robots",
  "seo.noindex_search", "seo.noindex_login", "seo.noindex_cart",
  "seo.noindex_checkout", "seo.noindex_filter", "seo.noindex_paginated",
  "seo.canonical_base", "seo.force_https", "seo.www_policy",
  "seo.trailing_slash", "seo.canonical_self_ref", "seo.strip_url_params",
  "seo.sitemap_enabled", "seo.sitemap_editions", "seo.sitemap_blog",
  "seo.sitemap_guia_cats", "seo.sitemap_guia_listings", "seo.sitemap_last_generated",
  "seo.robots_txt",
];
const ALL_KEYS = [...BASE_KEYS, ...SEO_KEYS];

/* ── Defaults ─────────────────────────────────────────────── */
const DEFAULTS: Record<string, string> = {
  "seo.indexing_enabled":   "true",
  "seo.meta_robots":        "index,follow",
  "seo.sitemap_enabled":    "true",
  "seo.sitemap_editions":   "true",
  "seo.sitemap_blog":       "true",
  "seo.sitemap_guia_cats":  "true",
  "seo.sitemap_guia_listings": "true",
  "seo.canonical_self_ref": "true",
  "seo.force_https":        "true",
  "seo.www_policy":         "none",
  "seo.trailing_slash":     "none",
  "seo.strip_url_params":   "utm_source,utm_medium,utm_campaign,fbclid,gclid",
};

/* ── Templates robots.txt ─────────────────────────────────── */
const ROBOTS_TEMPLATES = {
  producao: (base: string) =>
`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout
Disallow: /conta
Disallow: /loja/carrinho

Sitemap: ${base || "https://laugoarmsbrasil.com.br"}/sitemap.xml`,

  staging:
`User-agent: *
Disallow: /`,

  dev:
`User-agent: *
Disallow: /`,
};

const SUB_TABS = [
  { id: "identidade", label: "Identidade" },
  { id: "indexacao",  label: "Indexação"  },
  { id: "canonical",  label: "Canonicals" },
  { id: "sitemap",    label: "Sitemap"    },
  { id: "robots",     label: "Robots.txt" },
] as const;

type SubTab = typeof SUB_TABS[number]["id"];

/* ── Checkbox helper ──────────────────────────────────────── */
function Toggle({ label, id, checked, onChange, hint }: {
  label: string; id: string; checked: boolean;
  onChange: (v: boolean) => void; hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 relative w-[36px] h-[20px] rounded-full transition-colors shrink-0 ${checked ? "bg-[#ff1f1f]" : "bg-[#1c2a3e]"}`}
      >
        <span className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full transition-transform ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
      </button>
      <div>
        <label htmlFor={id} className="text-[#d4d4da] text-[13px] cursor-pointer" onClick={() => onChange(!checked)}>{label}</label>
        {hint && <p className="text-[#526888] text-[11px] mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function Checkbox({ label, id, checked, onChange, hint }: {
  label: string; id: string; checked: boolean;
  onChange: (v: boolean) => void; hint?: string;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-2 cursor-pointer group">
      <div className={`mt-0.5 w-[16px] h-[16px] rounded-[3px] border flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-[#ff1f1f] border-[#ff1f1f]" : "border-[#1c2a3e] bg-[#070a12] group-hover:border-[#526888]"}`}
        onClick={() => onChange(!checked)}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
      <div>
        <span className="text-[#d4d4da] text-[13px]">{label}</span>
        {hint && <p className="text-[#526888] text-[11px] mt-0.5">{hint}</p>}
      </div>
    </label>
  );
}

/* ── Componente principal ─────────────────────────────────── */
export default function TabSEO({ settings }: Props) {
  const [sub, setSub]       = useState<SubTab>("identidade");
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of ALL_KEYS) init[k] = settings[k] ?? DEFAULTS[k] ?? "";
    return init;
  });
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [regenerating, setRegen]    = useState(false);
  const [regenMsg, setRegenMsg]     = useState<string | null>(null);

  function set(key: string, val: string) { setValues(v => ({ ...v, [key]: val })); }
  function bool(key: string, def = false) { const v = values[key]; return v !== undefined ? v === "true" : def; }
  function toggleKey(key: string, def = false) { set(key, bool(key, def) ? "false" : "true"); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const result = await saveSettings(values);
    if (result.error) setError(result.error);
    else setSaved(true);
    setSaving(false);
    if (result.ok) setTimeout(() => setSaved(false), 3000);
  }

  async function handleRegenerate() {
    setRegen(true); setRegenMsg(null);
    try {
      const res = await fetch("/api/admin/seo/regenerate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const ts = new Date(data.generatedAt).toLocaleString("pt-BR");
        set("seo.sitemap_last_generated", data.generatedAt);
        setRegenMsg(`✓ Regenerado em ${ts}`);
      } else {
        setRegenMsg(`Erro: ${data.error}`);
      }
    } catch {
      setRegenMsg("Erro de conexão.");
    } finally {
      setRegen(false);
      setTimeout(() => setRegenMsg(null), 5000);
    }
  }

  const descLen = values["site.description"]?.length ?? 0;
  const descOk  = descLen >= 120 && descLen <= 160;
  const canonBase = values["seo.canonical_base"] || "https://laugoarmsbrasil.com.br";

  /* robots.txt warnings */
  const robotsTxt = values["seo.robots_txt"] ?? "";
  const hasBlockAll = /^\s*Disallow:\s*\/\s*$/m.test(robotsTxt);
  const hasUserAgentAll = /^\s*User-agent:\s*\*\s*$/m.test(robotsTxt);
  const robotsBlocksEveryone = hasBlockAll && hasUserAgentAll;

  /* Alertas de conflito */
  const gscConfigured = !!(settings["integrations.google_search_console"]);
  const indexingOff = !bool("seo.indexing_enabled", true);
  const sitemapOff = !bool("seo.sitemap_enabled", true);
  const conflicts = [
    indexingOff && gscConfigured && "Site bloqueado para indexação mas Google Search Console está configurado.",
    indexingOff && !sitemapOff && "Indexação desativada mas sitemap ainda ativo — desative o sitemap também.",
  ].filter(Boolean) as string[];

  const lastGen = values["seo.sitemap_last_generated"]
    ? new Date(values["seo.sitemap_last_generated"]).toLocaleString("pt-BR")
    : "Nunca gerado";

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-0 max-w-[760px]">
      <div className="mb-5">
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">SEO & Meta Tags</h2>
        <p className="text-[#526888] text-[13px]">Indexação, canonicals, sitemap e robots.txt gerenciados em um só lugar.</p>
      </div>

      {/* Alertas de conflito */}
      {conflicts.map(msg => (
        <div key={msg} className="bg-[#1a120a] border border-[#ff9500]/40 rounded-[8px] px-4 py-3 mb-3 text-[#ff9500] text-[13px] flex gap-2">
          <span className="shrink-0">⚠️</span> {msg}
        </div>
      ))}

      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-4 text-[#ff6b6b] text-[13px]">{error}</div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#141d2c] pb-0 overflow-x-auto">
        {SUB_TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setSub(t.id)}
            className={`px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors -mb-px ${
              sub === t.id ? "border-[#ff1f1f] text-white" : "border-transparent text-[#526888] hover:text-[#7a9ab5]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── IDENTIDADE ── */}
      {sub === "identidade" && (
        <div className="flex flex-col gap-6">
          <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
            <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🪪 Identidade SEO</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nome do Site *</label>
                <input value={values["site.name"]} onChange={e => set("site.name", e.target.value)}
                  placeholder="Laúgo Arms Brasil" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Slogan / Tagline</label>
                <input value={values["site.tagline"]} onChange={e => set("site.tagline", e.target.value)}
                  placeholder="O Mundo das Armas em Suas Mãos" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>
                Meta description padrão
                <span className={`ml-2 font-normal ${descOk ? "text-[#22c55e]" : "text-[#526888]"}`}>
                  {descLen}/160 {descOk ? "✓ ideal" : descLen < 120 ? "(mín. 120)" : "(máx. 160)"}
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
              <p className="text-[#526888] text-[11px] mt-1">Impacto baixo em ranking, alto em estrutura semântica.</p>
            </div>
          </section>

          <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
            <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🖼 Imagens & Open Graph</h3>
            <div>
              <label className={labelCls}>URL do Logotipo</label>
              <input value={values["site.logo_url"]} onChange={e => set("site.logo_url", e.target.value)}
                placeholder="https://..." type="url" className={inputCls} />
              <p className="text-[#526888] text-[11px] mt-1">PNG transparente. Exibido no header do site.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>URL do Favicon</label>
                <input value={values["site.favicon_url"]} onChange={e => set("site.favicon_url", e.target.value)}
                  placeholder="https://.../favicon.ico" type="url" className={inputCls} />
                <p className="text-[#526888] text-[11px] mt-1">ICO ou PNG 32×32 px.</p>
              </div>
              <div>
                <label className={labelCls}>Imagem OG (compartilhamento social)</label>
                <input value={values["site.og_image_url"]} onChange={e => set("site.og_image_url", e.target.value)}
                  placeholder="https://.../og-image.jpg" type="url" className={inputCls} />
                <p className="text-[#526888] text-[11px] mt-1">1200×630 px — JPG ou PNG.</p>
              </div>
            </div>
            {(values["site.logo_url"] || values["site.og_image_url"]) && (
              <div className="flex gap-4 pt-1">
                {values["site.logo_url"] && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-[80px] h-[40px] bg-[#141d2c] rounded flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={values["site.logo_url"]} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    <p className="text-[#526888] text-[10px]">Logo</p>
                  </div>
                )}
                {values["site.og_image_url"] && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-[120px] h-[63px] bg-[#141d2c] rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={values["site.og_image_url"]} alt="OG preview" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[#526888] text-[10px]">OG 1200×630</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── INDEXAÇÃO ── */}
      {sub === "indexacao" && (
        <div className="flex flex-col gap-6">
          <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-5">
            <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🔍 Indexação e Rastreamento</h3>

            <Toggle id="idx-enabled" label="Permitir indexação do site"
              checked={bool("seo.indexing_enabled", true)}
              onChange={v => set("seo.indexing_enabled", v ? "true" : "false")}
              hint="Desativando isso, adiciona noindex em todas as páginas e bloqueia o sitemap." />

            <div>
              <label className={labelCls}>Meta robots global padrão</label>
              <select className={selectCls} value={values["seo.meta_robots"]}
                onChange={e => set("seo.meta_robots", e.target.value)}>
                <option value="index,follow">index, follow — indexar e rastrear links (padrão)</option>
                <option value="noindex,follow">noindex, follow — não indexar mas rastrear links</option>
                <option value="index,nofollow">index, nofollow — indexar mas não seguir links</option>
                <option value="noindex,nofollow">noindex, nofollow — bloquear tudo</option>
              </select>
              <p className="text-[#526888] text-[11px] mt-1">Páginas individuais podem sobrescrever este valor.</p>
            </div>

            <div>
              <p className="text-[#7a9ab5] text-[12px] font-semibold uppercase tracking-[0.5px] mb-3">Páginas de sistema — forçar noindex</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "seo.noindex_search",    label: "Busca interna (/busca?q=...)",      hint: "Evita indexação de páginas de resultado de busca." },
                  { key: "seo.noindex_login",     label: "Login / Conta (/conta)",            hint: "" },
                  { key: "seo.noindex_cart",      label: "Carrinho (/loja/carrinho)",         hint: "" },
                  { key: "seo.noindex_checkout",  label: "Checkout (/checkout)",              hint: "" },
                  { key: "seo.noindex_filter",    label: "Páginas de filtro (?categoria=...)",hint: "Evita URLs duplicadas por parâmetros." },
                  { key: "seo.noindex_paginated", label: "Páginas paginadas (?page=2...)",    hint: "Recomendado — evita duplicidade de conteúdo." },
                ].map(item => (
                  <Checkbox key={item.key} id={item.key} label={item.label} hint={item.hint}
                    checked={bool(item.key)}
                    onChange={v => set(item.key, v ? "true" : "false")} />
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── CANONICALS ── */}
      {sub === "canonical" && (
        <div className="flex flex-col gap-6">
          <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-5">
            <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🔗 Canonicals e URL</h3>

            <div>
              <label className={labelCls}>URL canônica base do site</label>
              <input value={values["seo.canonical_base"]} onChange={e => set("seo.canonical_base", e.target.value)}
                placeholder="https://laugoarmsbrasil.com.br" type="url" className={inputCls} />
              <p className="text-[#526888] text-[11px] mt-1">Sem barra no final. Usada para gerar canonicals e sitemap.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Protocolo</label>
                <select className={selectCls} value={values["seo.force_https"]}
                  onChange={e => set("seo.force_https", e.target.value)}>
                  <option value="true">Forçar HTTPS</option>
                  <option value="false">Manter como está</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Política de www</label>
                <select className={selectCls} value={values["seo.www_policy"]}
                  onChange={e => set("seo.www_policy", e.target.value)}>
                  <option value="none">Não alterar</option>
                  <option value="with">Sempre com www</option>
                  <option value="without">Sempre sem www</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Barra final (trailing slash)</label>
                <select className={selectCls} value={values["seo.trailing_slash"]}
                  onChange={e => set("seo.trailing_slash", e.target.value)}>
                  <option value="none">Não alterar</option>
                  <option value="remove">Sempre remover</option>
                  <option value="keep">Sempre manter</option>
                </select>
              </div>
            </div>

            <Toggle id="canonical-self" label="Canonical autorreferente por padrão"
              checked={bool("seo.canonical_self_ref", true)}
              onChange={v => set("seo.canonical_self_ref", v ? "true" : "false")}
              hint="Adiciona <link rel=canonical> apontando para a própria URL em todas as páginas." />

            <div>
              <label className={labelCls}>Parâmetros de URL a ignorar na canonical</label>
              <input value={values["seo.strip_url_params"]}
                onChange={e => set("seo.strip_url_params", e.target.value)}
                placeholder="utm_source,utm_medium,fbclid,gclid" className={inputCls} />
              <p className="text-[#526888] text-[11px] mt-1">
                Separados por vírgula. Estes parâmetros são removidos da URL canônica — evita duplicidade por rastreamento.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* ── SITEMAP ── */}
      {sub === "sitemap" && (
        <div className="flex flex-col gap-6">
          <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-5">
            <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🗺️ Sitemap XML</h3>

            <Toggle id="sitemap-enabled" label="Ativar sitemap.xml"
              checked={bool("seo.sitemap_enabled", true)}
              onChange={v => set("seo.sitemap_enabled", v ? "true" : "false")}
              hint="Desativando retorna 404 para /sitemap.xml." />

            <div className="bg-[#070a12] border border-[#1c2a3e] rounded-[8px] px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[#7a9ab5] text-[11px] uppercase tracking-[0.5px] font-semibold mb-0.5">URL do sitemap</p>
                <p className="text-[#d4d4da] text-[13px] font-mono">{canonBase}/sitemap.xml</p>
              </div>
              <a href="/sitemap.xml" target="_blank" rel="noopener"
                className="text-[#ff1f1f] text-[12px] hover:text-white transition-colors whitespace-nowrap">
                Abrir →
              </a>
            </div>

            <div>
              <p className="text-[#7a9ab5] text-[12px] font-semibold uppercase tracking-[0.5px] mb-3">Incluir no sitemap</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "seo.sitemap_editions",      label: "Edições da revista",       hint: "/edicoes/[slug]" },
                  { key: "seo.sitemap_blog",           label: "Artigos / Blog",           hint: "/blog/[slug]" },
                  { key: "seo.sitemap_guia_cats",      label: "Categorias do Guia",       hint: "/guia/[categoria]" },
                  { key: "seo.sitemap_guia_listings",  label: "Empresas do Guia",         hint: "/guia/empresa/[slug]" },
                ].map(item => (
                  <Checkbox key={item.key} id={item.key} label={item.label} hint={item.hint}
                    checked={bool(item.key, true)}
                    onChange={v => set(item.key, v ? "true" : "false")} />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#141d2c]">
              <div>
                <p className="text-[#7a9ab5] text-[12px] font-semibold uppercase tracking-[0.5px] mb-0.5">Última geração</p>
                <p className="text-[#d4d4da] text-[13px]">{lastGen}</p>
                {regenMsg && (
                  <p className={`text-[12px] mt-1 ${regenMsg.startsWith("✓") ? "text-[#22c55e]" : "text-[#ff6b6b]"}`}>{regenMsg}</p>
                )}
              </div>
              <button type="button" onClick={handleRegenerate} disabled={regenerating}
                className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[13px] h-[36px] px-5 rounded-[6px] transition-colors disabled:opacity-50 whitespace-nowrap">
                {regenerating ? "Regenerando..." : "↻ Regenerar"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ── ROBOTS.TXT ── */}
      {sub === "robots" && (
        <div className="flex flex-col gap-6">
          <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
            <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🤖 Robots.txt</h3>

            {/* Warning de bloqueio total */}
            {robotsBlocksEveryone && (
              <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 flex gap-2 text-[#ff6b6b] text-[13px]">
                <span>🔴</span>
                <span><strong>Atenção:</strong> O robots.txt atual contém <code className="bg-[#1a0808] px-1 rounded">Disallow: /</code> com <code className="bg-[#1a0808] px-1 rounded">User-agent: *</code> — isso bloqueia <strong>todo o rastreamento</strong> do site.</span>
              </div>
            )}

            {/* Templates */}
            <div>
              <p className="text-[#7a9ab5] text-[12px] font-semibold uppercase tracking-[0.5px] mb-2">Templates prontos</p>
              <div className="flex gap-2 flex-wrap">
                <button type="button"
                  onClick={() => set("seo.robots_txt", ROBOTS_TEMPLATES.producao(canonBase))}
                  className="h-[32px] px-3 bg-[#0f381f] border border-[#22c55e]/30 text-[#22c55e] text-[12px] rounded-[6px] hover:bg-[#164d28] transition-colors">
                  Produção
                </button>
                <button type="button"
                  onClick={() => set("seo.robots_txt", ROBOTS_TEMPLATES.staging)}
                  className="h-[32px] px-3 bg-[#141d2c] border border-[#526888]/40 text-[#526888] text-[12px] rounded-[6px] hover:border-zinc-500 transition-colors">
                  Staging
                </button>
                <button type="button"
                  onClick={() => set("seo.robots_txt", ROBOTS_TEMPLATES.dev)}
                  className="h-[32px] px-3 bg-[#1a0808] border border-[#ff1f1f]/30 text-[#ff6b6b] text-[12px] rounded-[6px] hover:bg-[#260a0a] transition-colors">
                  Desenvolvimento
                </button>
                {robotsTxt && (
                  <button type="button" onClick={() => set("seo.robots_txt", "")}
                    className="h-[32px] px-3 bg-[#141d2c] border border-[#1c2a3e] text-[#526888] text-[12px] rounded-[6px] hover:border-zinc-500 transition-colors">
                    Limpar (usar padrão)
                  </button>
                )}
              </div>
            </div>

            {/* Editor */}
            <div>
              <label className={labelCls}>
                Conteúdo do robots.txt
                {!robotsTxt && <span className="ml-2 font-normal text-[#526888]">(usando padrão gerado automaticamente)</span>}
              </label>
              <textarea
                value={values["seo.robots_txt"]}
                onChange={e => set("seo.robots_txt", e.target.value)}
                rows={14}
                placeholder={`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${canonBase}/sitemap.xml`}
                spellCheck={false}
                className={areaCls + " font-mono text-[13px]"}
              />
              <p className="text-[#526888] text-[11px] mt-1">
                Cole apenas o conteúdo — sem declaração XML. Deixe vazio para usar o padrão gerado pelas configurações de indexação.{" "}
                <a href="/robots.txt" target="_blank" rel="noopener" className="text-[#7a9ab5] hover:text-white transition-colors">Ver /robots.txt atual →</a>
              </p>
            </div>

            {/* Preview somente se houver conteúdo */}
            {robotsTxt && (
              <div className="bg-[#070a12] border border-[#1c2a3e] rounded-[8px] p-4">
                <p className="text-[#526888] text-[11px] uppercase tracking-[0.5px] font-semibold mb-2">Preview — /robots.txt</p>
                <pre className="text-[#22c55e] text-[12px] font-mono whitespace-pre-wrap leading-relaxed">{robotsTxt}</pre>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Salvar */}
      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1 mt-6">
        <button type="submit" disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors">
          {saving ? "Salvando..." : "Salvar SEO"}
        </button>
        {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo com sucesso!</p>}
      </div>
    </form>
  );
}
