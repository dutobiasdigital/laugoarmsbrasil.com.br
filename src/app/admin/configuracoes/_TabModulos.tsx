"use client";

import { useState } from "react";
import { saveSettings, inputCls, labelCls, areaCls } from "./_ConfiguracoesClient";

interface Props { settings: Record<string, string>; }

const SUB_TABS = [
  { id: "revistas",  label: "Revistas / Publicações" },
  { id: "blog",      label: "Blog" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "guia",      label: "Guia Comercial" },
];

/* ── Toggle checkbox ──────────────────────────────────────────── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-[44px] h-[24px] rounded-full transition-colors ${checked ? "bg-[#ff1f1f]" : "bg-[#1c2a3e]"}`}
      >
        <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-transform ${checked ? "translate-x-[23px]" : "translate-x-[3px]"}`} />
      </div>
      <span className="text-[#d4d4da] text-[13px]">{label}</span>
    </label>
  );
}

/* ── Caixa de paginação genérica ─────────────────────────────── */
function PaginacaoCard({
  title,
  keyQtd,
  keyScroll,
  defaultQtd,
  labelQtd,
  values,
  set,
}: {
  title: string;
  keyQtd: string;
  keyScroll: string;
  defaultQtd: string;
  labelQtd: string;
  values: Record<string, string>;
  set: (k: string, v: string) => void;
}) {
  return (
    <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
      <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
          <label className={labelCls}>{labelQtd}</label>
          <input
            type="number"
            min="1"
            max="200"
            value={values[keyQtd] || defaultQtd}
            onChange={(e) => set(keyQtd, e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="pb-1">
          <Toggle
            checked={values[keyScroll] === "true"}
            onChange={(v) => set(keyScroll, v ? "true" : "false")}
            label="Scroll infinito"
          />
          <p className="text-[#526888] text-[11px] mt-1.5">
            {values[keyScroll] === "true"
              ? "Itens carregados automaticamente ao rolar a página."
              : "Paginação tradicional por botões/números."}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Revistas / Publicações ──────────────────────────────────── */
function TabRevistas({ settings }: Props) {
  const KEYS = ["modulos.revistas.edicoes_por_pagina", "modulos.revistas.scroll_infinito"];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of KEYS) init[k] = settings[k] ?? "";
    if (!init["modulos.revistas.edicoes_por_pagina"]) init["modulos.revistas.edicoes_por_pagina"] = "24";
    if (!init["modulos.revistas.scroll_infinito"])    init["modulos.revistas.scroll_infinito"]    = "false";
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);
  function set(k: string, v: string) { setValues((p) => ({ ...p, [k]: v })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const r = await saveSettings(values);
    if (r.error) setError(r.error); else setSaved(true);
    setSaving(false);
    if (r.ok) setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">Revistas / Publicações</h2>
        <p className="text-[#526888] text-[13px]">Configurações de exibição das edições da revista.</p>
      </div>
      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>}
      <PaginacaoCard
        title="📚 Edições"
        keyQtd="modulos.revistas.edicoes_por_pagina"
        keyScroll="modulos.revistas.scroll_infinito"
        defaultQtd="24"
        labelQtd="Edições por página"
        values={values}
        set={set}
      />
      <SaveBar saving={saving} saved={saved} label="Salvar Revistas" />
    </form>
  );
}

/* ── Blog ────────────────────────────────────────────────────── */
function TabBlog({ settings }: Props) {
  const KEYS = ["modulos.blog.artigos_por_pagina", "modulos.blog.scroll_infinito"];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of KEYS) init[k] = settings[k] ?? "";
    if (!init["modulos.blog.artigos_por_pagina"]) init["modulos.blog.artigos_por_pagina"] = "12";
    if (!init["modulos.blog.scroll_infinito"])    init["modulos.blog.scroll_infinito"]    = "false";
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);
  function set(k: string, v: string) { setValues((p) => ({ ...p, [k]: v })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const r = await saveSettings(values);
    if (r.error) setError(r.error); else setSaved(true);
    setSaving(false);
    if (r.ok) setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">Blog</h2>
        <p className="text-[#526888] text-[13px]">Configurações de exibição dos artigos do blog.</p>
      </div>
      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>}
      <PaginacaoCard
        title="📝 Artigos"
        keyQtd="modulos.blog.artigos_por_pagina"
        keyScroll="modulos.blog.scroll_infinito"
        defaultQtd="12"
        labelQtd="Artigos por página"
        values={values}
        set={set}
      />
      <SaveBar saving={saving} saved={saved} label="Salvar Blog" />
    </form>
  );
}

/* ── E-commerce ──────────────────────────────────────────────── */
function TabEcommerce({ settings }: Props) {
  const KEYS = [
    "modulos.ecommerce.produtos_por_pagina",
    "modulos.ecommerce.scroll_infinito",
    "editorial.artigos_gratuitos",
    "editorial.mensagem_paywall",
  ];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of KEYS) init[k] = settings[k] ?? "";
    if (!init["modulos.ecommerce.produtos_por_pagina"]) init["modulos.ecommerce.produtos_por_pagina"] = "12";
    if (!init["modulos.ecommerce.scroll_infinito"])     init["modulos.ecommerce.scroll_infinito"]     = "false";
    if (!init["editorial.artigos_gratuitos"])           init["editorial.artigos_gratuitos"]           = "0";
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);
  function set(k: string, v: string) { setValues((p) => ({ ...p, [k]: v })); }

  const paywallOn = parseInt(values["editorial.artigos_gratuitos"] ?? "0") > 0;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const r = await saveSettings(values);
    if (r.error) setError(r.error); else setSaved(true);
    setSaving(false);
    if (r.ok) setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">E-commerce</h2>
        <p className="text-[#526888] text-[13px]">Configurações de exibição e monetização da loja virtual.</p>
      </div>
      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>}

      <PaginacaoCard
        title="🛍️ Produtos"
        keyQtd="modulos.ecommerce.produtos_por_pagina"
        keyScroll="modulos.ecommerce.scroll_infinito"
        defaultQtd="12"
        labelQtd="Produtos por página"
        values={values}
        set={set}
      />

      {/* Paywall */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-6 flex flex-col gap-4">
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[18px] pb-2 border-b border-[#141d2c]">🔒 Paywall</h3>
        <div>
          <label className={labelCls}>
            Artigos gratuitos antes do paywall
            <span className="ml-2 text-[#526888] font-normal">(0 = sem paywall — acesso livre)</span>
          </label>
          <input
            value={values["editorial.artigos_gratuitos"]}
            onChange={(e) => set("editorial.artigos_gratuitos", e.target.value)}
            type="number" min="0" max="50"
            className={inputCls}
          />
        </div>
        {paywallOn && (
          <div>
            <label className={labelCls}>Mensagem de paywall</label>
            <textarea
              value={values["editorial.mensagem_paywall"]}
              onChange={(e) => set("editorial.mensagem_paywall", e.target.value)}
              rows={3}
              placeholder="Este conteúdo é exclusivo para assinantes. Assine agora e tenha acesso ilimitado à Revista Magnum."
              className={areaCls}
            />
          </div>
        )}
        {!paywallOn && (
          <p className="text-[#526888] text-[12px] bg-[#141d2c] rounded-[6px] px-3 py-2">
            💡 Paywall desativado. Todos os artigos são acessíveis gratuitamente.
          </p>
        )}
      </section>

      <SaveBar saving={saving} saved={saved} label="Salvar E-commerce" />
    </form>
  );
}

/* ── Guia Comercial ─────────────────────────────────────────── */
function TabGuia({ settings }: Props) {
  const KEYS = ["modulos.guia.anunciantes_por_pagina", "modulos.guia.scroll_infinito"];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of KEYS) init[k] = settings[k] ?? "";
    if (!init["modulos.guia.anunciantes_por_pagina"]) init["modulos.guia.anunciantes_por_pagina"] = "24";
    if (!init["modulos.guia.scroll_infinito"])        init["modulos.guia.scroll_infinito"]        = "false";
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);
  function set(k: string, v: string) { setValues((p) => ({ ...p, [k]: v })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    const r = await saveSettings(values);
    if (r.error) setError(r.error); else setSaved(true);
    setSaving(false);
    if (r.ok) setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px]">
      <div>
        <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[26px] leading-none mb-1">Guia Comercial</h2>
        <p className="text-[#526888] text-[13px]">Configurações de exibição dos anunciantes e empresas do guia.</p>
      </div>
      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 text-[#ff6b6b] text-[13px]">{error}</div>}
      <PaginacaoCard
        title="🗺️ Anunciantes"
        keyQtd="modulos.guia.anunciantes_por_pagina"
        keyScroll="modulos.guia.scroll_infinito"
        defaultQtd="24"
        labelQtd="Anunciantes por página"
        values={values}
        set={set}
      />
      <SaveBar saving={saving} saved={saved} label="Salvar Guia" />
    </form>
  );
}

/* ── Barra de salvar ─────────────────────────────────────────── */
function SaveBar({ saving, saved, label }: { saving: boolean; saved: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur py-3 -mx-1 px-1">
      <button
        type="submit"
        disabled={saving}
        className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors"
      >
        {saving ? "Salvando..." : label}
      </button>
      {saved && <p className="text-[#22c55e] text-[13px] font-medium">✓ Salvo com sucesso!</p>}
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────── */
export default function TabModulos({ settings }: Props) {
  const [sub, setSub] = useState("revistas");

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-tab nav */}
      <div className="flex gap-1 bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-1 flex-wrap">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSub(t.id)}
            className={`flex-1 min-w-[140px] h-[36px] rounded-[8px] text-[13px] font-medium transition-colors ${
              sub === t.id
                ? "bg-[#ff1f1f] text-white"
                : "text-[#7a9ab5] hover:text-white hover:bg-[#141d2c]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === "revistas"  && <TabRevistas  settings={settings} />}
      {sub === "blog"      && <TabBlog      settings={settings} />}
      {sub === "ecommerce" && <TabEcommerce settings={settings} />}
      {sub === "guia"      && <TabGuia      settings={settings} />}
    </div>
  );
}
