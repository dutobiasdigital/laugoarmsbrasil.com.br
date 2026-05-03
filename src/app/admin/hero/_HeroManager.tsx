"use client";

import { useRef, useState } from "react";

/* ── Types ─────────────────────────────────────────────────── */
export interface HeroConfig {
  heightDesktop: number;
  heightTablet:  number;
  heightMobile:  number;
  autoplayMs:    number;
  animation:     "slide" | "fade" | "slideUp";
}

export interface HeroSlide {
  id: string;
  active: boolean;
  order: number;
  background: { type: "gradient" | "image"; gradient?: string; imageUrl?: string };
  backgroundTablet?: string | null;
  backgroundMobile?: string | null;
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  text?: string;
  button1?: { label: string; href: string } | null;
  button2?: { label: string; href: string } | null;
  photo?: { url: string; layout: "right" | "left" | "overlay" } | null;
}

const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[13px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] transition-colors";

const numberInputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[38px] px-3 text-[13px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] transition-colors w-[90px] text-center";

function generateId() { return Math.random().toString(36).slice(2); }

/* ── Upload button ─────────────────────────────────────────── */
function ImageUploadButton({ folder = "hero", onUploaded }: { folder?: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onUploaded(data.url);
    } catch { /* silent */ }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
      onDrop={(e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file?.type.startsWith("image/")) uploadFile(file);
      }}
      className={`relative shrink-0 rounded-[6px] ${isDragging ? "ring-2 ring-[#ff1f1f]/60" : ""}`}
    >
      {isDragging && (
        <div className="absolute inset-0 rounded-[6px] flex items-center justify-center pointer-events-none z-10 bg-[#0e1520]/80">
          <span className="text-[#ff6b6b] text-[11px] font-semibold">Solte aqui</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`h-[38px] px-3 rounded-[6px] border border-[#1c2a3e] text-[#7a9ab5] hover:text-white hover:border-zinc-500 text-[12px] font-semibold transition-colors disabled:opacity-40 whitespace-nowrap ${isDragging ? "opacity-40" : ""}`}
      >
        {uploading ? "Enviando…" : "↑ Upload"}
      </button>
    </div>
  );
}

/* ── Responsive image field ────────────────────────────────── */
function ResponsiveImgField({
  label, hint, value, onChange, folder,
}: {
  label: string; hint: string;
  value: string | null | undefined;
  onChange: (v: string | null) => void;
  folder: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[#526888] text-[11px] font-semibold">{label}</label>
        <span className="text-[#1c2a3e] text-[10px]">{hint}</span>
      </div>
      <div className="flex gap-2">
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="URL ou ↑ upload (deixe vazio para usar o fundo principal)"
          className={"flex-1 " + inputCls}
        />
        <ImageUploadButton folder={folder} onUploaded={(url) => onChange(url)} />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[#526888] hover:text-[#ff6b6b] text-[18px] px-2"
            aria-label="Remover"
          >×</button>
        )}
      </div>
      {value && (
        <div className="mt-1.5 h-[56px] rounded-[4px] overflow-hidden border border-[#1c2a3e]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────── */
export default function HeroManager({
  initialSlides,
  initialConfig,
}: {
  initialSlides: HeroSlide[];
  initialConfig: HeroConfig;
}) {
  const [slides,     setSlides]     = useState<HeroSlide[]>(initialSlides);
  const [config,     setConfig]     = useState<HeroConfig>(initialConfig);
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState<string | null>(null);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const updateConfig = (partial: Partial<HeroConfig>) =>
    setConfig((prev) => ({ ...prev, ...partial }));

  const defaultSlide = (): HeroSlide => ({
    id: generateId(), active: true, order: slides.length,
    background: { type: "gradient", gradient: "linear-gradient(135deg, #070a12 0%, #0e1520 100%)" },
    title: "Laúgo Arms Brasil", titleHighlight: "", subtitle: "", text: "",
    button1: null, button2: null, photo: null,
  });

  const addSlide   = () => { const s = defaultSlide(); setSlides((p) => [...p, s]); setEditingId(s.id); };
  const removeSlide = (id: string) => { setSlides((p) => p.filter((s) => s.id !== id)); if (editingId === id) setEditingId(null); };
  const updateSlide = (id: string, partial: Partial<HeroSlide>) =>
    setSlides((p) => p.map((s) => (s.id === id ? { ...s, ...partial } : s)));
  const moveUp   = (id: string) => setSlides((p) => { const i = p.findIndex((s) => s.id === id); if (i === 0) return p; const n = [...p]; [n[i-1],n[i]] = [n[i],n[i-1]]; return n; });
  const moveDown = (id: string) => setSlides((p) => { const i = p.findIndex((s) => s.id === id); if (i === p.length-1) return p; const n = [...p]; [n[i],n[i+1]] = [n[i+1],n[i]]; return n; });

  const save = async () => {
    setSaving(true); setSaveMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "hero.slides": JSON.stringify(slides),
          "hero.config": JSON.stringify(config),
        }),
      });
      if (!res.ok) throw new Error();
      setSaveMsg("Salvo com sucesso!");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch {
      setSaveMsg("Erro ao salvar. Tente novamente.");
      setTimeout(() => setSaveMsg(null), 4000);
    } finally { setSaving(false); }
  };

  const ANIMATIONS: { value: HeroConfig["animation"]; label: string }[] = [
    { value: "slide",   label: "Deslizar (horizontal)" },
    { value: "fade",    label: "Fade (dissolve)" },
    { value: "slideUp", label: "Deslizar (vertical)" },
  ];

  return (
    <div>
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={addSlide}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-semibold h-[40px] px-5 flex items-center rounded-[6px] transition-colors gap-2">
          + Adicionar Slide
        </button>
        <button
          onClick={() => setShowConfig((v) => !v)}
          className={`h-[40px] px-4 rounded-[6px] text-[13px] font-semibold border transition-colors ${showConfig ? "border-[#ff1f1f] bg-[#260a0a] text-white" : "border-[#1c2a3e] text-[#7a9ab5] hover:border-zinc-500 hover:text-white"}`}
        >
          ⚙ Configurações
        </button>
        <div className="flex-1" />
        {saveMsg && <span className={`text-[13px] ${saveMsg.startsWith("Erro") ? "text-[#ff6b6b]" : "text-[#22c55e]"}`}>{saveMsg}</span>}
        <button onClick={save} disabled={saving}
          className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-white text-[14px] font-semibold h-[40px] px-5 rounded-[6px] transition-colors disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {/* ── Config panel ── */}
      {showConfig && (
        <div className="bg-[#0e1520] border border-[#1c2a3e] rounded-[10px] p-5 mb-5">
          <p className="text-white text-[14px] font-semibold mb-4">Configurações Globais do Hero</p>

          {/* Heights */}
          <div className="mb-4">
            <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-2">Altura (px)</label>
            <div className="flex flex-wrap gap-4">
              {([
                { key: "heightDesktop", label: "Desktop (≥1024px)" },
                { key: "heightTablet",  label: "Tablet (768–1023px)" },
                { key: "heightMobile",  label: "Mobile (<768px)" },
              ] as const).map(({ key, label }) => (
                <div key={key} className="flex flex-col items-center gap-1.5">
                  <span className="text-[#526888] text-[11px]">{label}</span>
                  <input
                    type="number"
                    min={100}
                    max={1200}
                    value={config[key]}
                    onChange={(e) => updateConfig({ [key]: Math.max(100, parseInt(e.target.value) || 600) })}
                    className={numberInputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Autoplay */}
          <div className="mb-4">
            <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-2">Tempo por slide</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={60}
                value={Math.round(config.autoplayMs / 1000)}
                onChange={(e) => updateConfig({ autoplayMs: Math.max(1, parseInt(e.target.value) || 6) * 1000 })}
                className={numberInputCls}
              />
              <span className="text-[#526888] text-[13px]">segundos</span>
            </div>
          </div>

          {/* Animation */}
          <div>
            <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-2">Animação de transição</label>
            <div className="flex flex-wrap gap-2">
              {ANIMATIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateConfig({ animation: value })}
                  className={`h-[36px] px-4 rounded-[6px] text-[13px] font-semibold border transition-colors ${
                    config.animation === value
                      ? "border-[#ff1f1f] bg-[#260a0a] text-white"
                      : "border-[#1c2a3e] text-[#7a9ab5] hover:border-[#526888]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {slides.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#1c2a3e] rounded-[12px]">
          <p className="text-[#526888] text-[15px] mb-5">Nenhum slide cadastrado.</p>
          <button onClick={addSlide}
            className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[15px] font-semibold h-[44px] px-8 rounded-[6px] transition-colors">
            + Adicionar Primeiro Slide
          </button>
        </div>
      )}

      {/* ── Slides list ── */}
      {slides.map((slide, i) => (
        <div key={slide.id} className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden mb-3">

          {/* Card header */}
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-[#ff1f1f] font-bold text-[16px]">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[14px] font-semibold truncate">
                {slide.title}{slide.titleHighlight ? ` — ${slide.titleHighlight}` : ""}
              </p>
              <p className="text-[#526888] text-[12px]">
                {slide.active ? "Ativo" : "Inativo"} ·{" "}
                {slide.background.type === "gradient" ? "Degradê" : "Imagem"} ·{" "}
                {slide.backgroundTablet ? "📱Tablet " : ""}{slide.backgroundMobile ? "📱Mobile " : ""}
                {slide.photo ? `Foto ${slide.photo.layout}` : "Sem foto"}
              </p>
            </div>
            <button
              onClick={() => updateSlide(slide.id, { active: !slide.active })}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${slide.active ? "bg-[#0f381f] text-[#22c55e]" : "bg-[#141d2c] text-[#526888]"}`}
            >
              {slide.active ? "ATIVO" : "INATIVO"}
            </button>
            <button onClick={() => moveUp(slide.id)} disabled={i === 0} className="text-[#526888] hover:text-white disabled:opacity-20 text-[16px]">↑</button>
            <button onClick={() => moveDown(slide.id)} disabled={i === slides.length - 1} className="text-[#526888] hover:text-white disabled:opacity-20 text-[16px]">↓</button>
            <button
              onClick={() => setEditingId(editingId === slide.id ? null : slide.id)}
              className="text-[#7a9ab5] hover:text-white text-[13px] border border-[#1c2a3e] px-3 py-1 rounded-[4px]"
            >
              {editingId === slide.id ? "Fechar" : "Editar"}
            </button>
            <button onClick={() => removeSlide(slide.id)} className="text-white hover:text-[#ff6b6b] text-[18px] px-1">×</button>
          </div>

          {/* Expanded editor */}
          {editingId === slide.id && (
            <div className="border-t border-[#141d2c] p-5 flex flex-col gap-6">

              {/* Row 1 — Background + Responsive images */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Background */}
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-1.5">Plano de fundo (Desktop)</label>
                    <div className="flex gap-2 mb-3">
                      {(["gradient", "image"] as const).map((t) => (
                        <button key={t}
                          onClick={() => updateSlide(slide.id, { background: { ...slide.background, type: t } })}
                          className={`flex-1 h-[36px] rounded-[6px] text-[13px] font-semibold border transition-colors ${slide.background.type === t ? "border-[#ff1f1f] bg-[#260a0a] text-white" : "border-[#1c2a3e] text-[#7a9ab5] hover:border-[#526888]"}`}
                        >
                          {t === "gradient" ? "Degradê" : "Imagem"}
                        </button>
                      ))}
                    </div>
                    {slide.background.type === "gradient" ? (
                      <div>
                        <label className="block text-[#526888] text-[11px] mb-1">CSS gradient</label>
                        <input
                          value={slide.background.gradient ?? ""}
                          onChange={(e) => updateSlide(slide.id, { background: { ...slide.background, gradient: e.target.value } })}
                          placeholder="linear-gradient(135deg, #070a12 0%, #0e1520 100%)"
                          className={"w-full " + inputCls}
                        />
                        <div className="mt-2 h-[40px] rounded-[6px]" style={{ background: slide.background.gradient ?? "#070a12" }} />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[#526888] text-[11px] mb-1">URL ou upload</label>
                        <div className="flex gap-2">
                          <input
                            value={slide.background.imageUrl ?? ""}
                            onChange={(e) => updateSlide(slide.id, { background: { ...slide.background, imageUrl: e.target.value } })}
                            placeholder="https://..."
                            className={"flex-1 " + inputCls}
                          />
                          <ImageUploadButton folder="hero/backgrounds"
                            onUploaded={(url) => updateSlide(slide.id, { background: { ...slide.background, imageUrl: url } })} />
                        </div>
                        {slide.background.imageUrl && (
                          <div className="mt-2 h-[80px] rounded-[6px] overflow-hidden border border-[#1c2a3e]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={slide.background.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Responsive image overrides */}
                <div className="flex flex-col gap-3">
                  <label className="block text-[#7a9ab5] text-[12px] font-semibold">Imagens por dispositivo (opcional)</label>
                  <p className="text-[#526888] text-[11px] -mt-1">Se não definida, usa o fundo principal acima.</p>
                  <ResponsiveImgField
                    label="Tablet (768–1023 px)"
                    hint="Landscape"
                    value={slide.backgroundTablet}
                    onChange={(v) => updateSlide(slide.id, { backgroundTablet: v })}
                    folder="hero/tablet"
                  />
                  <ResponsiveImgField
                    label="Mobile (< 768 px)"
                    hint="Portrait"
                    value={slide.backgroundMobile}
                    onChange={(v) => updateSlide(slide.id, { backgroundMobile: v })}
                    folder="hero/mobile"
                  />
                </div>
              </div>

              {/* Row 2 — Buttons + Text + Photo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Buttons */}
                <div className="flex flex-col gap-4">
                  {/* Button 1 */}
                  <div>
                    <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-1.5">Botão 1 (opcional)</label>
                    {slide.button1 ? (
                      <div className="flex gap-2">
                        <input value={slide.button1.label}
                          onChange={(e) => updateSlide(slide.id, { button1: { ...(slide.button1 as { label: string; href: string }), label: e.target.value } })}
                          placeholder="Label" className={inputCls + " flex-1"} />
                        <input value={slide.button1.href}
                          onChange={(e) => updateSlide(slide.id, { button1: { ...(slide.button1 as { label: string; href: string }), href: e.target.value } })}
                          placeholder="/link" className={inputCls + " flex-1"} />
                        <button onClick={() => updateSlide(slide.id, { button1: null })} className="text-[#526888] hover:text-[#ff6b6b] text-[18px] px-2">×</button>
                      </div>
                    ) : (
                      <button onClick={() => updateSlide(slide.id, { button1: { label: "Ver produtos", href: "/loja" } })}
                        className="text-[#526888] hover:text-white text-[13px] border border-dashed border-[#1c2a3e] hover:border-[#526888] rounded-[6px] h-[36px] px-4 transition-colors">
                        + Adicionar botão 1
                      </button>
                    )}
                  </div>

                  {/* Button 2 */}
                  <div>
                    <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-1.5">Botão 2 (opcional)</label>
                    {slide.button2 ? (
                      <div className="flex gap-2">
                        <input value={slide.button2.label}
                          onChange={(e) => updateSlide(slide.id, { button2: { ...(slide.button2 as { label: string; href: string }), label: e.target.value } })}
                          placeholder="Label" className={inputCls + " flex-1"} />
                        <input value={slide.button2.href}
                          onChange={(e) => updateSlide(slide.id, { button2: { ...(slide.button2 as { label: string; href: string }), href: e.target.value } })}
                          placeholder="/link" className={inputCls + " flex-1"} />
                        <button onClick={() => updateSlide(slide.id, { button2: null })} className="text-[#526888] hover:text-[#ff6b6b] text-[18px] px-2">×</button>
                      </div>
                    ) : (
                      <button onClick={() => updateSlide(slide.id, { button2: { label: "Saiba mais", href: "/sobre" } })}
                        className="text-[#526888] hover:text-white text-[13px] border border-dashed border-[#1c2a3e] hover:border-[#526888] rounded-[6px] h-[36px] px-4 transition-colors">
                        + Adicionar botão 2
                      </button>
                    )}
                  </div>
                </div>

                {/* Text content */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-1.5">Subtítulo (badge)</label>
                    <input value={slide.subtitle ?? ""} onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                      placeholder="Ex: Novo produto" className={"w-full " + inputCls} />
                  </div>
                  <div>
                    <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-1.5">Título principal</label>
                    <input value={slide.title} onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                      placeholder="Laúgo Arms Brasil" className={"w-full " + inputCls} />
                  </div>
                  <div>
                    <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-1.5">Destaque do título (vermelho)</label>
                    <input value={slide.titleHighlight ?? ""} onChange={(e) => updateSlide(slide.id, { titleHighlight: e.target.value })}
                      placeholder="Ex: Em destaque" className={"w-full " + inputCls} />
                  </div>
                  <div>
                    <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-1.5">Texto descritivo</label>
                    <textarea value={slide.text ?? ""} onChange={(e) => updateSlide(slide.id, { text: e.target.value })}
                      rows={2} placeholder="Breve descrição..."
                      className="w-full bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2 text-[13px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] resize-none" />
                  </div>
                </div>
              </div>

              {/* Row 3 — Photo */}
              <div>
                <label className="block text-[#7a9ab5] text-[12px] font-semibold mb-1.5">Foto lateral (opcional)</label>
                {slide.photo ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input value={slide.photo.url}
                        onChange={(e) => updateSlide(slide.id, { photo: { ...(slide.photo as { url: string; layout: "right" | "left" | "overlay" }), url: e.target.value } })}
                        placeholder="URL da foto" className={inputCls + " flex-1"} />
                      <ImageUploadButton folder="hero/photos"
                        onUploaded={(url) => updateSlide(slide.id, { photo: { ...(slide.photo as { url: string; layout: "right" | "left" | "overlay" }), url } })} />
                      <button onClick={() => updateSlide(slide.id, { photo: null })} className="text-[#526888] hover:text-[#ff6b6b] text-[18px] px-2">×</button>
                    </div>
                    {slide.photo.url && (
                      <div className="h-[80px] w-[60px] rounded-[6px] overflow-hidden border border-[#1c2a3e]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slide.photo.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      {(["right", "left", "overlay"] as const).map((l) => (
                        <button key={l}
                          onClick={() => updateSlide(slide.id, { photo: { ...(slide.photo as { url: string; layout: "right" | "left" | "overlay" }), layout: l } })}
                          className={`flex-1 h-[32px] text-[11px] font-semibold rounded-[4px] border transition-colors ${slide.photo?.layout === l ? "border-[#ff1f1f] bg-[#260a0a] text-white" : "border-[#1c2a3e] text-[#526888] hover:border-[#526888]"}`}
                        >
                          {l === "right" ? "Direita" : l === "left" ? "Esquerda" : "Fundo"}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button onClick={() => updateSlide(slide.id, { photo: { url: "", layout: "right" } })}
                    className="text-[#526888] hover:text-white text-[13px] border border-dashed border-[#1c2a3e] hover:border-[#526888] rounded-[6px] h-[36px] px-4 transition-colors">
                    + Adicionar foto lateral
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      ))}
    </div>
  );
}
