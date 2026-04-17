"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

const SLIDES = [
  {
    label: "207 Edições · Acervo Digital Completo",
    lines: ["O Maior Acervo", "do Brasil."],
    lineColors: ["text-white", "text-[#ff1f1f]"],
    sub: "40 anos de conteúdo técnico reunidos\nnuma só plataforma. Leia quando quiser.",
    cta: { href: "/edicoes", label: "Explorar o Acervo →" },
    ctaSecondary: { href: "/edicoes?tipo=SPECIAL", label: "Ver Edições Especiais" },
  },
  {
    label: "Guia Comercial · Empresas do Setor",
    lines: ["Armas. Acessórios.", "Empresas."],
    lineColors: ["text-white", "text-[#ff1f1f]"],
    sub: "Encontre armeiros, clubes de tiro,\nimportadores e distribuidoras perto de você.",
    cta: { href: "/guia", label: "Acessar o Guia →" },
    ctaSecondary: { href: "/loja", label: "Ver a Loja" },
  },
  {
    label: "Assinatura Digital · Acesso Imediato",
    lines: ["Assine. Acesse.", "Agora."],
    lineColors: ["text-white", "text-[#ff1f1f]"],
    sub: "Acervo completo liberado na hora.\nSem frete. Sem espera. Direto no seu celular.",
    cta: { href: "/assine", label: "Ver Planos de Assinatura →" },
    ctaSecondary: { href: "/edicoes", label: "Conhecer o Acervo" },
  },
];

const STATS = [
  { value: "207",  label: "Edições\nno acervo"    },
  { value: "40",   label: "Anos de\nhistória"     },
  { value: "1986", label: "Fundada em\nSão Paulo" },
];

export default function WelcomeBanner() {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);
  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(() => next(), 10000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <section className="hero-metal relative overflow-hidden min-h-[380px] lg:min-h-[420px] flex items-center">

      {/* ── Grade decorativa ──────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#7a9ab5 0,transparent 1px,transparent 64px),repeating-linear-gradient(90deg,#7a9ab5 0,transparent 1px,transparent 64px)" }} />

      {/* ── Glow vermelho — esquerda ──────────────────────────── */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-10 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,31,31,0.09) 0%, transparent 65%)" }} />

      {/* ── Glow azul-aço — inferior direita ──────────────────── */}
      <div className="absolute -bottom-20 right-[10%] w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(122,154,181,0.04) 0%, transparent 70%)" }} />

      {/* ── Layout — esquerda + círculo direita ───────────────── */}
      <div className="relative z-10 w-full px-5 lg:px-20 py-6 lg:py-8 flex items-center gap-12">

        {/* ── Conteúdo esquerda ─────────────────────────────────── */}
        <div
          key={current}
          className="animate-fade-slide-in flex-1 max-w-[640px]"
        >
          {/* Label */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
            <span className="text-[#ff1f1f] text-[11px] font-bold tracking-[2.5px] uppercase">
              {slide.label}
            </span>
          </div>

          {/* Headline — 2 linhas */}
          <h1 className="font-['Barlow_Condensed'] font-extrabold leading-[0.92] mb-5 select-none">
            {slide.lines.map((line, i) => (
              <span key={i} className={`block ${slide.lineColors[i]}`}
                style={{ fontSize: "clamp(48px, 6.2vw, 90px)" }}>
                {line}
              </span>
            ))}
          </h1>

          {/* Subheadline */}
          <p className="text-[#7a9ab5] text-[15px] leading-relaxed max-w-[480px] mb-5 whitespace-pre-line">
            {slide.sub}
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap mb-6">
            <Link
              href={slide.cta.href}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[14px] font-bold px-7 py-3.5 rounded transition-colors"
            >
              {slide.cta.label}
            </Link>
            <Link
              href={slide.ctaSecondary.href}
              className="text-[#7a9ab5] hover:text-white text-[14px] font-semibold px-6 py-3.5 rounded transition-all"
              style={{ border: "1px solid rgba(28,42,62,0.9)", background: "rgba(255,255,255,0.02)" }}
            >
              {slide.ctaSecondary.label}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center flex-wrap gap-0">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 first:pl-0"
                style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(20,29,44,1)" }}
              >
                <span className="font-['Barlow_Condensed'] font-extrabold text-white leading-none"
                  style={{ fontSize: "clamp(24px, 2.8vw, 34px)" }}>
                  {stat.value}
                </span>
                <span className="text-[#526888] text-[11px] leading-snug whitespace-pre-line">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Coluna direita — círculo 40 anos (desktop) ────────── */}
        <div className="hidden lg:flex flex-col items-center justify-center shrink-0 select-none pointer-events-none"
          style={{ width: "30%" }}>
          <div className="relative flex items-center justify-center w-[200px] h-[200px]">
            {/* Anel externo */}
            <div className="absolute inset-0 rounded-full"
              style={{ border: "1px solid rgba(28,42,62,0.8)" }} />
            {/* Anel interno */}
            <div className="absolute inset-[18px] rounded-full"
              style={{ border: "1px solid rgba(255,31,31,0.12)" }} />
            {/* Conteúdo central */}
            <div className="flex flex-col items-center gap-1 relative z-10">
              <span className="font-['Barlow_Condensed'] font-extrabold text-white text-[60px] leading-none">40</span>
              <span className="text-[#ff1f1f] text-[11px] font-bold tracking-[3px] uppercase">Anos</span>
              <div className="w-8 h-[1px] bg-[#1c2a3e] my-1" />
              <span className="text-[#526888] text-[10px] font-semibold tracking-[1.5px]">1986 — 2026</span>
            </div>
          </div>
          {/* Label abaixo */}
          <div className="mt-3 flex flex-col items-center gap-1">
            <div className="w-[1px] h-5 bg-[#1c2a3e]" />
            <span className="text-[#1c2a3e] text-[9px] font-bold tracking-[3px] uppercase">
              Maior Acervo Digital do Brasil
            </span>
          </div>
        </div>

      </div>

      {/* ── Controles — alinhados à esquerda ─────────────────── */}
      <div className="absolute bottom-5 left-5 lg:left-20 z-20 flex items-center gap-4">

        <button
          onClick={prev}
          className="slider-nav-btn w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ border: "1px solid rgba(28,42,62,0.9)", background: "rgba(7,10,18,0.6)", color: "#526888" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={e => (e.currentTarget.style.color = "#526888")}
          aria-label="Slide anterior"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2L4 6l4 4" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className="transition-all duration-300 rounded-full"
              style={{
                width:  i === current ? "20px" : "6px",
                height: "6px",
                background: i === current ? "#ff1f1f" : "rgba(82,104,136,0.5)",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="slider-nav-btn w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ border: "1px solid rgba(28,42,62,0.9)", background: "rgba(7,10,18,0.6)", color: "#526888" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={e => (e.currentTarget.style.color = "#526888")}
          aria-label="Próximo slide"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>
        </button>

      </div>

      {/* ── Hashtag ───────────────────────────────────────────── */}
      <div className="absolute bottom-5 right-6 lg:right-10 z-10">
        <span className="text-[#1c2a3e] text-[11px] font-semibold tracking-[2px] uppercase">
          #RevistaMagnum
        </span>
      </div>

    </section>
  );
}
