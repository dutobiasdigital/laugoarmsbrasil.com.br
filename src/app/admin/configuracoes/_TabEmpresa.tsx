"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls, areaCls, selectCls } from "./_ConfiguracoesClient";
import TabRedes from "./_TabRedes";
import TabFiliais from "./_TabFiliais";

interface Props { settings: Record<string, string>; }

const SUB_TABS = [
  { id: "dados",   label: "Dados da Empresa" },
  { id: "design",  label: "Design System" },
  { id: "filiais", label: "Filiais" },
  { id: "redes",   label: "Redes Sociais" },
];

// Chaves que vêm do Supabase e serão salvas de volta
const KEYS = [
  // Identidade pública (compartilhadas com SEO)
  "site.name", "site.tagline", "site.domain",
  // Dados legais
  "empresa.razao_social", "empresa.cnpj",
  // Endereço
  "empresa.endereco", "empresa.cidade", "empresa.estado", "empresa.cep",
  // Contato
  "empresa.telefone", "empresa.email_geral", "empresa.email_comercial",
  "empresa.email_suporte", "empresa.horario_atendimento",
  // SEO da empresa
  "site.description", "site.keywords",
  // Legal
  "empresa.copyright",
];

const TIMEZONES = [
  "America/Sao_Paulo", "America/Manaus", "America/Belem",
  "America/Fortaleza", "America/Recife", "America/Cuiaba",
  "America/Porto_Velho", "America/Boa_Vista", "America/Noronha",
];

export default function TabEmpresa({ settings }: Props) {
  const [sub, setSub] = useState("dados");

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

      {sub === "dados"   && <TabDados   settings={settings} />}
      {sub === "design"  && <TabDesign  settings={settings} />}
      {sub === "filiais" && <TabFiliais />}
      {sub === "redes"   && <TabRedes   settings={settings} />}
    </div>
  );
}

/* ── Sub-componente: Dados da Empresa ──────────────────────────────── */
function TabDados({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of KEYS) init[k] = settings[k] ?? "";
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

  const descLen = values["site.description"]?.length ?? 0;
  const descOk  = descLen >= 120 && descLen <= 160;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-[720px]">
      <div>
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] leading-none mb-1">
          Dados da Empresa
        </h3>
        <p className="text-[#526888] text-[13px]">
          Identidade, localização, contato, SEO e textos institucionais.
        </p>
      </div>

      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}

      {/* Identidade */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h4 className="font-['Barlow_Condensed'] font-bold text-white text-[16px] pb-2 border-b border-[#141d2c]">
          🪪 Identidade
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nome do Site / Marca</label>
            <input
              value={values["site.name"]}
              onChange={(e) => set("site.name", e.target.value)}
              placeholder="Revista Magnum"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Slogan / Tagline</label>
            <input
              value={values["site.tagline"]}
              onChange={(e) => set("site.tagline", e.target.value)}
              placeholder="O Mundo das Armas em Suas Mãos"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Domínio (URL canônica)</label>
          <input
            value={values["site.domain"]}
            onChange={(e) => set("site.domain", e.target.value)}
            placeholder="https://www.revistamagnum.com.br"
            type="url"
            className={inputCls}
          />
          <p className="text-[#526888] text-[11px] mt-1">
            Sem barra no final. Usado em canonical URLs e sitemaps.
          </p>
        </div>
      </section>

      {/* Dados Legais */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h4 className="font-['Barlow_Condensed'] font-bold text-white text-[16px] pb-2 border-b border-[#141d2c]">
          📋 Dados Legais
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Razão Social</label>
            <input
              value={values["empresa.razao_social"]}
              onChange={(e) => set("empresa.razao_social", e.target.value)}
              placeholder="Editora Magnum Ltda"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>CNPJ</label>
            <input
              value={values["empresa.cnpj"]}
              onChange={(e) => set("empresa.cnpj", e.target.value)}
              placeholder="00.000.000/0000-00"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Endereço Sede */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h4 className="font-['Barlow_Condensed'] font-bold text-white text-[16px] pb-2 border-b border-[#141d2c]">
          📍 Endereço — Sede
        </h4>
        <div>
          <label className={labelCls}>Logradouro</label>
          <input
            value={values["empresa.endereco"]}
            onChange={(e) => set("empresa.endereco", e.target.value)}
            placeholder="Av. Paulista, 1000 — sala 101"
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Cidade</label>
            <input
              value={values["empresa.cidade"]}
              onChange={(e) => set("empresa.cidade", e.target.value)}
              placeholder="São Paulo"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Estado</label>
            <select
              value={values["empresa.estado"]}
              onChange={(e) => set("empresa.estado", e.target.value)}
              className={selectCls}
            >
              <option value="">UF</option>
              {["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"].map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>CEP</label>
            <input
              value={values["empresa.cep"]}
              onChange={(e) => set("empresa.cep", e.target.value)}
              placeholder="01310-100"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h4 className="font-['Barlow_Condensed'] font-bold text-white text-[16px] pb-2 border-b border-[#141d2c]">
          📞 Contato
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Telefone Principal</label>
            <input
              value={values["empresa.telefone"]}
              onChange={(e) => set("empresa.telefone", e.target.value)}
              placeholder="(11) 3333-4444"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Horário de Atendimento</label>
            <input
              value={values["empresa.horario_atendimento"]}
              onChange={(e) => set("empresa.horario_atendimento", e.target.value)}
              placeholder="Seg–Sex, 9h às 18h"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>E-mail Geral</label>
            <input
              value={values["empresa.email_geral"]}
              onChange={(e) => set("empresa.email_geral", e.target.value)}
              type="email"
              placeholder="contato@revistamagnum.com.br"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>E-mail Comercial / Publicidade</label>
            <input
              value={values["empresa.email_comercial"]}
              onChange={(e) => set("empresa.email_comercial", e.target.value)}
              type="email"
              placeholder="publicidade@revistamagnum.com.br"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>E-mail de Suporte ao Assinante</label>
            <input
              value={values["empresa.email_suporte"]}
              onChange={(e) => set("empresa.email_suporte", e.target.value)}
              type="email"
              placeholder="suporte@revistamagnum.com.br"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* SEO da empresa */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h4 className="font-['Barlow_Condensed'] font-bold text-white text-[16px] pb-2 border-b border-[#141d2c]">
          🌐 SEO — Descrição e Palavras-chave
        </h4>

        <div>
          <label className={labelCls}>
            Meta description padrão
            <span className={`ml-2 font-normal ${descOk ? "text-[#22c55e]" : "text-[#526888]"}`}>
              {descLen}/160{" "}
              {descOk ? "✓ ideal" : descLen < 120 ? "(mín. 120)" : "(máx. 160)"}
            </span>
          </label>
          <textarea
            value={values["site.description"]}
            onChange={(e) => set("site.description", e.target.value)}
            rows={3}
            placeholder="O maior acervo de publicações especializadas em armas, munições e legislação do Brasil."
            className={areaCls}
          />
        </div>

        <div>
          <label className={labelCls}>Palavras-chave (separadas por vírgula)</label>
          <input
            value={values["site.keywords"]}
            onChange={(e) => set("site.keywords", e.target.value)}
            placeholder="revista de armas, tiro esportivo, CAC, munições, legislação"
            className={inputCls}
          />
          <p className="text-[#526888] text-[11px] mt-1">
            Adicione ou remova termos separados por vírgula.
          </p>
        </div>
      </section>

      {/* Copyright */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h4 className="font-['Barlow_Condensed'] font-bold text-white text-[16px] pb-2 border-b border-[#141d2c]">
          ⚖️ Textos Legais
        </h4>
        <div>
          <label className={labelCls}>Texto de Copyright (rodapé)</label>
          <textarea
            value={values["empresa.copyright"]}
            onChange={(e) => set("empresa.copyright", e.target.value)}
            rows={2}
            placeholder={`© ${new Date().getFullYear()} Revista Magnum. Todos os direitos reservados.`}
            className={areaCls}
          />
        </div>
      </section>

      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors"
        >
          {saving ? "Salvando..." : "Salvar Empresa"}
        </button>
        {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo com sucesso!</p>}
      </div>
    </form>
  );
}

/* ── Sub-componente: Design System ─────────────────────────────── */

/** Keys que o layout.tsx realmente lê para montar as CSS vars */
const DESIGN_KEYS = [
  // Logotipos
  "site.logo_url", "site.logo_dark_url", "site.favicon_url",
  // Marca
  "brand.color_primary", "brand.color_hover",
  // Tipografia
  "brand.font_heading",
  // Dark palette
  "brand.dark.bg_base", "brand.dark.bg_subtle", "brand.dark.bg_card",
  "brand.dark.bg_elevated", "brand.dark.border", "brand.dark.border_mid",
  "brand.dark.text", "brand.dark.text_heading", "brand.dark.text_muted", "brand.dark.text_subtle",
  // Light palette
  "brand.light.bg_base", "brand.light.bg_subtle", "brand.light.bg_card",
  "brand.light.bg_elevated", "brand.light.border", "brand.light.border_mid",
  "brand.light.text", "brand.light.text_heading", "brand.light.text_muted", "brand.light.text_subtle",
];

const DEFAULTS: Record<string, string> = {
  "brand.color_primary":      "#ff1f1f",
  "brand.color_hover":        "#cc0000",
  "brand.font_heading":       "barlow",
  "brand.dark.bg_base":       "#070a12",
  "brand.dark.bg_subtle":     "#0a0f1a",
  "brand.dark.bg_card":       "#0e1520",
  "brand.dark.bg_elevated":   "#141d2c",
  "brand.dark.border":        "#141d2c",
  "brand.dark.border_mid":    "#1c2a3e",
  "brand.dark.text":          "#d4d4da",
  "brand.dark.text_heading":  "#dce8ff",
  "brand.dark.text_muted":    "#7a9ab5",
  "brand.dark.text_subtle":   "#526888",
  "brand.light.bg_base":      "#f1f5f9",
  "brand.light.bg_subtle":    "#f8fafc",
  "brand.light.bg_card":      "#ffffff",
  "brand.light.bg_elevated":  "#e2e8f0",
  "brand.light.border":       "#cbd5e1",
  "brand.light.border_mid":   "#94a3b8",
  "brand.light.text":         "#334155",
  "brand.light.text_heading": "#1e293b",
  "brand.light.text_muted":   "#475569",
  "brand.light.text_subtle":  "#64748b",
};

const FONT_OPTIONS = [
  { value: "barlow",     label: "Barlow Condensed",  sample: "font-['Barlow_Condensed']" },
  { value: "oswald",     label: "Oswald",             sample: "font-['Oswald']" },
  { value: "bebas",      label: "Bebas Neue",         sample: "font-['Bebas_Neue']" },
  { value: "montserrat", label: "Montserrat",         sample: "font-['Montserrat']" },
  { value: "playfair",   label: "Playfair Display",   sample: "font-['Playfair_Display']" },
];

function ColorRow({
  k, label, hint, values, set,
}: { k: string; label: string; hint?: string; values: Record<string, string>; set: (k: string, v: string) => void }) {
  const val = values[k] || DEFAULTS[k] || "#000000";
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={val}
          onChange={e => set(k, e.target.value)}
          className="w-[40px] h-[40px] rounded-[6px] border border-[#1c2a3e] bg-transparent cursor-pointer p-0.5 shrink-0"
        />
        <input
          type="text"
          value={val}
          onChange={e => set(k, e.target.value)}
          maxLength={9}
          className="bg-[#070a12] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[13px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] flex-1 font-mono transition-colors"
        />
        <div
          className="w-[40px] h-[40px] rounded-[6px] border border-[#1c2a3e] shrink-0"
          style={{ background: val }}
        />
      </div>
      {hint && <p className="text-[#526888] text-[11px] mt-1">{hint}</p>}
    </div>
  );
}

function TabDesign({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of DESIGN_KEYS) init[k] = settings[k] ?? DEFAULTS[k] ?? "";
    return init;
  });
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);
  const [error,  setError]    = useState<string | null>(null);
  const [mode,   setMode]     = useState<"dark" | "light">("dark");

  function set(k: string, v: string) { setValues((p) => ({ ...p, [k]: v })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const r = await saveSettings(values);
    if (r.error) setError(r.error); else setSaved(true);
    setSaving(false);
    if (r.ok) setTimeout(() => setSaved(false), 3000);
  }

  const fontLabel = FONT_OPTIONS.find(f => f.value === values["brand.font_heading"])?.label ?? "Barlow Condensed";
  const fontClass = FONT_OPTIONS.find(f => f.value === values["brand.font_heading"])?.sample ?? "font-['Barlow_Condensed']";

  const prefix = `brand.${mode}`;
  const bgBase     = values[`${prefix}.bg_base`]      || DEFAULTS[`${prefix}.bg_base`];
  const bgCard     = values[`${prefix}.bg_card`]      || DEFAULTS[`${prefix}.bg_card`];
  const bgElevated = values[`${prefix}.bg_elevated`]  || DEFAULTS[`${prefix}.bg_elevated`];
  const borderMid  = values[`${prefix}.border_mid`]   || DEFAULTS[`${prefix}.border_mid`];
  const textHead   = values[`${prefix}.text_heading`] || DEFAULTS[`${prefix}.text_heading`];
  const textMuted  = values[`${prefix}.text_muted`]   || DEFAULTS[`${prefix}.text_muted`];
  const brand      = values["brand.color_primary"]    || DEFAULTS["brand.color_primary"];

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-[780px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">Design System</h2>
        <p className="text-[#526888] text-[13px]">
          Todas as cores e tipografia aplicadas em tempo real ao site via CSS vars do <code className="text-[#7a9ab5]">layout.tsx</code>.
        </p>
      </div>

      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>
      )}

      {/* ── Logotipos ─────────────────────────────────── */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🖼️ Logotipos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Logo (fundo escuro — padrão)</label>
            <input value={values["site.logo_url"] ?? ""} onChange={e => set("site.logo_url", e.target.value)}
              type="url" placeholder="https://..." className={inputCls} />
            {values["site.logo_url"] && (
              <div className="mt-2 bg-[#070a12] rounded-[6px] p-3 flex items-center justify-center h-[60px] border border-[#141d2c]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={values["site.logo_url"]} alt="Logo preview" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>
          <div>
            <label className={labelCls}>Logo (fundo claro)</label>
            <input value={values["site.logo_dark_url"] ?? ""} onChange={e => set("site.logo_dark_url", e.target.value)}
              type="url" placeholder="https://..." className={inputCls} />
            {values["site.logo_dark_url"] && (
              <div className="mt-2 bg-white rounded-[6px] p-3 flex items-center justify-center h-[60px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={values["site.logo_dark_url"]} alt="Logo light preview" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>
        </div>
        <div className="max-w-[280px]">
          <label className={labelCls}>Favicon (URL)</label>
          <input value={values["site.favicon_url"] ?? ""} onChange={e => set("site.favicon_url", e.target.value)}
            type="url" placeholder="https://.../favicon.ico" className={inputCls} />
        </div>
      </section>

      {/* ── Cores da Marca ────────────────────────────── */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">
          🎨 Cor da Marca
          <span className="ml-2 text-[#526888] text-[13px] font-normal">→ <code>--brand</code></span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorRow k="brand.color_primary" label="Cor Primária (--brand)" hint="Botões, links, destaques e todos os elementos brand" values={values} set={set} />
          <ColorRow k="brand.color_hover"   label="Cor Hover (--brand-hover)" hint="Tom mais escuro ao passar o mouse" values={values} set={set} />
        </div>
      </section>

      {/* ── Tipografia ─────────────────────────────────── */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">
          🔤 Tipografia
          <span className="ml-2 text-[#526888] text-[13px] font-normal">→ <code>--font-heading</code></span>
        </h3>
        <div className="max-w-[360px]">
          <label className={labelCls}>Fonte para títulos e headings</label>
          <select
            value={values["brand.font_heading"] || "barlow"}
            onChange={e => set("brand.font_heading", e.target.value)}
            className={selectCls}
          >
            {FONT_OPTIONS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <p className="text-[#526888] text-[11px] mt-1">Todas as fontes já estão carregadas via Google Fonts no layout.</p>
        </div>
        <div className="bg-[#141d2c] rounded-[8px] p-4 flex flex-col gap-2">
          <p className="text-[#526888] text-[11px] font-semibold uppercase tracking-wide">Pré-visualização</p>
          <p className={`${fontClass} font-bold text-white text-[32px] leading-tight`}>
            Revista Magnum — Título H1
          </p>
          <p className={`${fontClass} font-bold text-[#7a9ab5] text-[20px]`}>
            Sub-heading e destaques com {fontLabel}
          </p>
        </div>
      </section>

      {/* ── Paleta de Cores (Dark / Light) ─────────────── */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] overflow-hidden">
        {/* Tabs dark / light */}
        <div className="flex border-b border-[#141d2c]">
          {(["dark", "light"] as const).map(m => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`flex-1 h-[44px] text-[13px] font-semibold transition-colors ${
                mode === m ? "bg-[#141d2c] text-white" : "text-[#526888] hover:text-[#7a9ab5]"
              }`}
            >
              {m === "dark" ? "🌙 Modo Escuro" : "☀️ Modo Claro"}
            </button>
          ))}
        </div>

        <div className="p-6 flex flex-col gap-5">
          <p className="text-[#526888] text-[12px]">
            Todas estas cores são injetadas como CSS vars no <code className="text-[#7a9ab5]">:root</code> {mode === "dark" ? "(padrão)" : "(html.light)"} pelo <code className="text-[#7a9ab5]">layout.tsx</code>.
          </p>

          {/* Fundos */}
          <div>
            <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.8px] mb-3">Fundos</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ColorRow k={`${prefix}.bg_base`}     label="--bg-base"     hint="Fundo da página" values={values} set={set} />
              <ColorRow k={`${prefix}.bg_subtle`}   label="--bg-subtle"   hint="Fundo sutil"    values={values} set={set} />
              <ColorRow k={`${prefix}.bg_card`}     label="--bg-card"     hint="Cards"          values={values} set={set} />
              <ColorRow k={`${prefix}.bg_elevated`} label="--bg-elevated" hint="Elevado/labels" values={values} set={set} />
            </div>
          </div>

          {/* Bordas */}
          <div>
            <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.8px] mb-3">Bordas</p>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 max-w-[360px]">
              <ColorRow k={`${prefix}.border`}     label="--border"     hint="Borda sutil" values={values} set={set} />
              <ColorRow k={`${prefix}.border_mid`} label="--border-mid" hint="Borda média" values={values} set={set} />
            </div>
          </div>

          {/* Textos */}
          <div>
            <p className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.8px] mb-3">Textos</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ColorRow k={`${prefix}.text`}         label="--text-primary" hint="Corpo principal" values={values} set={set} />
              <ColorRow k={`${prefix}.text_heading`} label="--text-heading" hint="Títulos"         values={values} set={set} />
              <ColorRow k={`${prefix}.text_muted`}   label="--text-muted"   hint="Labels/subtítulo" values={values} set={set} />
              <ColorRow k={`${prefix}.text_subtle`}  label="--text-subtle"  hint="Dicas/placeholders" values={values} set={set} />
            </div>
          </div>

          {/* Preview */}
          <div
            className="rounded-[10px] border p-5 flex flex-col gap-3"
            style={{ background: bgBase, borderColor: borderMid }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[1px]" style={{ color: textMuted }}>
              Preview — {mode === "dark" ? "Modo Escuro" : "Modo Claro"}
            </p>
            <div className="rounded-[8px] p-4 flex flex-col gap-2" style={{ background: bgCard, border: `1px solid ${borderMid}` }}>
              <p className={`${fontClass} font-bold text-[22px] leading-none`} style={{ color: textHead }}>
                Título do Card
              </p>
              <p className="text-[13px]" style={{ color: textMuted }}>Texto descritivo do conteúdo do card.</p>
              <button
                type="button"
                className="self-start mt-1 px-4 h-[34px] rounded-[6px] text-white text-[13px] font-semibold"
                style={{ background: brand }}
              >
                Ação Primária
              </button>
            </div>
            <div className="flex gap-3">
              {[bgCard, bgElevated, brand].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-[6px] border" style={{ background: c, borderColor: borderMid }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
        <button type="submit" disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors">
          {saving ? "Salvando..." : "Salvar Design System"}
        </button>
        {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo! Aguarde ~60s para refletir no site.</p>}
      </div>
    </form>
  );
}
