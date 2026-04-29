"use client";

import { useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";

/* ── Shared styles ── */
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const sectionTitle = "text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4";

/* ── Color picker row ── */
function ColorRow({
  label, description, value, onChange,
}: { label: string; description?: string; value: string; onChange: (v: string) => void; }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#141d2c] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[#d4d4da] text-[13px] font-semibold">{label}</p>
        {description && <p className="text-[#526888] text-[11px] mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-[36px] h-[36px] rounded-[6px] border border-[#1c2a3e] cursor-pointer bg-[#141d2c] p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[36px] px-2.5 text-[13px] text-[#d4d4da] font-mono w-[100px] focus:outline-none focus:border-[#ff1f1f]"
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  );
}

/* ── Font options ── */
const FONTS = [
  { key: "barlow",     label: "Barlow Condensed", style: "'Barlow Condensed', sans-serif",    tag: "Padrão · Impactante" },
  { key: "oswald",     label: "Oswald",           style: "'Oswald', sans-serif",              tag: "Compacto · Moderno" },
  { key: "bebas",      label: "Bebas Neue",        style: "'Bebas Neue', sans-serif",          tag: "Impacto · Display" },
  { key: "montserrat", label: "Montserrat",        style: "'Montserrat', sans-serif",          tag: "Elegante · Versátil" },
  { key: "playfair",   label: "Playfair Display",  style: "'Playfair Display', serif",         tag: "Editorial · Clássico" },
];

type Tab = "logos" | "cores" | "tipografia";

interface Props { cfg: Record<string, string>; }

export default function DesignForm({ cfg }: Props) {
  const [tab, setTab] = useState<Tab>("logos");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ── Logo states ── */
  const [logoDark,  setLogoDark]  = useState(cfg["brand.logo_dark"]  || "");
  const [logoLight, setLogoLight] = useState(cfg["brand.logo_light"] || "");
  const [favicon,   setFavicon]   = useState(cfg["brand.favicon"]    || "");

  /* ── Brand colors ── */
  const [colorPrimary, setColorPrimary] = useState(cfg["brand.color_primary"] || "#ff1f1f");
  const [colorHover,   setColorHover]   = useState(cfg["brand.color_hover"]   || "#cc0000");

  /* ── Dark palette ── */
  const [dkBgBase,       setDkBgBase]       = useState(cfg["brand.dark.bg_base"]      || "#070a12");
  const [dkBgCard,       setDkBgCard]       = useState(cfg["brand.dark.bg_card"]      || "#0e1520");
  const [dkBgElevated,   setDkBgElevated]   = useState(cfg["brand.dark.bg_elevated"]  || "#141d2c");
  const [dkBorder,       setDkBorder]       = useState(cfg["brand.dark.border"]       || "#141d2c");
  const [dkBorderMid,    setDkBorderMid]    = useState(cfg["brand.dark.border_mid"]   || "#1c2a3e");
  const [dkText,         setDkText]         = useState(cfg["brand.dark.text"]         || "#d4d4da");
  const [dkTextHeading,  setDkTextHeading]  = useState(cfg["brand.dark.text_heading"] || "#dce8ff");
  const [dkTextMuted,    setDkTextMuted]    = useState(cfg["brand.dark.text_muted"]   || "#7a9ab5");
  const [dkTextSubtle,   setDkTextSubtle]   = useState(cfg["brand.dark.text_subtle"]  || "#526888");

  /* ── Light palette ── */
  const [ltBgBase,       setLtBgBase]       = useState(cfg["brand.light.bg_base"]      || "#f1f5f9");
  const [ltBgCard,       setLtBgCard]       = useState(cfg["brand.light.bg_card"]      || "#ffffff");
  const [ltBgElevated,   setLtBgElevated]   = useState(cfg["brand.light.bg_elevated"]  || "#e2e8f0");
  const [ltBorder,       setLtBorder]       = useState(cfg["brand.light.border"]       || "#cbd5e1");
  const [ltBorderMid,    setLtBorderMid]    = useState(cfg["brand.light.border_mid"]   || "#94a3b8");
  const [ltText,         setLtText]         = useState(cfg["brand.light.text"]         || "#334155");
  const [ltTextHeading,  setLtTextHeading]  = useState(cfg["brand.light.text_heading"] || "#1e293b");
  const [ltTextMuted,    setLtTextMuted]    = useState(cfg["brand.light.text_muted"]   || "#475569");
  const [ltTextSubtle,   setLtTextSubtle]   = useState(cfg["brand.light.text_subtle"]  || "#64748b");

  /* ── Typography ── */
  const [fontHeading, setFontHeading] = useState(cfg["brand.font_heading"] || "barlow");

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const payload: Record<string, string> = {
      "brand.logo_dark":            logoDark,
      "brand.logo_light":           logoLight,
      "brand.favicon":              favicon,
      "brand.color_primary":        colorPrimary,
      "brand.color_hover":          colorHover,
      "brand.dark.bg_base":         dkBgBase,
      "brand.dark.bg_card":         dkBgCard,
      "brand.dark.bg_elevated":     dkBgElevated,
      "brand.dark.border":          dkBorder,
      "brand.dark.border_mid":      dkBorderMid,
      "brand.dark.text":            dkText,
      "brand.dark.text_heading":    dkTextHeading,
      "brand.dark.text_muted":      dkTextMuted,
      "brand.dark.text_subtle":     dkTextSubtle,
      "brand.light.bg_base":        ltBgBase,
      "brand.light.bg_card":        ltBgCard,
      "brand.light.bg_elevated":    ltBgElevated,
      "brand.light.border":         ltBorder,
      "brand.light.border_mid":     ltBorderMid,
      "brand.light.text":           ltText,
      "brand.light.text_heading":   ltTextHeading,
      "brand.light.text_muted":     ltTextMuted,
      "brand.light.text_subtle":    ltTextSubtle,
      "brand.font_heading":         fontHeading,
    };
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "logos",      label: "Logotipos" },
    { id: "cores",      label: "Cores" },
    { id: "tipografia", label: "Tipografia" },
  ];

  return (
    <div className="max-w-[820px]">
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-[#141d2c] mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-[#ff1f1f] text-white"
                : "border-transparent text-[#7a9ab5] hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── LOGOS TAB ── */}
      {tab === "logos" && (
        <div className="flex flex-col gap-8">
          <div>
            <p className={sectionTitle}>Logo — Tema Escuro</p>
            <p className="text-[#526888] text-[12px] mb-4">Exibido quando o site está no modo escuro. Recomendado: PNG com fundo transparente, versão clara do logotipo.</p>
            <ImageUpload
              folder="brand"
              filename="logo-dark"
              defaultUrl={logoDark}
              inputName="_logoDark"
              aspectHint="Proporção livre — altura recomendada: 52–80px"
              onUrlChange={setLogoDark}
            />
          </div>
          <div>
            <p className={sectionTitle}>Logo — Tema Claro</p>
            <p className="text-[#526888] text-[12px] mb-4">Exibido quando o site está no modo claro. Versão escura do logotipo para fundo branco/claro.</p>
            <ImageUpload
              folder="brand"
              filename="logo-light"
              defaultUrl={logoLight}
              inputName="_logoLight"
              aspectHint="Proporção livre — altura recomendada: 52–80px"
              onUrlChange={setLogoLight}
            />
          </div>
          <div>
            <p className={sectionTitle}>Favicon</p>
            <p className="text-[#526888] text-[12px] mb-4">Ícone exibido na aba do navegador. Tamanho recomendado: 32×32px ou 64×64px, formato PNG ou ICO.</p>
            <ImageUpload
              folder="brand"
              filename="favicon"
              defaultUrl={favicon}
              inputName="_favicon"
              aspectHint="Quadrado — 32×32px ou 64×64px"
              onUrlChange={setFavicon}
            />
          </div>
        </div>
      )}

      {/* ── CORES TAB ── */}
      {tab === "cores" && (
        <div className="flex flex-col gap-8">
          {/* Brand */}
          <div>
            <p className={sectionTitle}>Marca</p>
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] px-5 py-1">
              <ColorRow label="Cor principal" description="Botões, ícones, destaques — a cor mais visível da marca" value={colorPrimary} onChange={setColorPrimary} />
              <ColorRow label="Cor hover / secundária" description="Variante mais escura usada em estados de hover e gradientes" value={colorHover} onChange={setColorHover} />
            </div>
          </div>

          {/* Dark palette */}
          <div>
            <p className={sectionTitle}>Paleta — Tema Escuro</p>
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] px-5 py-1">
              <ColorRow label="Fundo base"       description="Cor de fundo principal da página"         value={dkBgBase}      onChange={setDkBgBase} />
              <ColorRow label="Fundo card"        description="Cards, painéis, caixas de conteúdo"      value={dkBgCard}      onChange={setDkBgCard} />
              <ColorRow label="Fundo elevado"     description="Elementos levemente acima do card"       value={dkBgElevated}  onChange={setDkBgElevated} />
              <ColorRow label="Borda sutil"       description="Divisórias e bordas de cards"            value={dkBorder}      onChange={setDkBorder} />
              <ColorRow label="Borda média"       description="Inputs, bordas de destaque leve"         value={dkBorderMid}   onChange={setDkBorderMid} />
              <ColorRow label="Texto principal"   description="Corpo de texto, labels"                  value={dkText}        onChange={setDkText} />
              <ColorRow label="Texto título"      description="Headings e títulos de página"            value={dkTextHeading} onChange={setDkTextHeading} />
              <ColorRow label="Texto suave"       description="Subtítulos, textos secundários"          value={dkTextMuted}   onChange={setDkTextMuted} />
              <ColorRow label="Texto sutil"       description="Metadados, timestamps, notas"            value={dkTextSubtle}  onChange={setDkTextSubtle} />
            </div>
          </div>

          {/* Light palette */}
          <div>
            <p className={sectionTitle}>Paleta — Tema Claro</p>
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] px-5 py-1">
              <ColorRow label="Fundo base"       description="Cor de fundo principal da página"         value={ltBgBase}      onChange={setLtBgBase} />
              <ColorRow label="Fundo card"        description="Cards, painéis, caixas de conteúdo"      value={ltBgCard}      onChange={setLtBgCard} />
              <ColorRow label="Fundo elevado"     description="Elementos levemente acima do card"       value={ltBgElevated}  onChange={setLtBgElevated} />
              <ColorRow label="Borda sutil"       description="Divisórias e bordas de cards"            value={ltBorder}      onChange={setLtBorder} />
              <ColorRow label="Borda média"       description="Inputs, bordas de destaque leve"         value={ltBorderMid}   onChange={setLtBorderMid} />
              <ColorRow label="Texto principal"   description="Corpo de texto, labels"                  value={ltText}        onChange={setLtText} />
              <ColorRow label="Texto título"      description="Headings e títulos de página"            value={ltTextHeading} onChange={setLtTextHeading} />
              <ColorRow label="Texto suave"       description="Subtítulos, textos secundários"          value={ltTextMuted}   onChange={setLtTextMuted} />
              <ColorRow label="Texto sutil"       description="Metadados, timestamps, notas"            value={ltTextSubtle}  onChange={setLtTextSubtle} />
            </div>
          </div>
        </div>
      )}

      {/* ── TIPOGRAFIA TAB ── */}
      {tab === "tipografia" && (
        <div className="flex flex-col gap-6">
          <div>
            <p className={sectionTitle}>Fonte dos Títulos</p>
            <p className="text-[#526888] text-[12px] mb-5">Usada em todos os headings, títulos de seção e números de destaque do site.</p>
            <div className="flex flex-col gap-3">
              {FONTS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFontHeading(f.key)}
                  className={`flex items-center gap-4 p-4 rounded-[10px] border transition-colors text-left ${
                    fontHeading === f.key
                      ? "border-[#ff1f1f] bg-[#1a0a0a]"
                      : "border-[#141d2c] bg-[#0e1520] hover:border-[#1c2a3e]"
                  }`}
                >
                  <div className={`w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center ${
                    fontHeading === f.key ? "border-[#ff1f1f]" : "border-[#1c2a3e]"
                  }`}>
                    {fontHeading === f.key && <div className="w-[8px] h-[8px] rounded-full bg-[#ff1f1f]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: f.style }} className="text-white text-[28px] leading-none mb-1">
                      {f.label}
                    </p>
                    <p className="text-[#526888] text-[11px]">{f.tag}</p>
                  </div>
                  <p style={{ fontFamily: f.style }} className="text-[#7a9ab5] text-[20px] shrink-0 hidden sm:block">
                    Aa 123
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
            <p className="text-[#526888] text-[11px] font-semibold uppercase tracking-[1px] mb-3">Preview</p>
            <p style={{ fontFamily: FONTS.find(f => f.key === fontHeading)?.style }} className="text-white text-[48px] leading-none mb-2">
              Laúgo Arms Brasil
            </p>
            <p style={{ fontFamily: FONTS.find(f => f.key === fontHeading)?.style }} className="text-[#7a9ab5] text-[24px] leading-none">
              Edição 207 — Especial
            </p>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#141d2c]">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors"
        >
          {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar Design System"}
        </button>
        <p className="text-[#526888] text-[12px]">
          As alterações são aplicadas em todo o site em até 60 segundos.
        </p>
      </div>
    </div>
  );
}
